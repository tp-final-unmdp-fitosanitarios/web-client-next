const swSelf = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'mi-app-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  // otros archivos estáticos que quieras servir offline
];

swSelf.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  swSelf.skipWaiting();
});

swSelf.addEventListener('activate', (event: ExtendableEvent) => {
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

swSelf.addEventListener('fetch', (event: FetchEvent) => {
    const req = event.request;
  
    if (req.method !== 'GET') return;
  
    event.respondWith(
      caches.match(req).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
  
        return fetch(req).catch(async () => {
          if (req.destination === 'document') {
            const fallback = await caches.match('/index.html');
            if (fallback) return fallback;
          }
          // Respuesta fallback genérica para otros casos (por ejemplo, texto simple offline)
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
    );
  });
  
