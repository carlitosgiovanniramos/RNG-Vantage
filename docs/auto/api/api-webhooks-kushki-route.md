# Documentación técnica: app/api/webhooks/kushki/route.ts

Archivo: route.ts  
Ruta: app/api/webhooks/kushki/route.ts  
Longitud: ~405 líneas (contenido disponible en el código proporcionado)

Propósito general
- Este archivo implementa un webhook de Kushki para conciliar el estado de los pagos, especialmente pensados para cobros recurrentes y transferencias bancarias asincrónicas. Cuando Kushki notifica un cambio de estado, este endpoint actualiza las transacciones y, en su caso, las suscripciones asociadas, y envía notificaciones por correo al usuario.

Resumen de la funcionalidad
- Verificación de autenticidad: valida un secreto compartido vía cabecera x-webhook-secret.
- Parseo y validación del payload: valida la estructura del evento con kushkiWebhookSchema.
- Mapeo de estados: traduce estados de Kushki a estados internos mediante mapKushkiStatus.
- Flujo para contracargos: si el evento es un chargeback, revierte la transacción y suspende la suscripción vinculada.
- Flujo para cobros recurrentes: si Kushki genera un cobro sin transacción previa, registra la transacción en la DB y, si corresponde, extiende la suscripción y envía notificaciones.
- Flujo para transacciones existentes: maneja idempotencia ante estados finales; activa la suscripción si es necesario; actualiza estado de la transacción y envía notificaciones.
- Notificaciones: envía correos cuando corresponde (pagos confirmados, pagos fallidos, cobros recurrentes, etc.) usando el cliente de correo y plantillas.

Notas importantes:
- Se ejecuta con el cliente admin (service role) para operaciones de escritura en la base de datos.
- Idempotencia: cuando una transacción ya está en un estado final, se responde 200 con indicación idempotente para evitar reprocesos.
- Seguridad: Kushki reintenta ante respuestas no 2xx; por lo tanto, las respuestas válidas deben ser 200 aunque no haya cambios.
- Estados y transformaciones: utiliza mapKushkiStatus para convertir estados de Kushki a estados internos como completed, failed, etc.
- Duraciones y fechas: utiliza addMonths para extender la vigencia de las suscripciones cuando corresponde.

Secciones de la documentación

## Descripción general
El archivo implementa un webhook de Kushki para la conciliación de pagos, con soporte específico para cobros recurrentes y contracargos. Proporciona:
- Verificación de autenticidad mediante un secreto compartido.
- Lectura y validación del payload con kushkiWebhookSchema.
- Lógica para manejar tres casos principales: contracargos, cobros recurrentes y pagos normales.
- Actualización de transacciones y suscripciones en Supabase.
- Envío de correos electrónicos a usuarios (best-effort) mediante plantillas de correo.

## Responsabilidades
- Verificar el secreto compartido y rechazar requests no autorizadas (401).
- Parsear y validar el payload recibido de Kushki.
- Manejar eventos de contracargo (chargeback) para revertir cobros y suspender suscripciones.
- Manejar cobros recurrentes que Kushki cobra sin transacción precreada, registrando la transacción y extendiendo la suscripción.
- Actualizar el estado de transacciones y, cuando aplique, activar o extender suscripciones.
- Notificar al cliente por correo en eventos relevantes (pago aprobado, pago fallido, cobro recurrente).

## Props / Parámetros

A nivel de funciones (signaturas y descripciones):

- secretsMatch(provided: string, expected: string): boolean
  - Descripción: compara en tiempo constante dos secretos para evitar ataques de timing.
  - Parámetros:
    - provided: secret proporcionado en el header x-webhook-secret.
    - expected: secret configurado en Kushki (config.webhookSecret).
  - Retorna: true si coinciden, false en caso contrario.

- addMonths(isoDate: string, months: number): string
  - Descripción: añade una cantidad de meses a una fecha ISO y devuelve la nueva fecha ISO.
  - Parámetros:
    - isoDate: fecha en formato ISO.
    - months: cantidad de meses a sumar.
  - Retorna: nueva fecha en formato ISO.

