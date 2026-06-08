# Client Onboarding SOP — WhatsApp AI Receptionist

**Purpose:** Step-by-step process to onboard a local business onto OpenWA as a paying client.  
**Estimated time:** 2–3 hours (first client), 1–2 hours (subsequent clients).

---

## Phase 0: Pre-Onboarding (Before the Call)

### 0.1 — Qualify the Client
Before investing time, confirm:
- [ ] They have a **WhatsApp Business** number (not personal WhatsApp)
- [ ] They receive **5+ customer enquiries per day** on WhatsApp
- [ ] They're losing leads because they can't reply fast enough (evenings/weekends)
- [ ] They're willing to pay £X/month for the service (set your price)
- [ ] They understand this is an AI assistant, not a human replacement

### 0.2 — Prepare Your Demo
- [ ] Have the wife's cleaning company demo live and working
- [ ] Test the full flow end-to-end with your own phone
- [ ] Prepare 2–3 example conversations to show
- [ ] Have the lead summary format ready to show

### 0.3 — Send Pre-Call Material
Send the client a short message or email:
> "I'll show you how [Business Name] can answer every WhatsApp enquiry instantly — even at 11pm. Here's a 2-min video of how it works: [link]"

---

## Phase 1: Discovery Call (30–45 min)

### 1.1 — Understand Their Business
Ask and document:
1. **Business name and type**
2. **WhatsApp Business number** (must be a dedicated number, not personal)
3. **Services offered** (list each one)
4. **Price ranges** (per service, or "from £X")
5. **Areas covered** (postcodes, boroughs, radius)
6. **Opening hours** (when are humans available?)
7. **Current pain points:**
   - How many enquiries/day on WhatsApp?
   - What % do they miss or reply late to?
   - What do customers most commonly ask?
8. **Lead notification preference:**
   - Where should leads go? (WhatsApp group, email, dashboard?)
9. **Handoff rules:**
   - When should the AI hand off to a human?
   - Which types of enquiries need a person?

### 1.2 — Collect FAQs
Ask: "What are the 10 most common questions customers ask on WhatsApp?"
Document each question and the correct answer.

### 1.3 — Show the Demo
- Show the wife's cleaning company demo live
- Let them see the full conversation flow
- Show the lead summary output
- Explain: "This is exactly what your customers would experience"

---

## Phase 2: Technical Setup (60–90 min)

### 2.1 — Create OpenWA Session
```bash
# On the VPS, create a new WhatsApp session for the client
# Session name format: {business-slug}-main
# Example: sparkle-clean-main
```

### 2.2 — Link Client's WhatsApp
1. Generate QR code for the new session
2. **Client scans QR code** with their WhatsApp Business app
3. Confirm connection: send a test message, verify it's received
4. ⚠️ **Only do this after client agrees to pilot** — never link without permission

### 2.3 — Configure the AI Assistant
Set up in OpenWA:
- [ ] **Business name** and greeting message
- [ ] **Services list** with price ranges
- [ ] **Areas covered** (postcodes)
- [ ] **Opening hours**
- [ ] **FAQs** (from discovery call)
- [ ] **Lead collection flow** (what info to gather)
- [ ] **Lead notification destination** (WhatsApp group/email)
- [ ] **Handoff rules** (when to escalate to human)

### 2.4 — Configure Webhook
- [ ] Set webhook URL: `https://api.76-13-252-4.sslip.io/api/webhooks/whatsapp`
- [ ] Verify webhook is receiving events
- [ ] Test: send a message to the client's WhatsApp number, confirm OpenWA receives it

### 2.5 — Set Up Lead Delivery
- [ ] Create a WhatsApp group for leads (add client + your number)
- [ ] Configure OpenWA to send lead summaries to the group
- [ ] Test: complete a full enquiry flow, verify lead appears in the group

---

## Phase 3: Testing & Go-Live (30 min)

### 3.1 — Internal Testing (BEFORE client's customers see it)
- [ ] Test with your own phone (different number from the business)
- [ ] Test with a staff member's phone
- [ ] Run through 5+ different conversation paths:
  - Normal enquiry → lead captured
  - Pricing question → correct price range given
  - Out-of-area postcode → polite decline
  - Request to speak to human → handoff triggered
  - Weekend/evening message → AI responds, lead queued
- [ ] Verify all lead summaries are correct
- [ ] Verify handoff works (human gets notified)

### 3.2 — Client Approval
- [ ] Show client the test results
- [ ] Let them test with their own phone
- [ ] Get written confirmation: "We approve going live"

### 3.3 — Go Live
- [ ] Enable auto-reply on the client's WhatsApp
- [ ] Monitor for the first 2 hours
- [ ] Check leads are flowing correctly
- [ ] Confirm client is happy

---

## Phase 4: Handoff & Ongoing

### 4.1 — Handoff Document
Give the client:
- [ ] How to view leads in the dashboard
- [ ] How to manually take over a conversation
- [ ] How to update FAQs/prices/areas
- [ ] Your support contact for issues
- [ ] Monthly check-in schedule

### 4.2 — Monthly Review (Recurring)
Every 30 days:
- [ ] Review lead capture rate
- [ ] Review handoff rate (too many = AI needs tuning)
- [ ] Update FAQs based on new common questions
- [ ] Check for missed leads or errors
- [ ] Invoice the client

---

## Pricing Guidance

| Tier | Monthly | Includes |
|---|---|---|
| **Starter** | £X | AI replies + lead capture, 1 business number, email leads |
| **Professional** | £X | + WhatsApp group lead delivery, handoff rules, monthly review |
| **Agency** | £X | Multi-location, priority support, custom integrations |

*Set your own prices based on your market. Start with a discounted pilot rate (50% off first 2 months) to get case studies.*

---

## Important Rules

1. **NEVER** send bulk cold WhatsApp messages — this violates WhatsApp ToS and gets numbers banned
2. **ONLY** auto-reply to customers who message the business first (inbound) or have opted in
3. **ALWAYS** disclose that the customer is talking to an AI assistant
4. **ALWAYS** offer a handoff to a human
5. **NEVER** link a client's WhatsApp without their explicit permission
6. **ALWAYS** test internally before going live with real customers
