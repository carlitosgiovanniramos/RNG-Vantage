# Integración de pagos con Kushki

Pasarela de pagos del checkout de RGL Estudio. Permite cobrar suscripciones
con **tarjeta** y **transferencia bancaria**, además del flujo manual de
**efectivo** que ya existía.

## Variables de entorno

| Variable | Ámbito | Descripción |
|----------|--------|-------------|
| `NEXT_PUBLIC_KUSHKI_ENV` | cliente + servidor | `sandbox` o `production` |
| `NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID` | cliente | ID público, tokenización de tarjeta |
| `KUSHKI_PRIVATE_MERCHANT_ID` | servidor | ID privado, cargos y transferencias |
| `KUSHKI_WEBHOOK_SECRET` | servidor | Secreto compartido del webhook |
| `NEXT_PUBLIC_SITE_URL` | cliente + servidor | URL pública para el callback de transferencia |

Las credenciales se obtienen de la consola de Kushki tras aprobar la cuenta
Merchant (requiere RUC y cuenta bancaria ecuatoriana).

## Archivos principales

- `lib/kushki/` — config, cliente HTTP, tipos y lógica del webhook.
- `lib/validators/payment.ts` — validación Zod de los flujos de pago.
- `app/(public)/checkout/payment-actions.ts` — actions `chargeWithCard` e `initTransfer`.
- `app/(public)/checkout/card-form.tsx` / `transfer-form.tsx` — UI.
- `app/api/webhooks/kushki/route.ts` — receptor de notificaciones.

## Flujo con tarjeta (síncrono)

1. KushkiJS tokeniza la tarjeta en el navegador (campos en iframes, PCI).
2. `chargeWithCard` crea suscripción + transacción `pending` y llama a
   `/card/v1/charges`.
3. La respuesta HTTP ya indica el resultado:
   - aprobado → transacción `completed`, suscripción `active`.
   - rechazado → transacción `failed`.

## Flujo con transferencia (asíncrono)

1. `initTransfer` crea suscripción + transacción `pending` y llama a
   `/transfer/v1/init`.
2. El cliente es redirigido a su banco (o recibe un código de referencia).
3. La transacción **permanece `pending`**.
4. Al completar la transferencia, Kushki llama al webhook, que actualiza la
   transacción y activa la suscripción.

## Webhook

URL: `https://<dominio>/api/webhooks/kushki`

Configuración en la consola de Kushki:
1. Registrar esa URL como webhook de notificaciones.
2. Añadir un header personalizado `x-webhook-secret` con el valor de
   `KUSHKI_WEBHOOK_SECRET`.

El handler valida el secreto, es idempotente (no reprocesa estados finales)
y siempre responde 200 ante eventos válidos para frenar los reintentos.

> El webhook **no funciona en `localhost`** — requiere la app desplegada con
> URL pública (o un túnel tipo ngrok).

Prueba rápida del endpoint:

```bash
curl -i -X POST http://localhost:3000/api/webhooks/kushki \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <KUSHKI_WEBHOOK_SECRET>" \
  -d '{"transactionId":"prueba-123","status":"APPROVAL"}'
```

## Pruebas en sandbox

1. `NEXT_PUBLIC_KUSHKI_ENV=sandbox` y credenciales de sandbox en `.env.local`.
2. Usar las tarjetas de prueba de la documentación de Kushki.

## Pendientes / hardening

- **Desglose de IVA:** `chargeWithCard` e `initTransfer` envían el precio
  completo como `subtotalIva0`. Confirmar el tratamiento fiscal con la
  contabilidad antes de producción.
- **Verificación reforzada del webhook:** opcionalmente, re-consultar a la API
  de Kushki el estado real en vez de confiar en el payload.
- **Validación de monto en el webhook:** comparar `event.amount` con
  `transaction.amount`.
- **Panel de éxito:** `checkout/page.tsx` (`?success=1`) muestra datos de
  transferencia manual; tras un pago con tarjeta el mensaje es engañoso.
- **Reconciliación si falla el `update` posterior a un cargo aprobado:**
  añadir reintento / log / alerta.
