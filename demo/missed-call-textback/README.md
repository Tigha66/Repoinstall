# Missed-Call Text-Back (OpenWA + Telnyx)

When someone calls your Telnyx number and it isn't answered, this service
automatically sends them a **WhatsApp** message via OpenWA:

> "Hi! 👋 Sorry we missed your call to *{business}*. How can we help?"

This is the **demo wedge** for selling WhatsApp automation to local businesses.

```
Caller dials Telnyx number
   → Telnyx posts call webhooks → this service (POST /telnyx)
   → if incoming + unanswered → OpenWA sends WhatsApp text-back to the caller
```

Zero npm dependencies (Node 18+ built-ins only).

---

## Ports in this project
| Service | Port | Preview URL |
|---|---|---|
| OpenWA API | 2785 | https://2785-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net/api |
| OpenWA Dashboard | 2886 | https://2886-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net |
| **This service** | **2789** | **https://2789-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net** |

---

## Setup (one time)

### 1. Configure
`.env` is already created with your OpenWA API key. Edit the branding:
```
BUSINESS_NAME=Acme Barbers
TEXTBACK_MESSAGE=Hi! 👋 Sorry we missed your call to {business}. How can we help?
```

### 2. Connect your WhatsApp number
```bash
./connect-whatsapp.sh
```
Then open the **dashboard**, log in with the API key, open session `demo`, and
scan the live QR from **WhatsApp ▸ Linked Devices ▸ Link a device** using
**+44 7901 921642**. (QR refreshes live in the dashboard.)

### 3. Start the service
```bash
./start.sh
# health → {"service":"missed-call-textback","ok":true,...}
```

---

## Test WITHOUT Telnyx (great for your Loom demo)
Trigger a text-back manually — pretend a customer just called:
```bash
curl "http://localhost:2789/simulate?from=+447700900123"
```
The number you pass receives the WhatsApp text-back. Use your own 2nd phone so
you can film it landing.

---

## Wire up Telnyx (for real missed calls)

1. **Telnyx Portal → Call Control / Voice API → Applications** → create a
   *Call Control Application*.
2. Set the **Webhook URL** to this service's public URL + `/telnyx`:
   ```
   https://2789-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net/telnyx
   ```
   (HTTP POST, format = "Webhook API Version 2".)
3. **Numbers → My Numbers → your UK number → Voice** → assign the Call Control
   Application you just created.
4. Call your Telnyx UK number from another phone, **don't answer / let it ring
   and hang up** → the caller's WhatsApp gets the text-back. ✅

### Going to production for a real client
Two ways to route a business's missed calls into Telnyx:
- **Conditional call forwarding** on their existing line ("forward when busy /
  unanswered" → the Telnyx number). Every call that reaches Telnyx is then
  already a missed call.
- Or publish the **Telnyx number** as their click-to-call / Google number.

Connect **the client's** WhatsApp number as a new OpenWA session and point
`OPENWA_SESSION` at it (one service per client, or extend to multi-tenant).

---

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | status + resolved session id |
| GET/POST | `/simulate?from=+44…` | manually fire a text-back (demo/testing) |
| POST | `/telnyx` (or `/telnyx/<WEBHOOK_TOKEN>`) | Telnyx call webhooks |

## How "missed" is detected
- `call.answered` → remembers that call id as answered.
- `call.hangup` → if the call was **incoming** and **never answered**, send the
  text-back. Answered or outbound calls are ignored.
- Same caller isn't re-texted within `COOLDOWN_MS` (default 5 min).

## Security notes
- Set `WEBHOOK_TOKEN` in `.env` to require `/telnyx/<token>` (basic shared
  secret). For full Telnyx Ed25519 signature verification, add the public key
  check before going to production.
- The `.env` (with your API key) and `qr.png` are gitignored.

## Logs
```bash
tail -f /tmp/logs/textback.log
```
