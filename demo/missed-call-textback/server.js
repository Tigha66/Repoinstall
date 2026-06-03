#!/usr/bin/env node
/*
 * Missed-Call Text-Back — webhook service for OpenWA + Telnyx
 * ----------------------------------------------------------------
 * Flow:
 *   Caller dials your Telnyx number
 *     -> Telnyx posts Call Control webhooks to  POST /telnyx/:token
 *     -> if the call is incoming and was NOT answered, we
 *     -> call the OpenWA API to WhatsApp the caller a text-back
 *
 * Zero npm dependencies — uses Node 18+ built-ins (http, crypto, global fetch).
 * Run:  node server.js   (reads config from ./.env or real env vars)
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Tiny .env loader (no dependency on dotenv)
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const CONFIG = {
  port: parseInt(process.env.PORT || '2789', 10),
  openwaBase: (process.env.OPENWA_API_BASE || 'http://localhost:2785/api').replace(/\/$/, ''),
  apiKey: process.env.OPENWA_API_KEY || '',
  sessionName: process.env.OPENWA_SESSION || 'demo',
  businessName: process.env.BUSINESS_NAME || 'our team',
  message:
    process.env.TEXTBACK_MESSAGE ||
    "Hi! 👋 Sorry we missed your call to {business}. How can we help? Just reply here and we'll get right back to you.",
  // Optional shared secret embedded in the webhook path: /telnyx/<token>
  webhookToken: process.env.WEBHOOK_TOKEN || '',
  // Don't re-text the same number within this window (ms)
  cooldownMs: parseInt(process.env.COOLDOWN_MS || '300000', 10),
};

// In-memory state
const answeredCalls = new Set(); // call_control_id values that got answered
const incomingCalls = new Map(); // call_control_id -> caller number (from call.initiated)
const lastTexted = new Map(); // normalized number -> timestamp

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

// E.164 / messy number -> WhatsApp chatId  (digits only + @c.us)
function toChatId(num) {
  if (!num) return null;
  const digits = String(num).replace(/\D/g, '');
  if (digits.length < 8) return null;
  return `${digits}@c.us`;
}

function renderMessage() {
  return CONFIG.message.replace(/\{business\}/g, CONFIG.businessName);
}

// ---------------------------------------------------------------------------
// OpenWA helpers
// ---------------------------------------------------------------------------
let cachedSessionId = null;

async function resolveSessionId(force = false) {
  if (cachedSessionId && !force) return cachedSessionId;
  const res = await fetch(`${CONFIG.openwaBase}/sessions`, {
    headers: { 'X-API-Key': CONFIG.apiKey },
  });
  if (!res.ok) throw new Error(`list sessions failed: ${res.status}`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : body.data || body.sessions || [];
  const match = list.find((s) => s.name === CONFIG.sessionName);
  if (!match) throw new Error(`session "${CONFIG.sessionName}" not found — create + connect it first`);
  cachedSessionId = match.id;
  return cachedSessionId;
}

async function sendTextBack(toNumber) {
  const chatId = toChatId(toNumber);
  if (!chatId) {
    log('skip: cannot build chatId from', toNumber);
    return;
  }

  // cooldown / de-dupe
  const now = Date.now();
  const last = lastTexted.get(chatId) || 0;
  if (now - last < CONFIG.cooldownMs) {
    log('skip (cooldown):', chatId);
    return;
  }
  lastTexted.set(chatId, now);

  try {
    let sessionId = await resolveSessionId();
    const doSend = () =>
      fetch(`${CONFIG.openwaBase}/sessions/${sessionId}/messages/send-text`, {
        method: 'POST',
        headers: { 'X-API-Key': CONFIG.apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text: renderMessage() }),
      });

    let res = await doSend();
    if (res.status === 404) {
      // session id may have changed — refresh once
      sessionId = await resolveSessionId(true);
      res = await doSend();
    }
    const txt = await res.text();
    if (!res.ok) {
      log('❌ send failed', res.status, txt.slice(0, 200));
    } else {
      log('✅ text-back sent to', chatId);
    }
  } catch (err) {
    log('❌ send error:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Telnyx event handling
// ---------------------------------------------------------------------------
function handleTelnyxEvent(evt) {
  const data = evt && evt.data ? evt.data : evt;
  const type = data && data.event_type;
  const payload = (data && data.payload) || {};
  const direction = payload.direction; // "incoming" | "outgoing"
  const ccid = payload.call_control_id;
  const from = payload.from;

  log('telnyx event:', type, '| dir:', direction, '| from:', from);

  // Remember incoming calls when they start — call.hangup does NOT carry the
  // direction field, so we rely on what we saw at call.initiated.
  if (type === 'call.initiated' && ccid) {
    if (direction === 'incoming' || direction === undefined) {
      incomingCalls.set(ccid, from);
    }
    return;
  }

  if (type === 'call.answered' && ccid) {
    answeredCalls.add(ccid);
    return;
  }

  if (type === 'call.hangup') {
    const wasAnswered = ccid && answeredCalls.has(ccid);
    const knownIncoming = ccid && incomingCalls.has(ccid);
    const caller = from || (ccid && incomingCalls.get(ccid));
    // cleanup
    if (ccid) {
      answeredCalls.delete(ccid);
      incomingCalls.delete(ccid);
    }
    // A missed call = an incoming call that was never answered.
    const wasIncoming = knownIncoming || direction === 'incoming';
    if (wasIncoming && !wasAnswered) {
      sendTextBack(caller);
    } else {
      log('no text-back (answered or outbound)');
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
function readBody(req) {
  return new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => (buf += c));
    req.on('end', () => resolve(buf));
  });
}

function send(res, code, obj) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': typeof obj === 'string' ? 'text/plain' : 'application/json' });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${CONFIG.port}`);
  const pathname = url.pathname.replace(/\/$/, '') || '/';

  // Health / info
  if (req.method === 'GET' && (pathname === '/' || pathname === '/health')) {
    return send(res, 200, {
      service: 'missed-call-textback',
      ok: true,
      session: CONFIG.sessionName,
      sessionId: cachedSessionId,
      business: CONFIG.businessName,
      webhookPath: CONFIG.webhookToken ? `/telnyx/${CONFIG.webhookToken}` : '/telnyx',
    });
  }

  // Manual trigger for demos / Loom — no Telnyx needed.
  //   GET  /simulate?from=+447700900123
  //   POST /simulate   {"from":"+447700900123"}
  if (pathname === '/simulate') {
    let from = url.searchParams.get('from');
    if (req.method === 'POST') {
      try {
        const body = JSON.parse((await readBody(req)) || '{}');
        from = from || body.from;
      } catch (_) {}
    }
    if (!from) return send(res, 400, { error: 'provide ?from=+44...' });
    log('SIMULATE missed call from', from);
    sendTextBack(from);
    return send(res, 200, { ok: true, simulatedFrom: from });
  }

  // Telnyx webhook  (POST /telnyx  or  /telnyx/<token>)
  if (req.method === 'POST' && (pathname === '/telnyx' || pathname === `/telnyx/${CONFIG.webhookToken}`)) {
    if (CONFIG.webhookToken && pathname !== `/telnyx/${CONFIG.webhookToken}`) {
      return send(res, 401, { error: 'bad token' });
    }
    const raw = await readBody(req);
    // Respond 200 immediately so Telnyx doesn't retry; process async.
    send(res, 200, { received: true });
    try {
      const evt = JSON.parse(raw || '{}');
      handleTelnyxEvent(evt);
    } catch (err) {
      log('❌ bad webhook payload:', err.message);
    }
    return;
  }

  send(res, 404, { error: 'not found' });
});

server.listen(CONFIG.port, '0.0.0.0', () => {
  log(`missed-call-textback listening on :${CONFIG.port}`);
  log(`  OpenWA:   ${CONFIG.openwaBase}  (session "${CONFIG.sessionName}")`);
  log(`  Webhook:  POST ${CONFIG.webhookToken ? `/telnyx/${CONFIG.webhookToken}` : '/telnyx'}`);
  log(`  Test:     GET  /simulate?from=+447700900123`);
  if (!CONFIG.apiKey) log('  ⚠️  OPENWA_API_KEY is empty — set it in .env');
  resolveSessionId()
    .then((id) => log(`  Session resolved: ${id}`))
    .catch((e) => log(`  ⚠️  ${e.message}`));
});
