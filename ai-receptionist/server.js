#!/usr/bin/env node
/**
 * AI Receptionist — standalone prototype (separate from RingBack)
 * --------------------------------------------------------------
 * Demonstrates how an AI phone receptionist behaves: it greets the caller,
 * understands intent, books an appointment (captures service, name, time, phone),
 * answers basic questions, and produces a structured booking + summary.
 *
 * - Dependency-free (Node 18+ http). Runs with ZERO setup or API keys.
 * - Default brain = a smart scripted conversation flow (always works, free).
 * - Optional: set OPENAI_API_KEY in .env to get free-form natural-language replies.
 *
 * This is a PROTOTYPE to show the experience. To make it answer real phone calls,
 * see README.md (Telnyx Voice + OpenAI Realtime media streaming).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// ---- tiny .env loader (no deps) ----
function loadEnv() {
  try {
    const p = path.join(__dirname, '.env');
    if (!fs.existsSync(p)) return;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch (_) {}
}
loadEnv();

const PORT = process.env.PORT || 4000;
const BUSINESS = process.env.BUSINESS_NAME || 'Bright Smile Dental';
const AGENT = process.env.AGENT_NAME || 'Aria';
const HOURS = process.env.HOURS || 'Mon–Sat, 9am–6pm';
const HAS_OPENAI = !!process.env.OPENAI_API_KEY;
// When a booking is captured, send a REAL confirmation via the RingBack service (WhatsApp/SMS).
const CONFIRM_URL = process.env.CONFIRM_URL || 'https://get.callpilotvoice.co.uk/api/book';
const SEND_CONFIRM = process.env.SEND_CONFIRM !== 'false';

async function sendConfirmation(b) {
  if (!SEND_CONFIRM || !b || !b.phone) return false;
  try {
    const r = await fetch(CONFIRM_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: b.name, mobile: b.phone, service: b.service, datetime: b.datetime }),
    });
    return r.ok;
  } catch (_) { return false; }
}

const sessions = new Map(); // sessionId -> { state, data, history }

// ---------------------------------------------------------------------------
// Scripted conversation brain (the reliable, free default)
// ---------------------------------------------------------------------------
const SERVICES = ['check-up', 'cleaning', 'whitening', 'consultation', 'emergency', 'appointment'];

function newSession() {
  return { state: 'intent', data: {}, history: [] };
}

function detect(text, words) {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
}

function scriptedReply(s, msg) {
  const t = (msg || '').trim();
  const d = s.data;

  // global intents
  if (detect(t, ['hour', 'open', 'close', 'time you', 'when are you'])) {
    return { reply: `We're open ${HOURS}. Would you like to book a time?`, next: 'intent' };
  }
  if (detect(t, ['where', 'address', 'location', 'parking'])) {
    return { reply: `We're in the centre of town with parking nearby. Want me to book you an appointment?`, next: 'intent' };
  }
  if (detect(t, ['price', 'cost', 'how much', 'fee'])) {
    return { reply: `Prices depend on the treatment — the dentist will confirm at your visit. Shall I book you a consultation?`, next: 'intent' };
  }

  switch (s.state) {
    case 'intent': {
      if (detect(t, ['book', 'appointment', 'schedule', 'see', 'come in', 'yes', ...SERVICES])) {
        const svc = SERVICES.find((x) => t.toLowerCase().includes(x));
        if (svc) { d.service = svc; return { reply: `Great — a ${svc}. Can I take your name, please?`, next: 'name' }; }
        return { reply: `Of course! What would you like to book — a check-up, cleaning, whitening, or a consultation?`, next: 'service' };
      }
      if (detect(t, ['cancel', 'reschedule', 'change'])) {
        return { reply: `No problem — I can have the team call you back to reschedule. What's your name and number?`, next: 'name' };
      }
      return { reply: `I can help you book an appointment or answer a quick question. Would you like to book a visit?`, next: 'intent' };
    }
    case 'service': {
      const svc = SERVICES.find((x) => t.toLowerCase().includes(x)) || t || 'appointment';
      d.service = svc;
      return { reply: `Perfect — a ${svc}. And your name?`, next: 'name' };
    }
    case 'name': {
      d.name = t.replace(/^(it'?s|i'?m|my name is)\s+/i, '').trim() || 'there';
      return { reply: `Thanks, ${d.name}. What day and time works best for you?`, next: 'datetime' };
    }
    case 'datetime': {
      d.datetime = t;
      return { reply: `Got it — ${d.datetime}. What's the best mobile number to send your confirmation to?`, next: 'phone' };
    }
    case 'phone': {
      d.phone = t;
      s.booking = { business: BUSINESS, service: d.service || 'appointment', name: d.name, datetime: d.datetime, phone: d.phone };
      return {
        reply: `All set, ${d.name}! ✅ I've booked your ${d.service || 'appointment'} for ${d.datetime}. You'll get a confirmation text at ${d.phone}. Is there anything else I can help with?`,
        next: 'done', booking: s.booking,
      };
    }
    case 'done': {
      if (detect(t, ['no', 'that', 'thanks', 'bye', 'all good'])) {
        return { reply: `Wonderful — thanks for calling ${BUSINESS}. Have a great day! 👋`, next: 'ended' };
      }
      if (detect(t, ['book', 'another', 'also', 'yes'])) { s.data = {}; return { reply: `Sure — what would you like to book?`, next: 'service' }; }
      return { reply: `Happy to help with anything else, or shall I let you go?`, next: 'done' };
    }
    default:
      return { reply: `Thanks for calling ${BUSINESS}!`, next: 'ended' };
  }
}

// ---------------------------------------------------------------------------
// Optional OpenAI brain (free-form natural replies) — used only if key present
// ---------------------------------------------------------------------------
async function openaiReply(s, msg) {
  const sys = `You are ${AGENT}, a warm, concise phone receptionist for ${BUSINESS} (open ${HOURS}). ` +
    `Greet briefly, understand the caller, and if they want an appointment collect: service, name, day/time, and mobile number — one question at a time. ` +
    `When you have all four, confirm the booking in one sentence and say a confirmation text will be sent. Keep replies to 1-2 short sentences.`;
  const messages = [{ role: 'system', content: sys }, ...s.history, { role: 'user', content: msg }];
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages, temperature: 0.6, max_tokens: 120 }),
  });
  const j = await res.json();
  return j.choices?.[0]?.message?.content?.trim() || `Sorry, could you repeat that?`;
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((r) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => r(b)); });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/') return send(res, 200, PAGE, 'text/html; charset=utf-8');
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, brain: HAS_OPENAI ? 'openai' : 'scripted', business: BUSINESS });

  if (req.method === 'POST' && url.pathname === '/chat') {
    const body = JSON.parse((await readBody(req)) || '{}');
    const id = body.sessionId || 'anon';
    let s = sessions.get(id);
    const greeting = `Thanks for calling ${BUSINESS}! I'm ${AGENT}, your virtual receptionist. How can I help — book an appointment, or a quick question?`;
    if (!s) { s = newSession(); sessions.set(id, s); if (!body.message) return send(res, 200, { reply: greeting, state: s.state }); }

    const msg = (body.message || '').toString().slice(0, 500);
    s.history.push({ role: 'user', content: msg });

    let out;
    if (HAS_OPENAI) {
      const reply = await openaiReply(s, msg).catch(() => null);
      out = reply ? { reply, next: s.state } : scriptedReply(s, msg);
    } else {
      out = scriptedReply(s, msg);
    }
    s.state = out.next || s.state;
    s.history.push({ role: 'assistant', content: out.reply });
    let confirmSent = false;
    if (out.booking && !s.confirmSent) { confirmSent = await sendConfirmation(out.booking); s.confirmSent = true; }
    return send(res, 200, { reply: out.reply, state: s.state, booking: out.booking || s.booking || null, confirmSent });
  }
  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`AI Receptionist prototype on http://localhost:${PORT}`);
  console.log(`Brain: ${HAS_OPENAI ? 'OpenAI (' + (process.env.OPENAI_MODEL || 'gpt-4o-mini') + ')' : 'scripted (no API key — set OPENAI_API_KEY for natural language)'}`);
  console.log(`Business: ${BUSINESS} | Agent: ${AGENT}`);
});

// ---------------------------------------------------------------------------
// Web UI (phone-call style chat)
// ---------------------------------------------------------------------------
const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>AI Receptionist — Demo</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#0b141a;color:#0b141a;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:14px}
.phone{width:100%;max-width:420px;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.4)}
.top{background:#0b141a;color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}
.av{width:42px;height:42px;border-radius:50%;background:#25d366;display:grid;place-items:center;font-size:20px}
.top b{font-size:16px}.top .s{font-size:12px;color:#8ed6a3}
.chat{height:62vh;min-height:380px;overflow-y:auto;padding:16px;background:#eef2f4;display:flex;flex-direction:column;gap:8px}
.b{max-width:82%;padding:10px 13px;border-radius:14px;font-size:15px;line-height:1.4}
.ai{background:#fff;align-self:flex-start;border-bottom-left-radius:4px}
.me{background:#25d366;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.book{align-self:center;background:#e7f9ee;border:1px solid #b7ebc1;border-radius:12px;padding:10px 12px;font-size:13px;color:#0b141a;width:92%}
.book b{color:#1da851}
.in{display:flex;gap:8px;padding:12px;background:#fff;border-top:1px solid #e9edef}
.in input{flex:1;padding:12px 14px;border:1px solid #cfd9de;border-radius:999px;font-size:15px}
.in button{background:#25d366;color:#fff;border:0;border-radius:999px;width:48px;font-size:18px;font-weight:800}
.note{font-size:11px;color:#8696a0;text-align:center;padding:6px}
</style></head><body>
<div class="phone">
  <div class="top"><div class="av">📞</div><div><b id="biz">AI Receptionist</b><div class="s" id="brain">● answering…</div></div></div>
  <div class="chat" id="chat"></div>
  <div class="in"><input id="msg" placeholder="Type as if you're the caller…" autocomplete="off"><button id="send">➤</button></div>
  <div class="note">Prototype — a demo of how an AI receptionist answers & books. Separate from RingBack.</div>
</div>
<script>
const sid='s'+Math.floor(performance.now())+''+Math.round(performance.timeOrigin%1000);
const chat=document.getElementById('chat');
function add(t,cls){const d=document.createElement('div');d.className='b '+cls;d.textContent=t;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
function book(b){const d=document.createElement('div');d.className='book';d.innerHTML='✅ <b>Booking captured</b><br>'+
 'Business: '+b.business+'<br>Service: '+b.service+'<br>Name: '+(b.name||'-')+'<br>When: '+(b.datetime||'-')+'<br>Phone: '+(b.phone||'-');chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
let lastBooking=null;
async function call(message){
 const r=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:sid,message:message})});
 const j=await r.json();add(j.reply,'ai');
 if(j.booking&&JSON.stringify(j.booking)!==JSON.stringify(lastBooking)){lastBooking=j.booking;book(j.booking);}
}
document.getElementById('biz').textContent=document.title.split(' — ')[0];
fetch('/health').then(r=>r.json()).then(h=>{document.getElementById('biz').textContent=h.business;document.getElementById('brain').textContent='● '+(h.brain==='openai'?'AI (OpenAI)':'AI (demo)')+' · answering';});
function go(){const m=document.getElementById('msg');const v=m.value.trim();if(!v)return;add(v,'me');m.value='';call(v);}
document.getElementById('send').onclick=go;
document.getElementById('msg').addEventListener('keydown',e=>{if(e.key==='Enter')go();});
call(''); // greeting
</script></body></html>`;
