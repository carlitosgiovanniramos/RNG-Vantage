# Documentación técnica: lib/kushki/client.ts

Archivo: lib/kushki/client.ts  
Nombre: client.ts  
Líneas: 84 (archivo proporcionado)

Fecha de última actualización: 29/5/2026

---

## Descripción general

Este archivo implementa un envoltorio de bajo nivel para interactuar con la API REST de Kushki desde el lado del servidor. Proporciona:

- Una clase de error tipado (KushkiApiError) para manejar fallos de la API de Kushki de forma estructurada.
- Un wrapper asíncrono kushkiFetch que:
  - Inyecta de forma automática el header de autenticación (Private-Merchant-Id o Public-Merchant-Id) según el modo especificado.
  - Realiza la llamada HTTP con el método y cuerpo proporcionados.
  - Normaliza respuestas no exitosas lanzando KushkiApiError con información de estado y código de error (si está disponible).
  - Analiza la respuesta como JSON cuando sea posible y devuelve el valor tipado como T.
- Dependencia de configuración (getKushkiConfig) para obtener baseUrl y credenciales.

El archivo está marcado como server-only, indicando que debe ejecutarse en el entorno del servidor (por ejemplo en Next.js) y no en el cliente.

---

## Responsabilidades

- Proporcionar un manejo robusto de llamadas a la API de Kushki desde el servidor.
- Inyectar correctamente el header de autenticación según el tipo (privado o público).
- Normalizar errores de la API en una excepción tipada KushkiApiError.
- Mantener la coherencia de tipado (usando TypeScript genérico T para la respuesta).

---

## Props / Parámetros

Dado que kushkiFetch es una función, a continuación se describen sus parámetros:

- kushkiFetch<T>(path: string, options: KushkiFetchOptions = {}): Promise<T>
  - path: string
    - Ruta de la API Kushki a la que se desea hacer la llamada, por ejemplo: "/payments".
  - options: KushkiFetchOptions
    - method?: "GET" | "POST" | "PUT" | "DELETE"
      - Método HTTP a utilizar. Valor por defecto: "POST".
    - body?: unknown
      - Cuerpo de la solicitud. Si se proporciona, se serializa como JSON.
    - auth?: "private" | "public"
      - Tipo de autenticación:
        - "private": usa Private-Merchant-Id (config.privateMerchantId).
        - "public": usa Public-Merchant-Id (config.publicMerchantId).
      - Valor por defecto: "private".

Notas sobre KushkiFetchOptions:
- El header Content-Type se fija a "application/json".
- Dependiendo de auth, se inyecta el header correspondiente con el ID de comerciante adecuado.
- Si body no está definido, no se envía cuerpo en la solicitud.

---

## Retorna

- KushkiFetch<T> devuelve una Promesa que resuelve en T, donde T es el tipo esperado de la respuesta JSON de Kushki.
- En caso de error (no respuesta 2xx), se lanza KushkiApiError:
  - status: código de estado HTTP de la respuesta.
  - message: mensaje de error extraído de Kushki (si está disponible) o un fallback.
  - code?: código de error de Kushki (si está disponible).

---

## Dependencias

- getKushkiConfig (./config): Proporciona la configuración necesaria (baseUrl, privateMerchantId, publicMerchantId).
- KushkiErrorBody (./types): Tipo utilizado para extraer message y code del cuerpo de error devuelto por Kushki.
- server-only directive: Indica que este módulo debe ejecutarse en el entorno del servidor.
- fetch (global): API de fetch para realizar las llamadas HTTP.
- JSON.parse / JSON.stringify: Para serialización y deserialización de cuerpos JSON.

Notas importantes:
- El wrapper intenta parsear la respuesta como JSON cuando hay texto de respuesta. Si la respuesta no es JSON, se lanza KushkiApiError con un mensaje específico.
- Si la respuesta HTTP no es OK (no 2xx), se extrae un KushkiErrorBody (si está disponible) para obtener message y code, y se lanza KushkiApiError con esa información.

---

## Ejemplos de uso

Ejemplo 1: Llamada para crear un pago usando el modo privado (IDs de comerciante privados)

- Suponiendo que la respuesta de Kushki para la ruta "/payments" devuelve un objeto JSON compatible con la interfaz esperada.

Código (TypeScript):

- import { kushkiFetch } from "./kushki/client";

async function crearPago(payload: unknown) {
  const resultado = await kushkiFetch<unknown>("/payments", {
    method: "POST",
    auth: "private",
    body: payload,
  });
  return resultado;
}

Ejemplo 2: Llamada para consultar un recurso público (modo público)

Código (TypeScript):

async function obtenerOperacionPublica(id: string) {
  const resultado = await kushkiFetch<unknown>(`/public/operacion/${id}`, {
    method: "GET",
    auth: "public",
  });
  return resultado;
}

Notas sobre los ejemplos:
- En ambos casos, el tipo genérico T debe reflejar la estructura real de la respuesta esperada para la ruta específica.
- Si Kushki retorna un cuerpo con un mensaje de error, KushkiApiError se lanzará con ese mensaje y código, si están disponibles.

---

## Notas técnicas

- Seguridad y entorno:
  - El módulo se marca con "server-only", lo que evita su uso desde el cliente y ayuda a proteger IDs de comerciante.
- Gestión de errores:
  - Si la respuesta no es JSON, se lanza KushkiApiError con un mensaje claro que indica que Kushki devolvió una respuesta no-JSON junto con el status HTTP.
  - Si la respuesta tiene status fuera de 2xx, se intenta extraer un KushkiErrorBody (message y code) y se lanza KushkiApiError con esos valores. Si no están disponibles, se utilizan mensajes y códigos por defecto.
- Normalización de respuestas:
  - Se intenta parsear la respuesta como JSON cuando hay contenido; si no hay contenido, se devuelve null convertido a T (lo cual debe ser manejado por el consumidor).
- Serialización de body:
  - Si se provee body, se serializa con JSON.stringify; si no se proporciona, no se envía un cuerpo en la solicitud.
- Rendimiento y caché:
  - Se establece cache: "no-store" en la llamada fetch para evitar almacenamiento intermedio de respuestas.
- Tipado:
  - kushkiFetch es genérica (<T>), lo que permite tipar la respuesta esperada y obtener verificación de tipos en tiempo de compilación.
- Robustez:
  - La función asume que getKushkiConfig provee: baseUrl, privateMerchantId y publicMerchantId. Si alguno falta, podría fallar en tiempo de ejecución.
  - El código maneja tanto respuestas JSON válidas como errores estructurados y no estructurados de Kushki.

Limitaciones conocidas:
- Si Kushki devuelve respuestas no-JSON con código de estado no-OK, el flujo intentará parsear JSON primero; ante un fallo en parseo se lanza KushkiApiError con un mensaje de no-JSON.
- El tipo KushkiErrorBody debe contener al menos message, y opcionalmente code; si la API cambia, podría requerir ajuste en el mapeo de error.

---

## Última actualización

29/5/2026

---

Si necesitas que amplíe alguno de los apartados con más ejemplos de uso realista, o deseas incluir un diagrama de flujo simplificado de la ruta de ejecución de kushkiFetch, dímelo y lo agrego.