const swSelf = self;
const CACHE_NAME = 'mi-app-static-v1';
const STATIC_ASSETS = ['/', '/offline.html'];

swSelf.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  swSelf.skipWaiting();
});

swSelf.addEventListener('activate', (event) => {
  console.log('[SW] Activado');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  swSelf.clients.claim();
});

swSelf.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;
  // Si es navegación a una ruta de la SPA (por ejemplo /aplicador/...), devolvemos el shell (/)
  const isNavigationRequest = req.mode === 'navigate';

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        return res;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Si no hay conexión...
        if (isNavigationRequest) {
          const cache = await caches.open(CACHE_NAME);
          const fallback = await cache.match('/');
          if (fallback) return fallback;
        }

        // Para otros casos, dejamos que el frontend maneje (o devolvemos vacío)
        return new Response('', { status: 200, statusText: 'Offline' });
      }
    })()
  );
});
