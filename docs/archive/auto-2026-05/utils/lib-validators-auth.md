# Documentación técnica – lib/validators/auth.ts

Autor: RNG Vantage Dev Team  
Fecha de última actualización: 12/5/2026

Este archivo define y exporta los esquemas de validación de entrada para autenticación (inicio de sesión y registro) utilizando la librería Zod. También expone los tipos TypeScript derivados de dichos esquemas.

---

## Descripción general

El módulo auth.ts proporciona validación estructurada para las entradas de autenticación:

- loginSchema: valida un login con correo electrónico y contraseña.
- registerSchema: valida un registro de usuario con nombre, apellido, correo, contraseña, confirmación de contraseña y consentimiento de tratamiento de datos, además verifica que la contraseña y su confirmación coincidan y que el consentimiento sea verdadero.
- Exporta tipos TypeScript (LoginInput y RegisterInput) derivados de los esquemas para facilitar el uso tipado en la aplicación.

La validación utiliza mensajes de error en español y una expresión regular para la contraseña fuerte.

---

## Responsabilidades

- Definir y exportar esquemas de validación con Zod para entradas de autenticación.
- Enforcear reglas de negocio de la UI/UX:
  - Email debe ser válido.
  - Contraseñas deben cumplir requisitos de fortaleza.
  - Confirmación de contraseña debe coincidir con la original.
  - Consentimiento de datos debe ser aceptado (true).
- Proveer tipos TypeScript derivados para facilitar el uso tipado en el código consumidor.

---

## Exportados (Entidades y Propiedades)

A continuación se describen las exportaciones del archivo, junto con el propósito y las validaciones aplicadas.

- loginSchema (const)
  - Tipo: z.ZodObject<...>
  - Descripción: Esquema de validación para la entrada de inicio de sesión.
  - Campos:
    - email: string, debe ser un correo válido. Mensaje: "Ingresa un correo electrónico válido".
    - password: string, debe ser al menos 1 carácter. Mensaje: "La contraseña es obligatoria".
  - Notas: No hay verificación de coincidencia de contraseñas aquí; solo valida formato y presencia.

- registerSchema (const)
  - Tipo: z.ZodObject<...>
  - Descripción: Esquema de validación para el registro de usuario.
  - Campos:
    - first_name: string, mínimo 2 caracteres. Mensaje: "El nombre debe tener al menos 2 caracteres".
    - last_name: string, mínimo 2 caracteres. Mensaje: "El apellido debe tener al menos 2 caracteres".
    - email: string, debe ser un correo válido. Mensaje: "Ingresa un correo electrónico válido".
    - password: string, debe cumplir la expresión regular strongPasswordRegex.
      - Regex y mensaje: 
        - strongPasswordRegex: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$
        - Mensaje: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
    - confirm_password: string, mínimo 1 carácter. Mensaje: "Confirma tu contraseña".
    - data_consent: booleano que debe ser verdadero. Mensaje si no: "Debes aceptar la política de tratamiento de datos (LOPDP)".
  - Verificación adicional (fuera de línea por campo):
    - top-level refine: valida que data.password === data.confirm_password.
    - Si no coinciden, el error se asigna a confirmar_password con el mensaje: "Las contraseñas no coinciden".

- LoginInput (type)
  - Descripción: Tipo de datos inferido a partir de loginSchema.
  - Contenido: { email: string; password: string }

- RegisterInput (type)
  - Descripción: Tipo de datos inferido a partir de registerSchema.
  - Contenido: { first_name: string; last_name: string; email: string; password: string; confirm_password: string; data_consent: boolean }

---

## Parámetros (para cada exportación)

Dado que el archivo expone esquemas de validación (no componentes) y tipos, los parámetros relevantes se describen a nivel de esquema:

- loginSchema
  - Entrada esperada para validación:
    - email: string (formato email válido)
    - password: string (al menos 1 carácter)
  - Retorno típico de validación: objeto con las mismas propiedades si es válido, o errores de validación si no lo es.

- registerSchema
  - Entrada esperada para validación:
    - first_name: string (≥ 2 chars)
    - last_name: string (≥ 2 chars)
    - email: string (formato email válido)
    - password: string (cumple strongPasswordRegex)
    - confirm_password: string (≥ 1 carácter)
    - data_consent: boolean (true)
  - Retorno típico de validación: objeto con las mismas propiedades si es válido; errores detallados si no lo es.
  - Verificación adicional: password debe ser igual a confirm_password (error asociado a confirm_password si no coincide).

