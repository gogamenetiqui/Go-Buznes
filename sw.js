const CACHE_NAME = 'go-buznes-cache-v1';
const ASSETS = [
  './home.html',
  './index.html',
  './manifest.json',
  './data/images/logo_gbz.jpg'
];

// Installation : Mise en cache des fichiers de structure critiques
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage des versions obsolètes du cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes (Stratégie Réseau d'abord, repli sur le cache)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si le réseau fonctionne, on renvoie la ressource et on met à jour le cache
        if (e.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau échoue (mode hors-ligne ou mauvaise connexion), on utilise le cache
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (e.request.mode === 'navigate') {
            return caches.match('./home.html');
          }
        });
      })
  );
});
