import "server-only";

/**
 * Configuracion central de la pasarela de pagos Kushki.
 * Lee y valida las variables de entorno bajo demanda (lazy),
 * para no romper el build cuando faltan credenciales.
 *
 * Este modulo es server-only: nunca debe importarse desde un
 * Client Component. El `publicMerchantId` se incluye aqui solo
 * para uso en servidor; en el cliente (commit 7) se lee directo
 * desde `process.env.NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID`.
 */

export type KushkiEnv = "sandbox" | "production";

const KUSHKI_BASE_URLS: Record<KushkiEnv, string> = {
  sandbox: "https://api-uat.kushkipagos.com",
  production: "https://api.kushkipagos.com",
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`[kushki] Falta la variable de entorno ${name}`);
  }
  return value;
}

function resolveEnv(): KushkiEnv {
  const raw = (process.env.NEXT_PUBLIC_KUSHKI_ENV ?? "sandbox").trim().toLowerCase();
  if (raw !== "sandbox" && raw !== "production") {
    throw new Error(
      `[kushki] KUSHKI_ENV debe ser "sandbox" o "production" (recibido: "${raw}")`,
    );
  }
  return raw;
}

export type KushkiConfig = {
  env: KushkiEnv;
  baseUrl: string;
  publicMerchantId: string;
  privateMerchantId: string;
  webhookSecret: string;
};

let cached: KushkiConfig | null = null;

/**
 * Devuelve la configuracion de Kushki validada y cacheada.
 * @throws {Error} si falta alguna variable de entorno requerida.
 */
export function getKushkiConfig(): KushkiConfig {
  if (cached) return cached;

  const env = resolveEnv();

  cached = {
    env,
    baseUrl: KUSHKI_BASE_URLS[env],
    publicMerchantId: requireEnv("NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID"),
    privateMerchantId: requireEnv("KUSHKI_PRIVATE_MERCHANT_ID"),
    webhookSecret: requireEnv("KUSHKI_WEBHOOK_SECRET"),
  };

  return cached;
}
