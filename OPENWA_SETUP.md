# OpenWA — Setup & Run Guide (Daytona / non-Docker)

OpenWA (self-hosted WhatsApp API gateway) lives in [`openwa/`](./openwa) and runs
directly with **Node.js v22 + NestJS** (Docker is not available in this sandbox).
The bundled **dashboard** is a Vite + React SPA and runs without Docker too.

| Service   | Local URL                         | Preview URL (Daytona)                                                   |
|-----------|-----------------------------------|------------------------------------------------------------------------|
| API       | http://localhost:2785/api         | https://2785-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net/api |
| Swagger   | http://localhost:2785/api/docs    | https://2785-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net/api/docs |
| Health    | http://localhost:2785/api/health  | https://2785-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net/api/health |
| Dashboard | http://localhost:2886             | https://2886-2ef6750c-c511-4644-8253-9e60c8d938ba.daytonaproxy01.net    |

---

## Production-style configuration

`openwa/.env` is configured for real use:

| Setting               | Value                       | Why |
|-----------------------|-----------------------------|-----|
| `NODE_ENV`            | `production`                | Seeds a strong random API key (`owa_k1_…`) instead of the insecure `dev-admin-key`. |
| `API_MASTER_KEY`      | *(empty)*                   | Not used by this version — keys are stored in the DB. Left blank to avoid confusion. |
| `DATABASE_TYPE`       | `sqlite`                    | Zero external services. |
| `DATABASE_NAME`       | `./data/openwa.sqlite`      | Keeps the data DB **inside `data/`** (gitignored). The default `openwa` would drop a DB file in the repo root. |
| `CORS_ORIGINS`        | `http://localhost:2886`     | Locked to the dashboard origin instead of `*`. |
| `ENABLE_SWAGGER`      | `true`                      | API docs at `/api/docs`. Set to `false` to disable in hardened deployments. |

### About the API key

- In **production mode** OpenWA generates a random admin key on first boot, stores
  its SHA-256 hash in `data/main.sqlite`, and writes the raw key to `data/.api-key`.
- The **dev key `dev-admin-key` is NOT seeded** in production (verified: it returns `401`).
- Send it on every request as either header:
  - `X-API-Key: <key>`  **or**  `Authorization: Bearer <key>`
- Show the current key any time:
  ```bash
  cd openwa && ./run.sh key      # or: cat openwa/data/.api-key
  ```
- Rotate / create more keys via `POST /api/auth/api-keys` (see Swagger) or the dashboard.

> ⚠️ The key in `data/.api-key` is environment-specific and **gitignored** — it is
> never committed. If you wipe `data/`, a new key is generated on next start.

---

## Quick start (recommended: helper script)

A small process manager lives at `openwa/run.sh`:

```bash
cd openwa

./run.sh start             # build (if needed) + start the API on :2785
./run.sh dashboard-start   # start the dashboard on :2886
./run.sh status            # show PIDs + health
./run.sh key               # print the current API key
./run.sh stop              # stop the API
./run.sh restart           # restart the API
./run.sh dashboard-stop    # stop the dashboard
./run.sh logs              # tail the API logs
```

## Manual commands (equivalent)

### Start the API
```bash
cd openwa
npm run build                 # first time / after code changes -> dist/
nohup npm run start:prod > /tmp/logs/openwa.log 2>&1 &
# wait ~18s, then:
curl -s http://localhost:2785/api/health      # {"status":"ok",...}
```

### Stop the API
```bash
pkill -f "node dist/main"
```

### Restart the API
```bash
pkill -f "node dist/main"; sleep 2
cd openwa && nohup npm run start:prod > /tmp/logs/openwa.log 2>&1 &
```

### Start the dashboard
```bash
cd openwa/dashboard
nohup node_modules/.bin/vite > /tmp/logs/dashboard.log 2>&1 &
# open http://localhost:2886  (or the Daytona preview URL above)
# log in by pasting the API key from:  cat ../data/.api-key
```
The dashboard dev server proxies `/api` and `/socket.io` to the API on `:2785`,
and `vite.config.ts` allows the preview hostname (`server.allowedHosts`). To restrict
allowed hosts, set `VITE_ALLOWED_HOSTS=host1,host2` before starting it.

