# API y Server Actions

Documento correspondiente al código consolidado en `main`.

## GET /api/admin/export-transactions

Exporta transacciones en CSV. Requiere sesión y perfil con rol `admin` e `is_active` distinto de `false`.

- 200: archivo CSV.
- 401: no hay sesión.
- 403: el perfil no es un administrador activo.
- 500: error al consultar las transacciones.

Implementación: [route.ts](../app/api/admin/export-transactions/route.ts).

No existe una ruta REST `/api/transactions` ni `/api/webhooks/kushki` en esta versión.

## Checkout

Las operaciones se realizan mediante Server Actions de Next.js en [payment-actions.ts](../app/(public)/checkout/payment-actions.ts):

- `initPayphonePayment`: autentica, valida el servicio activo, crea suscripción y transacción pendientes y prepara el pago. Devuelve la URL del portal.
- `initManualTransfer`: crea la suscripción y transacción pendientes para una transferencia manual.
- `uploadTransferReceipt`: valida propietario, estado pendiente, tipo y tamaño del archivo; guarda el comprobante en el bucket privado `comprobantes`. Admite JPG, PNG y WEBP hasta 5 MB.

El importe se obtiene del servicio en la base de datos, no del cliente.

## Retorno de PayPhone

`/pago-respuesta?id=...&clientTransactionId=...` consulta el resultado del proveedor desde el servidor y actualiza transacción y suscripción. Es una página de retorno del navegador, no un webhook. Consulta [el flujo de pagos](payphone-integration.md).

## Servicios administrativos

Las Server Actions de [actions.tsx](../app/(dashboard)/servicios/actions.tsx) validan el rol de administrador activo antes de crear, actualizar o eliminar servicios. Los datos se validan con Zod y las mutaciones invalidan el catálogo público.

## Edge Functions

`dashboard-metrics` y `subscription-renewal` residen en `supabase/functions`, fuera de las rutas HTTP de Next.js. Consulta su código y las migraciones de cron para la autenticación y el despliegue.
