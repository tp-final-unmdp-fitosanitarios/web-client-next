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
    "/home",
    "/locaciones",
    "/login",
    "/maquinas",
    "/perfil",
    "/perfil/cambiar-password",
    "/personal/agregar",
    "/productos",
    "/stock",
    "/stock/agregar",
    "/stock/mover",
    "/stock/retirar"
  ]
});

export default withSerwist(nextConfig);