// Centralized runtime configuration for the dashboard.
//
// Backend URL resolution order:
//   1. VITE_API_URL  — absolute backend API base, e.g. https://api.example.com/api
//                      (set this in Vercel / production)
//   2. "/api"        — relative path used in local dev, proxied by Vite to
//                      http://localhost:2785 (see vite.config.ts)
//
// Keeping the dev fallback means `npm run dev` keeps working with no env file.

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

const rawApiUrl = (import.meta.env.VITE_API_URL ?? '').trim();

/** Base URL used for all REST calls. "/api" in dev, absolute backend URL in prod. */
export const API_BASE_URL = rawApiUrl ? trimTrailingSlash(rawApiUrl) : '/api';

/**
 * Socket.IO origin for live updates. Resolution order:
 *   1. VITE_WS_URL                      — explicit override
 *   2. origin of VITE_API_URL           — derived from the backend API URL
 *   3. window.location.origin           — dev / same-origin proxy
 */
function resolveWsUrl(): string {
  const explicit = (import.meta.env.VITE_WS_URL ?? '').trim();
  if (explicit) return trimTrailingSlash(explicit);

  if (rawApiUrl) {
    try {
      return new URL(rawApiUrl).origin;
    } catch {
      // VITE_API_URL was relative (e.g. "/api") — fall through to current origin.
    }
  }

  return window.location.origin;
}

export const WS_URL = resolveWsUrl();
