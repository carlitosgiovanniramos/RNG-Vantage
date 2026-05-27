# Integración de pagos con Kushki

Pasarela de pagos del checkout de RGL Estudio. Cubre:

- **Tarjeta** — cargo único (servicios de pago único) y **suscripción
  recurrente** (servicios `manejo_redes`, cobro mensual automático).
- **Transferencia bancaria** — pago único asíncrono.
- **Efectivo / manual** — flujo previo, Ruth confirma el pago a mano.
- **Correos transaccionales** y **manejo de cobros fallidos (dunning)**.

---

## 1. Variables de entorno

| Variable | Ámbito | Descripción |
|----------|--------|-------------|
| `NEXT_PUBLIC_KUSHKI_ENV` | cliente + servidor | `sandbox` o `production` |
| `NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID` | cliente | ID público — tokenización de tarjeta |
| `KUSHKI_PRIVATE_MERCHANT_ID` | servidor | ID privado — cargos, transferencias, suscripciones |
| `KUSHKI_WEBHOOK_SECRET` | servidor | Secreto compartido del webhook |
| `NEXT_PUBLIC_SITE_URL` | cliente + servidor | URL pública — callback de transferencia |
| `RESEND_API_KEY` | servidor | API key de Resend — correos transaccionales |
| `EMAIL_FROM` | servidor | Remitente; requiere dominio verificado en Resend |

Sin las variables de Kushki la app compila pero los pagos fallan. Sin las de
Resend, los correos simplemente se omiten (con un `warning` en el log) — no
rompe ningún flujo.

---

## 2. Migraciones de base de datos

Aplicar en orden:

| Migración | Qué añade |
|-----------|-----------|
| `20260522000000_kushki_gateway_columns.sql` | Columnas `gateway`, `gateway_transaction_id`, `gateway_reference`, `gateway_status` en `transactions` + índice único |
| `20260522120000_fix_subscription_renewal_cron.sql` | Corrige la autenticación del cron de renovación (lee el service_role_key desde Vault) |
| `20260522140000_kushki_subscription_id.sql` | Columna `gateway_subscription_id` en `subscriptions` + índice único |

---

## 3. Archivos principales

- `lib/kushki/` — `config.ts`, `client.ts`, `types.ts`, `webhook.ts`.
- `lib/email/` — `client.ts` (envío vía Resend), `templates.ts`.
- `lib/validators/payment.ts` — validación Zod de los flujos de pago.
- `app/(public)/checkout/payment-actions.ts` — `chargeWithCard`, `initTransfer`, `subscribeWithCard`.
- `app/(public)/checkout/` — `checkout-form.tsx`, `card-form.tsx`, `transfer-form.tsx`.
- `app/api/webhooks/kushki/route.ts` — receptor de notificaciones de Kushki.
- `app/(dashboard)/subscriptions/actions.ts` — `cancelSubscription` (admin).
- `app/(dashboard)/subscriptions/cancel-subscription-button.tsx` — UI admin de cancelación.
- `app/(public)/perfil/` — portal del cliente: `subscriptions-panel.tsx`,
  `update-card-form.tsx`, `actions.ts` (`cancelMySubscription`, `updatePaymentMethod`).
- `lib/kushki/card-fields.ts` — tokenización de tarjeta compartida (lado cliente).
- `lib/email/` — envío de correos transaccionales.
- `app/(dashboard)/pagos-fallidos/page.tsx` — vista de pagos fallidos y contracargos.
- `app/api/admin/export-transactions/route.ts` — export CSV de transacciones (admin).
- `supabase/functions/subscription-renewal/index.ts` — cron de renovación/expiración.

---

## 4. Flujos de pago

### 4.1 Tarjeta — pago único (síncrono)

1. KushkiJS (`@kushki/js-sdk`) tokeniza la tarjeta en el navegador (campos en
   iframes, requisito PCI — el número de tarjeta nunca toca nuestro DOM).
2. `chargeWithCard` crea suscripción + transacción `pending` y llama a
   `/card/v1/charges`.
3. La respuesta HTTP ya indica el resultado:
   - aprobado → transacción `completed`, suscripción `active`, correo de confirmación.
   - rechazado → transacción `failed`.

### 4.2 Tarjeta — suscripción recurrente (servicios `manejo_redes`)

Se activa cuando el servicio es recurrente y el cliente marca "auto-renovar".

1. `card-form` tokeniza con `isSubscription: true`.
2. `subscribeWithCard` crea la suscripción `pending`, llama a
   `/subscriptions/v1/card` y, al éxito, guarda `gateway_subscription_id` y
   activa la suscripción. Envía correo "Suscripción activada".
3. **Kushki cobra la tarjeta cada mes automáticamente.** Cada cobro llega por
   el webhook, que registra una transacción nueva y extiende `ends_at`.
4. Las transacciones de los cobros (incluido el primero) **las crea el
   webhook**, no `subscribeWithCard`.

### 4.3 Transferencia bancaria (asíncrono)

1. `initTransfer` crea suscripción + transacción `pending` y llama a
   `/transfer/v1/init`.
