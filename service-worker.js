
// Ce fichier permet à l'application de fonctionner hors ligne et d'être installable
const CACHE_NAME = 'socio-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './questions.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
