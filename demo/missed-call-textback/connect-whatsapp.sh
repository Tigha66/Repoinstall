#!/usr/bin/env bash
# Create + start the WhatsApp session and fetch a QR you can scan.
# Reads OPENWA_API_BASE / OPENWA_API_KEY / OPENWA_SESSION from ./.env
set -euo pipefail
cd "$(dirname "$0")"

# load .env
set -a; [ -f .env ] && . ./.env; set +a
BASE="${OPENWA_API_BASE:-http://localhost:2785/api}"
KEY="${OPENWA_API_KEY:?set OPENWA_API_KEY in .env}"
NAME="${OPENWA_SESSION:-demo}"

echo "→ ensuring session '$NAME' exists…"
curl -s -X POST "$BASE/sessions" -H "X-API-Key: $KEY" \
  -H 'Content-Type: application/json' -d "{\"name\":\"$NAME\"}" >/dev/null || true

ID=$(curl -s "$BASE/sessions" -H "X-API-Key: $KEY" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);l=d if isinstance(d,list) else d.get('data',d.get('sessions',[]));print(next(s['id'] for s in l if s['name']=='$NAME'))")
echo "→ session id: $ID"

echo "→ starting session…"
curl -s -X POST "$BASE/sessions/$ID/start" -H "X-API-Key: $KEY" >/dev/null
sleep 5

echo "→ fetching QR → qr.png"
curl -s "$BASE/sessions/$ID/qr" -H "X-API-Key: $KEY" \
  | python3 -c "import sys,json,base64;q=json.load(sys.stdin).get('qrCode','');b=q.split(',',1)[1] if ',' in q else q;open('qr.png','wb').write(base64.b64decode(b));print('saved qr.png')"

cat <<MSG

✅ Scan to connect WhatsApp (+44…):
   Easiest: open the dashboard, log in with your API key, open session '$NAME',
   and scan the live QR with WhatsApp ▸ Linked Devices ▸ Link a device.

   Dashboard: https://2886-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net

   (qr.png saved here as a fallback, but it expires fast — the dashboard QR refreshes live.)
MSG
