const CACHE_NAME = 'fkm-energy-v1';
const ASSETS = [
  'P.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Installation et mise en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Stratégie : Réseau d'abord, sinon Cache (pour Firebase)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
