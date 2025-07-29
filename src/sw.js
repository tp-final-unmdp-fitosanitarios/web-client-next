import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import { NetworkOnly, NetworkFirst } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";

// Plugin para POST/PUT offline
const bgSyncPlugin = new BackgroundSyncPlugin("offline-queue", {
  maxRetentionTime: 24 * 60,
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheAdditionalEntries: [
    "/",
    "/aplicaciones",
    "/aplicaciones/confirmar",
    "/aplicaciones/consolidado",
    "/aplicaciones/crear",
    "/aplicaciones/finalizar",
    "/aplicaciones/historico",
    "/aplicaciones/iniciar",
    "/aplicaciones/modificar",
    "/cultivos",
    "/estadisticas",
    "/home",
    "/locaciones",
    "/locaciones/agregar",
    "/login",
    "/maquinas",
    "/maquinas/agregar",
    "/perfil",
    "/perfil/cambiar-password",
    "/personal",
    "/personal/agregar",
    "/productos",
    "/productos/agregar",
    "/productos/agroquimicos",
    "/productos/agroquimicos/agregar",
    "/productos/edit",
    "/stock",
    "/stock/mover",
    "/stock/movimientos",
    "/stock/proveedores",
    "/stock/retirar"
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,

    // 🌐 DOCUMENT requests (HTML routes)
    {
      urlPattern: ({ request, url }) =>
        request.mode === 'navigate' || url.searchParams.has('__flight__') || url.searchParams.has('_rsc'),
      handler: new NetworkFirst(),
    },

    // ⬆️ POST y PUT offline con background sync
    {
      urlPattern: ({ request }) => request.method === 'POST',
      handler: new NetworkOnly({
        plugins: [bgSyncPlugin],
      }),
    },
    {
      urlPattern: ({ request }) => request.method === 'PUT',
      handler: new NetworkOnly({
        plugins: [bgSyncPlugin],
      }),
    },
  ],
});

serwist.addEventListeners();
