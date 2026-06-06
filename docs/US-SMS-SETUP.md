# 🇺🇸 US SMS setup — Toll-Free Verification (ready-to-paste) + tenant config

US = SMS country (not WhatsApp). RingBack in the US = **missed call → SMS text-back** via Telnyx.
To send automated SMS in the US you must pass **A2P verification**. Easiest path = **Toll-Free Verification**.

## Step 1 — Telnyx account
- Change account email to **hello@callpilotvoice.co.uk** (business domain — helps lift the freemail block).
- Buy a **Toll-Free number** (Numbers → Search → Toll-Free: 833/844/855/866/877/888).
  (Your current number +1 571 788 4804 is a *local* number = 10DLC, not toll-free. Toll-free is simpler — get an 8xx.)

## Step 2 — Submit Toll-Free Verification (Telnyx → Messaging → Toll-Free Verification)
Paste these answers:

**Business name:** RingBack (Abdelhak Tirha)
**Business website:** https://get.callpilotvoice.co.uk
**Business address:** (your UK address)
**Contact email:** hello@callpilotvoice.co.uk
**Business type / vertical:** Software / Communications (SaaS for small businesses)

**Use-case category:** Customer Care / Conversational
**Use-case description:**
> RingBack helps small businesses respond to missed phone calls. When a customer calls a business
> and the call is not answered, our system sends ONE automatic SMS inviting the caller to reply with
> a convenient time or to book online. We also send appointment confirmations and reminders. Every
> recipient has just dialed the business themselves, so they are expecting a reply. Every message
> identifies the business and includes opt-out instructions (Reply STOP).

**How do recipients opt in? (opt-in description):**
> The consumer initiates contact by calling the business directly; the SMS is a courtesy reply to
> their own inbound phone call. Businesses also display a notice ("By calling, you agree to receive
> SMS replies; reply STOP to opt out") at point of contact and on their website. Consumers can reply
> STOP at any time to unsubscribe and HELP for assistance.

**Opt-in screenshot/URL:** https://get.callpilotvoice.co.uk/privacy.html

**Estimated monthly volume:** 2,000 (start) — scale later
**Message frequency:** Varies; ~1 message per missed call + booking confirmations/reminders.

**Sample messages (paste all):**
1. `Hi! Sorry we missed your call to Mile High HVAC. Reply with a good time and we'll book you in, or book online: https://get.callpilotvoice.co.uk/book.html?lang=en  Reply STOP to opt out.`
2. `Your appointment with Mile High HVAC is confirmed for Tue 10am. Reply R to reschedule. Reply STOP to opt out.`
3. `Reminder: your appointment with Mile High HVAC is tomorrow at 10am. See you then! Reply STOP to opt out.`

**HELP message:** `RingBack: For help, reply HELP or email hello@callpilotvoice.co.uk. Reply STOP to unsubscribe.`
**STOP message:** `You're unsubscribed from RingBack messages and won't receive any more. Reply START to resubscribe.`

## Step 3 — After approval (a few days–2 weeks)
- Tell me the **approved sending number** → I set the US tenant `smsFrom` to it and test.
- US tenant is already configured (see below) — plug-and-play once approved.

## ✅ US tenant (already live in /opt/textback/tenants.json)
```
"+15717884804": {
  "name": "us-demo", "businessName": "Mile High HVAC", "channel": "sms",
  "message": "Hi! Sorry we missed your call to {business}. Reply with a good time and we'll book you in, or book online: {booking}. Reply STOP to opt out.",
  "smsFrom": "+15717884804",
  "bookingUrl": "https://get.callpilotvoice.co.uk/book.html?lang=en"
}
```
(When the toll-free number is approved, update `smsFrom` + the tenant key to the new 8xx number.)

## US go-to-market
- **Pricing ($):** $79 / $149 / $299 (you beat Podium $399+ / Weave $249).
- **Top niches (SMS-led):** home services/trades (HVAC, plumbers, electricians, roofers), salons/barbers,
  dental & med spas, auto repair. Trades especially — a missed call = a lost job worth $$$.
- **Compliance:** every message includes STOP/HELP (baked in). Keep opt-in basis = consumer called first.
