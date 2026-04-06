import { z } from 'zod';

export const createReservationSchema = z.object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.email("Correo electrónico inválido"),
    phone: z.string().optional(),
    preferred_date: z.iso.datetime({ message: "Fecha y hora inválidas" }).refine(
        (dateStr) => new Date(dateStr) > new Date(),
        { message: "La fecha debe ser futura" }
    ),
    notes: z.string().max(500, "Máximo 500 caracteres").optional(),
    data_consent: z.boolean().refine((val) => val === true, {
        message: "Es obligatorio aceptar el tratamiento de datos",
    }),
});