- LoginInput y RegisterInput
  - Tipos derivados con z.infer; útiles para tipar funciones, formularios y APIs que consumen estas validaciones.

---

## Retorna

- loginSchema: no es una función, es un esquema de validación. Al usar parse/safeParse sobre un objeto, se obtiene:
  - success = true y data con los campos validados si es válido.
  - success = false y errores detallados si no es válido.
- registerSchema: igual que loginSchema, pero con reglas adicionales (contraseña fuerte, consenso, coincidencia de contraseñas).
- LoginInput / RegisterInput: tipos TypeScript derivados de los esquemas para uso estático en el código.

Ejemplos de uso típicos:
- Validar login:
  - loginSchema.safeParse({ email: "usuario@example.com", password: "P@ssw0rd" })
- Validar registro:
  - registerSchema.safeParse({
      first_name: "Ana",
      last_name: "Pérez",
      email: "ana.perez@example.com",
      password: "Fort3#Pass",
      confirm_password: "Fort3#Pass",
      data_consent: true
    })

Si el objeto es válido, result.success será true y result.data contendrá el objeto validado.

---

## Dependencias

- zod: biblioteca de validación y parsing de esquemas.
  - Uso principal: construir esquemas zod para login y registro.
  - Funciones clave: z.object, z.string, z.boolean, z.infer, .min, .email, .regex, .refine, .extend (implícito a través de .object), .parse / .safeParse (usage típica, no explícito en el archivo).

Notas: no se utilizan otros hooks, servicios o componentes externos dentro de este archivo.

---

## Ejemplos de uso

A continuación se muestran ejemplos prácticos de uso en TypeScript.

- Ejemplo de validación de login
```ts
import { loginSchema, LoginInput } from "../lib/validators/auth";

const input = {
  email: "usuario@example.com",
  password: "P@ssw0rd",
};

const result = loginSchema.safeParse(input);

if (result.success) {
  const data: LoginInput = result.data;
  // continuar con la lógica de login
} else {
  // tratar errores: result.error
}
```

- Ejemplo de validación de registro
```ts
import { registerSchema, RegisterInput } from "../lib/validators/auth";

const input = {
  first_name: "Ana",
  last_name: "Gómez",
  email: "ana@example.com",
  password: "Fort3#Pass",
  confirm_password: "Fort3#Pass",
  data_consent: true
};

const result = registerSchema.safeParse(input);

if (result.success) {
  const data: RegisterInput = result.data;
  // continuar con el flujo de registro
} else {
  // manejar errores de validación
  // result.error?.issues ofrece detalles por campo
}
```

---

## Notas técnicas

- Regular expression de contraseñas:
  - strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  - Requisitos cubiertos:
    - Al menos 8 caracteres
    - Al menos una letra minúscula
    - Al menos una letra mayúscula
    - Al menos un dígito
    - Al menos un carácter especial no alfanumérico
- Mensajes de validación en español, proporcionados en las opciones de cada regla:
  - Validación de email, contraseña obligatoria, coincidencia de contraseñas, y consentimiento de datos (LOPDP).
- Validación de consentimiento:
  - data_consent debe ser verdadero. Si no, se devuelve un error con mensaje específico.
- Verificación de consistencia entre contraseñas:
  - Se utiliza un refine a nivel de objeto para asegurar data.password === data.confirm_password.
  - El error se asigna al campo confirm_password para claridad de usuario.
- Tipado:
  - Los tipos LoginInput y RegisterInput se derivan de los esquemas mediante z.infer, lo que garantiza que los tipos se mantengan sincronizados con las validaciones.
- Rendimiento:
  - Zod compila las validaciones y ofrece parse/safeParse eficientes para entradas de formularios.
- Localización:
  - Los mensajes de error están en español, adecuado para aplicaciones hispanohablantes.

---

## Última actualización

12/5/2026

---
Este documento cubre las secciones relevantes para entender y usar el archivo lib/validators/auth.ts sin necesidad de revisar el código fuente completo. Si se añaden nuevos campos o reglas de validación, se debe actualizar este documento para mantener la coherencia entre el código y la documentación.