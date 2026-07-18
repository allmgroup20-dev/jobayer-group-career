const CACHE_VERSION = 5;
const CACHE = `jgcareer-v${CACHE_VERSION}`;
const RUNTIME = `jgcareer-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `jgcareer-images-v${CACHE_VERSION}`;
const API_CACHE = `jgcareer-api-v${CACHE_VERSION}`;

const PRECACHE = ["/", "/offline", "/products", "/faq", "/login", "/register"];

const IMAGE_EXT = /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)(\?.*)?$/;
const STATIC_EXT = /\.(js|css|woff2?|ttf|otf|eot)(\?.*)?$/;

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== RUNTIME && k !== IMAGE_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  // Images — cache first, network fallback
  if (IMAGE_EXT.test(url.pathname)) {
    e.respondWith(
      caches.open(IMAGE_CACHE).then((c) =>
        c.match(e.request).then((hit) => {
          if (hit) return hit;
          return fetch(e.request).then((res) => {
            if (res.ok) c.put(e.request, res.clone());
            return res;
          });
        })
      ).catch(() => fetch(e.request))
    );
    return;
  }

  // Static assets (JS/CSS/fonts) — cache first
  if (STATIC_EXT.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then((r) => r || fetch(e.request))
    );
    return;
  }

  // API calls — network first, cache on success
  if (url.pathname.startsWith("/api/") && e.request.method === "GET") {
    e.respondWith(
      networkFirstThenCache(e.request, API_CACHE).catch(() =>
        caches.match(e.request)
      )
    );
    return;
  }

  // Navigation — network first, offline fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      networkFirstThenCache(e.request, RUNTIME).catch(() =>
        caches.match("/offline").then((o) => o || new Response("Offline", { status: 502 }))
      )
    );
    return;
  }

  // Everything else — network first
  e.respondWith(
    networkFirstThenCache(e.request, RUNTIME).catch(() =>
      caches.match(e.request)
    )
  );
});

async function networkFirstThenCache(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const res = await fetch(request);
    if (res.ok) {
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return null;
  }
}
