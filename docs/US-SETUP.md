# 🇺🇸 Running RingBack in the US (SMS, not WhatsApp)

Americans use **SMS**, not WhatsApp — so in the US the missed-call text-back goes out as **SMS via
Telnyx**. The service now supports this per-tenant (`"channel": "sms"`).

## How US differs from UK
| | UK / EU | US |
|---|---|---|
| Text-back channel | WhatsApp (OpenWA) | **SMS (Telnyx)** |
| Sender number | client's WhatsApp | a **US Telnyx number** (yours: the US one you bought) |
| Extra setup | scan QR | **10DLC A2P registration** (see below) ⚠️ |
| Pricing | £49 / £99 / £249 | **$99 / $199 / $399** |

## ⚠️ The one US-specific hurdle: 10DLC registration
US carriers **block business (A2P) SMS** from numbers that aren't registered under **10DLC**. Before
SMS will reliably deliver, you must (in the Telnyx portal → Messaging):
1. **Register a Brand** (your business details / EIN if you have a US entity; sole-prop/foreign also supported).
2. **Register a Campaign** (use case: "Customer Care" / "Conversational" — missed-call text-back fits).
3. **Create a Messaging Profile** and attach your US number + the campaign.
- Takes ~1–3 business days for approval. Costs a small one-off + ~$1.50/mo campaign fee.
- Until registered, US SMS will be filtered/blocked — don't sell US trials before this is done.

## Tenant config for a US client (channel = sms)
In `/opt/textback/tenants.json`, key by the client's **US Telnyx number** and set `channel: "sms"`:
```json
{
  "+1XXXXXXXXXX": {
    "name": "denver-hvac",
    "businessName": "Mile High HVAC",
    "session": "denver-hvac",
    "channel": "sms",
    "message": "Hi! Sorry we missed your call to {business}. How can we help? Reply here and we'll get right back to you.",
    "smsFallback": false,
    "smsFrom": "+1XXXXXXXXXX"
  }
}
```
- `channel: "sms"` → the service sends SMS via Telnyx (no WhatsApp/QR needed).
- `smsFrom` = the US Telnyx number (must be 10DLC-registered + on a messaging profile).
- `TELNYX_API_KEY` is already set in `/opt/textback/.env`.
Then `curl -X POST http://127.0.0.1:2789/reload`.

## Telnyx call routing (same idea as UK)
Point the client's US Telnyx number's **Voice/Call-Control webhook** to
`https://api.76-13-252-4.sslip.io/telnyx/<token>` (the existing Call Control app). On an unanswered
incoming call, the service SMS-texts the caller back.

## Test (after 10DLC approved)
`https://api.76-13-252-4.sslip.io/simulate?from=+1YOURCELL&to=+1YOURTELNYXNUMBER`
→ your US cell should receive the SMS text-back.

## Go-to-market (US)
- Lead niches: **HVAC, plumbing, electrical, roofing, dental/med-spa, auto repair, small law firms.**
- Use the SMS versions of the outreach in `OUTREACH-TRADES-BEAUTY.md`.
- Charge **$99–$399** — the US pays it (Podium/GoHighLevel charge $300–$500 for similar).
- This is exactly GoHighLevel/Podium's market — you compete on price + done-for-you setup.

---

## ✅ What's already configured (done via API)
- **US tenant** added in `/opt/textback/tenants.json`: key `+15717884804` → "Mile High HVAC" demo,
  `channel: "sms"`, `smsFrom: +15717884804`. Service routes it correctly (verified).
- **Messaging profile** created: `RingBack US/Intl` (id `40019e92-601a-4122-9029-256d0773833c`),
  whitelisted destinations US + GB. **US number `+15717884804` attached to it.**

## 🔎 Diagnosis — why a live US SMS test fails *right now*
The US number `+15717884804` (Telnyx longcode) reports:
`sms: { domestic_two_way: true, international_outbound: FALSE }`
Two separate blockers:
1. **International outbound = OFF** → it **cannot SMS a UK (+44) number** (error: "Invalid 'to'
   address"). This only matters for self-demoing to your UK phone.
2. **10DLC not yet approved** → it **cannot send US→US A2P SMS** yet (your Sole-Prop brand is in
   progress). This is the real requirement for actual US clients.

## ❓ Do you need to message Telnyx support?
- **For the real business (US client → their US customers): NO.** Just finish **10DLC** (self-serve:
  brand → campaign → attach number). No support ticket needed.
- **Only if you want to self-demo by texting your UK phone** from the US number: you'd need
  **international SMS enabled** on the account (Telnyx disables it by default for fraud control;
  enabling usually needs a quick **support request**). ⚠️ Not worth it — instead:
  - Get a **free US number to receive** (Google Voice / TextNow) and test domestic US→US after 10DLC, **or**
  - Just use the **UK WhatsApp demo** as proof when selling US prospects.

## ▶️ To make the US demo real (after 10DLC approves)
1. Brand approved + OTP done → create **Campaign** (Customer Care) → it gets approved.
2. Confirm the number is on the messaging profile + campaign.
3. Get a US receiving number (Google Voice/TextNow) → `simulate?from=+1USNUMBER&to=+15717884804`
   → the US number texts that US number. ✅

