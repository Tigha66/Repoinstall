# Demo Script — Cleaning Company AI Receptionist

**Business:** Wife's cleaning company  
**Session:** `wife-cleaning-main`  
**WhatsApp:** 447742344614  
**Purpose:** Collect cleaning quote enquiries and produce a structured lead summary

---

## Conversation Flow

### Step 1: Greeting

**Customer sends:** "Hi, how much for a deep clean?"

**AI replies:**
> Hi 👋 Thanks for contacting [Cleaning Company Name]. I can help get a cleaning quote ready for you. What postcode is the property in?

---

### Step 2: Postcode

**Customer sends:** "SW6"

**AI replies:**
> Great, SW6 — we cover that area 🏠 What type of property is it? (house, flat, office, or commercial)

---

### Step 3: Property Type

**Customer sends:** "Flat"

**AI replies:**
> How many bedrooms does the flat have?

*(Options: studio, 1, 2, 3, 4+)*

---

### Step 4: Bedrooms

**Customer sends:** "2"

**AI replies:**
> And how many bathrooms?

*(Options: 1, 2, 3+)*

---

### Step 5: Bathrooms

**Customer sends:** "1"

**AI replies:**
> What type of cleaning service do you need?
>
> 1️⃣ Regular cleaning  
> 2️⃣ Deep cleaning  
> 3️⃣ End-of-tenancy cleaning  
> 4️⃣ After-builders cleaning  
> 5️⃣ Office cleaning

---

### Step 6: Service Type

**Customer sends:** "2" (or "deep cleaning")

**AI replies:**
> Any extras you'd like included?
>
> 🍳 Oven  
> 🧊 Fridge  
> 🛋️ Carpets  
> 🪟 Windows  
> 🪑 Upholstery
>
> Just let me know which ones, or say "none".

---

### Step 7: Extras

**Customer sends:** "Oven and windows"

**AI replies:**
> When would you like the cleaning done? Please give a preferred date or "asap".

---

### Step 8: Preferred Date

**Customer sends:** "Friday"

**AI replies:**
> Last thing — what's your name and best contact number for the quote?

---

### Step 9: Name & Contact

**Customer sends:** "Sarah, 07700 900123"

**AI replies:**
> Perfect! Here's your enquiry summary:
>
> 🧼 **New cleaning enquiry**
>
> **Name:** Sarah  
> **Postcode:** SW6  
> **Property:** 2-bed flat  
> **Bathrooms:** 1  
> **Service:** Deep cleaning  
> **Extras:** Oven + windows  
> **Preferred date:** Friday  
> **Contact:** 07700 900123
>
> We'll send you a quote within 24 hours. Thanks, Sarah! 🙏

---

## Lead Summary Output (to WhatsApp group / dashboard)

```
🧼 New cleaning enquiry

Name: Sarah
Contact: 07700 900123
Postcode: SW6
Property: 2-bed flat
Bathrooms: 1
Service: Deep cleaning
Extras: Oven + windows
Preferred date: Friday

Action: Send quote / confirm availability.
```

---

## Edge Cases to Handle

### Out-of-Area Postcode
**Customer sends:** "M1" (Manchester)
**AI replies:**
> Thanks for your interest! Unfortunately we don't cover M1 yet. We currently serve London and surrounding areas. Would you like us to let you know when we expand to your area?

### Vague Service Request
**Customer sends:** "I need cleaning"
**AI replies:**
> No problem! To give you the right quote, could you tell me:
> 1. What's the postcode?
> 2. Is it a house, flat, office, or commercial space?
> 3. What type of cleaning — regular, deep clean, end-of-tenancy, after-builders, or office?

### Request to Speak to Human
**Customer sends:** "Can I speak to someone?"
**AI replies:**
> Of course! Let me connect you with the team. They'll be with you shortly. In the meantime, could you share your postcode and what you need cleaned? That way we can help you faster. 🙏

*(Trigger handoff — notify human via WhatsApp group/email)*

### Weekend/Evening Enquiry
**Customer sends:** "How much for a deep clean?" (at 10pm)
**AI replies:**
> Hi 👋 Thanks for contacting [Cleaning Company Name]. I can help get a cleaning quote ready for you right now, and our team will follow up during working hours. What postcode is the property in?

*(AI collects the enquiry 24/7, human follows up next business day)*

### Incomplete Enquiry (Customer Goes Silent)
If customer doesn't respond within 30 minutes:
**AI sends (optional follow-up):**
> Hi! Just checking if you still need that cleaning quote. Let me know whenever you're ready — I'm here to help! 😊

---

## Configuration Reference

### Services & Price Ranges
| Service | Price Range |
|---|---|
| Regular cleaning | £X–£X per hour |
| Deep cleaning | £X–£X per visit |
| End-of-tenancy | £X–£X per visit |
| After-builders | £X–£X per visit |
| Office cleaning | £X–£X per visit |

### Extras
| Extra | Price |
|---|---|
| Oven | £X |
| Fridge | £X |
| Carpets | £X per room |
| Windows | £X |
| Upholstery | £X |

### Areas Covered
*(List postcodes/boroughs the cleaning company serves)*

### Opening Hours
*(When humans are available to follow up)*

### Handoff Rules
- Customer asks to speak to human → immediate handoff
- Complaint or unhappy customer → immediate handoff
- Out-of-area enquiry → polite decline, no handoff needed
- Complex/commercial enquiry → handoff after collecting basic info
