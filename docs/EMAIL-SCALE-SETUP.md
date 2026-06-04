# 📈 Option A — Scale Cold Email Safely (Instantly/Smartlead)

Goal: send **hundreds of personalised cold emails/week** without getting blocked or burning
your real domain. This is the standard "cold-email infrastructure" setup.

> ⚠️ Golden rule: **never send cold email from `callpilotvoice.co.uk` or your personal Gmail.**
> Use throwaway *secondary* domains so that if one gets flagged, your real brand is untouched.

---

## 1. Shopping list (one-time + monthly)
| Item | What / why | Cost |
|---|---|---|
| **2 secondary domains** | e.g. `trycallpilot.com`, `getringback.com`. Sending domains (not your main one). | ~£8–10/yr each |
| **Inboxes** | 2–3 mailboxes per domain (e.g. `abdelhaq@`, `hello@`, `team@`) = 4–6 total | Google Workspace ~£5/inbox/mo, or use the tool's hosted inboxes |
| **Cold-email tool** | **Instantly.ai** (~$37/mo) or **Smartlead** (~$39/mo) — does warmup, inbox rotation, sequences, throttling | ~£30–40/mo |
| **Lead source** | Google-Maps scraper (Outscraper / Apify) for local cleaning firms + emails, or Apollo.io for B2B | ~£30–50/mo |
| **Email verifier** | MillionVerifier / ZeroBounce (or built into the tool) — kills bounces | ~£15–20 |

**Total ≈ £80–120/mo to run.** One Pro client (£99/mo) covers it; everything above is profit.

## 2. Setup steps (Day 0, ~1–2 hours)
1. **Buy 2 domains** (Cloudflare/Namecheap). Keep them close to your brand but separate.
2. **Create 2–3 inboxes per domain** (Google Workspace or the tool's DFY inboxes).
3. **Add DNS records for each domain** (the tool gives exact values — copy-paste into Cloudflare):
   - **SPF** (TXT): authorises your sender (e.g. `v=spf1 include:_spf.google.com ~all`)
   - **DKIM** (TXT): signs your mail (Workspace/tool provides the key)
   - **DMARC** (TXT): `v=DMARC1; p=none; rua=mailto:you@domain`
   - **Custom tracking domain** (CNAME): so open/click tracking isn't on a shared domain
   *(SPF+DKIM+DMARC = the 3 records that decide if you land in inbox vs spam. Non-negotiable.)*
4. **Connect the inboxes to Instantly/Smartlead.**
5. **Turn on warmup** for every inbox and **wait 2–3 weeks** before real sending. (The tool
   auto-sends/replies tiny volumes to build reputation. Skipping this = straight to spam.)

## 3. While warming up (do this in week 1–2)
- **Build your lead list (500–1,000):** scrape Google Maps for `cleaning company [London area]`,
  `end of tenancy cleaning [area]`, `office cleaning [area]` across boroughs → export name,
  website, email, phone. Apply the qualification filter from `LONDON_CLEANING_LEADS.md`.
- **Verify every email** (MillionVerifier). Remove invalid/risky → keeps bounce rate < 3%.
- **Load the sequence** (below) into the tool with merge fields `{firstName}` `{company}` `{area}`.

## 4. The sequence (reuse + extend `EMAIL-OUTREACH.md`)
- **Email 1 (Day 0):** the core email — personalised first line + missed-call angle + demo link + free trial.
- **Email 2 (Day 3):** short bump — "did this reach you? happy to switch on the free trial."
- **Email 3 (Day 6):** value nudge — "1 recovered job usually pays for it; free for 7 days."
- **Email 4 (Day 10):** breakup — "I'll close your file — want in on the trial before I do?"
Keep each 4–6 lines, one CTA, plain text (no images/lots of links = better deliverability).
Always include identity + an opt-out line (UK PECR/GDPR).

## 5. Sending settings (don't get flagged)
- **Ramp slowly:** start ~20/inbox/day, increase ~5/week to a max ~40/inbox/day.
- With 5 inboxes that's **~150–200 sends/day** safely (rotated by the tool).
- Spread across the day, weekdays, business hours. Stop sending to anyone who replies.
- Keep **bounce < 3%**, **spam complaints near 0**. If deliverability dips, pause + re-warm.

## 6. What "good" looks like (KPIs)
- Open rate 40–60% · Reply rate 3–8% · Positive replies 1–3% of sends.
- ~1,000 sends → ~30–60 replies → ~10–20 interested → a handful of trials → paying clients.
- Track in the tool's dashboard; push interested replies into your trial pipeline.

## 7. Guardrails (keep it legal + safe)
- Secondary domains only; never your main brand/personal email.
- Verify emails before sending; honour opt-outs instantly; clear sender identity.
- Personalise (first line + company) — generic blasts get flagged and ignored.
- This is for **outreach only**. The product still only ever replies to **inbound** messages.

## 8. Fast path if you don't want to DIY
Instantly/Smartlead both sell **"done-for-you" domain+inbox+warmup setups** (~£100–150 one-off)
— they buy the domains, create inboxes, set DNS, and warm them. Worth it to skip the fiddly part.

---

**Realistic timeline:** set up this week → warm up 2–3 weeks → start sending at scale in ~3
weeks. **In the meantime, run `EMAIL-OUTREACH.md` (Option C) manually** so you're getting
replies and your first customers *now*, while the scaled engine warms up.
