import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({
  // Los Server Actions tienen un limite de body de 1 MB por defecto.
  // Se sube a 6 MB para permitir la carga de comprobantes (hasta 5 MB).
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
});
