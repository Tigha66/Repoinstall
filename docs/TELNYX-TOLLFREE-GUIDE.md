# 📞 Telnyx US Toll-Free — buy + verify (step by step)

Goal: one US toll-free number that can **receive calls** (detect missed calls) + **send SMS**
text-backs to US customers — no 10DLC, no EIN. ~5 business days for verification.

## Step 1 — Buy the toll-free number
1. Telnyx Portal → **Numbers → Search & Buy Numbers**.
2. Filters: **Country = United States**, **Number Type = Toll-Free**.
3. Search → pick an available `+1 (8XX)` number → **Add to cart → Buy**. (~$1/mo.)

## Step 2 — Attach it to a Messaging Profile (for SMS)
1. **Messaging → Messaging Profiles.** You can reuse the existing **"RingBack US/Intl"** profile or
   **Create** a new one (name it `RingBack TF`).
2. Go to **Numbers → My Numbers → [your new toll-free] → Messaging tab** → set the **Messaging
   Profile** to that profile → Save.

## Step 3 — Point its calls at the text-back service (for missed-call detection)
1. **Numbers → My Numbers → [your toll-free] → Voice tab.**
2. Assign the **Call Control Application** "Missed-Call Text-Back (OpenWA demo)" (already exists in
   your account) — OR set the voice webhook to:
   `https://api.76-13-252-4.sslip.io/telnyx/z7qONFmth1SprQMtkfDHFR3`
3. Save. (Now an unanswered call to this number triggers the text-back.)

## Step 4 — Submit Toll-Free Verification
1. **Messaging → Toll-Free Verification** (a.k.a. Toll-Free Verification Requests) → **Create / New request**.
2. Fill in (paste-ready):
   - **Business name:** CallPilot (RingBack) · **Website:** https://get.callpilotvoice.co.uk
   - **Address / contact:** your UK address · **Email:** hello@callpilotvoice.co.uk · **Phone:** +447901921642
   - **Use case:** Customer Care (or "Notifications" / describe as "missed-call text-back")
   - **Expected volume:** Low (e.g. 100/day)
   - **Opt-in type:** Verbal / Other (inbound-call consent)
   - **Opt-in description (paste):**
     > The consumer initiates contact by calling the business's published toll-free number. If the
     > call isn't answered, they receive a one-time automated SMS reply offering help. The inbound
     > call is the opt-in. The message includes STOP opt-out instructions.
   - **How consumers find the number:** published on the business's website, listings, advertising,
     business cards and signage.
   - **Opt-in URL:** https://get.callpilotvoice.co.uk/privacy.html
   - **Sample message (paste):**
     > Thanks for calling [Business]! Sorry we missed your call — how can we help? Reply STOP to opt out.
   - **Select the toll-free number** you bought.
3. **Submit** → review ~5 business days. (If rejected, email tfverification@telnyx.com for manual review.)

## Step 5 — After approval: wire it as a US client tenant
Add a tenant in `/opt/textback/tenants.json` keyed by the toll-free number, `channel: "sms"`,
`smsFrom` = the toll-free number → `curl -X POST http://127.0.0.1:2789/reload`. Then test:
`https://api.76-13-252-4.sslip.io/simulate?from=+1USCELL&to=+1YOURTOLLFREE`.
(Ask me — I'll do the tenant wiring in 1 min once it's verified.)

## Notes
- The local US number you have (+15717884804) needs 10DLC for US sending → **leave it / abandon**;
  the toll-free is your US path.
- Toll-free SMS to US numbers only sends after verification is **approved**.
