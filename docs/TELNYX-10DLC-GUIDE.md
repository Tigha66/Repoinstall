# 📋 Telnyx 10DLC Registration — Step by Step (US SMS)

Required before US business SMS will deliver. ~1–3 days + small fees. Do this in parallel while
you sell UK. Telnyx Portal → **Messaging → 10DLC**.

> Note on you being UK-based: US 10DLC needs a **Brand**. Two paths:
> - **Sole Proprietor** brand — no US EIN needed, quick, but **low throughput** (fine to start/test).
> - **Standard brand** — needs a registered business + Tax ID (US EIN, or a non-US business reg number
>   — Telnyx supports international brands). Higher throughput. Form a US LLC later if you scale.
> Start with **Sole Proprietor** to get live fast; upgrade to Standard when you have paying US clients.

## Step 1 — Create a Brand (Messaging → 10DLC → Brands → Create)
Fill in:
- **Entity type:** Sole Proprietor (to start) — or your registered business for Standard.
- **Legal company name:** CallPilot / your registered name.
- **Country:** United Kingdom (for the brand entity) — or US if you form an LLC.
- **Tax ID/EIN:** leave blank for Sole Proprietor; for Standard use your business reg/EIN.
- **Address, website (https://get.callpilotvoice.co.uk), support email (hello@callpilotvoice.co.uk),
  phone, vertical:** "Professional Services" / "Technology".
- Submit → brand vetting (usually minutes–hours). Cost ≈ one-time $4 vetting.

## Step 2 — Create a Campaign (10DLC → Campaigns → Create)
This is the important part — describe the **missed-call text-back** use case clearly:
- **Use case:** **Customer Care** (or "Conversational"/"2-Way"). **NOT Marketing.**
- **Campaign description:**
  > "Automated missed-call text-back. When a customer calls the business and the call is not
  > answered, an SMS is sent to that caller offering assistance. Replies are handled by the business."
- **Message flow / opt-in description:**
  > "End users initiate contact by calling the business's published phone number. The SMS is a direct
  > reply to that inbound call. No marketing lists; consent is the inbound call itself."
- **Sample message 1:** `Hi! Sorry we missed your call to {Business}. How can we help? Reply here and we'll get right back to you.`
- **Sample message 2:** `Thanks for calling {Business}! We're with a customer right now — reply here and we'll get straight back to you.`
- **Opt-in keyword/flow:** inbound call. **Opt-out:** "Reply STOP to opt out." **Help:** "Reply HELP for help."
- **Includes phone numbers / links / age-gated:** No links required; no age-gated content.
- Submit → campaign review (often same-day to ~3 days). Campaign fee ≈ $1.50–$10/mo.

## Step 2b — Campaign: exact field-by-field (PASTE-READY)
Telnyx → 10DLC → **Campaigns → Create**. Pick your approved brand, then:

- **Use case:** `Customer Care` (for a Sole-Prop brand it may auto-select the sole-proprietor use
  case — that's fine). **Do NOT pick Marketing.**
- **Campaign description (paste):**
  > Automated missed-call text-back for local businesses. When a customer calls the business and
  > the call is not answered, a one-time SMS is sent to that caller offering assistance. The
  > business then replies to help. No promotional or marketing content.
- **Message flow / How do end users consent (paste):**
  > The consumer initiates contact by calling the business's published phone number. The SMS is a
  > direct, one-time reply to that inbound call — the call itself is the opt-in. No purchased or
  > marketing lists are used. Consumers can reply STOP at any time to opt out.
- **Sample message 1 (paste):**
  > Hi! Sorry we missed your call to Mile High HVAC. How can we help? Reply here and we'll get
  > right back to you. Reply STOP to opt out.
- **Sample message 2 (paste):**
  > Thanks for calling Mile High HVAC — we're with a customer right now. Reply here and we'll get
  > straight back to you. Msg & data rates may apply.
- **Content attributes / flags:**
  - Embedded link: **No** · Embedded phone number: **Yes** (the business number) ·
    Age-gated content: **No** · Direct lending: **No** · Affiliate marketing: **No**.
- **Opt-in keywords:** `START` — **Opt-in message:**
  > You're connected to Mile High HVAC. Msg & data rates may apply. Reply HELP for help, STOP to opt out.
- **Opt-out keyword:** `STOP` — **Opt-out message:**
  > You've been unsubscribed and won't receive more messages. Reply START to opt back in.
- **Help keyword:** `HELP` — **Help message:**
  > Mile High HVAC: reply to chat with us. Msg & data rates may apply. Reply STOP to opt out.

Submit → review (often same-day to ~3 business days). Campaign fee ≈ $1.50–$10/mo.
> Tip: keep the live text-back wording (in tenants.json) consistent with your registered sample
> messages — carriers can filter content that drifts far from what you registered.

## Step 3 — Messaging Profile + attach number
- 10DLC → **Messaging Profiles → Create** (or use existing).
- Attach your **US Telnyx number** to the profile.
- Link the **approved campaign** to the profile/number.
- Ensure the number is **SMS-enabled** (Numbers → your US number → Messaging → enable).

## Step 4 — Confirm it's live
- Once brand + campaign show **Approved/Registered** and the number is on the campaign:
- Test: `https://api.76-13-252-4.sslip.io/simulate?from=+1YOURCELL&to=+1YOURTELNYXNUMBER`
  → your US cell should receive the SMS. (Add the US tenant first — see `US-SETUP.md`.)

## Gotchas
- **Don't send US SMS before approval** — it gets filtered/blocked and can flag your number.
- Keep **STOP/HELP** handling (Telnyx auto-handles STOP at the carrier level).
- Sole Proprietor has daily caps — fine for a handful of clients; upgrade to Standard for scale.
- Message content must match the registered samples — keep the text-back wording consistent.
