self.addEventListener('install', (_e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (_e) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(response => {
        if (!response.ok) {
          return fetch('/index.html');
        }
        return response;
      }).catch(() => fetch('/index.html'))
    );
  } else {
    e.respondWith(fetch(e.request));
  }
});
