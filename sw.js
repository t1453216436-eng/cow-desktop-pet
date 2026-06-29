const CACHE_NAME = "cow-desktop-pet-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=8",
  "./app.js?v=8",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/bg-morning.png?v=8",
  "./assets/bg-day.png?v=8",
  "./assets/bg-evening.png?v=8",
  "./assets/bg-night.png?v=8"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
