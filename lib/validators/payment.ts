import { z } from "zod";

/**
 * Validadores de los flujos de pago con Kushki.
 * Zod v4. Mensajes de error en espanol para mostrarse al usuario.
 */

/**
 * Estados de transaccion de Kushki.
 * IMPORTANTE: debe reflejar el tipo KushkiTransactionStatus
 * definido en lib/kushki/types.ts (commit 1). Mantener sincronizados.
 */
const kushkiStatuses = [
  "APPROVAL",
  "DECLINED",
  "INITIALIZED",
  "PENDING",
  "EXPIRED",
] as const;

/**
 * Tipos de documento aceptados por Kushki en Ecuador.
 * Verificar los valores exactos contra la doc de Kushki al
 * implementar el commit 5 y ajustar si difieren.
 */
const documentTypes = ["CC", "RUC", "PP"] as const;

/** Campos comunes a todo inicio de checkout. */
const checkoutBaseSchema = z.object({
  service_id: z.uuid("ID de servicio invalido"),
  auto_renew: z.boolean().default(false),
});

/**
 * Cargo con tarjeta. El `token` lo genera KushkiJS en el cliente
 * (tokenizacion); el servidor nunca recibe los datos de la tarjeta.
 */
export const kushkiCardChargeSchema = checkoutBaseSchema.extend({
  token: z.string().min(1, "Token de tarjeta requerido"),
});

/**
 * Inicio de pago por transferencia bancaria.
 * Kushki exige los datos del documento del pagador.
 */
export const kushkiTransferInitSchema = checkoutBaseSchema.extend({
  document_type: z.enum(documentTypes, {
    message: "Tipo de documento no valido",
  }),
  document_id: z
    .string()
    .min(10, "El documento debe tener al menos 10 digitos")
    .max(13, "El documento no puede exceder 13 digitos"),
  email: z.email("Correo electronico invalido"),
});

/**
 * Inicio de pago por transferencia bancaria MANUAL (sin pasarela).
 * El cliente transfiere a la cuenta de RGL y luego sube el comprobante;
 * Ruth verifica y aprueba. Solo se necesita el servicio y la renovacion.
 */
export const manualTransferInitSchema = checkoutBaseSchema;

export type ManualTransferInitInput = z.infer<typeof manualTransferInitSchema>;

/**
 * Payload entrante del webhook de Kushki.
 * Lenient: Kushki puede enviar campos extra; Zod los descarta
 * por defecto (no usar .strict()).
 */
export const kushkiWebhookSchema = z.object({
  transactionId: z.string().min(1, "transactionId requerido"),
  transactionReference: z.string().optional(),
  ticketNumber: z.string().optional(),
  status: z.enum(kushkiStatuses),
  paymentMethod: z.string().optional(),
  amount: z.number().optional(),
  // Presente cuando el evento es el cobro de una suscripcion recurrente.
  subscriptionId: z.string().optional(),
  // Tipo de evento; "chargeback" indica un contracargo / disputa.
  eventType: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type KushkiCardChargeInput = z.infer<typeof kushkiCardChargeSchema>;
export type KushkiTransferInitInput = z.infer<typeof kushkiTransferInitSchema>;
export type KushkiWebhookInput = z.infer<typeof kushkiWebhookSchema>;
