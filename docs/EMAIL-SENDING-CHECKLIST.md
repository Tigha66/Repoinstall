# ✅ Email Sending — Secure the password + Inbox-placement test

Do these BEFORE emailing any real prospect. Order matters.

## 🔐 Part 1 — Secure the Gmail app password (do first)
The previous app password was exposed in plaintext — treat it as compromised.

1. **Revoke it:** Google Account → **Security → 2-Step Verification → App passwords** → delete the
   old one.
2. **Create a new app password** (16 chars). Copy it once.
3. **Store it ONLY in a `.env` file** next to the script (never in shell history, never in a message):
   ```
   # .env   (and add ".env" to .gitignore)
   GMAIL_APP_PWD=your_new_app_password_here
   SENDER_EMAIL=hello@callpilotvoice.co.uk
   GMAIL_USER=hajabdelhak66@gmail.com
   ```
4. **Load it in the script** with python-dotenv (not `export`):
   ```python
   from dotenv import load_dotenv; load_dotenv()
   import os; APP_PWD = os.environ["GMAIL_APP_PWD"]
   ```
5. **Never** `export GMAIL_APP_PWD=...` on the command line, pipe it to a log, or print it.
6. **Clean up the leak:** remove the password from `outreach.log`, `prospects.csv` notes, and
   shell history (`history -c` / edit `~/.bash_history`).

`.gitignore` must contain: `.env`, `*.log`, `prospects.csv`.

## 📬 Part 2 — Inbox-placement test (prove you don't land in spam)
Sending "as hello@callpilotvoice.co.uk" via a *free* Gmail can fail SPF/DKIM/DMARC and hit spam.
Verify before any real send.

1. **Send ONE test email** (the real outreach body) to **a non-Gmail inbox you control** — e.g. an
   **Outlook.com / Yahoo / iCloud** address. (Gmail-to-Gmail is too lenient to be a real test.)
2. **Check where it landed:**
   - ✅ **Inbox** → good, proceed (low volume only — see Part 3).
   - ❌ **Spam/Junk** or **didn't arrive** → STOP. Fix auth (Part 2a) or switch to the dedicated-
     domain setup in `EMAIL-SCALE-SETUP.md`.
3. **Check the headers** (in the test email: "Show original" / "View source"): look for
   `SPF=pass`, `DKIM=pass`, `DMARC=pass`. Any `fail`/`softfail` = deliverability risk.

### Part 2a — If it lands in spam, fix domain auth
- **SPF:** edit the `callpilotvoice.co.uk` SPF TXT record to authorise Google sending, e.g.
  `v=spf1 include:_spf.google.com include:_spf.mx.cloudflare.net ~all`
- **DKIM:** a *free* Gmail can't DKIM-sign a custom domain. Options: (a) move `hello@` to **Google
  Workspace** (~£5/mo) and enable DKIM, or (b) use the dedicated-domain + Instantly/Smartlead
  setup (recommended for any real volume).
- Re-run the inbox test after changes.

## 📊 Part 3 — Safe sending rules (until on the scaled setup)
- **Max ~10–15 personalised emails/day** from this address. No bulk blasts (protects the
  `callpilotvoice.co.uk` brand domain).
- Every email: personalised opening line + demo link `https://get.callpilotvoice.co.uk` + FREE
  7-day trial + clear sender identity + opt-out line ("reply 'no' and I won't follow up").
- Use the approved copy in `EMAIL-OUTREACH.md` verbatim. Verify each recipient address first.
- Honour every opt-out immediately and permanently. Add `time.sleep(2)` between sends.
- Log only metadata (who/when/status) — **never** the password — to a gitignored log.

## When to graduate to scale
As soon as you want to send >20/day or the inbox test is shaky → switch to the dedicated-domain +
warmup setup in **`EMAIL-SCALE-SETUP.md`**. Keep cold volume OFF your main brand domain.
