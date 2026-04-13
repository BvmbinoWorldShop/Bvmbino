const CACHE_NAME = 'bvmbino-auteur-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/js/main.js',
  '/js/core.js',
  '/js/api.js',
  '/js/render.js',
  '/js/store.js',
  '/js/router.js',
  '/js/ui.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  // Only cache GET requests (don't cache API POST calls)
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