2. El cliente es redirigido a su banco (o recibe un código de referencia).
3. La transacción **permanece `pending`**.
4. Al completarse, Kushki llama al webhook → transacción `completed`,
   suscripción `active`, correo de confirmación.

### 4.4 Efectivo / manual

`createSubscription` crea todo en `pending`. Ruth confirma el pago desde el
panel con `markTransactionAsCompleted`, que activa la suscripción y envía el
correo de confirmación al cliente.

---

## 5. Webhook

URL: `https://<dominio>/api/webhooks/kushki`

Configuración en la consola de Kushki:

1. Registrar esa URL como webhook de notificaciones.
2. Añadir un header personalizado `x-webhook-secret` con el valor de
   `KUSHKI_WEBHOOK_SECRET`.

Comportamiento:

- Valida el secreto en **tiempo constante** (`timingSafeEqual`).
- **Pago único / transferencia:** busca la transacción por
  `gateway_transaction_id`, actualiza su estado y activa la suscripción.
  Idempotente: no reprocesa estados finales.
- **Cobro recurrente:** si no hay transacción previa pero el evento trae
  `subscriptionId`, busca la suscripción por `gateway_subscription_id`,
  registra una transacción nueva y extiende `ends_at`. El índice único sobre
  `gateway_transaction_id` da idempotencia ante webhooks repetidos.
- **Contracargo / disputa:** si el evento es de tipo `chargeback`, marca la
  transacción como `refunded`, cancela la suscripción recurrente en Kushki y
  la marca `cancelled`.
- Siempre responde `200` ante eventos válidos para frenar reintentos; responde
  `500` solo ante errores transitorios de BD (para que Kushki reintente).

> El webhook **no funciona en `localhost`** — requiere la app desplegada con
> URL pública (o un túnel tipo ngrok).

Prueba rápida del endpoint:

```bash
curl -i -X POST http://localhost:3000/api/webhooks/kushki \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <KUSHKI_WEBHOOK_SECRET>" \
  -d '{"transactionId":"prueba-123","status":"APPROVAL"}'
```

---

## 6. Correos transaccionales

Se envían vía Resend (`lib/email/`). Son **best-effort**: si Resend falla o no
está configurado, el flujo de pago no se interrumpe.

| Evento | Correo |
|--------|--------|
| Cargo con tarjeta aprobado | Pago confirmado |
| Suscripción recurrente creada | Suscripción activada |
| Transferencia confirmada (webhook) | Pago confirmado |
| Transferencia rechazada (webhook) | Pago no completado |
| Pago manual confirmado por Ruth | Pago confirmado |
| Cobro mensual exitoso (webhook) | Recibo del cobro mensual |
| Cobro mensual rechazado (webhook) | Aviso de cobro rechazado (dunning) |

Las plantillas (HTML simple con estilos inline) están en
`lib/email/templates.ts`.

---

## 7. Manejo de cobros recurrentes fallidos (dunning)

Cuando Kushki no logra cobrar un mes de una suscripción:

1. El webhook registra la transacción `failed` y envía al cliente el correo de
   dunning ("revisa tu método de pago, si no se regulariza se dará de baja").
2. La suscripción **no** se renueva: `ends_at` no se extiende.
3. El cron `subscription-renewal` aplica un **período de gracia de 5 días**
   (constante `KUSHKI_GRACE_MS`): si la suscripción lleva más de 5 días
   vencida, la marca `expired` y `auto_renew = false`. Dentro de la gracia la
   respeta, para no expirarla antes de que Kushki reintente.

> No existe un estado `past_due` explícito: una suscripción con cobro fallido
> sigue `active` hasta que el cron la expira tras la gracia.

---

## 8. Cancelación de suscripciones y portal del cliente

### Cancelación

Disponible para el **admin** (`/subscriptions`) y para el **cliente** en su
perfil (`/perfil`). Ambas comparten la misma lógica:

1. Si la suscripción tiene `gateway_subscription_id`, **se cancela primero en
   Kushki** para detener los cobros automáticos.
2. Solo si Kushki confirma, se marca la suscripción local `cancelled` y
   `auto_renew = false`. Si Kushki falla, no cambia nada (evita quedar
   "cancelada" mientras Kushki sigue cobrando).

`cancelSubscription` (admin) verifica rol admin; `cancelMySubscription`
(cliente) verifica que la suscripción pertenezca al usuario.

### Portal del cliente (`/perfil`)

El cliente ve sus suscripciones (estado, fechas, auto-renovación), su
**historial de pagos**, y puede **cancelar** y **actualizar la tarjeta** de
sus suscripciones recurrentes.

### Actualizar método de pago

Para una suscripción recurrente, el cliente puede cambiar la tarjeta:
`update-card-form` tokeniza la nueva tarjeta con KushkiJS y `updatePaymentMethod`
la envía a Kushki. Cierra el círculo del dunning (sección 7): el correo de
cobro rechazado dirige al cliente a actualizar su tarjeta aquí.

---

## 9. Cron de renovación

`supabase/functions/subscription-renewal/index.ts`, ejecutado a diario por
`pg_cron`.

