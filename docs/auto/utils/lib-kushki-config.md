# Configuración central de Kushki (lib/kushki/config.ts)

Este archivo implementa la configuración central para la pasarela de pagos Kushki. Proporciona un acceso seguro y validado a los parámetros necesarios para interactuar con la API de Kushki, manejando la selección de entorno (sandbox o producción), las credenciales y el webhook. Además, utiliza lazy loading (lectura perezosa) y caching para evitar errores durante el build cuando falten credenciales y para optimizar el rendimiento en runtime.

- Nota importante: este módulo es server-only. No debe importarse desde un Client Component. El commentado público/privado se mantiene para claridad de uso en servidor; en el cliente deben leerse las variables de entorno de forma diferente (p. ej., NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID si aplica).

---

## Descripción general

- Proporciona una configuración validada y cacheada para la integración con Kushki.
- Lee variables de entorno de forma lazy (solo cuando se solicita la configuración) para no romper el build si faltan credenciales.
- Soporta dos entornos: sandbox y production.
- Exporta tipos clave y una función principal para obtener la configuración validada: `getKushkiConfig()`.
- Construye la estructura de configuración con:
  - env: entorno actual (sandbox | production)
  - baseUrl: URL base de la API de Kushki correspondiente al entorno
  - publicMerchantId: identificador público del comerciante (lectura en servidor)
  - privateMerchantId: identificador privado del comerciante
  - webhookSecret: secreto para webhook

---

## Responsabilidades

- Orquestar la configuración de Kushki a nivel de servidor.
- Validar que las variables de entorno requeridas existan y no estén vacías.
- Determinar el `baseUrl` adecuado según el entorno (sandbox o producción).
- Evitar lecturas repetidas de variables de entorno mediante caching.
- Ofrecer una API simple y segura para obtener la configuración validada.

---

## Tipos y entidades exportadas

- KushkiEnv
  - Descripción: tipo de entorno permitido.
  - Valores: "sandbox" | "production"

- KushkiConfig
  - Objeto de configuración devuelto por getKushkiConfig.
  - Campos:
    - env: KushkiEnv
    - baseUrl: string
    - publicMerchantId: string
    - privateMerchantId: string
    - webhookSecret: string

---

## Parámetros y funciones

A continuación se describe cada función (incluidas aquellas no-exportadas) con sus parámetros y comportamiento.

- KushkiEnv (tipo exportado)
  - Descripción: define los entornos admitidos.
  - Valores posibles: "sandbox", "production"

- KushkiConfig (tipo exportado)
  - Descripción: estructura final de configuración de Kushki.

- requireEnv(name: string): string
  - Descripción: lee una variable de entorno por nombre y la valida.
  - Parámetros:
    - name: string — nombre de la variable de entorno a leer.
  - Retorno:
    - string — valor no nulo/nulo-blank de la variable de entorno.
  - Errores:
    - Lanza Error si la variable no existe o está vacía.
  - Notas: se utiliza internamente para asegurar que las credenciales necesarias existan before retornar la configuración.

- resolveEnv(): KushkiEnv
  - Descripción: resuelve el entorno Kushki a partir de la variable de entorno pública.
  - Parámetros: ninguno
  - Retorno: KushkiEnv ("sandbox" o "production")
  - Errores:
    - Lanza Error si el valor no es "sandbox" ni "production".
  - Detalle: lee NEXT_PUBLIC_KUSHKI_ENV (con valor por defecto "sandbox"), normaliza a minúsculas y valida.

- getKushkiConfig(): KushkiConfig
  - Descripción: devuelve la configuración de Kushki validada y cacheada.
  - Parámetros: ninguno
  - Retorno: KushkiConfig
  - Detalles:
    - Utiliza una captura en memoria (variable `cached`) para evitar recomputaciones posteriores.
    - Construye la configuración con:
      - env: resultado de resolveEnv()
      - baseUrl: mapeado desde env a través de KUSHKI_BASE_URLS
      - publicMerchantId: leído con requireEnv("NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID")
      - privateMerchantId: leído con requireEnv("KUSHKI_PRIVATE_MERCHANT_ID")
      - webhookSecret: leído con requireEnv("KUSHKI_WEBHOOK_SECRET")

