const swSelf = self;
const CACHE_NAME = 'mi-app-static-v1';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
];

swSelf.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  swSelf.skipWaiting();
});

swSelf.addEventListener('activate', (event) => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  swSelf.clients.claim();
});

swSelf.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cachedResponse => {
      // Si es un recurso estático y existe en cache, lo devolvemos
      if (cachedResponse) return cachedResponse;

      // Si no hay cache, intentamos fetch normalmente
      return fetch(req).catch(() => {
        // No devolvemos nada. Deja que el frontend lo maneje
        return new Response('', { status: 200 });
      });
    })
  );
});
