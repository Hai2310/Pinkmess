const CACHE_NAME = 'pinkmess-v4';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/',
        '/manifest.webmanifest',
        '/icons/pinkmess-icon-180.jpg',
        '/icons/pinkmess-icon-512.jpg'
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() || 'Bạn có tin nhắn mới trên Pinkmess 💌' };
  }

  const title = payload.title || 'Pinkmess 💌';
  const options = {
    body: payload.body || 'Có người đang nhắn tin cho bạn nè 🐰',
    icon: payload.icon || '/icons/pinkmess-icon-512.jpg',
    badge: payload.badge || '/icons/pinkmess-icon-180.jpg',
    tag: payload.tag || 'pinkmess-message',
    renotify: true,
    data: payload.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const conversationId = event.notification.data?.conversationId;
  const callRequestId = event.notification.data?.callRequestId;
  const targetUrl = conversationId
    ? `/?conversation=${encodeURIComponent(conversationId)}`
    : callRequestId
    ? `/?call_request=${encodeURIComponent(callRequestId)}`
    : '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => 'focus' in client);
      if (existing) {
        existing.navigate(targetUrl);
        return existing.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
