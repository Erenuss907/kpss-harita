const CACHE_NAME = 'turkiye-ezber-v2';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './images/daglar.jpg',
  './images/tektonik-goller.jpg',
  './images/volkanik-goller.jpg',
  './images/volkanik-set-goller.jpg',
  './images/karstik-goller.jpg',
  './images/buzul-goller.jpg',
  './images/aluvyon-set-goller.jpg',
  './images/heyelan-set-goller.jpg',
  './images/kiyi-set-goller.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
