# Landing Page — WhatsApp AI Receptionist

**Location:** `/root/openwa-deploy/landing/`  
**Status:** ✅ Built and ready to deploy  
**Commit:** (see git log)

---

## Where the Landing Page Lives

```
/root/openwa-deploy/landing/
├── index.html              # Entry HTML with SEO meta tags
├── package.json            # Dependencies (React, Vite, lucide-react)
├── vite.config.ts          # Vite config
├── tsconfig.json           # TypeScript config
├── vercel.json             # Vercel deployment config
├── public/
│   └── favicon.svg         # WhatsApp-style green favicon
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Main app with all sections
    ├── App.css             # Complete landing page stylesheet
    ├── index.css           # Base styles
    └── components/
        ├── Header.tsx          # Sticky nav with logo + CTA
        ├── Hero.tsx            # Headline, CTAs, chat mockup
        ├── Problem.tsx         # Pain points grid
        ├── Solution.tsx        # Features grid (6 cards)
        ├── Demo.tsx            # Chat conversation + lead summary
        ├── HowItWorks.tsx      # 4-step process
        ├── Niches.tsx          # Industry cards (6 niches)
        ├── Benefits.tsx        # Benefits grid (6 cards)
        ├── Pricing.tsx         # Starter/Pro/Managed cards + founding offer
        ├── LeadForm.tsx        # Lead capture form (mailto fallback)
        ├── FreeTrial.tsx       # 7-day trial section
        ├── FAQ.tsx             # Accordion FAQ (8 questions)
        ├── FinalCTA.tsx        # Bottom conversion section
        └── Footer.tsx          # Links, anti-spam statement
```

---

## How to Run Locally

```bash
cd /root/openwa-deploy/landing
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How to Deploy to Vercel

### Option 1: Vercel CLI
```bash
cd /root/openwa-deploy/landing
npx vercel
```

### Option 2: Git Push (Recommended)
1. Push this repo to GitHub/GitLab
2. Import the `landing/` directory as a Vercel project
3. Vercel auto-detects Vite framework
4. Build command: `npm run build`
5. Output directory: `dist`

### Option 3: Manual Deploy
```bash
cd /root/openwa-deploy/landing
npm run build
npx vercel deploy --prod ./dist
```

---

## What CTAs Currently Do

| CTA | Current Action |
|---|---|
| **Start Free Trial** (Header) | Scrolls to `#pricing` |
| **Start 7-Day Free Trial** (Hero/Pricing) | Scrolls to `#pricing` |
| **See Demo** (Hero) | Scrolls to `#demo` |
| **Book a Demo** (Pro card) | Scrolls to `#demo` |
| **Talk to Us** (Managed card) | Scrolls to `#lead-form` |
| **Request Free Trial** (Form) | Opens `mailto:hello@leadreply.ai` with form data |

---

## How to Change the Brand Name

Search and replace `LeadReply AI` across all files:
```
grep -r "LeadReply" src/
```

Files to update:
- `index.html` (title, meta description)
- `src/components/Header.tsx` (logo)
- `src/components/Hero.tsx` (chat mockup name)
- `src/components/Pricing.tsx` (plan features mentioning the brand)
- `src/components/Footer.tsx`

---

## How to Change Pricing

Edit `src/components/Pricing.tsx`:

```tsx
const plans = [
  {
    name: 'Starter',
    price: '£99',        // Change this
    period: '/month',
    setup: '£299 setup', // Change this
    // ...
  },
  // ...
]
```

To offer in USD, change `£` to `$` and adjust pricing.

---

## How to Connect a Real Form

The lead form currently uses `mailto:` as a fallback. To connect a real backend:

1. Add a form endpoint to your API (e.g., `/api/leads`)
2. Update `LeadForm.tsx` `handleSubmit`:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  if (response.ok) setSubmitted(true)
}
```

Or use a third-party service:
- **Formspree**: Change form action to `https://formspree.io/f/YOUR_FORM_ID`
- **Make.com / Zapier**: POST to a webhook URL
- **Google Sheets**: Use a script or API integration

---

## How to Add a Custom Domain

1. Buy a domain (e.g., `leadreply.ai`)
2. In Vercel dashboard → Project Settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. In `index.html`, update the `<title>` and `<meta>` tags

---

## Tracking & Analytics

To add analytics, insert tracking code in `index.html` before `</head>`:

**Google Analytics 4:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

**Plausible (privacy-friendly):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```
Then add to `main.tsx`:
```tsx
import { inject } from '@vercel/analytics'
inject()
```

---

## Compliance Notes

### Anti-Spam Statement
The landing page includes a clear anti-spam statement in:
- Hero trust bar
- Free trial note
- Footer legal text
- FAQ ("Is this spam?", "Does it send bulk WhatsApp messages?")

### Data Protection
- The form does not store data client-side
- `mailto:` opens the user's email client (no data sent to servers)
- When connecting a real form backend, ensure GDPR-compliant data handling
- Add a privacy policy link before collecting real leads

### WhatsApp Compliance
The landing page does NOT claim:
- ❌ Guaranteed revenue or leads
- ❌ "Never get banned"
- ❌ "Unlimited bulk WhatsApp"
- ❌ "Send thousands of messages"

Instead it clearly states:
- ✅ Only replies to inbound messages
- ✅ No bulk cold messaging
- ✅ Human handoff included
- ✅ Test before going live

---

## Typecheck & Build

```bash
npx tsc --noEmit   # Typecheck (no emit)
npm run build      # Full build to dist/
npx vite preview   # Preview production build locally
```

---

## Known Limitations

1. **Form uses mailto:** — No server-side lead collection yet
2. **No analytics** — Add your preferred tracking
3. **No dark mode** — Light theme only
4. **No i18n** — English only (UK English)
5. **No cookie banner** — Add if targeting EU visitors
6. **No A/B testing** — Consider adding Optimizely, VWO, or PostHog

---

## What You Need to Provide

Before going live, you'll need:

- [ ] **Brand name** — Replace "LeadReply AI" if needed
- [ ] **Email address** — Replace `hello@leadreply.ai` with your real email
- [ ] **Domain name** — e.g., `leadreply.ai`
- [ ] **Privacy policy page** — Link in footer
- [ ] **Terms of service page** — Link in footer
- [ ] **Real form backend** — For lead collection
- [ ] **Analytics** — GA4, Plausible, or Vercel Analytics
- [ ] **Logo** — Replace the icon-only logo in the header
- [ ] **Professional copy review** — Ensure pricing and claims are accurate
