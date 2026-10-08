const CACHE = "take-me-bake-v4";
const ROOT = new URL("./", self.location).pathname;
const APP = [ROOT, `${ROOT}manifest.webmanifest`, `${ROOT}take-me-bake-logo-transparent.png`];

self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP)).then(() => self.skipWaiting())),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())),
);
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Never cache the HTML document. Vite filenames are content-hashed, so a
  // cached document can otherwise point to bundles removed by a later deploy.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(ROOT)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (hit) =>
        hit ||
        fetch(event.request)
          .then((response) => {
            // Clone before returning the response: the browser may consume the
            // body while the asynchronous cache write is waiting to begin.
            const cacheCopy = response.clone();
            event.waitUntil(
              caches.open(CACHE).then((cache) => cache.put(event.request, cacheCopy)),
            );
            return response;
          })
          .catch(() => caches.match(ROOT)),
    ),
  );
});