---

## Dependencias

- TypeScript
- Next.js environment (process.env)
- No depende de bibliotecas externas para la lógica de configuración
- El módulo importa "server-only" para asegurar su uso exclusivamente en el lado del servidor

Notas:
- El mapping de URLs base se mantiene en un diccionario estático:
  - sandbox -> https://api-uat.kushkipagos.com
  - production -> https://api.kushkipagos.com

- La lectura de variables de entorno es lazy y se realiza solo cuando se invoca getKushkiConfig por primera vez.

---

## Ejemplos de uso

Ejemplo 1: obtener la configuración en código del servidor y usar la baseUrl
- Ubicación: código del backend (server-side)
- Código:

```ts
import { getKushkiConfig } from "lib/kushki/config";

const kushkiCfg = getKushkiConfig();

console.log("Kushki base URL:", kushkiCfg.baseUrl);
console.log("Kushki Public Merchant ID:", kushkiCfg.publicMerchantId);
// Utilizar kushkiCfg para inicializar cliente Kushki, etc.
```

Notas:
- Debe ejecutarse en contexto servidor (por ejemplo, API routes, getServerSideProps, o alguna tarea de servidor).
- Asegúrate de tener las variables de entorno:
  - NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID
  - KUSHKI_PRIVATE_MERCHANT_ID
  - KUSHKI_WEBHOOK_SECRET
  - NEXT_PUBLIC_KUSHKI_ENV (opcional, por defecto sandbox)

Ejemplo 2: manejo de errores por falta de variables de entorno
- Código:

```ts
import { getKushkiConfig } from "lib/kushki/config";

try {
  const cfg = getKushkiConfig();
  // usar cfg...
} catch (e) {
  // Manejo de fallo: variables de entorno no definidas o env inválido
  console.error("Error al obtener la configuración de Kushki:", e);
  throw e;
}
```

Notas sobre variables de entorno:
- NEXT_PUBLIC_KUSHKI_ENV (opcional; valor esperado: "sandbox" o "production"; por defecto "sandbox")
- NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID (utilizado en servidor)
- KUSHKI_PRIVATE_MERCHANT_ID (utilizado en servidor)
- KUSHKI_WEBHOOK_SECRET (utilizado en servidor)

---

## Notas técnicas

- Lazy loading y caching
  - getKushkiConfig cachea la configuración en la variable de módulo `cached` para evitar recalcularla o volver a leer variables de entorno en llamadas subsecuentes.
  - Esto evita posibles fallos durante el build si las credenciales no están disponibles y garantiza un rendimiento estable en runtime.

- Seguridad y alcance
  - publicMerchantId se utiliza aquí desde el servidor para evitar exponer credenciales sensibles en el cliente. En el cliente, las credenciales y secretos deben gestionarse de forma diferente (lectura directa desde process.env en cliente no recomendado para credenciales secretas).
  - El código valida explícitamente que las variables necesarias existan y no estén vacías, lanzando errores claros en caso de ausencia.

- Validación de entorno
  - resolveEnv(): lee NEXT_PUBLIC_KUSHKI_ENV y lo normaliza. Solo admite "sandbox" o "production". Cualquier otro valor genera un error claro.

- Consistencia de URL base
  - baseUrl se determina a partir del env mediante el mapeo KUSHKI_BASE_URLS:
    - sandbox -> https://api-uat.kushkipagos.com
    - production -> https://api.kushkipagos.com

- Mensajes de error
  - requireEnv(name) genera un error con mensaje específico: “[kushki] Falta la variable de entorno ${name}”
  - resolveEnv() genera un error si el valor no es aceptado: “[kushki] KUSHKI_ENV debe ser "sandbox" o "production" (recibido: "...")”

- Compatibilidad
  - Archivo escrito en TypeScript y expone tipos para KushkiEnv y KushkiConfig, facilitando su uso por otras partes del código con tipado estático.

---

## Última actualización

29/5/2026

---