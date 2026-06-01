#!/usr/bin/env bash
# OpenWA process manager for non-Docker (Daytona/VPS) usage.
# Usage: ./run.sh {start|stop|restart|status|logs|key|dashboard-start|dashboard-stop}
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
mkdir -p /tmp/logs

API_MATCH="node dist/main"
API_LOG="/tmp/logs/openwa.log"
DASH_LOG="/tmp/logs/dashboard.log"
API_PORT="${API_PORT:-2785}"
DASH_PORT="${DASHBOARD_PORT:-2886}"

# Match the real API node process (exclude this script / grep itself)
api_pids()  { pgrep -f "$API_MATCH" | grep -vx "$$" || true; }
# Match the actual vite binary path; exclude this script's own PID
dash_pids() { pgrep -f "node_modules/.bin/vite" | grep -vx "$$" || true; }
port_up()   { curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://localhost:$1/" 2>/dev/null; }

start() {
  if [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://localhost:$API_PORT/api/health)" = "200" ]; then echo "API already running on :$API_PORT"; else
    echo "Building (if needed) and starting API on :$API_PORT ..."
    [ -f dist/main.js ] || npm run build
    nohup npm run start:prod > "$API_LOG" 2>&1 &
    sleep 18
    echo "API started. Health: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$API_PORT/api/health)"
  fi
}

stop() {
  local p; p="$(api_pids)"
  if [ -n "$p" ]; then kill $p 2>/dev/null || true; sleep 2; kill -9 $p 2>/dev/null || true; echo "API stopped."; else echo "API not running."; fi
}

dashboard_start() {
  if [ "$(port_up "$DASH_PORT")" = "200" ]; then echo "Dashboard already running on :$DASH_PORT"; else
    echo "Starting dashboard on :$DASH_PORT ..."
    ( cd dashboard && nohup node_modules/.bin/vite > "$DASH_LOG" 2>&1 & )
    sleep 7
    echo "Dashboard: $(port_up "$DASH_PORT")"
  fi
}

dashboard_stop() {
  local p; p="$(dash_pids)"
  if [ -n "$p" ]; then kill -9 $p 2>/dev/null || true; echo "Dashboard stopped."; else echo "Dashboard not running."; fi
}

case "${1:-}" in
  start)            start ;;
  stop)             stop ;;
  restart)          stop; sleep 1; start ;;
  status)
    echo "API PIDs:       $(api_pids || echo none)"
    echo "API health:     $(curl -s -o /dev/null -w '%{http_code}' http://localhost:$API_PORT/api/health || echo down)"
    echo "Dashboard PIDs: $(dash_pids || echo none)"
    ;;
  logs)             tail -n 60 -f "$API_LOG" ;;
  key)              cat data/.api-key 2>/dev/null || echo "(no key yet - start the API first)" ;;
  dashboard-start)  dashboard_start ;;
  dashboard-stop)   dashboard_stop ;;
  *) echo "Usage: ./run.sh {start|stop|restart|status|logs|key|dashboard-start|dashboard-stop}"; exit 1 ;;
esac
