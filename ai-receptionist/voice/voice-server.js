#!/usr/bin/env node
/**
 * LIVE VOICE AI RECEPTIONIST
 * Telnyx (Call Control + bidirectional media streaming)  <->  OpenAI Realtime API
 *
 * Flow:
 *   Caller dials your Telnyx number
 *     -> Telnyx hits this server's webhook (/telnyx-voice)
 *     -> we ANSWER the call, then start MEDIA STREAMING to our WebSocket (/media)
 *     -> Telnyx streams the caller's audio (g711 µ-law 8k) over the WS
 *     -> we pipe it to OpenAI Realtime, which understands + speaks back (g711 µ-law)
 *     -> we stream OpenAI's audio back to Telnyx (caller hears the AI)
 *     -> when the model calls book_appointment(), we POST to RingBack /book to send a WhatsApp/SMS confirmation
 *
 * Requires: OPENAI_API_KEY, TELNYX_API_KEY, PUBLIC_WSS_URL (wss://.../media). See .env.example + README.md.
 * NOTE: This is a complete implementation but UNTESTED on a live call (needs a real phone call to verify).
 *       The two things most likely to need a small tweak on first call: (a) Telnyx streaming_start params,
 *       (b) audio format names. Both are flagged inline.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// ---- env ----
(function loadEnv() {
  try {
    const p = path.join(__dirname, '.env');
    if (!fs.existsSync(p)) return;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch (_) {}
})();

const CFG = {
  port: process.env.PORT || 5050,
  openaiKey: process.env.OPENAI_API_KEY,
  realtimeModel: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview-2024-12-17',
  voice: process.env.VOICE || 'alloy',
  telnyxKey: process.env.TELNYX_API_KEY,
  publicWss: process.env.PUBLIC_WSS_URL || 'wss://voice.callpilotvoice.co.uk/media',
  business: process.env.BUSINESS_NAME || 'Bright Smile Dental',
  agent: process.env.AGENT_NAME || 'Aria',
  hours: process.env.HOURS || 'Mon–Sat, 9am–6pm',
  confirmUrl: process.env.CONFIRM_URL || 'https://get.callpilotvoice.co.uk/api/book',
};

function log(...a) { console.log(new Date().toISOString(), ...a); }

const INSTRUCTIONS =
  `You are ${CFG.agent}, a warm, professional phone receptionist for ${CFG.business} (open ${CFG.hours}). ` +
  `Greet the caller briefly, then help them. If they want an appointment, collect (one at a time): ` +
  `service, full name, preferred day/time, and mobile number. Once you have all four, call the book_appointment ` +
  `tool, then confirm in one short sentence that a confirmation will be texted. Answer simple questions (hours, ` +
  `location, services) briefly. Keep replies short and natural, like a real receptionist on the phone.`;

const TOOLS = [{
  type: 'function',
  name: 'book_appointment',
  description: 'Book an appointment once name, service, day/time and mobile number are all known.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' }, service: { type: 'string' },
      datetime: { type: 'string', description: 'Caller preferred day and time, e.g. "Tuesday 3pm"' },
      phone: { type: 'string', description: 'Mobile number with country code if given' },
    },
    required: ['name', 'service', 'datetime', 'phone'],
  },
}];

// ---- Telnyx REST helpers ----
async function telnyx(ccid, action, body) {
  const r = await fetch(`https://api.telnyx.com/v2/calls/${ccid}/actions/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CFG.telnyxKey}` },
    body: JSON.stringify(body || {}),
  });
  if (!r.ok) log(`Telnyx ${action} failed`, r.status, await r.text().catch(() => ''));
  return r.ok;
}

async function sendConfirmation(args) {
  try {
    await fetch(CFG.confirmUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: args.name, mobile: args.phone, service: args.service, datetime: args.datetime, business: CFG.business }),
    });
    log('✅ booking confirmation sent for', args.phone);
  } catch (e) { log('confirm send failed', e.message); }
}

// ---------------------------------------------------------------------------
// HTTP: Telnyx Call Control webhook
// ---------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, business: CFG.business, realtime: !!CFG.openaiKey, telnyx: !!CFG.telnyxKey }));
  }
  if (req.method === 'POST' && req.url.startsWith('/telnyx-voice')) {
    let body = ''; req.on('data', (c) => (body += c));
    req.on('end', async () => {
      res.writeHead(200); res.end('ok'); // ack fast
      let ev; try { ev = JSON.parse(body).data; } catch (_) { return; }
      const type = ev?.event_type;
      const ccid = ev?.payload?.call_control_id;
      if (!ccid) return;
      log('Telnyx event:', type);
      if (type === 'call.initiated') {
        await telnyx(ccid, 'answer');
      } else if (type === 'call.answered') {
        // Start bidirectional media streaming to our WebSocket.
        // NOTE: verify these field names against current Telnyx docs on first live test.
        await telnyx(ccid, 'streaming_start', {
          stream_url: CFG.publicWss,
          stream_track: 'inbound_track',
          stream_bidirectional_mode: 'rtp',
          stream_bidirectional_codec: 'PCMU', // µ-law 8k — matches OpenAI g711_ulaw
        });
      }
    });
    return;
  }
  res.writeHead(404); res.end('not found');
});

// ---------------------------------------------------------------------------
// WebSocket: Telnyx media <-> OpenAI Realtime bridge
// ---------------------------------------------------------------------------
const wss = new WebSocket.Server({ server, path: '/media' });

wss.on('connection', (telnyxWs) => {
  log('Telnyx media WS connected');
  let streamId = null;
  let oaReady = false;
  const queue = []; // caller audio waiting for OpenAI to be ready

  // open OpenAI Realtime
  const oa = new WebSocket(`wss://api.openai.com/v1/realtime?model=${CFG.realtimeModel}`, {
    headers: { Authorization: `Bearer ${CFG.openaiKey}`, 'OpenAI-Beta': 'realtime=v1' },
  });

  oa.on('open', () => {
    log('OpenAI Realtime connected');
    oa.send(JSON.stringify({
      type: 'session.update',
      session: {
        modalities: ['audio', 'text'],
        instructions: INSTRUCTIONS,
        voice: CFG.voice,
        input_audio_format: 'g711_ulaw',
        output_audio_format: 'g711_ulaw',
        turn_detection: { type: 'server_vad', silence_duration_ms: 600 },
        tools: TOOLS,
        tool_choice: 'auto',
      },
    }));
    // greet first
    oa.send(JSON.stringify({ type: 'response.create', response: { instructions: `Greet the caller warmly as ${CFG.business}.` } }));
    oaReady = true;
    while (queue.length) oa.send(queue.shift());
  });

  // OpenAI -> Telnyx (AI speech + tool calls)
  oa.on('message', async (raw) => {
    let m; try { m = JSON.parse(raw.toString()); } catch (_) { return; }
    if (m.type === 'response.audio.delta' && m.delta) {
      // send AI audio back to the caller via Telnyx
      telnyxWs.send(JSON.stringify({ event: 'media', media: { payload: m.delta } }));
    } else if (m.type === 'input_audio_buffer.speech_started') {
      // caller interrupted — stop current AI audio
      telnyxWs.send(JSON.stringify({ event: 'clear' }));
      oa.send(JSON.stringify({ type: 'response.cancel' }));
    } else if (m.type === 'response.function_call_arguments.done') {
      let args = {}; try { args = JSON.parse(m.arguments || '{}'); } catch (_) {}
      if (m.name === 'book_appointment') {
        await sendConfirmation(args);
        oa.send(JSON.stringify({ type: 'conversation.item.create', item: {
          type: 'function_call_output', call_id: m.call_id, output: JSON.stringify({ booked: true }) } }));
        oa.send(JSON.stringify({ type: 'response.create' }));
      }
    } else if (m.type === 'error') {
      log('OpenAI error', JSON.stringify(m.error || m));
    }
  });
  oa.on('close', () => log('OpenAI WS closed'));
  oa.on('error', (e) => log('OpenAI WS error', e.message));

  // Telnyx -> OpenAI (caller audio)
  telnyxWs.on('message', (raw) => {
    let m; try { m = JSON.parse(raw.toString()); } catch (_) { return; }
    switch (m.event) {
      case 'connected': break;
      case 'start': streamId = m.stream_id || m.start?.stream_id; log('stream start', streamId); break;
      case 'media': {
        const append = JSON.stringify({ type: 'input_audio_buffer.append', audio: m.media.payload });
        if (oaReady && oa.readyState === WebSocket.OPEN) oa.send(append); else queue.push(append);
        break;
      }
      case 'stop': log('stream stop'); try { oa.close(); } catch (_) {} break;
    }
  });

  telnyxWs.on('close', () => { log('Telnyx WS closed'); try { oa.close(); } catch (_) {} });
  telnyxWs.on('error', (e) => log('Telnyx WS error', e.message));
});

server.listen(CFG.port, () => {
  log(`Voice AI receptionist on :${CFG.port}`);
  log(`Webhook: POST /telnyx-voice  |  Media WS: /media  (public: ${CFG.publicWss})`);
  log(`OpenAI key: ${CFG.openaiKey ? 'set' : 'MISSING'} | Telnyx key: ${CFG.telnyxKey ? 'set' : 'MISSING'}`);
  if (!CFG.openaiKey || !CFG.telnyxKey) log('⚠️  Set OPENAI_API_KEY and TELNYX_API_KEY in .env before going live.');
});
