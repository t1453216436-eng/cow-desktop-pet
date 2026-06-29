const CACHE_NAME = "cow-desktop-pet-v9";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=9",
  "./app.js?v=9",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/bg-morning.png?v=9",
  "./assets/bg-day.png?v=9",
  "./assets/bg-evening.png?v=9",
  "./assets/bg-night.png?v=9",
  "./assets/models/cow.glb?v=9"
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
