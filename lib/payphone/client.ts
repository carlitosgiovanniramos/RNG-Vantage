import { request as httpsRequest } from "node:https";

import { getPayphoneConfig } from "./config";
import type { PayphonePrepareResponse, PayphoneConfirmResponse } from "./types";

const BASE_URL = "https://pay.payphonetodoesposible.com/api";

export class PayphoneApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "PayphoneApiError";
  }
}

/**
 * POST a la API de Payphone usando el modulo `https` nativo de Node.
 *
 * IMPORTANTE: NO usar `fetch` (undici). El backend de Payphone (ASP.NET)
 * responde HTTP 500 ("Runtime Error") ante las peticiones de undici
 * (por el manejo de cabeceras en minuscula). El modulo `https` nativo
 * preserva las cabeceras y funciona correctamente.
 */
function payphonePost(
  path: string,
  body: unknown,
): Promise<{ status: number; text: string }> {
  const { token } = getPayphoneConfig();
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      `${BASE_URL}${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, text: data });
        });
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function payphoneFetch<T>(path: string, body: unknown): Promise<T> {
  const { status, text } = await payphonePost(path, body);

  if (status < 200 || status >= 300) {
    console.error(`[payphone] ${path} → HTTP ${status}:`, text.slice(0, 500));

    let message = `Error Payphone ${status}`;
    try {
      const parsed = JSON.parse(text) as { message?: string; error?: string; title?: string };
      message = parsed.message ?? parsed.error ?? parsed.title ?? message;
    } catch {}
    throw new PayphoneApiError(status, message);
  }

  return JSON.parse(text) as T;
}

/**
 * Crea (prepara) una intención de pago en Payphone y devuelve los
 * enlaces de pago. El cliente debe redirigirse a `payWithCard` o
 * `payWithPayPhone`.
 *
 * amount: monto en CENTAVOS USD (ej. $50.00 → 5000).
 * clientTransactionId: identificador unico propio, MAXIMO 15 caracteres.
 * Debe cumplirse: amount === amountWithoutTax + amountWithTax + tax + service + tip.
 */
export async function preparePayphonePayment(params: {
  amount: number;
  clientTransactionId: string;
  reference: string;
  email?: string;
  responseUrl: string;
  cancellationUrl: string;
}): Promise<PayphonePrepareResponse> {
  const { storeId } = getPayphoneConfig();

  return payphoneFetch<PayphonePrepareResponse>("/button/Prepare", {
    amount: params.amount,
    amountWithoutTax: params.amount,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    currency: "USD",
    storeId,
    clientTransactionId: params.clientTransactionId,
    reference: params.reference,
    lang: "es",
    email: params.email,
    responseUrl: params.responseUrl,
    cancellationUrl: params.cancellationUrl,
  });
}

/**
 * Confirma el resultado final de un pago con Payphone.
 * Debe llamarse desde /pago-respuesta cuando el cliente regresa del portal.
 *
 * @param id ID numerico que Payphone envia en la URL de retorno (?id=).
 * @param clientTxId Nuestro clientTransactionId (campo `clientTxId` en la API).
 */
export async function confirmPayphonePayment(
  id: number,
  clientTxId: string,
): Promise<PayphoneConfirmResponse> {
  return payphoneFetch<PayphoneConfirmResponse>("/button/V2/Confirm", {
    id,
    clientTxId,
  });
}
