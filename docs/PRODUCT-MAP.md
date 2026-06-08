# 🗂️ Your Products — what they are, links, how to use & sell

You have 3 sellable products + the tools to sell them. Here's everything in one place.

## 1) 🌐 Websites for local businesses (autoAIwebsolutions)
- **Live:** https://autoaiwebsolutions.com  (GitHub Pages — edit repo `tigha66/openclaw-config` → index.html)
- **What:** £397 one-off or £39/mo websites for plumbers, dentists, salons, estate agents.
- **Now has:** the AI voice widget embedded (floating mic) — your live proof/demo.
- **Sell:** "Website + AI receptionist" bundle.

## 2) 📞 RingBack — missed-call text-back + booking
- **Landing (per market):** https://get.callpilotvoice.co.uk (UK £) · /ae.html (Gulf $) · /us.html · /fr.html · /es.html · /it.html · /ca.html · /ma.html · /ar.html
- **What:** when a business misses a call, the caller instantly gets a WhatsApp (or SMS in US) + booking link.
- **Booking page:** /book.html  · **Live demo to a phone:** /demo.html
- **Pricing:** UK £39/49/99/199 · Gulf $99/199/399 · US $49/149/249/499 · Maghreb 290/590/990 MAD
- **Sell:** Gulf email + London walk-ins. Onboard a client → send me business name + WhatsApp number.

## 3) 🎙️ AI Voice Receptionist (your hero product)
- **Try it / demo page:** https://get.callpilotvoice.co.uk/receptionist.html
- **Direct voice agent:** https://get.callpilotvoice.co.uk/talk/  (dropdown to pick business type)
- **Embed widget (any site, 1 line):**
  `<script src="https://get.callpilotvoice.co.uk/widget.js" data-name="Business" data-owner="44..." data-color="#ff6b00"></script>`
  → floating mic, in-page voice call, **auto-reads the website** & answers about that business, books, and WhatsApps the owner.
- **Client link (no embed):** /talk/?kb=THEIR-SITE&name=THEIR-NAME&owner=THEIR-WHATSAPP&lock=1
- **Phone version (answers real calls):** ai-receptionist/voice/ (Telnyx + OpenAI Realtime) — built, wire up when a client wants it.
- **Pricing:** AI Pro £199–£499/mo done-for-you.
- **Cost to run:** ~$0.02–0.05/call (gpt-realtime-mini).

## 🛠️ Selling tools
- Demo launcher: /demo.html · QR cards: /card.html · Flyers: /flyer6.html, /flyer10.html · Cheat card: /cheatcard.html
- One-pagers: /onepager.html (UK), /onepager-ae.html (Gulf)
- Lead lists + scripts: in `docs/` (Gulf, US, UK, FR/ES/IT email leads; walk-in playbook)

## ⚙️ Infrastructure (behind the scenes)
- VPS (Hostinger) runs everything via Docker: landing (nginx), missed-call-textback (RingBack), web-voice (AI agent), OpenWA.
- OpenWA dashboard (WhatsApp engine): https://openwa.callpilotvoice.co.uk  (service session = wife's number)
- Email: hello@callpilotvoice.co.uk (Hostinger; send/receive via Gmail or webmail)
- Telnyx: missed-call detection + SMS. US toll-free +1 833 301 2002 = pending verification.

## 🚦 Status
- ✅ Live & sellable now: Websites, RingBack (UK/Gulf via WhatsApp), AI Voice Receptionist (web).
- ⏳ Pending: US SMS (Telnyx toll-free approval ~5 days), official Telnyx WhatsApp (do for paying clients).

## 🎯 How to sell (the motion)
1. Demo the **AI receptionist** live (let them talk to it) — the wow moment.
2. Offer the **bundle**: website + AI receptionist + missed-call recovery.
3. Free 7-day trial → collect **business name + WhatsApp number** → send to me → I configure/onboard.
4. Channels: London walk-ins · Gulf email (authenticating perfectly) · your own site as proof.
