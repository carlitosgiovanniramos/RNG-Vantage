## Descripción general

Este archivo define y exporta un esquema de validación utilizando Zod para la creación de reservas en RNG Vantage. El esquema, llamado createReservationSchema, valida la estructura y el contenido de un payload de reserva, asegurando que los campos cumplan requisitos de formato, longitud y reglas de negocio (por ejemplo, consentimiento de datos y que la fecha sea futura).

## Responsabilidades

- Proporcionar una validación tipada y centrada en mensajes de error en español para la creación de reservas.
- Garantizar que los campos clave cumplan con reglas específicas (nombre, correo, fecha deseada, consentimiento, etc.).
- Expone un único exportable: createReservationSchema.

## Props / Parámetros

Este módulo no define un componente React ni una función, sino un esquema de validación. A continuación se describen los campos validados dentro de createReservationSchema:

- full_name
  - Tipo: string
  - Requerido: sí
  - Restricciones: mínimo de 2 caracteres
  - Mensaje de error: "El nombre debe tener al menos 2 caracteres"

- email
  - Tipo: string (validación de correo)
  - Requerido: sí
  - Validación: formato de correo electrónico
  - Mensaje de error: "Correo electrónico inválido"

- phone
  - Tipo: string
  - Requerido: no
  - Descripción: opcional

- preferred_date
  - Tipo: string en formato datetime ISO
  - Requerido: sí
  - Validación: debe ser una fecha/hora ISO válida
  - Mensaje de error (validación de formato): "Fecha y hora inválidas"
  - Regla adicional: la fecha debe ser futura
  - Mensaje de error para la regla de fecha futura: "La fecha debe ser futura"

- notes
  - Tipo: string
  - Requerido: no
  - Restricciones: máximo 500 caracteres
  - Mensaje de error: "Máximo 500 caracteres"

- data_consent
  - Tipo: boolean
  - Requerido: sí
  - Regla: debe ser verdadero
  - Mensaje de error: "Es obligatorio aceptar el tratamiento de datos"

## Retorna

- Un esquema de validación de Zod (ZodObject) que describe la forma esperada de un objeto de reserva.
- Este esquema puede utilizarse para validar payloads mediante métodos como parse, safeParse, etc., devolviendo errores detallados cuando una validación falla.

## Dependencias

- zod: biblioteca de validación de esquemas de TypeScript/JavaScript.
  - Importación utilizada en el archivo: `import { z } from 'zod';`
- Si el proyecto utiliza otros módulos para capturar y manejar errores de validación, pueden integrarse con este esquema, pero no están implícitamente definidos en este archivo.

## Ejemplos de uso

Ejemplo mínimo de uso para validar un payload de reserva:

```ts
import { createReservationSchema } from 'lib/validators/reservation';

const payload = {
  full_name: "Carlos Pérez",
  email: "carlos.perez@example.com",
  preferred_date: "2026-07-01T15:00:00Z",
  data_consent: true
};

const result = createReservationSchema.safeParse(payload);

if (!result.success) {
  // result.error contiene los errores de validación detallados
  console.error(result.error.errors);
} else {
  // payload válido y listo para procesar/almacenar
  const validReservation = result.data;
}
```

Notas sobre el uso:
- El campo phone es opcional; puede omitirse.
- El campo notes es opcional; si se proporciona, no debe exceder 500 caracteres.
- El campo preferred_date debe ser una cadena ISO válida y además debe representar una fecha futura respecto al momento de la validación.
- El consentimiento de datos (data_consent) debe ser verdadero para que la validación pase.

## Notas técnicas

- El esquema utiliza mensajes de error en español para mejorar la experiencia de usuario en formularios.
- La validación de preferred_date combina dos pasos: (1) aseguran que la cadena sea una fecha ISO válida, (2) refinan para verificar que la fecha sea futura. Esto puede implicar dependencia del huso horario del entorno de ejecución.
- La validación de data_consent es estricta: debe ser true; si es false, se devuelve el mensaje "Es obligatorio aceptar el tratamiento de datos".
- Este archivo no realiza efectos secundarios ni llamadas a APIs; se limita a definir una estructura de validación que debe ser consumida por otras capas (formulario, API, etc.).

## Última actualización

12/5/2026