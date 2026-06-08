#!/usr/bin/env bash
# Start the missed-call-textback webhook service (detached, survives the shell).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p /tmp/logs
setsid bash -c 'node server.js > /tmp/logs/textback.log 2>&1' < /dev/null &
disown || true
sleep 2
PORT="$(grep -E '^PORT=' .env 2>/dev/null | cut -d= -f2 || echo 2789)"
PORT="${PORT:-2789}"
echo "→ started. health:"
curl -s "http://localhost:${PORT}/health" && echo
echo "→ logs: tail -f /tmp/logs/textback.log"
