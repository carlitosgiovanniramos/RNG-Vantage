# Edge Functions de Supabase

Este documento detalla las funciones serverless alojadas en Supabase (Edge Functions basadas en Deno), su propósito, mecanismos de autenticación y flujos esperados.

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
    "monthly_income_series": [{ "label": "Ene", "value": 1500 }, ...],
    "service_mix": [{ "name": "Manejo Redes", "value": 8 }, ...]
  }
  ```

---

## 2. `subscription-renewal` (ACTIVA)
**Propósito:** Procesar e intentar renovar las suscripciones que han expirado pero que tienen el flag `auto_renew=true`.
- **Endpoint:** `POST /functions/v1/subscription-renewal`
- **Auth:** Requiere JWT válido en el header `Authorization` + Rol `admin` en el JWT. Idealmente, se invocaría diariamente vía pg_cron o un CRON externo seguro.
- **Lógica:** 
  - Solo los servicios de tipo `manejo_redes` son elegibles para renovación automática.
  - Al renovar, extiende la fecha `ends_at` basándose en la duración del servicio.
  - Crea automáticamente una nueva transacción en estado `pending` por el monto de la renovación.
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
- **Mecanismo:** `pg_net` hace un HTTP POST a la Edge Function con el `service_role_key` como Bearer token.
- **Job name:** `daily-subscription-renewal`
- **Monitoreo:** Verificar la tabla `cron.job_run_details` para ver el historial de ejecuciones:
  ```sql
  SELECT * FROM cron.job_run_details 
  WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-subscription-renewal')
  ORDER BY start_time DESC LIMIT 10;
  ```

---

## 3. `payment-webhook` (PLACEHOLDER)
**Propósito:** Webhook diseñado para recibir notificaciones asíncronas de pasarelas de pago externas (ej. Stripe, MercadoPago, PayPal).
- **Endpoint:** `POST /functions/v1/payment-webhook`
- **Estado Actual:** Retorna HTTP `501 Not Implemented`.
- **Flujo Esperado (Cuando se integre):**
  1. Recibe el POST de la pasarela.
  2. Valida la firma de seguridad (ej. `Stripe-Signature`).
  3. Extrae el `transaction_id` de los metadatos.
  4. Si el pago fue exitoso (`charge.succeeded`), actualiza la `transaction` a `completed` y la `subscription` vinculada a `active`.
  5. Si el pago falla, marca la `transaction` como `failed`.

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
- `SUPABASE_SERVICE_ROLE_KEY`: Requerida explícitamente. Se usa internamente dentro de las Edge Functions para bypassear las políticas RLS (`Row Level Security`) y ejecutar lecturas/escrituras masivas (como en la renovación de suscripciones).

### Códigos de Error Comunes
- `401 Unauthorized`: El header Authorization falta o el JWT expiró.
- `403 Forbidden`: El usuario está logueado pero no tiene el rol de `admin`.
- `405 Method Not Allowed`: Método HTTP incorrecto (ej. hacer GET a `subscription-renewal`).
- `500 Internal Server Error`: Faltan variables de entorno en el servidor de Deno o hubo un fallo crítico en la consulta a la BD.
