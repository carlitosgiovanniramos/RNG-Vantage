export const PAYPHONE_STATUS = {
  APPROVED: 3,
  CANCELED: 2,
  REVERSED: 1,
} as const;

export type PayphoneStatusCode = (typeof PAYPHONE_STATUS)[keyof typeof PAYPHONE_STATUS];

/**
 * Respuesta de POST /api/button/Prepare — crea la intención de pago.
 * Devuelve los enlaces a los que se redirige al cliente.
 */
export interface PayphonePrepareResponse {
  paymentId: string;
  /** Enlace para pagar con tarjeta (checkout anónimo). */
  payWithCard: string;
  /** Enlace para pagar con la app de PayPhone. */
  payWithPayPhone: string;
}

/**
 * Respuesta de POST /api/button/V2/Confirm — verifica el resultado final.
 * statusCode 3 = aprobado.
 */
export interface PayphoneConfirmResponse {
  statusCode: number;
  transactionStatus?: string;
  transactionId?: number;
  clientTransactionId?: string;
  authorizationCode?: string;
  message?: string;
  messageCode?: number;
  amount?: number;
  currency?: string;
  email?: string;
  document?: string;
}
