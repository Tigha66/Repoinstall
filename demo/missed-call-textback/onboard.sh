#!/usr/bin/env bash
# Onboard a new RingBack client in ~1 minute.
# Creates a WhatsApp session, adds the tenant, and reloads the service.
# RUN ON THE VPS (where OpenWA + tenants.json live).
#
# Usage:
#   ./onboard.sh <session> <dialed_e164> "<Business Name>" ["custom message with {business}"]
# Example:
#   ./onboard.sh sparkle-cleaning +442036661234 "Sparkle Cleaning"
set -euo pipefail

if [ $# -lt 3 ]; then
  echo 'Usage: ./onboard.sh <session> <dialed_e164> "<Business Name>" ["custom message, use {business}"]'
  echo 'Example: ./onboard.sh sparkle-cleaning +442036661234 "Sparkle Cleaning"'
  exit 1
fi
SESSION="$1"; DIALED="$2"; BUSINESS="$3"
MSG="${4:-}"
if [ -z "$MSG" ]; then
  MSG="Hi! 👋 Sorry we missed your call to {business}. How can we help? Reply here and we'll get right back to you."
fi

KEY=$(cat /var/lib/docker/volumes/openwa_openwa-data/_data/.api-key)
B=http://127.0.0.1:2785/api
WEBHOOK_TOKEN="z7qONFmth1SprQMtkfDHFR3"   # from /opt/textback/.env
PUBLIC="https://api.76-13-252-4.sslip.io"

echo "1) creating WhatsApp session '$SESSION'..."
curl -s -X POST "$B/sessions" -H "X-API-Key: $KEY" -H 'Content-Type: application/json' \
  -d "{\"name\":\"$SESSION\"}" >/dev/null || true
ID=$(curl -s "$B/sessions" -H "X-API-Key: $KEY" \
  | python3 -c "import sys,json;print(next(s['id'] for s in json.load(sys.stdin) if s['name']=='$SESSION'))")
echo "   session id: $ID"

echo "2) starting session (generates QR)..."
curl -s -X POST "$B/sessions/$ID/start" -H "X-API-Key: $KEY" >/dev/null

echo "3) adding tenant to tenants.json (keyed by dialed number $DIALED)..."
python3 - "$DIALED" "$BUSINESS" "$SESSION" "$MSG" <<'PY'
import json, sys, os
dialed, business, session, msg = sys.argv[1:5]
p = "/opt/textback/tenants.json"
c = json.load(open(p)) if os.path.exists(p) else {"defaultTenant": session, "tenants": {}}
c.setdefault("tenants", {})[dialed] = {
    "name": session, "businessName": business, "session": session,
    "message": msg, "smsFallback": False, "smsFrom": dialed,
}
json.dump(c, open(p, "w"), indent=2, ensure_ascii=False)
print("   tenant added:", dialed, "->", business, "(session", session + ")")
PY

echo "4) reloading service..."
curl -s -X POST http://127.0.0.1:2789/reload >/dev/null && echo "   reloaded ✅"

cat <<EOF

────────────────────────────────────────────────────────────
✅ DONE on our side. Finish onboarding ($BUSINESS):

  A) CLIENT SCANS (link WhatsApp sender — on a 2nd screen):
     $PUBLIC/qr?session=$SESSION
     WhatsApp → Linked Devices → Link a device

  B) TELEPHONY (route their missed calls to Telnyx number $DIALED):
     Set that number's Voice/Call-Control webhook to:
        $PUBLIC/telnyx/$WEBHOOK_TOKEN
     (or set "forward when busy/unanswered" from their line -> $DIALED)

  C) TEST:
     $PUBLIC/simulate?from=<your_mobile>&to=$DIALED
────────────────────────────────────────────────────────────
EOF
