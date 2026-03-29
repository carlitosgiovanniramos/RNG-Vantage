import { z } from 'zod';

export const authValidator = z.object({
    email: z.string().email("Correo electrónico no válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico no válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirm_password: z.string().min(6, "La contraseña de confirmación debe tener al menos 6 caracteres"),
    data_consent: z.boolean().refine((val) => val === true, {
        message: "Debes aceptar el tratamiento de datos (LOPDP)",
    }),
}).refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
});

export type LoginInput = z.infer<typeof authValidator>;
export type RegisterInput = z.infer<typeof registerSchema>;