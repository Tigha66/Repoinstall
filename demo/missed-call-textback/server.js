#!/usr/bin/env node
/*
 * Missed-Call Text-Back — multi-tenant webhook service for OpenWA + Telnyx
 * -----------------------------------------------------------------------
 * Flow:
 *   Caller dials a business's Telnyx number
 *     -> Telnyx posts Call Control webhooks to  POST /telnyx[/<token>]
 *     -> if the call is incoming and was NOT answered (= missed call):
 *         1. WhatsApp the caller a branded text-back (via OpenWA)
 *         2. if WhatsApp fails and SMS fallback is on, send an SMS via Telnyx
 *
 * Routing: each call is matched to a TENANT by the number that was DIALED
 *   (payload.to). Each tenant has its own WhatsApp session + branding + SMS.
 *
 * Config:
 *   - tenants.json (multi-client)  — see tenants.example.json
 *   - or .env single-tenant fallback (used when tenants.json is absent)
 *
 * Zero npm dependencies — Node 18+ built-ins (http, global fetch).
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
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

// ---------------------------------------------------------------------------
// Global config (shared across tenants)
// ---------------------------------------------------------------------------
const CONFIG = {
  port: parseInt(process.env.PORT || '2789', 10),
  openwaBase: (process.env.OPENWA_API_BASE || 'http://localhost:2785/api').replace(/\/$/, ''),
  apiKey: process.env.OPENWA_API_KEY || '',
  webhookToken: process.env.WEBHOOK_TOKEN || '',
  cooldownMs: parseInt(process.env.COOLDOWN_MS || '300000', 10),
  telnyxApiKey: process.env.TELNYX_API_KEY || '',
  // Bind address. Default 0.0.0.0; set to 127.0.0.1 behind a reverse proxy
  // (e.g. Traefik on host network) so the port isn't exposed raw to the internet.
  bindHost: process.env.BIND_HOST || '0.0.0.0',
};

const DEFAULT_MESSAGE =
  "Hi! 👋 Sorry we missed your call to {business}. How can we help? Just reply here and we'll get right back to you.";

// ---------------------------------------------------------------------------
// Tenants
//   Keyed by the DIALED Telnyx number in E.164 (digits only used for matching).
//   Each tenant: { businessName, session, message, smsFallback, smsFrom }
// ---------------------------------------------------------------------------
function digits(n) {
  return String(n || '').replace(/\D/g, '');
}

function loadTenants() {
  const file = path.join(__dirname, 'tenants.json');
  const byNumber = new Map();
  let fallback = null;

  if (fs.existsSync(file)) {
    const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const [number, t] of Object.entries(cfg.tenants || {})) {
      const tenant = normaliseTenant(t);
      byNumber.set(digits(number), tenant);
      if (cfg.defaultTenant && t.name === cfg.defaultTenant) fallback = tenant;
    }
    if (!fallback && byNumber.size) fallback = [...byNumber.values()][0];
  }

  // .env single-tenant fallback (also used if no number matches)
  if (!fallback) {
    fallback = normaliseTenant({
      name: process.env.OPENWA_SESSION || 'demo',
      businessName: process.env.BUSINESS_NAME || 'our team',
      session: process.env.OPENWA_SESSION || 'demo',
      message: process.env.TEXTBACK_MESSAGE || DEFAULT_MESSAGE,
      smsFallback: String(process.env.SMS_FALLBACK || 'false') === 'true',
      smsFrom: process.env.SMS_FROM || '',
    });
  }
  return { byNumber, fallback };
}

function normaliseTenant(t) {
  return {
    name: t.name || t.session || 'tenant',
    businessName: t.businessName || 'our team',
    session: t.session || t.name,
    message: t.message || DEFAULT_MESSAGE,
    channel: t.channel === 'sms' ? 'sms' : 'whatsapp', // 'whatsapp' (UK/EU) or 'sms' (US)
    smsFallback: t.smsFallback === true,
    smsFrom: t.smsFrom || '',
    bookingUrl: t.bookingUrl || '', // optional Cal.com/Calendly link, used via {booking} in message
  };
}

let TENANTS = loadTenants();

function tenantFor(toNumber) {
  return (toNumber && TENANTS.byNumber.get(digits(toNumber))) || TENANTS.fallback;
}

function renderMessage(tenant) {
  return tenant.message
    .replace(/\{business\}/g, tenant.businessName)
    .replace(/\{booking\}/g, tenant.bookingUrl || '');
}

// ---------------------------------------------------------------------------
// In-memory state
// ---------------------------------------------------------------------------
const answeredCalls = new Set();
const incomingCalls = new Map(); // ccid -> { from, to }
const lastTexted = new Map(); // chatId -> timestamp
const sessionIdCache = new Map(); // session name -> OpenWA session id

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function toChatId(num) {
  const d = digits(num);
  return d.length >= 8 ? `${d}@c.us` : null;
}

// ---------------------------------------------------------------------------
// OpenWA (WhatsApp) send
// ---------------------------------------------------------------------------
async function resolveSessionId(sessionName, force = false) {
  if (!force && sessionIdCache.has(sessionName)) return sessionIdCache.get(sessionName);
  const res = await fetch(`${CONFIG.openwaBase}/sessions`, { headers: { 'X-API-Key': CONFIG.apiKey } });
  if (!res.ok) throw new Error(`list sessions failed: ${res.status}`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : body.data || body.sessions || [];
  const match = list.find((s) => s.name === sessionName);
  if (!match) throw new Error(`session "${sessionName}" not found`);
  sessionIdCache.set(sessionName, match.id);
  return match.id;
}

async function sendWhatsApp(sessionName, chatId, text) {
  let sessionId = await resolveSessionId(sessionName);
  const doSend = () =>
    fetch(`${CONFIG.openwaBase}/sessions/${sessionId}/messages/send-text`, {
      method: 'POST',
      headers: { 'X-API-Key': CONFIG.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, text }),
    });
  let res = await doSend();
  if (res.status === 404) {
    sessionId = await resolveSessionId(sessionName, true);
    res = await doSend();
  }
  if (!res.ok) throw new Error(`whatsapp send ${res.status}: ${(await res.text()).slice(0, 150)}`);
}

// Fetch the current QR (and status) for a session — used by the live QR page.
async function fetchSessionQr(sessionName) {
  const sessionId = await resolveSessionId(sessionName, true);
  const sres = await fetch(`${CONFIG.openwaBase}/sessions/${sessionId}`, { headers: { 'X-API-Key': CONFIG.apiKey } });
  const status = sres.ok ? (await sres.json()).status : 'unknown';
  if (status === 'ready' || status === 'connected') return { status, png: null };
  const qres = await fetch(`${CONFIG.openwaBase}/sessions/${sessionId}/qr`, { headers: { 'X-API-Key': CONFIG.apiKey } });
  if (!qres.ok) return { status, png: null };
  const q = (await qres.json()).qrCode || '';
  const b64 = q.includes(',') ? q.split(',', 1)[1] || q.split(',')[1] : q;
  return { status, png: b64 ? Buffer.from(b64, 'base64') : null };
}

// ---------------------------------------------------------------------------
// Telnyx SMS fallback
// ---------------------------------------------------------------------------
async function sendSms(from, to, text) {
  if (!CONFIG.telnyxApiKey) throw new Error('TELNYX_API_KEY not set');
  if (!from) throw new Error('tenant has no smsFrom number');
  const res = await fetch('https://api.telnyx.com/v2/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${CONFIG.telnyxApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, text }),
  });
  if (!res.ok) throw new Error(`sms send ${res.status}: ${(await res.text()).slice(0, 150)}`);
}

// ---------------------------------------------------------------------------
// The core action: text a missed caller back
// ---------------------------------------------------------------------------
async function textBackMissedCall(callerNumber, tenant) {
  const chatId = toChatId(callerNumber);
  if (!chatId) return log('skip: bad caller number', callerNumber);

  const now = Date.now();
  if (now - (lastTexted.get(chatId) || 0) < CONFIG.cooldownMs) {
    return log('skip (cooldown):', chatId);
  }
  lastTexted.set(chatId, now);

  const text = renderMessage(tenant);

  // US tenants: SMS is the primary channel (Americans don't use WhatsApp).
  if (tenant.channel === 'sms') {
    try {
      await sendSms(tenant.smsFrom, callerNumber, text);
      log(`✅ SMS text-back sent to ${callerNumber} [${tenant.businessName}]`);
    } catch (smsErr) {
      log('❌ SMS send failed:', smsErr.message);
    }
    return;
  }

  try {
    await sendWhatsApp(tenant.session, chatId, text);
    log(`✅ WhatsApp text-back sent to ${chatId} [${tenant.businessName}]`);
  } catch (waErr) {
    log('❌ WhatsApp failed:', waErr.message);
    if (tenant.smsFallback) {
      try {
        await sendSms(tenant.smsFrom, callerNumber, text);
        log(`✅ SMS fallback sent to ${callerNumber} [${tenant.businessName}]`);
      } catch (smsErr) {
        log('❌ SMS fallback failed:', smsErr.message);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Telnyx event handling
// ---------------------------------------------------------------------------
function handleTelnyxEvent(evt) {
  const data = evt && evt.data ? evt.data : evt;
  const type = data && data.event_type;
  const payload = (data && data.payload) || {};
  const { direction, call_control_id: ccid, from, to } = payload;

  log('telnyx event:', type, '| dir:', direction, '| from:', from, '| to:', to);

  if (type === 'call.initiated' && ccid) {
    if (direction === 'incoming' || direction === undefined) {
      incomingCalls.set(ccid, { from, to });
    }
    return;
  }

  if (type === 'call.answered' && ccid) {
    answeredCalls.add(ccid);
    return;
  }

  if (type === 'call.hangup') {
    const wasAnswered = ccid && answeredCalls.has(ccid);
    const tracked = ccid && incomingCalls.get(ccid);
    const caller = from || (tracked && tracked.from);
    const dialed = to || (tracked && tracked.to);
    if (ccid) {
      answeredCalls.delete(ccid);
      incomingCalls.delete(ccid);
    }
    const wasIncoming = !!tracked || direction === 'incoming';
    if (wasIncoming && !wasAnswered) {
      textBackMissedCall(caller, tenantFor(dialed));
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

function sendHtml(res, code, inner, refresh) {
  const meta = refresh ? `<meta http-equiv="refresh" content="${refresh}">` : '';
  const html = `<!doctype html><html><head><meta charset="utf-8">${meta}<meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect WhatsApp</title><style>body{font-family:system-ui,sans-serif;text-align:center;padding:24px;background:#0b141a;color:#e9edef}img{width:300px;height:300px;background:#fff;padding:10px;border-radius:12px}h2{margin:8px 0}.muted{color:#8696a0;font-size:14px}</style></head><body>${inner}</body></html>`;
  res.writeHead(code, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// Self-contained QR page so a client can scan WhatsApp from a phone browser.
async function renderQrPage(res) {
  const tenant = TENANTS.fallback;
  try {
    const sessionId = await resolveSessionId(tenant.session, true);
    const s = await fetch(`${CONFIG.openwaBase}/sessions/${sessionId}`, { headers: { 'X-API-Key': CONFIG.apiKey } }).then((r) => r.json());
    if (s.status === 'ready') {
      return sendHtml(res, 200, `<h2>✅ WhatsApp connected</h2><p class="muted">${tenant.businessName} · ${s.phone || ''}</p><p class="muted">You can close this page.</p>`);
    }
    const qr = await fetch(`${CONFIG.openwaBase}/sessions/${sessionId}/qr`, { headers: { 'X-API-Key': CONFIG.apiKey } }).then((r) => r.json()).catch(() => ({}));
    const img = qr.qrCode ? `<img src="${qr.qrCode}" alt="QR"/>` : `<p>Generating QR… this page refreshes automatically.</p>`;
    return sendHtml(res, 200, `<h2>Scan to connect WhatsApp</h2><p class="muted">${tenant.businessName} · session "${tenant.session}"</p>${img}<p class="muted">WhatsApp ▸ Linked devices ▸ Link a device<br>(status: ${s.status || 'starting'} · auto-refreshing)</p>`, 5);
  } catch (e) {
    return sendHtml(res, 200, `<h2>Session not ready</h2><p class="muted">${e.message}</p><p class="muted">Create &amp; start session "${tenant.session}" first.</p>`, 6);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${CONFIG.port}`);
  const pathname = url.pathname.replace(/\/$/, '') || '/';

  if (req.method === 'GET' && (pathname === '/' || pathname === '/health')) {
    return send(res, 200, {
      service: 'missed-call-textback',
      ok: true,
      tenants: [...TENANTS.byNumber.keys()],
      defaultTenant: TENANTS.fallback.businessName,
      webhookPath: CONFIG.webhookToken ? `/telnyx/${CONFIG.webhookToken}` : '/telnyx',
    });
  }

  // QR page — scan WhatsApp from a phone browser
  if (req.method === 'GET' && pathname === '/qr') {
    return renderQrPage(res);
  }

  // Live, auto-refreshing QR page — open in a browser to link WhatsApp.
  //   /qr?session=textback-demo
  if (req.method === 'GET' && pathname === '/qr') {
    const session = url.searchParams.get('session') || TENANTS.fallback.session;
    const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Link WhatsApp — ${session}</title>
<style>body{font-family:system-ui,sans-serif;text-align:center;background:#0b141a;color:#e9edef;padding:24px}
img{width:280px;height:280px;background:#fff;border-radius:12px;padding:10px}
.s{margin-top:16px;font-size:18px}.ok{color:#25d366}.muted{color:#8696a0;font-size:14px;margin-top:8px}</style></head>
<body><h2>Link WhatsApp</h2>
<div class="muted">Session: <b>${session}</b><br>WhatsApp → Linked Devices → Link a device → scan below</div>
<div style="margin-top:18px"><img id="q" src="/qr.png?session=${encodeURIComponent(session)}&t=0" alt="QR"></div>
<div class="s" id="s">Loading…</div>
<script>
let n=0;
async function tick(){
  try{
    const r=await fetch('/qr-status?session=${encodeURIComponent(session)}');
    const d=await r.json();
    const s=document.getElementById('s');
    if(d.status==='ready'||d.status==='connected'){
      s.innerHTML='✅ Connected'+(d.phone?(' as '+d.phone):'');s.className='s ok';
      document.getElementById('q').style.display='none';return;
    }
    s.textContent='Waiting for scan… ('+d.status+')';
    document.getElementById('q').src='/qr.png?session=${encodeURIComponent(session)}&t='+(n++);
  }catch(e){}
  setTimeout(tick,4000);
}
tick();
</script></body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  if (req.method === 'GET' && pathname === '/qr.png') {
    const session = url.searchParams.get('session') || TENANTS.fallback.session;
    try {
      const { png } = await fetchSessionQr(session);
      if (!png) return send(res, 204, '');
      res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
      return res.end(png);
    } catch (e) {
      return send(res, 500, { error: e.message });
    }
  }

  if (req.method === 'GET' && pathname === '/qr-status') {
    const session = url.searchParams.get('session') || TENANTS.fallback.session;
    try {
      const sessionId = await resolveSessionId(session, true);
      const r = await fetch(`${CONFIG.openwaBase}/sessions/${sessionId}`, { headers: { 'X-API-Key': CONFIG.apiKey } });
      const d = r.ok ? await r.json() : {};
      return send(res, 200, { status: d.status || 'unknown', phone: d.phone || null });
    } catch (e) {
      return send(res, 200, { status: 'error', error: e.message });
    }
  }

  // Reload tenants.json without restarting
  if (req.method === 'POST' && pathname === '/reload') {
    TENANTS = loadTenants();
    sessionIdCache.clear();
    return send(res, 200, { reloaded: true, tenants: [...TENANTS.byNumber.keys()] });
  }

  // Manual trigger for demos / Loom — no Telnyx needed.
  //   /simulate?from=+447700900123[&to=+442038389029]
  if (pathname === '/simulate') {
    let from = url.searchParams.get('from');
    let to = url.searchParams.get('to');
    if (req.method === 'POST') {
      try {
        const body = JSON.parse((await readBody(req)) || '{}');
        from = from || body.from;
        to = to || body.to;
      } catch (_) {}
    }
    if (!from) return send(res, 400, { error: 'provide ?from=+44...' });
    const tenant = tenantFor(to);
    log('SIMULATE missed call from', from, 'to', to, `[${tenant.businessName}]`);
    textBackMissedCall(from, tenant);
    return send(res, 200, { ok: true, simulatedFrom: from, tenant: tenant.businessName });
  }

  // --- Booking demo: GET /book (form) + POST /book (sends WhatsApp/SMS confirmation) ---
  if (req.method === 'GET' && pathname === '/book') {
    const t = TENANTS.fallback;
    const biz = (url.searchParams.get('b') || t.businessName).replace(/[<>]/g, '');
    const lang = ({ fr: 'fr', ar: 'ar' })[String(url.searchParams.get('lang') || '').toLowerCase()] || 'en';
    const T = {
      en: { title: 'Book with', sub: "Pick a time — we'll text you a confirmation on WhatsApp.", name: 'Your name', mobile: 'Your mobile (with country code, e.g. +44…)', service: 'Service', sph: 'e.g. haircut / quote / appointment', dt: 'Preferred date & time', btn: 'Request booking', ok: '✅ Sent! Check your WhatsApp for confirmation.', done: 'Done', err: 'Please enter a valid mobile with country code (e.g. +44…)' },
      fr: { title: 'Réserver avec', sub: 'Choisissez un horaire — nous vous enverrons une confirmation par WhatsApp.', name: 'Votre nom', mobile: 'Votre mobile (avec indicatif, ex. +33…)', service: 'Service', sph: 'ex. coupe / devis / rendez-vous', dt: 'Date et heure souhaitées', btn: 'Demander un rendez-vous', ok: '✅ Envoyé ! Vérifiez WhatsApp pour la confirmation.', done: 'Terminé', err: 'Veuillez saisir un mobile valide avec indicatif (ex. +33…)' },
      ar: { title: 'احجز مع', sub: 'اختر الوقت المناسب — وسنرسل لك تأكيداً عبر واتساب.', name: 'اسمك', mobile: 'رقم هاتفك (مع رمز الدولة، مثال +212…)', service: 'الخدمة', sph: 'مثال: قص شعر / عرض سعر / موعد', dt: 'التاريخ والوقت المفضّل', btn: 'طلب الحجز', ok: '✅ تم الإرسال! تحقّق من واتساب للتأكيد.', done: 'تم', err: 'يرجى إدخال رقم هاتف صحيح مع رمز الدولة (مثال +212…)' },
    }[lang];
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const html = `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${T.title} ${biz}</title>
<style>body{font-family:system-ui,'Segoe UI',Tahoma,sans-serif;background:#f7f9fa;margin:0;padding:24px;color:#0b141a}
.card{max-width:440px;margin:0 auto;background:#fff;border:1px solid #e9edef;border-radius:16px;padding:24px}
h1{font-size:22px;margin:0 0 4px}.muted{color:#667781;font-size:14px;margin-bottom:18px}
label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px}
input{width:100%;padding:11px 12px;border:1px solid #cfd9de;border-radius:10px;font-size:15px;box-sizing:border-box}
button{width:100%;margin-top:18px;background:#25d366;color:#fff;border:0;border-radius:999px;padding:14px;font-size:16px;font-weight:700;cursor:pointer}
.ok{display:none;text-align:center;color:#1da851;font-weight:700;margin-top:14px}</style></head>
<body><div class="card">
<h1>${T.title} ${biz}</h1><div class="muted">${T.sub}</div>
<form id="f">
<label>${T.name}</label><input name="name" required>
<label>${T.mobile}</label><input name="mobile" required>
<label>${T.service}</label><input name="service" placeholder="${T.sph}">
<label>${T.dt}</label><input name="datetime" type="datetime-local">
<button type="submit">${T.btn}</button>
<div class="ok" id="ok">${T.ok}</div>
</form></div>
<script>
document.getElementById('f').addEventListener('submit',async e=>{e.preventDefault();
const d=Object.fromEntries(new FormData(e.target));
const r=await fetch('/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
if(r.ok){document.getElementById('ok').style.display='block';e.target.querySelector('button').textContent=${JSON.stringify(T.done)};}
else{alert(${JSON.stringify(T.err)});}});
</script></body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  if (req.method === 'POST' && pathname === '/book') {
    const raw = await readBody(req);
    let body = {}; try { body = JSON.parse(raw || '{}'); } catch (_) {}
    const t = TENANTS.fallback;
    const name = String(body.name || 'there').slice(0, 60);
    const mobile = body.mobile || body.phone || '';
    const service = String(body.service || '').slice(0, 80);
    const datetime = String(body.datetime || '').slice(0, 80);
    const chatId = toChatId(mobile);
    if (!chatId) return send(res, 400, { error: 'valid mobile required' });
    const text = `Hi ${name}! ✅ Thanks for your booking request${service ? ` for ${service}` : ''}${datetime ? ` on ${datetime}` : ''} with ${t.businessName}. We'll confirm shortly — reply here if anything changes.`;
    try {
      if (t.channel === 'sms') await sendSms(t.smsFrom, mobile, text);
      else await sendWhatsApp(t.session, chatId, text);
      log(`✅ booking confirm sent to ${chatId} [${t.businessName}]`);
      return send(res, 200, { ok: true });
    } catch (e) {
      log('❌ booking confirm failed:', e.message);
      return send(res, 500, { error: e.message });
    }
  }

  // Telnyx webhook
  if (req.method === 'POST' && (pathname === '/telnyx' || pathname === `/telnyx/${CONFIG.webhookToken}`)) {
    if (CONFIG.webhookToken && pathname !== `/telnyx/${CONFIG.webhookToken}`) {
      return send(res, 401, { error: 'bad token' });
    }
    const raw = await readBody(req);
    send(res, 200, { received: true }); // ack fast, process async
    try {
      handleTelnyxEvent(JSON.parse(raw || '{}'));
    } catch (err) {
      log('❌ bad webhook payload:', err.message);
    }
    return;
  }

  send(res, 404, { error: 'not found' });
});

server.listen(CONFIG.port, CONFIG.bindHost, () => {
  log(`missed-call-textback listening on ${CONFIG.bindHost}:${CONFIG.port}`);
  log(`  OpenWA:   ${CONFIG.openwaBase}`);
  log(`  Tenants:  ${TENANTS.byNumber.size} configured | default="${TENANTS.fallback.businessName}" (session "${TENANTS.fallback.session}")`);
  log(`  Webhook:  POST ${CONFIG.webhookToken ? `/telnyx/${CONFIG.webhookToken}` : '/telnyx'}`);
  log(`  SMS:      ${CONFIG.telnyxApiKey ? 'available' : 'TELNYX_API_KEY not set'}`);
  if (!CONFIG.apiKey) log('  ⚠️  OPENWA_API_KEY is empty — set it in .env');
});
