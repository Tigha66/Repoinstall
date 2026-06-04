# RingBack — Missed-Call → WhatsApp Text-Back (LIVE)

> ⚠️ **AGENTS / DEVELOPERS READ FIRST:** This product is **already built and running in
> production.** Do **NOT** rebuild it, spin up a new Twilio/ngrok demo, or use any
> `*.daytonaproxy01.net` sandbox URL (those are dead/throwaway). Everything below is live.

RingBack is a done-for-you **"WhatsApp receptionist"**: when a customer calls a business
and no one answers, the caller instantly gets a branded WhatsApp text-back, so the business
stops losing enquiries. Sold to UK local businesses on monthly recurring revenue (£49–£249/mo).

---

## ✅ Live system (production, on the Hostinger VPS)
| Thing | Value |
|---|---|
| Landing page | **https://get.callpilotvoice.co.uk** (demo video, pricing, 7-day trial) |
| Webhook (Telnyx → service) | **https://api.76-13-252-4.sslip.io/telnyx/<token>** |
| Service health | https://api.76-13-252-4.sslip.io/health |
| Live QR (link a WhatsApp session) | https://api.76-13-252-4.sslip.io/qr?session=<name> |
| Telephony | **Telnyx** — number **+44 20 3838 9029** (configured) |
| WhatsApp engine | **OpenWA** (unofficial) in Docker on the VPS (`openwa-api`) |
| WhatsApp sender | session `textback-demo` → **447742344614** (connected, tested) |
| Contact | hello@callpilotvoice.co.uk · WhatsApp +447901921642 |

**Architecture:** Caller dials the Telnyx number → Telnyx posts call webhooks to the
text-back service (Docker container `missed-call-textback`, behind Traefik/HTTPS) → on an
unanswered incoming call it calls the OpenWA API → OpenWA sends the WhatsApp text-back.
Multi-tenant: each client = one OpenWA session + one row in `/opt/textback/tenants.json`,
keyed by the dialed Telnyx number. A cron **watchdog** auto-heals the session.

## 📁 What's in this repo
| Path | Purpose |
|---|---|
| `demo/missed-call-textback/` | The service: `server.js`, `onboard.sh`, `rebrand.sh`, `DEPLOY.md`, `README.md` |
| `demo/landing/index.html` | The live landing page source |
| `demo/sales-kit/` | Go-to-market: see below |
| `openwa/` | The OpenWA gateway (NestJS) — the WhatsApp engine |
| `OPENWA_SETUP.md` | OpenWA run/setup guide |

### Sales kit (`demo/sales-kit/`)
- `LAUNCH-PLAN.md` — MRR plan + 14-day launch sprint
- `outreach-scripts.md` — cold/warm message templates (cleaning-peer + professional variants)
- `first-10-targets.md` — seeded London cleaning prospect list + how to find more
- `pricing-one-pager.md`, `roi-calculator.md`, `trial-tracker.csv`, `lead-list-template.csv`
- `onboard-client-checklist.md` — activate a new client in ~2 min
- `hermes-agent-prompt.md` — **master brief for the autonomous sales agent**

## 🎯 Decisions already made (don't re-ask)
- Telephony = **Telnyx** (set up). WhatsApp = **OpenWA unofficial** (migrate to official
  Cloud API past ~10–15 clients). Wedge = **missed-call → WhatsApp text-back** (live).
- Pricing = **£49 / £99 / £249** + 7-day free trial. First niche = **London cleaning companies**.

## 🤖 If you are an agent helping with this
Your job is **sales/outreach + client onboarding**, not rebuilding infra:
1. Research & qualify prospects → personalise messages → schedule follow-ups → track → report.
2. **Never auto-send/bulk-send cold WhatsApp/DMs** (instant ban + UK PECR/GDPR breach).
   Draft personalised messages **one-by-one for human approval**; the system itself only
   ever replies to **inbound** messages.
3. To onboard a signed-up client: run `/opt/textback/onboard.sh` on the VPS (see
   `demo/sales-kit/onboard-client-checklist.md`).
