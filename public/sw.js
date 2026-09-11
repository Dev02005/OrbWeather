// OrbWeather service worker.
//
// Two jobs: offline caching, and showing weather alerts pushed from the server
// (see /api) — which works even while the app itself is closed.
//
// Caching strategy, by request kind:
//   navigation      network-first, falling back to the cached app shell offline
//   built assets    cache-first (Vite fingerprints them, so they never go stale)
//   weather APIs    network-first, falling back to the last successful response
//
// Bump CACHE_VERSION to retire every previous cache in one go.
const CACHE_VERSION = 'v3';
const SHELL_CACHE = `orbweather-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `orbweather-assets-${CACHE_VERSION}`;
const DATA_CACHE = `orbweather-data-${CACHE_VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE, DATA_CACHE];

const SHELL_URLS = ['/', '/index.html', '/manifest.json', '/favicon.ico', '/icon-192.png'];

const DATA_HOSTS = [
  'api.open-meteo.com',
  'air-quality-api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'api.bigdatacloud.net',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('orbweather-') && !CURRENT_CACHES.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Serve from cache, and refresh the entry in the background. */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

/** Always prefer the network; fall back to whatever was last stored. */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never interfere with writes or with cross-origin requests we don't know.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html', { cacheName: SHELL_CACHE }).then(
          (cached) => cached ?? Response.error()
        )
      )
    );
    return;
  }

  if (DATA_HOSTS.includes(url.hostname)) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }
});

// ─── Push alerts ────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let alert = {};
  try {
    alert = event.data ? event.data.json() : {};
  } catch {
    alert = { body: event.data ? event.data.text() : '' };
  }

  event.waitUntil(
    self.registration.showNotification(alert.title || 'OrbWeather', {
      body: alert.body || '',
      icon: '/icon-192.png',
      // Android draws the badge as a monochrome silhouette in the status bar.
      badge: '/badge-72.png',
      // A newer alert of the same kind replaces the old one instead of stacking.
      tag: alert.tag || 'orbweather',
      renotify: Boolean(alert.tag),
      data: { url: alert.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    (async () => {
      // Bring an already-open OrbWeather window forward rather than opening another.
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = windows.find((client) => client.url.startsWith(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })()
  );
});
