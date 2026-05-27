# Edge Functions de Supabase

Este documento detalla las funciones serverless alojadas en Supabase (Edge Functions basadas en Deno), su propósito, mecanismos de autenticación y flujos esperados.

> El **webhook de pagos de Kushki** NO es una Edge Function: está implementado
> como Route Handler de Next.js en `app/api/webhooks/kushki/route.ts`. Su
> documentación está en [`kushki-integration.md`](kushki-integration.md).

---

## 1. `dashboard-metrics` (ACTIVA)
**Propósito:** Centraliza el cálculo de métricas financieras y operativas del dashboard administrativo en una sola llamada para optimizar tiempos de carga.
- **Endpoint:** `GET /functions/v1/dashboard-metrics`
- **Auth:** Requiere JWT válido en el header `Authorization` + Rol `admin` en el `app_metadata` del JWT.
- **Fallback:** En caso de que la Edge Function falle (timeout o error de red), la Server Action `app/(dashboard)/dashboard/actions.ts` utiliza automáticamente las Vistas SQL (`v_dashboard_summary`, etc.) como respaldo.
- **Respuesta Esperada (200 OK):**
  ```json
  {
    "mrr": 1200,
    "monthly_income": 3500,
    "active_subscriptions": 15,
    "recurring_subscriptions": 8,
    "one_time_subscriptions": 7,
    "pending_reservations": 4,
    "monthly_income_series": [{ "label": "Ene", "value": 1500 }],
    "service_mix": [{ "name": "Manejo Redes", "value": 8 }]
  }
  ```

---

## 2. `subscription-renewal` (ACTIVA)
**Propósito:** Procesar el ciclo de vida diario de las suscripciones que han llegado a su fecha de vencimiento.
- **Endpoint:** `POST /functions/v1/subscription-renewal`
- **Auth:** Acepta **dos formas** de autenticación:
  - El `service_role_key` como Bearer token (lo usa el CRON, como secreto compartido).
  - Un JWT válido de un usuario con rol `admin` (invocación manual).
- **Lógica:**
  - **Suscripciones manuales** (efectivo / transferencia) de tipo `manejo_redes` con `auto_renew=true`: extiende `ends_at` según la duración del servicio y crea una transacción `pending` por el monto de la renovación. Las demás se marcan `expired`.
  - **Suscripciones gestionadas por Kushki** (`gateway_subscription_id` presente): Kushki las cobra y renueva sola, y el webhook extiende `ends_at` en cada cobro exitoso. El cron NO las renueva ni les crea transacciones; solo las marca `expired` si llevan más de 5 días vencidas (período de gracia: el último cobro falló y Kushki ya no las renovó).
- **Respuesta Esperada (200 OK / 207 Multi-Status):**
  ```json
  {
    "processed": 5,
    "renewed": 2,
    "expired": 2,
    "skipped": 1,
    "failures": []
  }
  ```

### Invocación Automática (CRON)
- **Programación:** Diaria a las 06:00 UTC (01:00 hora Ecuador) vía `pg_cron`.
- **Mecanismo:** una función wrapper en PostgreSQL (`public.trigger_subscription_renewal`) lee el `service_role_key` desde **Supabase Vault** y hace un HTTP POST a la Edge Function con `pg_net`.
- **Requisito operativo:** el secreto debe existir en Vault:
  ```sql
  select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
  ```
- **Job name:** `daily-subscription-renewal`
- **Monitoreo:**
  ```sql
  SELECT * FROM cron.job_run_details
  WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-subscription-renewal')
  ORDER BY start_time DESC LIMIT 10;
  ```

---

## 3. `payment-webhook` (DEPRECADA)
**Estado:** Deprecada — reemplazada por la API Route de Next.js `app/api/webhooks/kushki/route.ts`.

> **Nota:** Esta Edge Function fue originalmente un placeholder que respondía `501 Not Implemented`.
> Ya no se usa. La lógica de recepción de webhooks de Kushki está implementada directamente
> como Route Handler de Next.js, lo que permite usar el runtime de Node.js (`crypto.timingSafeEqual`),
> acceder al cliente admin de Supabase y enviar correos transaccionales con Resend en un solo
> proceso sin cold-starts de Deno.

No debe desplegarse ni invocarse. Si existe en el proyecto de Supabase, puede eliminarse con:
```bash
supabase functions delete payment-webhook
```

---

## Invocación y Testeo (cURL)

Para testear localmente o contra producción, debes proporcionar los secretos de entorno correspondientes y un JWT válido de un usuario con rol administrador.

```bash
curl -i --request GET 'https://<PROJECT_REF>.supabase.co/functions/v1/dashboard-metrics' \
  --header 'Authorization: Bearer <TU_ADMIN_JWT>'
```

### Variables de Entorno Requeridas en las Functions
- `SUPABASE_URL`: Inyectada automáticamente por Supabase.
- `SUPABASE_ANON_KEY`: Inyectada automáticamente por Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Requerida explícitamente. Se usa dentro de las Edge Functions para bypassear las políticas RLS y ejecutar lecturas/escrituras masivas.

### Códigos de Error Comunes
- `401 Unauthorized`: El header Authorization falta o el JWT/token es inválido.
- `403 Forbidden`: El usuario está logueado pero no tiene el rol de `admin`.
- `405 Method Not Allowed`: Método HTTP incorrecto.
- `500 Internal Server Error`: Faltan variables de entorno en el servidor de Deno o hubo un fallo crítico en la consulta a la BD.
