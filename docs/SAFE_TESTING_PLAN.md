# Safe Testing Plan — WhatsApp AI Receptionist

**Purpose:** Test the AI receptionist thoroughly before any real customer interacts with it.  
**Rule:** NO real customers should interact with the AI until all phases below are complete and signed off.

---

## Phase 1: Isolated Testing (No WhatsApp Connection)

**Goal:** Verify the AI logic works without any real WhatsApp involvement.

- [ ] Test the full conversation flow in OpenWA's test/sandbox mode (if available)
- [ ] Verify all conversation paths produce correct lead summaries
- [ ] Verify handoff triggers correctly
- [ ] Verify out-of-area postcodes are handled gracefully
- [ ] Verify FAQ answers are accurate
- [ ] Check for any crashes or error messages

**Sign-off:** Date: _____  By: _____

---

## Phase 2: Connected but Private (Your Phone Only)

**Goal:** Connect the real WhatsApp number but test only with your own personal phone.

- [ ] Link the client's WhatsApp Business number to OpenWA (QR scan)
- [ ] Send test messages from YOUR personal phone to the business number
- [ ] Run through the full demo script (cleaning quote flow)
- [ ] Test edge cases:
  - [ ] Out-of-area postcode
  - [ ] Request to speak to human
  - [ ] Vague/incomplete messages
  - [ ] Rapid messages (rate limiting)
  - [ ] Messages outside business hours
- [ ] Verify lead summaries appear in the correct destination (WhatsApp group/email)
- [ ] Verify handoff notifications reach the right person
- [ ] Monitor for 24 hours — check for unexpected behaviour

**⚠️ IMPORTANT:** During this phase, the business number should NOT be shared with customers. Only you are testing.

**Sign-off:** Date: _____  By: _____

---

## Phase 3: Staff Testing (Trusted People Only)

**Goal:** Have 2–3 trusted people (staff, friends, family) test the system.

- [ ] Give the business WhatsApp number to 2–3 trusted testers
- [ ] Ask them to have natural conversations (not just follow the script)
- [ ] Ask them to try to "break" the AI — send weird messages, go off-topic, etc.
- [ ] Collect feedback:
  - [ ] Did the AI understand their questions?
  - [ ] Were the responses helpful and accurate?
  - [ ] Did the lead summary capture all the right info?
  - [ ] Was anything confusing or off-putting?
- [ ] Fix any issues found
- [ ] Re-test until all testers are happy

**Sign-off:** Date: _____  By: _____

---

## Phase 4: Client Approval

**Goal:** Client reviews test results and approves going live.

- [ ] Show client the test conversation logs
- [ ] Show client the lead summaries produced
- [ ] Let client test with their own phone
- [ ] Address any concerns
- [ ] Get written approval (email or message is fine)

**Client approval:** Date: _____  Name: _____

---

## Phase 5: Soft Launch (Limited Hours)

**Goal:** Go live but with extra monitoring for the first week.

- [ ] Enable the AI for real customer enquiries
- [ ] Monitor every conversation for the first 48 hours
- [ ] Check leads are flowing correctly every few hours
- [ ] Be ready to manually intervene if something goes wrong
- [ ] After 1 week, review:
  - [ ] How many enquiries were captured?
  - [ ] How many handoffs occurred?
  - [ ] Were there any missed leads?
  - [ ] Any customer complaints?

**Sign-off:** Date: _____  By: _____

---

## Phase 6: Full Launch

**Goal:** Normal operation with monthly reviews.

- [ ] AI is fully live and handling customer enquiries
- [ ] Monthly review scheduled (first of every month)
- [ ] Client knows how to reach you for issues
- [ ] FAQs and pricing can be updated as needed

---

## Emergency Procedures

### If the AI Says Something Wrong or Inappropriate
1. Immediately disable auto-reply in OpenWA
2. Manually respond to the affected customer
3. Review the conversation log to find the issue
4. Fix the AI configuration
5. Re-test before re-enabling

### If WhatsApp Number Gets Flagged/Banned
1. Immediately stop all automated replies
2. Contact WhatsApp Business support
3. Have the client submit an appeal
4. Use a backup number if available
5. Review what caused the flag (usually bulk messaging or spam reports)

### If Leads Stop Flowing
1. Check OpenWA dashboard for errors
2. Check webhook status
3. Check the lead notification destination (WhatsApp group/email)
4. Test with your own phone to confirm
5. Fix and verify

---

## Testing Rules (Non-Negotiable)

1. ❌ **NEVER** go live without completing all 6 phases
2. ❌ **NEVER** test with real customers — only trusted testers
3. ❌ **NEVER** leave the AI unmonitored during the first week
4. ❌ **NEVER** send bulk messages or cold outreach using the business number
5. ✅ **ALWAYS** disclose to customers that they're talking to an AI
6. ✅ **ALWAYS** offer a handoff to a human
7. ✅ **ALWAYS** monitor the first 48 hours of going live
