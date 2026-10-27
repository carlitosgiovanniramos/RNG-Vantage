import { z } from "zod";

/** Campos comunes a todo inicio de checkout. */
const checkoutBaseSchema = z.object({
  service_id: z.uuid("ID de servicio invalido"),
  auto_renew: z.boolean().default(false),
});

/**
 * Inicio de pago con tarjeta via Payphone.
 * El cliente es redirigido a Payphone; no se recibe token de tarjeta aqui.
 */
export const payphonePaymentSchema = checkoutBaseSchema;

/**
 * Inicio de pago por transferencia bancaria MANUAL (sin pasarela).
 * El cliente transfiere a la cuenta de RGL y luego sube el comprobante;
 * Ruth verifica y aprueba. Solo se necesita el servicio y la renovacion.
 */
export const manualTransferInitSchema = checkoutBaseSchema;

export type PayphonePaymentInput = z.infer<typeof payphonePaymentSchema>;
export type ManualTransferInitInput = z.infer<typeof manualTransferInitSchema>;
