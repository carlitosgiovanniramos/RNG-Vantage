# Documentación técnica: lib/email/client.ts

Este archivo implementa el envío de correos transaccionales a través del servicio Resend. Está diseñado para no interrumpir flujos críticos (p. ej., pagos) ante errores de configuración o de red; en esos casos, registra el problema y devuelve un valor booleano, sin lanzar excepciones.

## Descripción general
- Proposito: Proporciona una utilidad para enviar correos transaccionales usando Resend (https://resend.com).
- Enfoque defensivo: El flujo de envío nunca debe romperse un flujo principal (p. ej., pago). Si falta configuración o Resend falla, se registra el problema y se retorna `false` sin lanzar errores.
- Entorno: Código destinado a ejecutarse en servidor (comprobado por la importación `"server-only"`). Esto evita que el código se cargue en el cliente de Next.js.

## Responsabilidades
- Obtener la configuración sensible desde variables de entorno (RESEND_API_KEY y EMAIL_FROM).
- Validar entradas y configuración antes de intentar enviar el correo.
- Realizar la llamada HTTP a la API de Resend para enviar el correo.
- Manejar errores de red/ Resend de forma segura, registrando logs y devolviendo `false`.
- Limitar el tiempo de espera de la operación para evitar bloquear flujos críticos.

## Props / Parámetros

- Exportado:
  - `sendEmail(params: { to: string; subject: string; html: string }): Promise<boolean>`
    - Descripción: Envía un correo transaccional usando Resend.
    - Parámetros:
      - `params.to: string` — destinatario del correo. Debe contener una dirección válida de correo electrónico.
      - `params.subject: string` — asunto del correo.
      - `params.html: string` — cuerpo del correo en HTML.
    - Retorno: `Promise<boolean>` que resuelve a `true` si el correo se envió correctamente; `false` en caso de:
      - Faltante configuración (RESEND_API_KEY o EMAIL_FROM).
      - Destinatario vacío.
      - Resend responde con error (código de estado distinto a 2xx).
      - Excepción o fallo durante la solicitud.

- Interno (no exportado):
  - `getEmailConfig(): EmailConfig | null`
    - Descripción: Obtiene la configuración necesaria para autenticarse con Resend desde variables de entorno.
    - Retorno: `EmailConfig` si ambos valores están presentes; `null` si falta alguna configuración.
  - Tipo auxiliar:
    - `EmailConfig = { apiKey: string; from: string }`

## Retorna

- `sendEmail(...)`: Promise<boolean>
  - Valor `true`: correo enviado exitosamente por Resend.
  - Valor `false`: cualquiera de los siguientes escenarios:
    - Falta configuración (RESEND_API_KEY o EMAIL_FROM).
    - Destinatario vacío.
    - Resend responde con código de error (no OK).
    - Cualquier excepción o error durante la solicitud.
- `getEmailConfig()`: EmailConfig | null
  - `EmailConfig` contiene:
    - `apiKey: string`
    - `from: string`

## Dependencias

- Librerías/Servicios:
  - API de Resend (https://api.resend.com/emails) a través de fetch.
- Entorno/Variables de entorno:
  - `RESEND_API_KEY` (clave de API para Resend).
  - `EMAIL_FROM` (dirección de correo desde la cual se envían los correos).
- Tecnología:
  - fetch (disponible en el entorno de Next.js en el servidor).
  - AbortSignal.timeout(8000) para establecer un tiempo máximo de espera de 8 segundos.
- Observabilidad:
  - Logs mediante consola:
    - `console.warn` cuando falta configuración o destinatario.
    - `console.error` ante respuestas no OK o errores durante el envío.

## Ejemplos de uso

Ejemplo mínimo de uso correcto:

- Importar y enviar un correo:

  - Uso en un entorno de servidor (según el contrato de "server-only"):

    - Código de ejemplo:
      - const enviado = await sendEmail({
          to: "usuario@example.com",
          subject: "Bienvenido a RNG Vantage",
          html: "<p>Gracias por registrarte en RNG Vantage.</p>",
        });
      - if (enviado) {
          // Lógica cuando el correo se envía correctamente
        } else {
          // Lógica ante fallo (sin interrumpir flujo)
        }

Notas:
- Si RESEND_API_KEY o EMAIL_FROM no están configurados, el correo se omite y se registra una advertencia.
- Si `to` está vacío, también se omite y se registra una advertencia.
- Este comportamiento está diseñado para no romper flujos críticos (p. ej., pagos).

## Notas técnicas

- Diseño defensivo:
  - El método `sendEmail` nunca lanza excepciones. En todos los casos de fallo (falta de configuración, destinatario vacío, error de Resend, error de red), se retorna `false` y se registra el problema.
- Seguridad y configuración:
  - Las credenciales se obtienen de variables de entorno en tiempo de ejecución, evitando la inclusión de credenciales en el código fuente.
  - El valor de `from` se utiliza tal cual en la petición a Resend.
- Rendimiento y fiabilidad:
  - Se aplica un límite de tiempo de 8 segundos en la solicitud HTTP mediante `signal: AbortSignal.timeout(8000)`, para evitar bloquear procesos sensibles.
  - No hay lógica de reintento en este archivo; ante fallos se registra y se continúa.
- Limitaciones:
  - Si el servicio de Resend está caído o devuelve errores, el flujo seguirá sin lanzar excepción y dependerá del código llamante decidir qué hacer ante `false`.
  - El comportamiento depende de que las variables de entorno estén correctamente configuradas en el entorno de ejecución.
- Consideraciones de despliegue:
  - Importar el módulo con `"server-only"` garantiza que este código se ejecute solo en el servidor, evitando exposición en el cliente.

## Última actualización
29/5/2026

--- 

Este desglose está basado en la implementación presente en lib/email/client.ts y describe su comportamiento, dependencias y uso esperado para que cualquier nuevo desarrollador pueda entenderlo sin revisar el código completo. Si se requieren ejemplos adicionales (por ejemplo, pruebas unitarias o mocks de fetch), se pueden añadir en una sección adicional.