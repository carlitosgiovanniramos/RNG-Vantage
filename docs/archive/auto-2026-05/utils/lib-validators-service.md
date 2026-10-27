# RNG Vantage - lib/validators/service.ts

Este archivo define las validaciones de esquema para los datos de servicios en RNG Vantage usando Zod. Proporciona dos esquemas: uno para crear un servicio y otro para actualizarlo, además de tipos TypeScript derivados de esos esquemas. Esto garantiza que las entradas en la API o en cualquier flujo de creación/actualización de servicios cumplan con las reglas de negocio y validaciones necesarias.

## Descripción general

- Propósito: garantizar que las estructuras de datos de un servicio cumplan con reglas de validación consistentes antes de que sean procesadas o almacenadas.
- Entidades validadas: servicio con campos como nombre, descripción, tipo, precio, duración, estado, imágenes y listas relacionadas (incluye, beneficios, entregables, público objetivo).
- Implementación: utiliza Zod (zod@v3) para definir esquemas de validación y tipos derivados.

## Responsabilidades

- Definir y validar la información mínima y máxima requerida para crear un servicio.
- Proveer una variante de validación para actualizaciones donde todos los campos son opcionales (permite actualizar sólo los campos deseados).
- Exponer tipos TypeScript (CreateServiceInput, UpdateServiceInput) que representen las estructuras validadas.
- Centralizar reglas de negocio de validación (longitudes, rangos, tipos, enumeraciones, valores por defecto).

## Props / Parámetros

A continuación se detallan los esquemas y sus campos, incluyendo tipo, requerimiento y descripción.

- createServiceSchema (ZodObject)
  - name: string, obligatorio
    - Requisito: mínimo 3 caracteres
    - Mensaje de error: "El nombre del servicio debe tener al menos 3 caracteres"
  - description: string, opcional
    - Máximo: 1000 caracteres
    - Mensaje de error: "Descripción demasiado larga"
  - full_description: string, opcional
    - Máximo: 1000 caracteres
    - Mensaje de error: "La descripción completa es demasiado larga"
  - image_url: string, opcional
    - Debe ser una URL válida
    - Permite valor vacío ("")
    - Mensaje de error si no es válida: "La URL de la imagen no es válida"
    - Zod usa .url(...) y luego .or(z.literal("")) para aceptar "" como valor válido
  - includes: array de strings, opcional
  - benefits: array de strings, opcional
  - deliverables: array de strings, opcional
  - target_audience: string, opcional
    - Máximo: 300 caracteres
    - Mensaje de error: "El público objetivo es demasiado largo"
  - type: enum de serviceTypes, obligatorio
    - serviceTypes = ["manejo_redes", "auditoria", "capacitacion", "otro"]
    - Mensaje de error si no coincide: "Tipo de servicio no válido"
  - price: number, obligatorio
    - Mínimo: 0
    - Mensaje de error: "El precio no puede ser negativo"
  - duration_months: number, obligatorio
    - Debe ser entero
    - Mínimo: 1
    - Valor por defecto: 1
  - is_active: boolean, obligatorio
    - Valor por defecto: true

- updateServiceSchema (ZodObject)
  - Deriva de createServiceSchema pero all fields son opcionales mediante .partial()
  - Esto permite validar actualizaciones parciales sin exigir todos los campos.

- CreateServiceInput (TypeScript)
  - Tipo inferido a partir de createServiceSchema
  - Representa la estructura validada para crear un servicio.

- UpdateServiceInput (TypeScript)
  - Tipo inferido a partir de updateServiceSchema
  - Representa la estructura validada para actualizar un servicio (todos los campos son opcionales).

Notas técnicas sobre dependencias y diseño:
- Dependencias: zod (ZodSchema de validación estática y tipado fuerte) y TypeScript.
- El conjunto de tipos para "type" se restringe mediante un enum estrictamente definido (serviceTypes) para evitar valores no deseados.
- image_url admite una URL válida o una cadena vacía para indicar ausencia de imagen.
- duration_months tiene valor por defecto 1 y debe ser entero; esto facilita crear servicios sin especificar duración explícita.
- updateServiceSchema usa partial para permitir actualizaciones parciales sin invalidar campos no proporcionados.

## Retorna

- createServiceSchema: un esquema Zod que valida una entrada de creación de servicio. Al usar parse o safeParse, retorna un objeto con la estructura validada, tipado como CreateServiceInput.
- updateServiceSchema: un esquema Zod que valida una entrada de actualización de servicio. Al usar parse o safeParse, retorna un objeto con la estructura validada, tipado como UpdateServiceInput (todos los campos son opcionales).
- CreateServiceInput: tipo que describe la forma de datos válida para crear un servicio.
- UpdateServiceInput: tipo que describe la forma de datos válida para actualizar un servicio (todos los campos opcionales).

Ejemplos de uso:
- Crear un servicio (mínimo viable):
  - Input mínimo:
    - { name: "Manejo de redes", price: 100, type: "manejo_redes" }
  - Código de validación:
    - const valid = createServiceSchema.parse(input);
    - // valid tendrá tipo CreateServiceInput
- Actualizar un servicio (actualización parcial):
  - Input parcial:
    - { id: "abc123", price: 120, is_active: false } // id podría ser parte de tu flujo, depende del uso
  - Código de validación:
    - const updated = updateServiceSchema.parse(input);
    - // updated tendrá tipo UpdateServiceInput

Notas de uso:
- Para obtener tipos a nivel de TypeScript a partir de los esquemas, se exportan CreateServiceInput y UpdateServiceInput.
- Asegúrate de que la entrada que llega a estos esquemas cumpla con las reglas de negocio (por ejemplo, precios no negativos y tipos válidos) para evitar errores en runtime.

## Notas técnicas

- El enum de tipos de servicio (serviceTypes) está definido como un array literal con as const para permitir un type inference más estricto y evitar valores fuera de la enumeración.
- image_url admite URL válidas o una cadena vacía, permitiendo representar “sin imagen” sin forzar una URL.
- Las descripciones (description y full_description) están limitadas a 1000 caracteres para evitar entradas excesivamente largas y posibles problemas de almacenamiento o rendering.
- target_audience tiene límite de 300 caracteres para evitar descripciones excesivas que compliquen el UX o la indexing.
- duration_months es entero y tiene un mínimo de 1, con valor por defecto 1, para simplificar la creación de servicios sin especificar duración.
- is_active tiene valor por defecto true, permitiendo que los nuevos servicios estén activos por defecto.

## Última actualización

12/5/2026

---

Si necesitas, puedo adaptar la documentación para incluir ejemplos de integración en tu API routes o handlers de Next.js, o generar un diagrama de relaciones entre este validator y otras partes del flujo de datos (por ejemplo, DTOs, servicios de acceso a la base de datos y capas de negocio).