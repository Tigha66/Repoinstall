# 7-Day Free Trial Process

## Overview

The 7-day free trial lets London cleaning companies test LeadReply's WhatsApp receptionist before committing. The goal is to demonstrate value quickly and convert to a paying client.

---

## Day 1: Setup

### Collect from the cleaning company:

**Business basics:**
- Business name
- WhatsApp number (for the assistant)
- Website or Instagram
- Business email

**Services:**
- What cleaning services do you offer?
- Which service gets the most enquiries?
- Which services do you NOT offer?
- Do you offer emergency / next-day cleaning?
- Do you work weekends?

**Areas:**
- Which London areas do you cover?
- Any areas you don't cover?

**Hours:**
- Opening hours for each day

**Pricing:**
- Do you want the assistant to mention starting prices?
- If yes, provide starting prices by service
- Should the assistant avoid prices and collect quote details instead?

**Quote questions:**
- What questions do you normally ask before giving a quote?
- Do you need postcode?
- Do you need property size?
- Do you need photos?
- Do you need to know furnished/unfurnished?
- Do you need extras like oven, carpet, windows, fridge?

**Lead delivery:**
- Where should lead summaries go?
- Email?
- Google Sheet?
- WhatsApp group?
- CRM?

**Tone:**
- Should the assistant sound friendly, premium, casual, or formal?
- Any words or phrases to avoid?

**Handoff:**
- When should the assistant pass to a human?
- Who should receive urgent leads?
- What number/email should be used?

**Other:**
- Emergency or urgent keywords
- Services they do not offer
- Any specific FAQs

### Action:
Create the client config file at `config/clients/<client-id>.json` using the template.

---

## Day 2: Build

### Create their custom WhatsApp flow:

1. Start with one main service first — **End-of-tenancy cleaning**
2. Do NOT try to build every possible flow at once
3. Configure the system prompt with their business details
4. Set up lead delivery (email or Google Sheet)
5. Test the basic flow internally

### Action:
- Customise `config/clients/<client-id>.json`
- Update the system prompt with their specific details
- Set up the WhatsApp connection (OpenWA or similar)

---

## Day 3: Internal Test

### Run at least 20 test conversations:

Use the test script:
```bash
python3 tests/test_swiftclean.py
```

### Check:
- [ ] Replies are instant
- [ ] Questions make sense
- [ ] Tone is right
- [ ] Lead summaries are clean
- [ ] Handoff works
- [ ] Owner notifications arrive
- [ ] No fake prices given
- [ ] No spam or outbound messages
- [ ] Unclear messages handled gracefully
- [ ] Human handoff triggered correctly

### Fix any confusing replies.

---

## Day 4: Client Test

### Ask the business owner to test 5–10 example enquiries.

Send them a list of test messages to send to the WhatsApp number:
1. "Hi, do you do end-of-tenancy cleaning?"
2. "How much for a 2-bed flat?"
3. "I need cleaning tomorrow in SW6"
4. "Can someone call me?"
5. "Do you cover Croydon?"

### Ask them:
- Were the questions right?
- Was the tone right?
- Was anything missing?
- Was the lead summary useful?
- Did anything feel off?

### Action:
Fix any issues found during client testing.

---

## Day 5: Soft Launch

### Let the assistant handle real inbound enquiries for a limited period.

- Keep human handoff available
- Watch the conversations closely
- Check lead summaries are being delivered
- Monitor for any issues

### Action:
- Monitor conversations daily
- Fix any issues immediately
- Keep the client informed

---

## Day 6: Review

### Check metrics:
- Number of messages received
- Number of qualified leads
- Number of quote-ready summaries
- After-hours enquiries captured
- Human handoffs triggered
- Common customer questions
- Points where customers got confused
- Client feedback

### Action:
Prepare the trial report.

---

## Day 7: Close

### Send the client a simple report using the trial report template.

### Trial Report Template:

```
7-Day WhatsApp Receptionist Trial Report

Business: [Client Name]
Trial dates: [Start] – [End]

Total conversations: [N]
Qualified cleaning leads: [N]
Quote-ready summaries sent: [N]
After-hours enquiries captured: [N]
Human handoffs: [N]

Most requested services:
1. [Service] – [N] enquiries
2. [Service] – [N] enquiries

Common customer questions:
- [Question 1]
- [Question 2]

Issues found:
- [Issue 1 — resolved]
- [Issue 2 — resolved]

Recommended improvements:
- [Improvement 1]
- [Improvement 2]

Recommendation:
Continue with Starter plan at £99/month.
```

### Pitch the founding client offer:

"We're setting up WhatsApp receptionists for the first 5 London cleaning companies at a reduced launch price: £149 setup + £49/month for your first 2 months. No long-term contract. You can test it first with a 7-day free trial."
