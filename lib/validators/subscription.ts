import { z } from "zod";

const subscriptionStatuses = ["active", "expired", "cancelled", "pending"] as const;

export const createSubscriptionSchema = z.object({
  user_id: z.string().uuid("ID de usuario inválido"),
  service_id: z.string().uuid("ID de servicio inválido"),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime({ message: "Fecha de fin inválida" }),
  auto_renew: z.boolean().default(false),
});

export const updateSubscriptionSchema = z.object({
  status: z.enum(subscriptionStatuses).optional(),
  ends_at: z.string().datetime().optional(),
  auto_renew: z.boolean().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;