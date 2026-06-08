#!/usr/bin/env bash
# Rebrand the demo text-back for a specific prospect, then hot-reload.
# Usage:
#   ./rebrand.sh "Shoreditch Barbers"
#   ./rebrand.sh "Shoreditch Barbers" "Hi! Sorry we missed your call to {business}. Reply to book a slot 💈"
set -euo pipefail
cd "$(dirname "$0")"

if [ -z "${1:-}" ]; then
  echo 'Usage: ./rebrand.sh "Business Name" ["custom message, use {business} as a placeholder"]'
  exit 1
fi
BUSINESS="$1"
MESSAGE="${2:-}"
NUMBER="+442038389029"   # the demo Telnyx number (key in tenants.json)

python3 - "$NUMBER" "$BUSINESS" "$MESSAGE" <<'PY'
import json, sys, os
number, business, message = sys.argv[1], sys.argv[2], sys.argv[3]
path = "tenants.json"
cfg = json.load(open(path)) if os.path.exists(path) else {"defaultTenant": "demo", "tenants": {}}
t = cfg["tenants"].setdefault(number, {"name": "demo", "session": "demo", "smsFallback": False, "smsFrom": number})
t["businessName"] = business
if message:
    t["message"] = message
json.dump(cfg, open(path, "w"), indent=2, ensure_ascii=False)
print(f"→ {number} is now '{business}'")
PY

# hot-reload the running service (no restart needed)
PORT="$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 || echo 2789)"
curl -s -X POST "http://localhost:${PORT:-2789}/reload" >/dev/null && echo "→ reloaded ✅  (record your Loom now)"
