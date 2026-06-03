# Deploying Missed-Call Text-Back (always-on)

The demo runs in a sandbox that **sleeps when idle** — fine for testing, not for
paying clients. For production you need this service (and OpenWA) running on an
**always-on host** with a stable public HTTPS URL for the Telnyx webhook.

There are two processes to keep alive:
1. **OpenWA** (the WhatsApp gateway) — port 2785
2. **This text-back service** — port 2789

---

## Option A — Cheap VPS + PM2 (recommended to start, ~£4–6/mo)
A small Hetzner / DigitalOcean / Vultr box (1–2 GB RAM; WhatsApp's Chromium needs
the RAM). Ubuntu 22.04+.

```bash
# 1. install Node 22 + pm2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs
sudo npm i -g pm2

# 2. get the code + install OpenWA deps
git clone <your-repo> && cd <repo>/openwa
npm ci && npm run build && npm run dashboard:build

# 3. start both with pm2 (uses ecosystem.config.js below)
cd ..
pm2 start demo/missed-call-textback/ecosystem.config.js
pm2 save && pm2 startup     # survive reboots
```

`pm2` restarts crashed processes automatically and survives server reboots —
this solves the "services died" problem from the sandbox.

### Public HTTPS for the webhook
Telnyx must reach this service over HTTPS. Put a reverse proxy in front:
```bash
sudo apt-get install -y caddy        # Caddy auto-provisions TLS
# /etc/caddy/Caddyfile:
#   textback.yourdomain.com {
#       reverse_proxy localhost:2789
#   }
sudo systemctl restart caddy
```
Then set the Telnyx Call Control App webhook to
`https://textback.yourdomain.com/telnyx`.

---

## Option B — Render / Railway (managed, no server admin)
- The repo already ships `render.yaml` for OpenWA.
- Add this service as a second **Web Service**: start command `node demo/missed-call-textback/server.js`, expose port 2789, set env vars (`OPENWA_API_BASE`, `OPENWA_API_KEY`, `TELNYX_API_KEY`).
- ⚠️ Note: managed hosts use **ephemeral disks**. OpenWA's WhatsApp login lives in
  `openwa/data` / `.wwebjs_auth` — mount a **persistent volume** there or you'll
  re-scan the QR on every deploy.

---

## Option C — Docker
`openwa/` already has a Dockerfile and `render.yaml`. Run OpenWA in its container,
and this service in a tiny sidecar:
```dockerfile
# demo/missed-call-textback/Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY server.js .env* tenants*.json ./
EXPOSE 2789
CMD ["node", "server.js"]
```
Point `OPENWA_API_BASE` at the OpenWA container (e.g. `http://openwa:2785/api`).

---

## Production checklist
- [ ] `WEBHOOK_TOKEN` set in `.env` → webhook path becomes `/telnyx/<token>` (basic auth).
- [ ] (Stronger) add Telnyx **Ed25519 signature verification** before going wide.
- [ ] Persistent storage for `openwa/data` (WhatsApp auth + SQLite).
- [ ] Each client = its own OpenWA **session** (their WhatsApp) + a row in `tenants.json`.
- [ ] `smsFrom` numbers are **SMS/messaging-profile enabled** in Telnyx if `smsFallback: true`.
- [ ] Monitoring/alert if either process is down (pm2 + a simple uptime check).
- [ ] Consider the official **WhatsApp Cloud API** for clients at scale (ban-safe).
