# LeadReply — WhatsApp Receptionist for London Cleaning Companies

## Quick Start

### 1. Test the demo (no WhatsApp connection needed)

```bash
cd /root/openwa-deploy/leadreply
python3 tests/test_swiftclean.py
```

This runs 15+ test conversations against the SwiftClean London demo config and shows the lead summaries.

### 2. Interactive CLI test

```bash
python3 -m flows.webhook swiftclean-london
```

Then type `phone|message` to simulate conversations:
```
+447700900123|Hi
+447700900123|Do you do end-of-tenancy cleaning?
+447700900123|SW6
```

### 3. Connect to WhatsApp

Set up a webhook endpoint:

```python
# Using Flask
from flows.webhook import create_flask_app
app = create_flask_app(client_id="swiftclean-london")
app.run(port=5000)

# Using FastAPI
from flows.webhook import create_fastapi_app
app = create_fastapi_app(client_id="swiftclean-london")
# Run with: uvicorn flows.webhook:app --port 5000
```

### 4. Set up Google Sheets logging

```bash
pip install gspread google-auth
export GOOGLE_SHEET_ID="your-sheet-id"
export GOOGLE_CREDENTIALS_PATH="credentials.json"
```

## Project Structure

```
leadreply/
├── config/
│   ├── clients/
│   │   ├── swiftclean-london.json    # Demo client config
│   │   └── <client-id>.json          # Real client configs
│   ├── template.json                  # Blank client template
│   └── system-prompt.md               # Assistant system prompt template
├── flows/
│   ├── engine.py                      # Conversation engine + state tracker
│   ├── webhook.py                     # WhatsApp webhook handler
│   └── google_sheets.py               # Google Sheets lead logger
├── tests/
│   └── test_swiftclean.py             # 15-test demo script
├── docs/
│   ├── trial-process.md               # 7-day free trial process
│   ├── onboarding-questionnaire.md    # Client onboarding questionnaire
│   ├── sales-materials.md             # Outreach + call script
│   └── demo-video-script.md           # 45-60 second demo video script
└── logs/                              # Lead + conversation logs
```

## Client Config

Each client has a JSON config file with:
- Business details (name, type, areas, hours)
- Services (with aliases for matching)
- Tone of voice
- Handoff rules
- FAQ
- Lead delivery method
- Pricing rules

## Conversation Flow

1. **Greeting** — Customer messages, assistant greets and identifies service
2. **Service matching** — Match to configured service by name or alias
3. **Qualifying** — Collect: postcode → property type → furnished → extras → date → urgency → name → phone
4. **Closing** — Confirm enquiry passed to team
5. **Lead summary** — Generate clean summary for owner

## Compliance

- Only replies to inbound messages
- No spam or outbound marketing
- No fake prices
- No pretending to be human
- Human handoff always available
- Owner can take over at any time

## Pricing

| Plan | Setup | Monthly |
|------|-------|---------|
| Founding Client (first 5) | £149 | £49/mo (first 2 months) |
| Starter | £149 | £99/mo |
| Pro | £299 | £199/mo |
| Managed | Custom | Custom |

## Next Steps

1. Test the demo: `python3 tests/test_swiftclean.py`
2. Build a free demo for a real cleaning company
3. Offer 7-day free trial
4. Convert to founding client
