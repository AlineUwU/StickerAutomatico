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

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(resp => {
      return resp || fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('/StickerAutomatico/index.html');
        }
      });
    })
  );
});
