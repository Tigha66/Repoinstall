# 📞 Live Voice AI Receptionist — Telnyx ↔ OpenAI Realtime

Answers real phone calls, talks to the caller, books appointments, and sends a WhatsApp/SMS
confirmation (via RingBack). Built but **not yet tested on a live call** — follow the steps below
to deploy and verify. Two things may need a small tweak on the first call (flagged in the code):
Telnyx `streaming_start` params and the audio format names.

## What you need
1. **OpenAI API key** with Realtime access.
2. **Telnyx**: a voice number + a Call Control Application (for the webhook), and your API key.
3. A **public TLS WebSocket URL** (e.g. `wss://voice.callpilotvoice.co.uk/media`) that reaches this server.

## Deploy (on your VPS)
```bash
cd ai-receptionist/voice
cp .env.example .env          # fill in OPENAI_API_KEY, TELNYX_API_KEY, PUBLIC_WSS_URL
npm install                   # installs the only dep: ws
node server.js                # or: pm2 / docker / systemd to keep it running
# health check:
curl localhost:5050/health
```

### Expose it with TLS (Telnyx requires https webhook + wss media)
Point a subdomain (e.g. `voice.callpilotvoice.co.uk`) at this server's port `5050` via your
existing **Traefik** reverse proxy (it already does Let's Encrypt for your other services).
- HTTPS `https://voice.callpilotvoice.co.uk/telnyx-voice` → webhook
- WSS `wss://voice.callpilotvoice.co.uk/media` → media stream (set as PUBLIC_WSS_URL)

## Wire up Telnyx
1. **Voice → Call Control Applications → Create** → set the **Webhook URL** to
   `https://voice.callpilotvoice.co.uk/telnyx-voice`.
2. Assign your **voice phone number** to that Call Control Application.
3. Make sure your Telnyx API key is in `.env`.

## Test
1. Call your Telnyx number from your phone.
2. You should hear the AI greet you as the business, hold a conversation, and book an appointment.
3. Give it a name + service + time + your mobile → you should receive a **WhatsApp/SMS confirmation**.
4. Watch the server logs for the event flow and any errors.

## How it works (data flow)
```
Caller → Telnyx number → /telnyx-voice webhook → answer → streaming_start
      → Telnyx opens WSS to /media → caller audio (µ-law 8k) → OpenAI Realtime
      → OpenAI understands + speaks (µ-law) → back to Telnyx → caller hears AI
      → model calls book_appointment() → POST RingBack /book → WhatsApp/SMS confirmation
```

## Cost
OpenAI Realtime voice ≈ $0.06–0.15/min (check openai.com/api/pricing). Telnyx voice + streaming is
a few ¢/min. At your **AI-Pro pricing ($399–$799/mo)** this is very profitable — but price for usage.

## Troubleshooting (first live call)
- **No audio back / one-way:** Telnyx bidirectional streaming params — confirm `streaming_start`
  field names + that bidirectional WS audio is enabled (Telnyx docs); adjust in voice-server.js.
- **Garbled audio:** audio format mismatch — keep both sides on µ-law 8k (`g711_ulaw` ↔ `PCMU`).
- **AI doesn't greet:** check OPENAI_API_KEY + Realtime access; see logs for `OpenAI error`.
- **No confirmation text:** the RingBack WhatsApp session must be connected (OpenWA dashboard).

## ⚠️ Honesty
Sell this only once you've completed a successful live test. Until then, demo the **chat** version
(`ai-receptionist/server.js`) — it shows the same conversation + real WhatsApp booking confirmation.
