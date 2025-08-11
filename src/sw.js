import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
import { NetworkOnly, NetworkFirst } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { actualizaAplicaciones } from "./utilities/ActualizaAplicaciones";

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
    "/home",
    "/locaciones",
    "/login",
    "/maquinas",
    "/stock",
    "/stock/mover",
    "/stock/retirar",
    "/not-found"
  ],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,

    // Navegación de la app (incluye rutas /aplicaciones/*) sigue con NetworkFirst,
    // lo cual garantiza HTML offline precacheado y datos frescos cuando hay red
    {
      matcher({ request, url }) {
        return request.mode === "navigate" || url.searchParams.has("__flight__") || url.searchParams.has("_rsc");
      },
      handler: new NetworkFirst(),
    },
  ],
});

class MiNetworkOnlyConActualizacionDB extends NetworkOnly {
  async handle({ request, event }) {
    // Actualiza la IndexedDB con la request
    await actualizaAplicaciones(request);
    // Seguir con el comportamiento normal
    return super.handle({ request, event });
  }
}


serwist.registerCapture(
  /.*/,
  new MiNetworkOnlyConActualizacionDB({
    plugins: [bgSyncPlugin],
  }),
  "POST"
);



serwist.registerCapture(
  /.*/,
  new MiNetworkOnlyConActualizacionDB({
    plugins: [bgSyncPlugin],
  }),
  "PUT"
);


serwist.addEventListeners();
