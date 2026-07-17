const CACHE_VERSION = 4;
const CACHE = `jgcareer-v${CACHE_VERSION}`;
const RUNTIME = `jgcareer-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `jgcareer-images-v${CACHE_VERSION}`;
const API_CACHE = `jgcareer-api-v${CACHE_VERSION}`;

const PRECACHE = ["/", "/offline", "/app-install", "/products", "/faq", "/login", "/register"];

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

async function fetchWithETag(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const headers = new Headers(request.headers);
  const cachedEtag = cached?.headers.get("ETag");
  if (cachedEtag) {
    headers.set("If-None-Match", cachedEtag);
  }

  const conditional = new Request(request, { headers });

  try {
    const res = await fetch(conditional);

    if (res.status === 304 && cached) {
      return cached;
    }

    if (res.ok) {
      const clone = res.clone();
      cache.put(request, clone);
    }
    return res;
  } catch {
    return cached || new Response("Offline", { status: 502 });
  }
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  // API calls — network first with ETag/304
  if (url.pathname.startsWith("/api/") && e.request.method === "GET") {
    e.respondWith(fetchWithETag(e.request, API_CACHE));
    return;
  }

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
      )
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

  // Navigation — network first with ETag/304, offline fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetchWithETag(e.request, RUNTIME).catch(() => caches.match("/offline"))
    );
    return;
  }

  // Everything else — network first with ETag/304
  e.respondWith(fetchWithETag(e.request, RUNTIME));
});