- Suscripciones **no** gestionadas por Kushki (efectivo/transferencia con
  auto-renovar en `manejo_redes`): renueva `ends_at` y crea una transacción
  `pending` para pago manual; las demás las expira.
- Suscripciones **gestionadas por Kushki** (`gateway_subscription_id` no nulo):
  no las renueva ni les crea transacciones (Kushki las cobra); solo las expira
  tras el período de gracia (ver sección 7).
- Autenticación: acepta el `service_role_key` como secreto compartido (el
  cron) o un JWT de admin.

---

## 10. Monitoreo, contracargos y exportación contable

### Pagos con incidencias

La página admin `/pagos-fallidos` lista las transacciones `failed` y
`refunded` (contracargos) con el cliente, monto, método y el detalle de la
pasarela, para que el administrador les dé seguimiento.

### Contracargos / disputas

Cuando Kushki notifica un contracargo, el webhook marca la transacción como
`refunded`, cancela la suscripción recurrente en Kushki (para detener cobros
futuros) y la marca `cancelled`. El caso aparece automáticamente en
`/pagos-fallidos`.

### Exportación contable

El endpoint admin `GET /api/admin/export-transactions` descarga todas las
transacciones en CSV (con BOM UTF-8 para Excel): fecha, cliente, monto,
estado, método, pasarela e IDs. Disponible desde el botón "Exportar CSV" en
la página de transacciones.

> La **conciliación** automática contra los reportes de liquidación de Kushki
> (verificar que lo depositado coincide con lo registrado) no está
> implementada — requiere la API de settlement de Kushki.

---

## 11. Pruebas en sandbox

1. `NEXT_PUBLIC_KUSHKI_ENV=sandbox` y credenciales de sandbox en `.env.local`.
2. Usar las tarjetas de prueba de la documentación de Kushki.
3. El webhook y los callbacks requieren la app desplegada o un túnel (ngrok).

---

## 12. Checklist de puesta en producción

### Negocio (Ruth)

- [ ] Cuenta Merchant de Kushki aprobada (RUC + cuenta bancaria ecuatoriana).
- [ ] Método **Transferencia** activado en la cuenta Kushki.
- [ ] Producto **Suscripciones** habilitado en la cuenta Kushki.
- [ ] Definir el tratamiento de **IVA** (15 %) con la contabilidad.

### Configuración

- [ ] Variables de Kushki en producción (sección 1).
- [ ] `NEXT_PUBLIC_SITE_URL` con el dominio real.
- [ ] Cuenta en Resend + dominio de envío verificado + `RESEND_API_KEY` y
      `EMAIL_FROM`.
- [ ] Crear el secreto del cron en Vault:
      `select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');`

### Base de datos y despliegue

- [ ] Aplicar las 3 migraciones (sección 2).
- [ ] Desplegar la app con URL pública.
- [ ] Desplegar la Edge Function: `supabase functions deploy subscription-renewal`.
- [ ] Registrar el webhook en la consola de Kushki con el header
      `x-webhook-secret`.
- [ ] Probar en sandbox antes de pasar a `production`.

---

## 13. Verificaciones pendientes contra la documentación de Kushki

Los tipos y endpoints de Kushki son un *scaffold*; **verificar contra la doc
vigente** antes de producción:

- Endpoint y payload de cargo (`POST /card/v1/charges`).
- Endpoint y payload de transferencia (`POST /transfer/v1/init`).
- Endpoint y payload de suscripción (`POST /subscriptions/v1/card`).
- Endpoint de cancelación de suscripción (se usa
  `DELETE /subscriptions/v1/card/{id}`).
- Endpoint de actualización de tarjeta de una suscripción (se usa
  `PUT /subscriptions/v1/card/{id}`). Si Kushki no lo soporta, la alternativa
  es cancelar y volver a suscribir.
- Que el webhook incluya `subscriptionId` en los eventos de cobro recurrente.
- **Que Kushki envíe un webhook por cada cobro, incluido el primero** de una
  suscripción. Si no notifica el primer cobro, hay que crear esa primera
  transacción dentro de `subscribeWithCard`.
- Que `@kushki/js-sdk` genere bien el token de suscripción con
  `isSubscription: true`.
- Que Kushki permita headers personalizados en los webhooks (`x-webhook-secret`).
- Cómo notifica Kushki los **contracargos** (el webhook los detecta por
  `eventType === "chargeback"`).

---

## 14. Pendientes / mejoras futuras

- **Facturación electrónica (SRI):** obligatoria en Ecuador; el sistema
  registra transacciones pero no emite comprobante legal. No implementado.
- **Desglose de IVA:** hoy el precio completo se envía como `subtotalIva0`.
- **Validación de monto en el webhook:** comparar `event.amount` con el
  esperado (defensa en profundidad).
- **Reconciliación si falla un `update` tras un cargo aprobado:** hoy se
  registra en log; podría añadirse reintento/alerta.
- **Conciliación contable:** cruzar las liquidaciones de Kushki contra las
  transacciones registradas (requiere la API de settlement de Kushki).
- **Monitoreo de errores:** integrar una herramienta tipo Sentry; hoy los
  errores van a `console.error`.
- **Estado `past_due`** explícito para suscripciones con cobro fallido.
