const CACHE_NAME = 'verde-guide-v2';

// API paths excluded from cache: auth tokens, user-specific data, and push
// subscriptions must always hit the network.
// Coverage:
//   /api/auth/*  — session/token endpoints
//   /api/user/*  — includes /api/user/profile (auth-protected, per-user data)
//   /api/push/*  — push subscription management (always requires fresh state)
const EXCLUDED_API_PATHS = ['/api/auth/', '/api/user/', '/api/push/'];

// Maximum number of API responses kept in cache to bound storage growth.
// Oldest entries are evicted when the limit is exceeded.
const API_CACHE_MAX_ENTRIES = 30;
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/offline.html',
];

// Install: Pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: Clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network-first for API, cache-first for static, offline fallback for pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension / devtools traffic
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // API requests: Network first, fall back to cached response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Check if it's safe to cache.
          // EXCLUDED_API_PATHS covers /api/auth/, /api/user/ (incl. /api/user/profile),
          // and /api/push/ — these must never be served from cache.
          const isExcluded = EXCLUDED_API_PATHS.some((path) =>
            url.pathname.startsWith(path)
          );
          const isCacheable =
            response.ok &&
            !isExcluded &&
            !request.headers.has('Authorization') &&
            !response.headers.get('cache-control')?.includes('no-store') &&
            !response.headers.get('cache-control')?.includes('private');

          if (isCacheable) {
            const clone = response.clone();
            // Enforce a max-entries cap to prevent unbounded cache growth.
            caches.open(CACHE_NAME).then(async (cache) => {
              await cache.put(request, clone);
              const keys = await cache.keys();
              // Only count API entries to avoid evicting static assets.
              const apiKeys = keys.filter((req) =>
                new URL(req.url).pathname.startsWith('/api/')
              );
              if (apiKeys.length > API_CACHE_MAX_ENTRIES) {
                // Evict the oldest entries (FIFO — keys() preserves insertion order).
                const toDelete = apiKeys.slice(
                  0,
                  apiKeys.length - API_CACHE_MAX_ENTRIES
                );
                await Promise.all(toDelete.map((req) => cache.delete(req)));
              }
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: Cache first, fall back to network and cache the result
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // HTML navigation pages: Network first with offline fallback
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // All other GET requests (manifest.json, etc.): Network only, cache fallback, no HTML
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then(
            (cached) =>
              cached ||
              new Response('', { status: 503, statusText: 'Service Unavailable' })
          )
      )
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  const title = data.title || 'Verde Guide';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/';
    if (!url.startsWith('/') && !url.startsWith(self.location.origin)) return;
    event.waitUntil(clients.openWindow(url));
  }
});
