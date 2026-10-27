# Documentación técnica — app/api/transactions/route.ts

Archivo: route.ts  
Ruta del archivo en el proyecto RNG Vantage: app/api/transactions/route.ts  
Estado (según el código actual): No implementado

Resumen rápido
- Este archivo define un controlador para el método POST en la ruta de transacciones (webhook placeholder para pagos con tarjeta).
- Actualmente solo devuelve una respuesta 501 con un mensaje de implementación pendiente.
- Contiene comentarios de implementación futura con pasos y ejemplos de payload esperados, pero no realiza ninguna lógica de negocio aún.

## Descripción general
El archivo route.ts sirve como placeholder para recibir notificaciones de pagos vía tarjetas desde procesadores como PayPhone, Stripe, MercadoPago u otros. Aunque el futuro objetivo es procesar webhooks de pago y marcar transacciones como completadas, la implementación actual no realiza ninguna acción de negocio y responde con un 501 (Not Implemented).

La intención documentada en el código es preparar el endpoint para cuando la clienta quiera cobrar con tarjeta. En ese momento, se podría validar la firma del webhook, parsear el payload para extraer la transacción y llamar a una acción de servidor existente (markTransactionAsCompleted), entre otras cosas.

Ejemplo de payload esperado (una vez implementado)
{
  "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed" | "failed",
  "payment_method": "card",
  "transaction_reference": "PAY-12345-STRIPE",
  "amount": 299.99,
  "timestamp": "2026-04-27T13:45:00Z"
}

Notas de implementación futura (descritas en el encabezado del archivo)
1. Validar la firma del webhook (para confirmar origen).
2. Extraer el transaction_id.
3. Llamar a markTransactionAsCompleted() (server action existente).
4. Retornar 200 OK.
5. En caso de error, loguear y retornar 400/500.

Recursos citados en el código
- Documentación PayPhone: https://developers.payphonecr.com
- Documentación Stripe: https://stripe.com/docs/webhooks

## Responsabilidades
- Exponer un endpoint POST para /api/transactions en el contexto de Next.js App Router.
- Servir como punto de entrada para futuros webhooks de procesamiento de pagos con tarjeta.
- Devolver una respuesta adecuada (actualmente no implementada) para indicar progreso y estado al consumidor del webhook.
- Proveer un lugar central para incorporar verificación de firma, parsing de payload y actualización de estado de transacciones cuando se implemente.

## Props / Parámetros
El controlador exporta una función POST que recibe un parámetro único:

- _request: Request
  - Tipo: Request (Web API Request)
  - Descripción: Objeto de petición entrante. En la versión actual no se utiliza para lógica de negocio; está destinado a recibir el cuerpo del webhook en implementaciones futuras.
  - Notas: Está marcado como no utilizado en el código (linting para variables no usadas). En futuras iteraciones se podría leer y validar el cuerpo y encabezados (por ejemplo, firmas).

## Retorna
La función POST devuelve un objeto Response con distintos contenidos según el flujo:

- En ejecución actual (placeholder):
  - Cuerpo JSON: { "message": "Webhook placeholder - No implementado aún", "status": "pending_implementation" }
  - Código de estado: 501
  - Descripción: Indica que la implementación del webhook aún no está realizada.

- En manejo de errores:
  - Cuerpo JSON: { "error": "Internal server error" }
  - Código de estado: 500
  - Descripción: Registro de error y respuesta genérica de fallo del servidor.

Notas: El código captura errores y los imprime con console.error antes de devolver 500.

## Dependencias
- Entorno y stack:
  - Next.js con App Router (ruta: app/api/transactions/route.ts)
  - TypeScript
  - Entorno de ejecución que soporta la API Route handlers (POST) y objetos globales Request/Response.
- No hay dependencias externas utilizadas en la implementación actual.
- En comentarios se mencionan posibles dependencias futuras para la implementación real:
  - markTransactionAsCompleted (server action existente)
  - verifyWebhookSignature (función de verificación de firma)
- El endpoint no realiza ninguna llamada a servicios externos en la versión actual.

## Ejemplos de uso
Ejemplo 1: Llamada POST al webhook (comportamiento actual, placeholder)

curl -X POST https://tu-dominio.com/api/transactions \
  -H "Content-Type: application/json" \
  -d '{ "transaction_id": "550e8400-e29b-41d4-a716-446655440000", "status": "completed", "payment_method": "card", "transaction_reference": "PAY-12345-STRIPE", "amount": 299.99, "timestamp": "2026-04-27T13:45:00Z" }'

Respuesta esperada (actual):
HTTP/1.1 501
Content-Type: application/json
{
  "message": "Webhook placeholder - No implementado aún",
  "status": "pending_implementation"
}

Notas: Este comportamiento es intencional y definido por la implementación actual del archivo. No se realiza procesamiento alguno del payload en esta versión.

Ejemplo 2: Comentario de implementación futura (documentación interna)
Una vez implementado:
- Se verificaría la firma del webhook.
- Se parsearía el payload para extraer transaction_id, status, etc.
- Si status === "completed", se llamaría markTransactionAsCompleted({ transaction_id, payment_method: "card" }).
- Se respondería con 200 OK en caso de éxito, o 400/500 en caso de error.

## Notas técnicas
- Estado actual del código: partialmente preparado para webhook de pagos, pero no ejecuta lógica de negocio.
- Estructura de respuesta: utiliza Response.json para devolver JSON con código de estado correspondiente (501 en placeholder, 500 en errores).
- Observaciones sobre seguridad:
  - No hay verificación de firma de webhook implementada en la versión actual.
  - En implementación real se recomienda validar orígenes y firmas para evitar spoofing.
- Futuras mejoras previstas (según comentarios en el código):
  - Validar la firma del webhook.
  - Parsear y validar el payload recibido.
  - Llamar a markTransactionAsCompleted cuando corresponda.
  - Retornar 200 OK tras procesamiento exitoso.
  - Manejo de errores robusto con logs y respuestas adecuadas.
- Rendimiento y mantenimiento:
  - Como punto de extensión, mantener el endpoint muy ligero hasta completar la lógica de negocio.
  - Considerar pruebas de integración con Stripe PayPhone MercadoPago si se elige soportar múltiples proveedores.

## Última actualización
12/5/2026

Notas finales
- Este documento refleja exactamente la implementación vigente en el código fuente proporcionado. Cualquier cambio en la lógica de negocio o en la API deberá actualizarse en este documento para mantener la coherencia entre el código y la documentación.