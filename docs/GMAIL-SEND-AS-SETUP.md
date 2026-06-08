# 📧 Gmail "Send mail as" — send from hello@callpilotvoice.co.uk

So emails (manual or via send_email.py) show **From: hello@callpilotvoice.co.uk** instead of your
gmail address. Do this in the **ONE Gmail account whose app password is in `.env`** (pick one —
either abdelhak.tigha@ or hajabdelhak66@ — and use it everywhere).

## Steps (in that Gmail, on desktop)
1. Gmail → **gear icon → See all settings**.
2. Tab: **Accounts and Import**.
3. Section **"Send mail as:"** → click **"Add another email address"**.
4. Popup:
   - **Name:** `CallPilot` (or your name)
   - **Email address:** `hello@callpilotvoice.co.uk`
   - Leave **"Treat as an alias"** ticked. → **Next Step**.
5. **SMTP server screen** — enter:
   - **SMTP Server:** `smtp.gmail.com`
   - **Port:** `587`
   - **Username:** your full gmail (e.g. `abdelhak.tigha@gmail.com`)
   - **Password:** your **new App Password** (the 16-char one)
   - **Secured connection using TLS** (selected)
   - → **Add Account**.
6. Gmail emails a **verification code/link** to `hello@callpilotvoice.co.uk`.
   - That address forwards to your Gmail (via Cloudflare Email Routing), so the verification email
     **lands in your Gmail inbox** in ~1 min.
   - Open it → click the **confirmation link** (or paste the code). Done. ✅
7. Now when composing, the **From** dropdown lets you pick `hello@callpilotvoice.co.uk`.
   - (Optional) Set it as **default** in the same "Send mail as" section.

## For the script (send_email.py)
- `SENDER_EMAIL=hello@callpilotvoice.co.uk` and `GMAIL_USER=<the same gmail>` in `.env`.
- It connects to `smtp.gmail.com:587` with the app password and sets `From: hello@callpilotvoice.co.uk`.
- This only works **after** the alias is verified (step 6). Until then Gmail rewrites/blocks the From.

## ⚠️ Deliverability (why the inbox test matters)
Google sends the mail, but your domain's **SPF** currently authorises Cloudflare, not Google — so
SPF may **fail** and land you in spam. If the inbox-placement test goes to spam:
- Edit the `callpilotvoice.co.uk` **SPF TXT** record to add Google:
  `v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all`
- Free Gmail can't DKIM-sign the custom domain, so for real volume use the dedicated-domain +
  warmup setup in `EMAIL-SCALE-SETUP.md`. For a handful of personal emails/day, SPF-fix + inbox
  test passing is enough.

## Order of operations
1. Revoke leaked app passwords → make ONE new app password.
2. Do this "Send mail as" setup (verify the alias).
3. Put creds in `.env` on the server.
4. Run the inbox-placement test to a **non-Gmail** address → must land in **Inbox**.
5. Only then send M&A + ThinkFM (2 emails, approved copy).
