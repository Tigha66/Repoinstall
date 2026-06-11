# RingBack 🔔 — AI Receptionist Engine (CallPilot)

> The voice brand behind **CallPilot**. RingBack is the AI call-handling layer that answers, qualifies and books — so no call is ever lost.

**Trading as:** CallPilot · **Web:** [callpilotvoice.co.uk](https://callpilotvoice.co.uk) · **Demo:** +1 571-788-4804 / +44 20 3838 9029

---

## About

**RingBack** is the brand and call-handling engine that powers **CallPilot**, an AI phone receptionist for small businesses. While *CallPilot* is the customer-facing product, *RingBack* is the underlying assistant configuration, call-flow logic and per-business voice profiles.

The mission: give a one-person trade business the same "always-answered" phone presence as a company with a full reception team — for the price of a couple of coffees a week.

## What lives here

```
/assistants           per-business AI assistant instructions (greeting + behaviour)
/call-flows           inbound routing, forward-on-no-answer config
/scripts              cold-call / DM / email / follow-up sales scripts
/voice-profiles       per-niche templates (plumber, salon, clinic, HVAC...)
/onboarding           new-client setup checklist
```

## How a business goes live

1. **Capture** the business: name, hours, services, FAQs, where to send leads.
2. **Configure** a RingBack assistant: greeting in the business's name + behaviour rules.
3. **Connect** a phone number (Telnyx) and set forward-on-no-answer.
4. **Test** a live call, then go live — same day.

## Example assistant instruction (plumber)

```
You are the AI receptionist for [Business], a plumbing company.
Greet: "Thanks for calling [Business] — how can I help you today?"
Collect, one question at a time: name, phone, address, problem.
If it's an emergency, reassure and mark urgent.
Offer to book a visit; read details back to confirm.
Never quote exact prices — a technician confirms on site.
End: "Thanks for calling [Business] — we'll be in touch shortly."
```

## Powered by

- **[Telnyx](https://telnyx.com)** — AI Assistants, voice, STT/TTS, TeXML
- Natural conversational AI with low-latency voice
- Voice + SMS lead delivery

## Relationship to CallPilot

| | |
|---|---|
| **RingBack** | the engine / voice brand — assistants, call flows, scripts |
| **CallPilot** | the product / website sold to businesses (callpilotvoice.co.uk) |

Same venture, two names: *RingBack rings them back, CallPilot pilots the call.*

## Contact

**hello@callpilotvoice.co.uk**

---

© RingBack / CallPilot.
