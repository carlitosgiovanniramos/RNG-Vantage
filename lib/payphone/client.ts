import { getPayphoneConfig } from "./config";
import type { PayphoneChargeResponse, PayphoneConfirmResponse } from "./types";

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

async function payphoneFetch<T>(path: string, body: unknown): Promise<T> {
  const { token } = getPayphoneConfig();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Loguear la respuesta completa para diagnosticar errores de Payphone.
    let rawBody = "";
    try {
      rawBody = await res.text();
    } catch {}
    console.error(`[payphone] ${path} → HTTP ${res.status}:`, rawBody);

    let message = `Error Payphone ${res.status}`;
    try {
      const parsed = JSON.parse(rawBody) as { message?: string; error?: string; title?: string };
      message = parsed.message ?? parsed.error ?? parsed.title ?? message;
    } catch {}
    throw new PayphoneApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

/**
 * Crea una intención de pago en Payphone y devuelve la URL de pago.
 *
 * amount: monto en CENTAVOS USD (ej. $50.00 → 5000).
 * clientTransactionId: UUID de la transaccion en nuestra BD.
 */
export async function createPayphonePayment(params: {
  amount: number;
  clientTransactionId: string;
  reference: string;
  email: string;
  responseUrl: string;
  cancellationUrl: string;
}): Promise<PayphoneChargeResponse> {
  return payphoneFetch<PayphoneChargeResponse>("/button/Charge", {
    amount: params.amount,
    amountWithoutTax: params.amount,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    currency: "USD",
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
 */
export async function confirmPayphonePayment(
  id: number,
  clientTransactionId: string,
): Promise<PayphoneConfirmResponse> {
  return payphoneFetch<PayphoneConfirmResponse>("/button/Confirm", {
    id,
    clientTransactionId,
  });
}
