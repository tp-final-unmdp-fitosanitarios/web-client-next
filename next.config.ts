import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

const withSerwist = withSerwistInit({
  swSrc: "./src/sw.js",
  swDest: "./public/sw.js",
  additionalPrecacheEntries: [
    "/",
    "/manifest.json",
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
    "/personal/agregar",
    "/productos",
    "/productos/agregar",
    "/productos/agroquimicos",
    "/productos/agroquimicos/agregar",
    "/productos/edit",
    "/stock",
    "/stock/agregar",
    "/stock/mover",
    "/stock/movimientos",
    "/stock/proveedores",
    "/stock/retirar"
  ]
});

export default withSerwist(nextConfig);