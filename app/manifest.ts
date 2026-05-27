import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RGL Estudio",
    short_name: "RGL",
    description: "Plataforma de gestión de servicios, reservas y suscripciones de RGL Estudio.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f7f5",
    theme_color: "#ae2900",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
