const CACHE_NAME = "evaluation-cache-v2";

const FILES_TO_CACHE = [
  "./",
  "index.html",
  "admin.html",
  "style.css",
  "app.js",
  "questions.js",
  "manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
