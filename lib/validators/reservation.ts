import { z } from 'zod';

export const createReservationSchema = z.object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().optional(),
    preferred_date: z.string().datetime({ message: "Fecha y hora inválidas" }),
    notes: z.string().max(500, "Máximo 500 caracteres").optional(),
    data_consent: z.boolean().refine((val) => val === true, {
        message: "Es obligatorio aceptar el tratamiento de datos",
    }),
});