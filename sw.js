const CACHE = "take-me-bake-v3";
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
  event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request).then((response) => {
    caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(ROOT))));
});
