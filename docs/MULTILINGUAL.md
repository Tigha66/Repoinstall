# 🌍 RingBack in Arabic & French

The product localizes easily — the text-back is just text, and the booking page now supports
languages (incl. right-to-left for Arabic). WhatsApp dominates in MENA/North Africa & francophone
markets, so this is a big, less-saturated opportunity.

## Localized booking pages (live)
- French: `https://api.76-13-252-4.sslip.io/book?lang=fr`
- Arabic (RTL): `https://api.76-13-252-4.sslip.io/book?lang=ar`
- English: `…/book` (default)
Set a tenant's `bookingUrl` to the matching `?lang=` link.

## Text-back messages (set as the tenant `message`)
**🇫🇷 French**
> Bonjour 👋 Désolé d'avoir manqué votre appel chez {business}. Réservez ici : {booking} — ou
> répondez simplement à ce message et nous reviendrons vers vous. ✨

**🇲🇦 Arabic (MSA — understood everywhere)**
> مرحباً 👋 نعتذر عن عدم الرد على مكالمتك مع {business}. يمكنك الحجز هنا: {booking} — أو راسلنا هنا
> وسنعاود التواصل معك فوراً. ✨

*(For Morocco/Algeria you can switch to Darija later; MSA is safe and universal to start.)*

## Outreach / sales messages (to win clients)
**🇫🇷 French**
> Bonjour 👋 petite question pour {business} — quand vous êtes occupé et ne pouvez pas répondre, le
> client appelle simplement le concurrent suivant. J'ai créé un outil qui renvoie automatiquement un
> WhatsApp à chaque appel manqué, pour ne plus perdre de clients (ils peuvent même réserver). Démo
> de 30 s : https://get.callpilotvoice.co.uk — gratuit 7 jours, je m'occupe de tout. Ça vous
> intéresse ? — Abdelhak

**🇲🇦 Arabic**
> مرحباً 👋 سؤال سريع لـ {business} — حين تكون مشغولاً ولا تستطيع الرد، يتصل الزبون بالمنافس التالي
> مباشرة. صنعتُ أداة ترسل تلقائياً رسالة واتساب لكل مكالمة فائتة حتى لا تفقد الزبائن (ويمكنهم الحجز
> أيضاً). شرح في 30 ثانية: https://get.callpilotvoice.co.uk — مجاناً لمدة 7 أيام، وأنا أتولّى
> الإعداد بالكامل. هل يهمّك الأمر؟ — عبد الحق

## How to set up a localized client (tenant)
In `/opt/textback/tenants.json`, key by their number, put the localized message + `?lang` booking URL:
```json
"+212XXXXXXXXX": {
  "name": "casa-salon",
  "businessName": "Salon Atlas",
  "session": "casa-salon",
  "message": "مرحباً 👋 نعتذر عن عدم الرد على مكالمتك مع {business}. احجز هنا: {booking} ✨",
  "bookingUrl": "https://api.76-13-252-4.sslip.io/book?lang=ar",
  "smsFallback": false,
  "smsFrom": "+212XXXXXXXXX"
}
```
→ `curl -X POST http://127.0.0.1:2789/reload`. Each client connects their own WhatsApp (their number).

## Market notes
- **Arabic markets:** Morocco, Algeria, Tunisia, Egypt, Gulf (UAE/Saudi/Qatar…), Jordan, Lebanon —
  WhatsApp is *the* channel; far less competition than UK/US.
- **French markets:** France, Belgium, Switzerland, Quebec, + francophone Africa (Senegal, Côte
  d'Ivoire, Morocco). WhatsApp dominant.
- **Pricing:** adjust to local purchasing power — e.g. France ≈ €49/€99; Morocco/Algeria lower
  (e.g. 199–399 MAD/mo). Keep the 3-tier shape.
- **Telephony (the one thing to check per country):** to detect missed calls you need a phone number
  the business's calls route to. Telnyx has numbers in France & many countries; for Morocco/Algeria
  number availability/regulations vary — use call-forwarding to an available number, or a local SMS/
  voice provider. The WhatsApp text-back itself works from any OpenWA-linked number, anywhere.

## Notes / limitations
- The text-back + booking page are localized. The automated booking *confirmation* message
  (from /book) is currently English — ask me to add per-tenant confirmation text if you want it in
  FR/AR too (quick change).
- Landing page (get.callpilotvoice.co.uk) is English; I can make FR/AR versions if you want to run
  ads/outreach in those languages.
