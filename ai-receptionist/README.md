# 🤖 AI Receptionist — standalone prototype

A separate project (NOT part of RingBack) that demonstrates how an AI receptionist behaves:
it **answers**, understands the caller, **books an appointment** (service → name → time → phone),
answers basic questions, and outputs a structured booking + summary.

## What this IS vs RingBack
| | RingBack | AI Receptionist (this) |
|---|---|---|
| Trigger | A **missed** call | Actually **answers** the call/chat |
| Talks to caller | ❌ (texts back) | ✅ holds a conversation |
| Books | via link/reply | conversationally, captures details |
| Complexity / cost | low | higher (voice AI + telephony) |

## Run it (zero setup, no API key)
```bash
cd ai-receptionist
node server.js
# open http://localhost:4000
```
Type as if you're the caller (e.g. "I'd like to book a cleaning"). It will book you and
show the captured booking. Works out of the box with a **scripted brain** (free, reliable).

## Make it sound truly AI (optional)
Add an OpenAI key for free-form natural language:
```bash
cp .env.example .env
# edit .env → OPENAI_API_KEY=sk-...
node server.js   # brain switches to OpenAI automatically
```
Cost is usage-based (gpt-4o-mini is very cheap for text). Check current pricing at openai.com/api/pricing.

## Configure the business
In `.env`:
```
BUSINESS_NAME=Bright Smile Dental
AGENT_NAME=Aria
HOURS=Mon–Sat, 9am–6pm
```

## How to turn this into a REAL phone receptionist (roadmap)
This prototype is **text/chat** to show the experience. To answer actual phone calls you add:
1. **Telnyx Voice (Call Control)** — receive the inbound call, stream audio.
2. **Speech-to-text** — transcribe the caller (Telnyx/Deepgram/OpenAI).
3. **The brain** (this server's logic, or OpenAI Realtime) — decide the reply.
4. **Text-to-speech** — speak back (Telnyx/ElevenLabs/OpenAI).
5. **Media streaming** glue (WebSocket) between Telnyx and the AI.
6. On booking → send SMS/WhatsApp confirmation + write to calendar (reuse RingBack's Telnyx/Cal.com).

The fastest real path today = **OpenAI Realtime API ↔ Telnyx media streaming** (voice-to-voice),
with this booking logic as the "tools" the model calls. That's a bigger build — do it only when
you have demand / a paying customer who wants the phone actually answered.

## Where this fits commercially
This is the **"AI Pro / AI Receptionist" tier** ($399–799+/mo) — premium, for clinics, law firms,
real estate, HVAC. Sell RingBack first (missed-call text-back); offer this as the upsell later.

⚠️ Honesty: until the telephony piece above is built, this answers **chat**, not live phone calls.
Don't sell "answers your phone" until step 1–5 are in place.
