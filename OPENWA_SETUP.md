# OpenWA Setup Notes

OpenWA (self-hosted WhatsApp API gateway) was cloned into `openwa/` and configured
to run directly with Node.js (no Docker in this environment).

## What was done
- Cloned from https://github.com/rmyndharis/OpenWA.git into `openwa/`
- Created `openwa/.env` from `.env.example` (NODE_ENV=development, SQLite, local storage)
- `npm install` (installs whatsapp-web.js + Puppeteer/Chromium)
- Installed Chromium system libraries (libnss3, libnspr4, libgbm1, etc.) via apt
- `npm run build` (NestJS) → `openwa/dist`
- Started with `npm run start:prod`

## Run
```bash
cd openwa
npm run start:prod        # or: npm run start:dev (watch mode)
```

## Endpoints
- API:     http://localhost:2785/api
- Swagger: http://localhost:2785/api/docs
- Health:  http://localhost:2785/api/health
- Dashboard (optional, not built here): port 2886

## Auth
In development mode OpenWA seeds a DB API key: `dev-admin-key`
(in production it generates `owa_k1_...`). The key is stored in the SQLite DB and
echoed in the startup banner. Use header: `X-API-Key: dev-admin-key`

## WhatsApp session flow
```bash
K=dev-admin-key
curl -X POST localhost:2785/api/sessions -H "X-API-Key: $K" -H "Content-Type: application/json" -d '{"name":"my-bot"}'
curl -X POST localhost:2785/api/sessions/<SID>/start -H "X-API-Key: $K"
curl localhost:2785/api/sessions/<SID>/qr -H "X-API-Key: $K"   # returns base64 PNG QR
```
Scan the QR with WhatsApp on your phone to connect.

## Updating OpenWA
The nested `.git` was removed so the source is tracked by this repo. To update,
re-clone upstream (https://github.com/rmyndharis/OpenWA.git) or re-add the remote.

## Notes
- Docker socket and the dashboard/Traefik containers are not used in this sandbox.
- `openwa/.env`, `node_modules/`, `dist/`, and `data/` are gitignored.
