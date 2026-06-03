const CACHE_NAME = 'shop-manager-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // Ajoute ici tes fichiers CSS ou JS locaux si tu en as, par exemple :
  // '/css/style.css',
  // '/js/app.js'
];

// Événement d'installation : Mise en cache des ressources critiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('pwa-cache: Enregistrement des ressources initiales');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Événement d'activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('pwa-cache: Nettoyage de l\'ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache : Stale-While-Revalidate
// Idéal pour les données Supabase / API qui doivent rester fraîches, 
// tout en garantissant un chargement de l'interface hors ligne.
self.addEventListener('fetch', (event) => {
  // Optionnel : Ne pas intercepter les requêtes vers l'API Supabase si tu veux du temps réel strict en ligne
  if (event.request.url.includes('supabase.co')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // On met à jour le cache uniquement avec les requêtes valides (GET et statut 200)
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Optionnel : Gestion d'erreur en cas de coupure totale de réseau
        console.log('Mode hors ligne actif pour cette requête');
      });

      // Renvoie immédiatement la version cachée si elle existe, sinon attend le réseau
      return cachedResponse || fetchPromise;
    })
  );
});