### Stop the dashboard
```bash
pkill -f "node_modules/.bin/vite"
```

---

## WhatsApp session workflow

All commands assume:
```bash
KEY="$(cat openwa/data/.api-key)"
BASE="http://localhost:2785/api"
```

### 1. Create a session
```bash
curl -s -X POST "$BASE/sessions" \
  -H "Content-Type: application/json" -H "X-API-Key: $KEY" \
  -d '{"name":"my-bot"}'
# -> returns {"id":"<SESSION_ID>", "status":"created", ...}
```

### 2. Start the session (launches the headless browser engine)
```bash
SID="<SESSION_ID>"
curl -s -X POST "$BASE/sessions/$SID/start" -H "X-API-Key: $KEY"
```

### 3. Fetch the QR code (then scan with WhatsApp on your phone)
```bash
# Returns JSON: {"qrCode":"data:image/png;base64,...."}
curl -s "$BASE/sessions/$SID/qr" -H "X-API-Key: $KEY"

# Save it as a PNG to view/scan:
curl -s "$BASE/sessions/$SID/qr" -H "X-API-Key: $KEY" \
 | python3 -c "import json,sys,base64; d=json.load(sys.stdin)['qrCode']; open('qr.png','wb').write(base64.b64decode(d.split(',')[1])); print('wrote qr.png')"
```
Open `qr.png`, then in WhatsApp: **Settings → Linked Devices → Link a Device**.
Poll status until it becomes `connected`:
```bash
curl -s "$BASE/sessions/$SID" -H "X-API-Key: $KEY"   # watch "status"
```

### 4. Send a test message (after the session is `connected`)
```bash
curl -s -X POST "$BASE/sessions/$SID/messages/send-text" \
  -H "Content-Type: application/json" -H "X-API-Key: $KEY" \
  -d '{"chatId":"628123456789@c.us","text":"Hello from OpenWA!"}'
```
Chat IDs use international format without `+`: `<countrycode><number>@c.us`
(e.g. Indonesia `628123456789@c.us`). Groups use `...@g.us`.

---

## Security notes

- A global API-key guard protects **every** route except the two health checks
  (`/api/health`, `/api/infra/health`). Verified: protected endpoints return `401`
  without a valid key.
- Sensitive data export (`/api/infra/export-data`), sessions, webhooks, settings,
  plugins, audit and API-key management all require the key.
- Swagger UI (`/api/docs`) is browsable without a key (documentation only — no data).
  Set `ENABLE_SWAGGER=false` to turn it off.
- **Never commit** `data/` (DBs, QR/session/browser data, `.api-key`), `.env`,
  `node_modules/`, or `dist/` — both the root `.gitignore` and `openwa/.gitignore`
  exclude these.

## What is gitignored (not committed)
- `openwa/.env`  (secrets/config)
- `openwa/data/**`  → SQLite DBs (`main.sqlite`, `openwa.sqlite`), `.api-key`,
  `.env.generated`, `sessions/` (Chromium profiles + WhatsApp auth), `media/`
- `**/node_modules/`, `**/dist/`, `**/*.log`, `**/qr*.png`,
  `.wwebjs_auth/`, `.wwebjs_cache/`

## Updating OpenWA
The nested `.git` was removed so the source is tracked by this repo. To pull
upstream changes, re-clone or re-add the remote:
```bash
git -C openwa init -q && git -C openwa remote add origin https://github.com/rmyndharis/OpenWA.git
```

## One-time machine setup already done
- `npm install` in `openwa/` and `openwa/dashboard/`
- Chromium system libraries for the WhatsApp engine:
  `libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0
  libpangocairo-1.0-0 libasound2 libatspi2.0-0 libxshmfence1 fonts-liberation`
