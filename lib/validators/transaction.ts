import { z } from "zod";

const paymentMethods = ["cash", "transfer", "card", "pending"] as const;
const transactionStatuses = ["pending", "completed", "failed", "refunded"] as const;

export const createTransactionSchema = z.object({
  user_id: z.uuid().optional(),
  subscription_id: z.uuid().optional(),
  amount: z.number().min(0, "El monto no puede ser negativo"),
  payment_method: z.enum(paymentMethods).default("pending"),
  status: z.enum(transactionStatuses).default("pending"),
  notes: z.string().max(500, "La nota es demasiado larga").optional(),
});

export const updateTransactionSchema = z.object({
  amount: z.number().min(0).optional(),
  payment_method: z.enum(paymentMethods).optional(),
  status: z.enum(transactionStatuses).optional(),
  notes: z.string().max(500).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

/**
 * Schema para marcar una transacción como pagada (Tarea 5)
 * Ruth usa esto cuando registra que un cliente ya le pagó
 */
export const markTransactionAsPaidSchema = z.object({
  transaction_id: z
    .string()
    .uuid("ID de transacción inválido"),
  payment_method: z
    .enum(paymentMethods)
    .refine(
      (method) => ["cash", "transfer", "card", "pending"].includes(method),
      "Método de pago debe ser: efectivo, transferencia, tarjeta u otro"
    ),
  notes: z
    .string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional(),
});

export type MarkTransactionAsPaidInput = z.infer<
  typeof markTransactionAsPaidSchema
>;