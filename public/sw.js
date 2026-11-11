const CACHE = "justgive-offline-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/offline.html")).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || request.mode !== "navigate" || url.origin !== self.location.origin) return;
  if (/\/api\/|\/admin(?:\/|$)|\/checkout(?:\/|$)|\/payment-status(?:\/|$)/.test(url.pathname)) return;
  event.respondWith(fetch(request).catch(async () => (await caches.match("/offline.html")) || Response.error()));
});
