#!/usr/bin/env node
/**
 * WEBSITE VOICE AI RECEPTIONIST (browser, WebRTC ↔ OpenAI Realtime)
 * ----------------------------------------------------------------
 * A "Talk to our receptionist" voice widget you can embed on any website.
 * Visitor clicks → speaks into their mic → the AI talks back in real time →
 * books an appointment → sends a WhatsApp/SMS confirmation via RingBack.
 *
 * No telephony needed — runs entirely in the browser. Only requirement: OPENAI_API_KEY.
 * (The phone-call version lives in ../voice/ and uses Telnyx.)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

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
  port: process.env.PORT || 5060,
  openaiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime',
  voice: process.env.VOICE || 'alloy',
  business: process.env.BUSINESS_NAME || 'Bright Smile Dental',
  agent: process.env.AGENT_NAME || 'Aria',
  hours: process.env.HOURS || 'Mon–Sat, 9am–6pm',
  confirmUrl: process.env.CONFIRM_URL || 'https://get.callpilotvoice.co.uk/api/book',
};
const log = (...a) => console.log(new Date().toISOString(), ...a);

// Business types — one deployment serves any business (pick via ?biz=KEY, or the on-page dropdown).
const BUSINESSES = {
  dental:     { name: 'our dental clinic', thing: 'appointment', services: 'check-ups, cleaning, whitening, consultations' },
  barber:     { name: 'our barbershop',    thing: 'appointment', services: 'haircuts, beard trims, shaves, skin fades' },
  salon:      { name: 'our salon',         thing: 'appointment', services: 'haircuts, colour, manicures, facials, lashes' },
  restaurant: { name: 'our restaurant',    thing: 'reservation',  services: 'table reservations, takeaway orders, private events' },
  hvac:       { name: 'our company',       thing: 'job',          services: 'AC repair, installation, maintenance, emergency callouts' },
  auto:       { name: 'our garage',        thing: 'booking',      services: 'MOT, servicing, repairs, diagnostics' },
  medspa:     { name: 'our med spa',       thing: 'appointment',  services: 'botox, fillers, facials, laser, consultations' },
  law:        { name: 'our firm',          thing: 'consultation', services: 'consultations, case reviews' },
  realestate: { name: 'our agency',        thing: 'viewing',      services: 'viewings, valuations, consultations' },
  general:    { name: 'our business',      thing: 'appointment',  services: 'appointments, consultations, quotes' },
};
function bizCfg(key) { return BUSINESSES[key] || BUSINESSES[process.env.BUSINESS_TYPE || 'dental'] || BUSINESSES.dental; }
function instructionsFor(c) {
  const what = c.thing === 'reservation' ? 'a reservation' : c.thing === 'job' ? 'a job booking' : 'an ' + c.thing;
  return `You are ${CFG.agent}, a warm, professional voice receptionist for ${c.name} (open ${CFG.hours}). ` +
    `We offer: ${c.services}. Greet the caller briefly, then help. To book ${what}, collect one at a time: ` +
    `service, full name, preferred day/time, and mobile number. When you have all four, call book_appointment, then ` +
    `confirm in one short sentence that a confirmation will be texted. Answer simple questions briefly. Keep it short and natural.`;
}

const TOOLS = [{
  type: 'function', name: 'book_appointment',
  description: 'Book an appointment once name, service, day/time and mobile number are known.',
  parameters: { type: 'object', properties: {
    name: { type: 'string' }, service: { type: 'string' },
    datetime: { type: 'string' }, phone: { type: 'string' } },
    required: ['name', 'service', 'datetime', 'phone'] },
}];

function readBody(req) { return new Promise((r) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => r(b)); }); }

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && u.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, business: CFG.business, key: !!CFG.openaiKey }));
  }

  // Mint a short-lived OpenAI Realtime session token for the browser (key stays server-side)
  if (req.method === 'GET' && u.pathname === '/session') {
    if (!CFG.openaiKey) { res.writeHead(500); return res.end(JSON.stringify({ error: 'OPENAI_API_KEY not set' })); }
    try {
      // pick the business (?biz=KEY) and optional custom name (?name=...)
      const base = bizCfg(u.searchParams.get('biz'));
      const c = { ...base, name: (u.searchParams.get('name') || base.name) };
      // Current GA endpoint to mint an ephemeral client secret for browser WebRTC
      const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
        method: 'POST',
        headers: { Authorization: `Bearer ${CFG.openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: {
          type: 'realtime', model: CFG.model, instructions: instructionsFor(c),
          tools: TOOLS, tool_choice: 'auto', audio: { output: { voice: CFG.voice } },
        } }),
      });
      const j = await r.json();
      const value = j.value || j.client_secret?.value || null;
      res.writeHead(r.ok && value ? 200 : 500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ value, model: CFG.model, business: c.name, error: j.error?.message }));
    } catch (e) { res.writeHead(500); return res.end(JSON.stringify({ error: e.message })); }
  }

  // Booking confirmation proxy (browser tool-call -> RingBack -> WhatsApp/SMS)
  if (req.method === 'POST' && u.pathname === '/book') {
    const body = JSON.parse((await readBody(req)) || '{}');
    try {
      const r = await fetch(CFG.confirmUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: body.name, mobile: body.phone, service: body.service, datetime: body.datetime, business: body.business || CFG.business }) });
      log('booking confirm', body.phone, r.ok ? 'ok' : 'fail');
      res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ ok: r.ok }));
    } catch (e) { res.writeHead(500); return res.end(JSON.stringify({ error: e.message })); }
  }

  if (req.method === 'GET' && (u.pathname === '/' || u.pathname === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(PAGE);
  }
  res.writeHead(404); res.end('not found');
});

server.listen(CFG.port, () => {
  log(`Web voice receptionist on :${CFG.port}  | OpenAI key: ${CFG.openaiKey ? 'set' : 'MISSING'} | business: ${CFG.business}`);
  if (!CFG.openaiKey) log('⚠️  Set OPENAI_API_KEY in .env to enable voice.');
});

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Talk to our receptionist</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#0b141a;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
.card{max-width:420px;width:100%;background:#111c24;border:1px solid #223;border-radius:22px;padding:30px;text-align:center}
.av{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#25d366,#1da851);display:grid;place-items:center;font-size:42px;margin:0 auto 16px;transition:.2s}
.av.live{animation:pulse 1.2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(37,211,102,.5)}70%{box-shadow:0 0 0 22px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}
h1{font-size:20px;margin-bottom:4px}.sub{color:#8aa;font-size:14px;margin-bottom:16px}
select{width:100%;padding:11px 12px;border:1px solid #2a3a44;border-radius:12px;font-size:15px;background:#0b141a;color:#fff;margin-bottom:14px}
button{width:100%;border:0;border-radius:999px;padding:16px;font-size:17px;font-weight:800;cursor:pointer}
.start{background:#25d366;color:#fff}.stop{background:#e74c3c;color:#fff;display:none}
.status{margin-top:16px;color:#8aa;font-size:13px;min-height:18px}
.hint{margin-top:14px;color:#5a6b73;font-size:12px;line-height:1.5}
</style></head><body>
<div class="card">
  <div class="av" id="av">🎙️</div>
  <h1 id="biz">Talk to our receptionist</h1>
  <div class="sub">Pick a business, tap, allow your mic, and just speak.</div>
  <select id="bizsel">
    <option value="dental">🦷 Dental clinic</option>
    <option value="barber">💈 Barbershop</option>
    <option value="salon">💇 Hair / Beauty salon</option>
    <option value="restaurant">🍽️ Restaurant / Café</option>
    <option value="hvac">❄️ HVAC / Trades</option>
    <option value="auto">🚗 Auto repair</option>
    <option value="medspa">💆 Med spa</option>
    <option value="law">⚖️ Law firm</option>
    <option value="realestate">🏠 Real estate</option>
    <option value="general">📅 Other business</option>
  </select>
  <button class="start" id="start">📞 Start call</button>
  <button class="stop" id="stop">■ End call</button>
  <div class="status" id="status"></div>
  <div class="hint">AI voice receptionist — answers, books appointments, and sends a WhatsApp confirmation.</div>
  <audio id="aud" autoplay></audio>
</div>
<script>
let pc,dc,stream,BIZNAME='';
const $=id=>document.getElementById(id);
function setStatus(t){$('status').textContent=t;}
const params=new URLSearchParams(location.search);
// ?biz=barber preselects; ?name=Mario%27s%20Barbers sets a custom name; ?lock=1 hides the picker (client links)
if(params.get('biz'))$('bizsel').value=params.get('biz');
if(params.get('lock')==='1')$('bizsel').style.display='none';
function sessionUrl(){
  let q='session?biz='+encodeURIComponent($('bizsel').value);
  if(params.get('name'))q+='&name='+encodeURIComponent(params.get('name'));
  return q;
}
async function start(){
  try{
    setStatus('Connecting…');
    const tok=await fetch(sessionUrl()).then(r=>r.json());
    if(!tok.value){setStatus('Setup needed: '+(tok.error||'no session token (add OpenAI credit?)'));return;}
    BIZNAME=tok.business||''; if(BIZNAME)$('biz').textContent=BIZNAME;
    const EPH=tok.value, MODEL=tok.model;
    pc=new RTCPeerConnection();
    pc.ontrack=e=>{$('aud').srcObject=e.streams[0];};
    stream=await navigator.mediaDevices.getUserMedia({audio:true});
    pc.addTrack(stream.getTracks()[0],stream);
    dc=pc.createDataChannel('oai-events');
    dc.onopen=()=>{dc.send(JSON.stringify({type:'response.create'}));};
    dc.onmessage=onEvent;
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);
    const r=await fetch('https://api.openai.com/v1/realtime/calls?model='+MODEL,{method:'POST',body:offer.sdp,
      headers:{Authorization:'Bearer '+EPH,'Content-Type':'application/sdp'}});
    await pc.setRemoteDescription({type:'answer',sdp:await r.text()});
    $('start').style.display='none';$('stop').style.display='block';$('av').classList.add('live');
    setStatus('🟢 Connected — start speaking');
  }catch(e){setStatus('Error: '+e.message);}
}
function onEvent(e){
  let m;try{m=JSON.parse(e.data);}catch(_){return;}
  if(m.type==='response.function_call_arguments.done'&&m.name==='book_appointment'){
    let a={};try{a=JSON.parse(m.arguments||'{}');}catch(_){}
    a.business=BIZNAME;
    fetch('book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(a)});
    dc.send(JSON.stringify({type:'conversation.item.create',item:{type:'function_call_output',call_id:m.call_id,output:JSON.stringify({booked:true})}}));
    dc.send(JSON.stringify({type:'response.create'}));
    setStatus('✅ Booking captured — confirmation sent');
  }
}
$('bizsel').onchange=function(){ if($('stop').style.display==='block'){stop();} $('biz').textContent='Talk to our receptionist'; };
function stop(){try{pc&&pc.close();stream&&stream.getTracks().forEach(t=>t.stop());}catch(_){}
  $('stop').style.display='none';$('start').style.display='block';$('av').classList.remove('live');setStatus('Call ended.');}
$('start').onclick=start;$('stop').onclick=stop;
</script></body></html>`;
