const CACHE_NAME = "cow-desktop-pet-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=6",
  "./app.js?v=6",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/cow-walk-1.png?v=6",
  "./assets/cow-walk-2.png?v=6",
  "./assets/cow-walk-3.png?v=6",
  "./assets/cow-graze.png?v=6",
  "./assets/bg-morning.png?v=6",
  "./assets/bg-day.png?v=6",
  "./assets/bg-evening.png?v=6",
  "./assets/bg-night.png?v=6"
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
