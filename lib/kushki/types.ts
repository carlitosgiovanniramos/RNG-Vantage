/**
 * Tipos de la API REST de Kushki.
 * Scaffold basado en la documentacion oficial: https://docs.kushki.com
 * Verificar nombres de campo al implementar cargos/transferencias.
 */

/** Estados de transaccion que devuelve Kushki en cargos y webhooks. */
export type KushkiTransactionStatus =
  | "APPROVAL"
  | "DECLINED"
  | "INITIALIZED"
  | "PENDING"
  | "EXPIRED";

/** Respuesta de POST /card/v1/charges */
export interface KushkiChargeResponse {
  ticketNumber: string;
  transactionReference: string;
  approvalCode?: string;
  responseCode?: string;
  responseText?: string;
}

/** Respuesta de POST /transfer/v1/init */
export interface KushkiTransferResponse {
  transactionReference: string;
  transactionId: string;
  /** URL a la que se redirige al usuario para completar la transferencia. */
  redirectUrl?: string;
  /** Codigo de referencia que el usuario usa al hacer la transferencia. */
  pendingReference?: string;
}

/** Respuesta de POST /subscriptions/v1/card (creacion de suscripcion). */
export interface KushkiSubscriptionResponse {
  subscriptionId: string;
  status?: KushkiTransactionStatus;
}

/** Payload que Kushki envia al webhook configurado. */
export interface KushkiWebhookEvent {
  transactionId: string;
  transactionReference?: string;
  ticketNumber?: string;
  status: KushkiTransactionStatus;
  paymentMethod?: string;
  amount?: number;
  /** Presente cuando el evento es el cobro de una suscripcion recurrente. */
  subscriptionId?: string;
  metadata?: Record<string, unknown>;
}

/** Forma del cuerpo de error de la API de Kushki. */
export interface KushkiErrorBody {
  code?: string;
  message?: string;
}