- getUserEmail(
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    userId: string | null
  ): Promise<string | null>
  - Descripción: obtiene el correo electrónico del usuario (best-effort) usando el admin client.
  - Parámetros:
    - supabaseAdmin: cliente admin (service role) de Supabase.
    - userId: ID del usuario en la base de datos de Supabase.
  - Retorna: correo del usuario si se encuentra, null si no existe o ante error.

- handleRecurringCharge(
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    event: { transactionId: string; subscriptionId: string; status: KushkiTransactionStatus }
  ): Promise<NextResponse>
  - Descripción: maneja el cobro recurrente de Kushki (pago mensual sin transacción previa).
  - Parámetros:
    - supabaseAdmin: cliente admin para operaciones DB.
    - event: objeto con transactionId, subscriptionId y status proveniente del webhook.
  - Retorna: NextResponse con el resultado de la operación.

- handleChargeback(
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    event: { transactionId: string; status: KushkiTransactionStatus }
  ): Promise<NextResponse>
  - Descripción: maneja contracargo (chargeback) para revocar cobro y suspender la subscripción vinculada.
  - Parámetros:
    - supabaseAdmin: cliente admin para operaciones DB.
    - event: objeto con transactionId y status.
  - Retorna: NextResponse con el resultado de la operación.

- POST(req: Request)
  - Descripción: handler principal del webhook de Kushki.
  - Parámetros:
    - req: objeto Request de la solicitud entrante.
  - Retorna: Promise<NextResponse> con el código HTTP y cuerpo JSON adecuados.

Notas sobre dependencias relevantes para estas funciones:
- next/server: NextResponse para respuestas HTTP.
- node:crypto: timingSafeEqual para comparación de secretos.
- "@/lib/supabase/admin": createAdminClient para obtener un cliente admin (service role).
- "@/lib/kushki/config": getKushkiConfig para obtener secretos/configuraciones.
- "@/lib/validators/payment": kushkiWebhookSchema para validar la estructura del webhook.
- "@/lib/kushki/webhook": mapKushkiStatus e isFinalTransactionStatus para mapear estados e identificar estados finales.
- "@/lib/kushki/client": kushkiFetch para interactuar con Kushki (p. ej. cancelación de suscripción en contracargos).
- "@/lib/kushki/types": KushkiTransactionStatus para tipado de estatus de Kushki.
- "@/lib/email/client" y "@/lib/email/templates": para envío de correos y plantillas de mensajes como paymentConfirmedEmail, paymentFailedEmail, recurringChargeReceiptEmail, recurringChargeFailedEmail.

## Retorna

- POST(req: Request): NextResponse
  - Retorna 200 en la mayoría de los casos cuando se procesa correctamente o se detecta repetición (idempotencia). En casos de errores de BD o actualización, retorna 500. En casos de autenticación fallida, retorna 401. En payloads inválidos, retorna 400. En casos de lookup fallido, 500.  
  - En el flujo de contracargo, cobro recurrente y transacciones existentes, se utilizan NextResponse para indicar si el webhook fue recibido, si es idempotente, o para indicar errores.

- Helpers (handleRecurringCharge, handleChargeback, getUserEmail, etc.)
  - Retornan NextResponse con un cuerpo JSON y un status HTTP (200, 400, 401, 500) dependiendo del resultado de la operación.

## Dependencias externas / librerías utilizadas
- Next.js (API Routes): manejo de requests/responses asíncronos.
- Supabase (admin client): operaciones de lectura/escritura en tablas: subscriptions, transactions, services, etc.
- Kushki: esquema de webhook y cliente para llamadas a la API (cancelación de suscripción).
- Node crypto: seguridad en la comparación de secretos.
- Servicio de correo (email client) y plantillas de correo:
  - paymentConfirmedEmail
  - paymentFailedEmail
  - recurringChargeReceiptEmail
  - recurringChargeFailedEmail
- Validadores y mapeadores:
  - kushkiWebhookSchema
  - mapKushkiStatus
  - isFinalTransactionStatus

## Ejemplos de uso

Ejemplo 1: webhook de Kushki recibida para un cobro recurrente
- Endpoint: POST https://tu-dominio.com/api/webhooks/kushki
- Headers:
  - Content-Type: application/json
  - x-webhook-secret: <secreto compartido configurado en Kushki>
