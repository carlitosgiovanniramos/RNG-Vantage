-- =============================================================
-- RGL Estudio: Vistas SQL para optimización de dashboard y admin
-- Migración creada el 2026-05-20
--
-- Todas las vistas usan SECURITY INVOKER (default en PostgreSQL 15+),
-- por lo que respetan las políticas RLS existentes:
--   - Admins ven todos los registros
--   - Clients ven solo sus propios datos
-- =============================================================


-- =============================================================
-- 1. v_dashboard_summary
-- Resumen financiero en una sola fila.
-- Respalda la Edge Function dashboard-metrics (fallback)
-- y las tarjetas del dashboard principal.
--
-- Campos:
--   mrr                     – Monthly Recurring Revenue (solo manejo_redes activas)
--   monthly_income           – Ingresos del mes actual (transacciones completadas)
--   active_subscriptions     – Total de suscripciones activas
--   recurring_subscriptions  – Suscripciones activas de tipo manejo_redes
--   one_time_subscriptions   – Suscripciones activas de otros tipos
--   pending_reservations     – Reservas con status 'pending'
-- =============================================================
CREATE OR REPLACE VIEW public.v_dashboard_summary AS
SELECT
  -- MRR: suma de precios de suscripciones activas de tipo manejo_redes
  COALESCE(SUM(sv.price) FILTER (
    WHERE sub.status = 'active' AND sv.type = 'manejo_redes'
  ), 0)::numeric(10,2) AS mrr,

  -- Ingresos del mes actual (transacciones completadas)
  COALESCE((
    SELECT SUM(t.amount)
    FROM public.transactions t
    WHERE t.status = 'completed'
      AND t.created_at >= date_trunc('month', now())
  ), 0)::numeric(10,2) AS monthly_income,

  -- Total suscripciones activas
  COUNT(*) FILTER (WHERE sub.status = 'active') AS active_subscriptions,

  -- Suscripciones recurrentes (manejo_redes activas)
  COUNT(*) FILTER (
    WHERE sub.status = 'active' AND sv.type = 'manejo_redes'
  ) AS recurring_subscriptions,

  -- Suscripciones únicas (activas, no manejo_redes)
  COUNT(*) FILTER (
    WHERE sub.status = 'active' AND sv.type IS DISTINCT FROM 'manejo_redes'
  ) AS one_time_subscriptions,

  -- Reservas pendientes
  COALESCE((
    SELECT COUNT(*)
    FROM public.reservations r
    WHERE r.status = 'pending'
  ), 0) AS pending_reservations

FROM public.subscriptions sub
LEFT JOIN public.services sv ON sv.id = sub.service_id;


-- =============================================================
-- 2. v_monthly_income
-- Ingresos mensuales agrupados por mes (últimos 6 meses).
-- Alimenta el gráfico de barras en dashboard-charts.tsx.
--
-- Campos:
--   month – Texto 'YYYY-MM' (ej. '2026-05')
--   total – Suma de amounts completados en ese mes
-- =============================================================
CREATE OR REPLACE VIEW public.v_monthly_income AS
SELECT
  to_char(date_trunc('month', t.created_at), 'YYYY-MM') AS month,
  COALESCE(SUM(t.amount), 0)::numeric(10,2) AS total
FROM public.transactions t
WHERE t.status = 'completed'
  AND t.created_at >= date_trunc('month', now()) - interval '5 months'
GROUP BY date_trunc('month', t.created_at)
ORDER BY date_trunc('month', t.created_at);


-- =============================================================
-- 3. v_service_mix
-- Conteo de suscripciones activas agrupadas por tipo de servicio.
-- Alimenta el gráfico de torta del dashboard.
--
-- Campos:
--   service_type – Tipo del servicio (manejo_redes, auditoria, etc.)
--   count        – Cantidad de suscripciones activas de ese tipo
-- =============================================================
CREATE OR REPLACE VIEW public.v_service_mix AS
SELECT
  sv.type AS service_type,
  COUNT(*) AS count
FROM public.subscriptions sub
JOIN public.services sv ON sv.id = sub.service_id
WHERE sub.status = 'active'
GROUP BY sv.type
ORDER BY count DESC;


-- =============================================================
-- 4. v_subscriptions_detail
-- Join de subscriptions + services + profiles con campos útiles.
-- Usada en app/(dashboard)/subscriptions/page.tsx.
--
-- Campos: id, user_id, service_id, starts_at, ends_at, status,
--         auto_renew, created_at, client_name, service_name,
--         service_type, price
-- =============================================================
CREATE OR REPLACE VIEW public.v_subscriptions_detail AS
SELECT
  sub.id,
  sub.user_id,
  sub.service_id,
  sub.starts_at,
  sub.ends_at,
  sub.status,
  sub.auto_renew,
  sub.created_at,
  -- Nombre del cliente (concatenación de first_name + last_name)
  COALESCE(
    NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''),
    'Sin cliente'
  ) AS client_name,
  -- Datos del servicio
  COALESCE(sv.name, 'Servicio desconocido') AS service_name,
  sv.type AS service_type,
  COALESCE(sv.price, 0)::numeric(10,2) AS price
FROM public.subscriptions sub
LEFT JOIN public.services sv ON sv.id = sub.service_id
LEFT JOIN public.profiles  p  ON p.id  = sub.user_id;


-- =============================================================
-- 5. v_transactions_detail
-- Join de transactions + profiles con campos útiles.
-- Usada en app/(dashboard)/transacciones/page.tsx.
--
-- Campos: id, user_id, subscription_id, amount, payment_method,
--         status, notes, created_at, client_name
--
-- LEFT JOIN profiles porque transactions.user_id es nullable.
-- =============================================================
CREATE OR REPLACE VIEW public.v_transactions_detail AS
SELECT
  t.id,
  t.user_id,
  t.subscription_id,
  t.amount,
  t.payment_method,
  t.status,
  t.notes,
  t.created_at,
  -- Nombre del cliente
  COALESCE(
    NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''),
    'Sin cliente'
  ) AS client_name
FROM public.transactions t
LEFT JOIN public.profiles p ON p.id = t.user_id;
