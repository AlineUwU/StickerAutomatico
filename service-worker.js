const CACHE_NAME = 'stickers-cache-v1';
const FILES_TO_CACHE = [
  '/StickerAutomatico/',
  '/StickerAutomatico/index.html',
  '/StickerAutomatico/styles.css',
  '/StickerAutomatico/script.js',
  '/StickerAutomatico/manifest.json',
  '/StickerAutomatico/icon-192.png',
  '/StickerAutomatico/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(error => {
        console.error('❌ Error cacheando archivos:', error);
      });
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/StickerAutomatico/index.html');
        }
      });
    })
  );
});