- Body (ejemplo, puede variar según kushkiWebhookSchema):
  {
    "transactionId": "txn_12345",
    "subscriptionId": "sub_67890",
    "status": "completed",
    "eventType": "payment"
  }

Notas: el webhook debe incluir un secret válido en el header. Si Kushki envía el mismo evento dos veces, y la transacción ya está en un estado final (completed/failed/refunded), la respuesta será 200 y no se reprocesará.

Ejemplo 2: webhook de contracargo
- Endpoint: POST https://tu-dominio.com/api/webhooks/kushki
- Headers:
  - Content-Type: application/json
  - x-webhook-secret: <secreto compartido configurado en Kushki>
- Body (ejemplo):
  {
    "transactionId": "txn_98765",
    "status": "charged_back",
    "eventType": "chargeback"
  }

Ejemplo de uso práctico (curl)
curl -X POST https://tu-dominio.com/api/webhooks/kushki \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: mi-secreto-compartido" \
  -d '{"transactionId":"txn_12345","subscriptionId":"sub_67890","status":"completed","eventType":"payment"}'

Notas: ajusta el body exacto a la estructura esperada por kushkiWebhookSchema. Este ejemplo ilustra la llamada con un payload típico.

## Notas técnicas

- Seguridad y autenticidad
  - El webhook verifica un secreto compartido vía la cabecera x-webhook-secret contra la configuración obtenida con getKushkiConfig. Si no coincide, se responde 401.
  - Se evita la exposición de información sensible en respuestas, manteniendo mensajes de error genéricos para casos de fallo.

- Idempotencia
  - Si una transacción ya está en estado final según isFinalTransactionStatus, la respuesta es 200 con { received: true, idempotent: true }.
  - En el flujo de cobro recurrente, si se intenta insertar una transacción con gateway_transaction_id ya existente, se detecta código 23505 y se responde 200 con { received: true, idempotent: true }.

- Consistencia de estado
  - Los estados de Kushki se mapean a estados internos mediante mapKushkiStatus.
  - Al recibir un estado "completed" para una transacción con suscripción vinculada, se activa la suscripción y se extiende su duración según el servicio contratado.
  - En contracargos, se marca la transacción como "refunded" y se suspende la suscripción vinculada. Si la suscripción tiene un gateway_subscription_id, se intenta cancelar la suscripción en Kushki.

- Notificaciones
  - Las notificaciones por correo se realizan en modo best-effort. Solo se envían si se puede determinar una dirección de correo para el usuario (getUserEmail).
  - Plantillas utilizadas para correos:
    - paymentConfirmedEmail: para pagos exitosos.
    - paymentFailedEmail: para pagos fallidos.
    - recurringChargeReceiptEmail: recibo de cobro recurrente.
    - recurringChargeFailedEmail: aviso de fallo en cobro recurrente.

- Rendimiento y errores
  - Se manejan errores de BD explícitamente, devolviendo 500 para señales que Kushki debe reintentar.
  - Errores en actualizaciones de suscripciones o transacciones se reportan y detienen el flujo con códigos 500, para que Kushki reintente.

- Dependencias de implementación
  - El archivo se apoya en el cliente admin de Supabase para operaciones de escritura y lectura con privilegios de servicio.
  - Se utiliza un cliente Kushki (kushkiFetch) para acciones administrativas como cancelar suscripciones.
  - Se aprovecha la validación de payload y utilidades de dominio (mapKushkiStatus, isFinalTransactionStatus) para mantener un flujo coherente de estados.

## Última actualización
29/5/2026

Observaciones finales
- El fragmento proporcionado del archivo termina con una sección de notificación al cliente y parece cortarse; el comportamiento esperado es que, tras notificar por correo en los casos de completed/failed, se termine la ejecución devolviendo 200 (con o sin cuerpo, según implementación). La documentación cubre el flujo completo mostrado en el código disponible y señala el comportamiento típico para otros casos.
- Si necesitas, puedo adaptar esta documentación para incluir ejemplos de payloads más detallados o aclarar campos específicos de kushkiWebhookSchema (una vez compartas su definición exacta).