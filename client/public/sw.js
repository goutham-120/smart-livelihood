/* Service Worker for SIH26097 PM-AJAY Livelihood Assistant PWA
   Caches the app shell for offline use */

const CACHE_NAME = 'pmajay-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

/* Install: cache the app shell */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

/* Activate: clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* Fetch: network-first for API, cache-first for static assets */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  /* Always go to network for API calls */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request).catch(() => {
      return new Response(
        JSON.stringify({ error: 'You are offline. Please check your connection.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }));
    return;
  }

  /* Cache-first for static assets */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        /* Return cached index.html for navigation requests (SPA fallback) */
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
