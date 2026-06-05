# 📅 Add Booking to RingBack

Two ways to let missed callers book an appointment. Start with Option A — it's reliable,
zero-risk, and sells today. Option B is the premium AI upsell (later).

## ✅ Option A — Booking LINK in the text-back (recommended, live now)
When someone misses a call, the WhatsApp/SMS includes a **book-now link**. The caller taps it,
picks a slot in the business's calendar, done. No new code, no AI, never breaks.

**Tooling (the client's calendar):**
- **Cal.com** — free, open-source, great booking links (cal.com/their-name). ✅ recommended.
- **Calendly** — easy, popular. · Or the client's **existing booking page** (Fresha/Treatwell/
  their site). Whatever they already use.

**How to set it per client (now supported):**
The service supports a `bookingUrl` + a `{booking}` placeholder in the message. In
`/opt/textback/tenants.json`:
```json
"+44XXXXXXXXXX": {
  "name": "acme-barbers",
  "businessName": "Acme Barbers",
  "session": "acme-barbers",
  "message": "Hi! 👋 Sorry we missed your call to {business}. Book a slot here: {booking} — or just reply and we'll help.",
  "bookingUrl": "https://cal.com/acme-barbers",
  "smsFallback": false,
  "smsFrom": "+44XXXXXXXXXX"
}
```
Then `curl -X POST http://127.0.0.1:2789/reload`. The text-back now reads:
> "Hi! 👋 Sorry we missed your call to Acme Barbers. Book a slot here: https://cal.com/acme-barbers
> — or just reply and we'll help."

**Onboarding a client with booking:** ask for their booking link (or set up a free Cal.com for
them in 5 min as part of the done-for-you setup), drop it in `bookingUrl`, reload. That's it.

**Sell it as the Pro tier (£99/mo):** "missed call → instant text-back **with a book-now link** so
they self-book even when you can't answer." Strong value for salons/dentists/clinics.

## 🚀 Option B — Conversational / AI booking (premium upsell, later)
The caller replies in WhatsApp and a bot collects name + preferred time and books into the calendar
automatically (no link click). This needs more building:
- An OpenWA **inbound-message webhook** → read replies.
- A flow that offers slots (via the **Cal.com API**), confirms, and writes the booking.
- Optionally an AI layer to parse natural language ("can I come Friday afternoon?").
This is the **AI-booking-agent** tier (£199–£399/mo). **Don't build it until a paying client asks
for it** — Option A covers 90% of the value with 0% of the risk.

## Recommendation
- **Now:** sell RingBack Pro = text-back **+ booking link** (Option A). Set up clients' Cal.com for
  them as part of "done-for-you." Higher price (£99), tiny extra effort.
- **Later:** offer conversational AI booking as the top tier once you have happy paying clients.
