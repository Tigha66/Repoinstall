# OpenWA — System Architecture & Setup Documentation

**Last verified:** 2026-06-01  
**Status:** ✅ Live on VPS + Vercel

---

## Architecture Overview

```
Customer WhatsApp  ──→  Meta Cloud API  ──>  OpenWA API (VPS)
                                                     │
                                                     │ Webhook POST /api/webhooks/whatsapp
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │   openwa-api     │
                                            │   (Docker)       │
                                            │   Port 127.0.0.1 │
                                            │   :2785          │
                                            └────────┬────────┘
                                                     │
                                            Docker network:
                                            dokploy-network
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │   Traefik        │
                                            │   (reverse proxy)│
                                            │   Ports 80/443   │
                                            └────────┬────────┘
                                                     │
                                                     ▼
                                            Public HTTPS:
                                            https://api.76-13-252-4.sslip.io/api/*

Dashboard (Vercel):  https://dashboard-xi-lac.vercel.app
```

## Infrastructure Components

### VPS (Hostinger)
- **IP:** 76.13.252.4
- **OS:** Ubuntu (Docker host)
- **Reverse proxy:** Traefik (managed by Dokploy)
- **Container orchestration:** Docker Compose via Dokploy

### OpenWA API Container
- **Image:** `openwa-api:latest`
- **Port binding:** `127.0.0.1:2785->2785/tcp` (loopback only — not exposed publicly)
- **Network:** `dokploy-network`
- **Local health:** `http://127.0.0.1:2785/api/health`

### OpenWA Router Container
- **Image:** `alpine:3.20`
- **Network mode:** `host`
- **Role:** Traefik router marker — tells Traefik to route traffic to the API container

### Traefik Reverse Proxy
- **Listens:** ports 80 (HTTP) and 443 (HTTPS)
- **Routes:** `https://api.76-13-252-4.sslip.io/api/*` → `127.0.0.1:2785`
- **SSL certificate:** Auto-provisioned via Let's Encrypt (sslip.io)

### Vercel Dashboard
- **URL:** https://dashboard-xi-lac.vercel.app
- **Framework:** React + Vite (SPA)
- **Environment variables:**
  - `VITE_API_URL=https://api.76-13-252-4.sslip.io/api`
  - `VITE_WS_URL=https://api.76-13-252-4.sslip.io`

## Why Loopback Routing?

The OpenWA container's Docker network IP (`10.0.1.35`) was unreachable from Traefik:
```
http://10.0.1.35:2785/api/health  → TIMED OUT
http://127.0.0.1:2785/api/health  → WORKS
```

So the setup uses:
1. OpenWA API bound to `127.0.0.1:2785` (loopback only)
2. `openwa-router` in `host` network mode acts as Traefik's routing target
3. Traefik routes public HTTPS traffic to the loopback port

This means the API is never directly exposed to the public internet — only through Traefik's HTTPS proxy.

## Docker Compose File

**Location:** `/root/openwa-deploy/openwa/docker-compose.dokploy.loopback.yml`

Key services:
- `openwa-api` — main API container
- `openwa-router` — Traefik routing marker (host network)

## Current API Status

| Endpoint | URL | Status |
|---|---|---|
| Health | `https://api.76-13-252-4.sslip.io/api/health` | ✅ `{"status":"ok"}` |
| Base | `https://api.76-13-252-4.sslip.io/api` | ✅ Live |
| Dashboard | `https://dashboard-xi-lac.vercel.app` | ✅ Live |

## Security Notes

⚠️ **API key was printed in logs during setup. Treat as exposed.**
- Rotate the OpenWA API key before real production/client use
- Never print full secrets in logs or chat — use masked format: `owa_k1_****abcd`
- Do NOT commit API keys, WhatsApp session files, QR codes, or `.env` files

## Temporary Domain

`api.76-13-252-4.sslip.io` is a **temporary sslip.io domain** for testing/demo.
Before real client work, replace with a real domain:
- Example: `api.yourdomain.com`
- Update Traefik routing rules accordingly
- Update Vercel env vars: `VITE_API_URL` and `VITE_WS_URL`

## WhatsApp Sessions

Current active session:
- **Session name:** `wife-cleaning-main`
- **Linked number:** 447742344614
- **Business:** Wife's cleaning company

## Next Steps to Production-Ready

1. ✅ API live on VPS
2. ✅ Health check working
3. ✅ Dashboard live on Vercel
4. ⚠️ Rotate exposed API key
5. ⚠️ Replace sslip.io with real domain
6. ⬜ Configure cleaning company demo flow
7. ⬜ Client onboarding SOP
8. ⬜ Testing plan
9. ⬜ Sales/outreach materials
