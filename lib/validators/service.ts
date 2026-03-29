import { z } from 'zod';

const serviceTypes = ["manejo_redes", "auditoria", "capacitacion", "otro"] as const;

export const createServiceSchema = z.object({
  name: z.string().min(3, "El nombre del servicio debe tener al menos 3 caracteres"),
  description: z.string().max(1000, "Descripción demasiado larga").optional(),
  type: z.enum(serviceTypes, { 
    message: "Tipo de servicio no válido" 
  }),
  price: z.number().min(0, "El precio no puede ser negativo"),
  duration_months: z.number().int().min(1, "Mínimo 1 mes").default(1),
  is_active: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;