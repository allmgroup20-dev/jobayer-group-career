importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

const CACHE_VERSION = 2;
const CACHE_NAMES = [
  'pages-v' + CACHE_VERSION,
  'static-assets-v' + CACHE_VERSION,
  'images-v' + CACHE_VERSION,
  'next-assets-v' + CACHE_VERSION,
];

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'pages-v' + CACHE_VERSION })
);

workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'worker',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-assets-v' + CACHE_VERSION,
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images-v' + CACHE_VERSION,
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 14 * 24 * 60 * 60 }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkOnly()
);

workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/'),
  new workbox.strategies.NetworkFirst({ cacheName: 'next-assets-v' + CACHE_VERSION })
);

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys
          .filter((key) => !CACHE_NAMES.includes(key))
          .map((key) => caches.delete(key))
        )
      ),
    ])
  );
});
