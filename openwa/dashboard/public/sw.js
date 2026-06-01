/* OpenWA Dashboard service worker.
 * Strategy: network-first for the app shell & assets (keeps content fresh and
 * avoids stale modules during dev), falling back to cache when offline.
 * API and realtime traffic are never intercepted.
 */
const VERSION = 'openwa-v1';
const CACHE = `openwa-cache-${VERSION}`;
const OFFLINE_URL = '/';

// Paths that must always hit the network (never cached / never intercepted).
const BYPASS = [
  '/api',
  '/socket.io',
  '/@vite',
  '/@react-refresh',
  '/@id',
  '/__vite',
  '/node_modules/.vite',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL]).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function shouldBypass(url) {
  return BYPASS.some((p) => url.pathname.startsWith(p)) || url.pathname.includes('?import');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET; let the browser deal with everything else.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Never touch API, websockets or Vite internals.
  if (sameOrigin && shouldBypass(url)) return;

  // App navigations: network-first, fall back to cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(OFFLINE_URL, fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(request)) || (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Same-origin static assets: network-first, cache on success.
  if (sameOrigin) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh && fresh.status === 200) {
            const cache = await caches.open(CACHE);
            cache.put(request, fresh.clone()).catch(() => {});
          }
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          throw new Error('offline and not cached');
        }
      })(),
    );
    return;
  }

  // Cross-origin (e.g. Google Fonts): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res && (res.status === 200 || res.type === 'opaque')) cache.put(request, res.clone()).catch(() => {});
          return res;
        })
        .catch(() => null);
      return cached || (await network) || Response.error();
    })(),
  );
});
