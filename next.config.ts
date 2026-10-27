import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

// Host publico (p.ej. tunel ngrok) derivado de NEXT_PUBLIC_SITE_URL.
// Permite acceder a la app y ejecutar Server Actions desde ese origen
// (Next 16 bloquea Server Actions de origenes cruzados por defecto).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteHost = siteUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const externalOrigins = siteHost && !siteHost.startsWith("localhost") ? [siteHost] : [];

const nextConfig: NextConfig = {
  // Permite peticiones cross-origin en desarrollo (assets/HMR) desde el tunel.
  allowedDevOrigins: externalOrigins,
  // Los Server Actions tienen un limite de body de 1 MB por defecto.
  // Se sube a 6 MB para permitir la carga de comprobantes (hasta 5 MB).
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
      ...(externalOrigins.length ? { allowedOrigins: externalOrigins } : {}),
    },
  },
};

// Serwist inyecta configuracion de webpack, lo que impide usar Turbopack
// en desarrollo. Como el service worker esta deshabilitado en dev de todas
// formas, el wrapper solo se aplica al build de produccion (`--webpack`).
export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withSerwist(nextConfig);
