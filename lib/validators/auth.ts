import { z } from "zod";

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z
  .object({
    first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Ingresa un correo electrónico válido"),
    password: z
      .string()
      .regex(
        strongPasswordRegex,
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
      ),
    confirm_password: z.string().min(1, "Confirma tu contraseña"),
    data_consent: z
      .boolean()
      .refine((value) => value === true, {
        message: "Debes aceptar la política de tratamiento de datos (LOPDP)",
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Las contraseñas no coinciden",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
