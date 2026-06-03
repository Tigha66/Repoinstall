# Onboard a New Client — 2-minute checklist

When a prospect says **"yes, set it up"**, do this. Most steps are automated by
`openwa/../demo/missed-call-textback/onboard.sh` (lives on the VPS at `/opt/textback/onboard.sh`).

## Step 0 — collect 4 things from the client
1. **Business name** (as it should appear in the WhatsApp message)
2. **Their WhatsApp number** (the sender — what customers will receive messages from)
3. **How their missed calls will reach us** (see Step 2 — usually call-forwarding to a Telnyx number)
4. **Any custom wording** they want (optional — we have a good default)

## Step 1 — run the onboard script (≈1 min) on the VPS
```bash
ssh root@76.13.252.4
cd /opt/textback
./onboard.sh <session-name> <dialed-telnyx-number> "<Business Name>" ["optional message {business}"]
# e.g.
./onboard.sh sparkle-cleaning +442036661234 "Sparkle Cleaning"
```
This creates the WhatsApp session, adds the tenant (routing + branding), and reloads. It
prints the client's QR link + the Telnyx webhook + a test URL.

## Step 2 — connect the client's WhatsApp (they scan, 1 min)
Send the client the QR link the script printed:
`https://api.76-13-252-4.sslip.io/qr?session=<session-name>`
- They open it on a **laptop/2nd screen**, then **WhatsApp → Linked Devices → Link a device** → scan.
- The page shows **✅ Connected** when done.
- 💡 Use a **lighter/dedicated** number where possible (heavy personal accounts can be flaky).

## Step 3 — route their missed calls into Telnyx
Each client needs a **dedicated Telnyx number** as the routing target. Two ways:
- **Call forwarding (most common):** client sets "forward when busy / unanswered" on their
  existing line → the Telnyx number. Every call that reaches Telnyx is then a missed call.
- **New advertised number:** client publishes the Telnyx number as their contact number.

Then point that Telnyx number's **Voice / Call-Control webhook** to:
`https://api.76-13-252-4.sslip.io/telnyx/z7qONFmth1SprQMtkfDHFR3`
(In Telnyx: create/assign a Call Control Application with that webhook, attach the number.
You can do this via the portal or the Telnyx API.)

## Step 4 — test (30 sec)
```
https://api.76-13-252-4.sslip.io/simulate?from=<your_mobile>&to=<their_telnyx_number>
```
Your mobile should receive the branded text-back. Then place a **real call** to their Telnyx
number, hang up, confirm the text-back lands.

## Step 5 — go live + start the 7-day trial clock
- Tell the client it's live; ask them to note any callers it recovers.
- Mid-trial check-in (day 3–4): "it's texted back X callers so far."
- Day 7: show the numbers → convert to £49/99/mo.
- Log everything in `trial-tracker.csv`.

## Per-client housekeeping
- 1 WhatsApp **session** per client (their number).
- 1 **tenant** row in `tenants.json` keyed by their **dialed Telnyx number**.
- The **watchdog** auto-heals the default tenant session; for multiple live clients,
  consider extending the watchdog to check each client's session (ask me when you reach 3+).

## ⚠️ Reminders
- Stability: dedicated/light numbers are far more reliable than heavy personal accounts.
- Scale: past ~10–15 clients, migrate clients to the **official WhatsApp Cloud API** (ban-safe).
- Compliance: messages only go to people who **just called** the client = expected contact.
