import "server-only";

import { getKushkiConfig } from "./config";
import type { KushkiErrorBody } from "./types";

/** Error tipado para fallos de la API de Kushki. */
export class KushkiApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "KushkiApiError";
    this.status = status;
    this.code = code;
  }
}

type KushkiFetchOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  /**
   * Header de autenticacion:
   * - "private": Private-Merchant-Id (cargos, transferencias) — por defecto.
   * - "public": Public-Merchant-Id (operaciones del lado publico).
   */
  auth?: "private" | "public";
};

/**
 * Wrapper de bajo nivel para llamar a la API REST de Kushki.
 * Inyecta el header de autenticacion y normaliza los errores.
 *
 * @throws {KushkiApiError} si la respuesta no es 2xx.
 */
export async function kushkiFetch<T>(
  path: string,
  options: KushkiFetchOptions = {},
): Promise<T> {
  const config = getKushkiConfig();
  const { method = "POST", body, auth = "private" } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth === "private") {
    headers["Private-Merchant-Id"] = config.privateMerchantId;
  } else {
    headers["Public-Merchant-Id"] = config.publicMerchantId;
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();

  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new KushkiApiError(
        response.status,
        `Kushki devolvio una respuesta no-JSON (${response.status})`,
      );
    }
  }

  if (!response.ok) {
    const errorBody = (parsed ?? {}) as KushkiErrorBody;
    throw new KushkiApiError(
      response.status,
      errorBody.message ?? `Kushki respondio ${response.status}`,
      errorBody.code,
    );
  }

  return parsed as T;
}
