export const PAYPHONE_STATUS = {
  APPROVED: 3,
  DECLINED: 2,
  REVERSED: 1,
} as const;

export type PayphoneStatusCode = (typeof PAYPHONE_STATUS)[keyof typeof PAYPHONE_STATUS];

/** Respuesta de POST /button/Charge — crea la intención de pago. */
export interface PayphoneChargeResponse {
  paymentUrl: string;
  transactionId: number;
  clientTransactionId: string;
}

/** Respuesta de POST /button/Confirm — verifica el resultado final. */
export interface PayphoneConfirmResponse {
  transactionId: number;
  clientTransactionId: string;
  statusCode: number;
  statusMessage: string;
  authorizationCode?: string;
  amount: number;
  currency: string;
  documentId?: string;
  email?: string;
  message?: string;
}
