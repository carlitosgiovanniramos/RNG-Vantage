-- =============================================================
-- Habilitar extensiones necesarias para CRON + HTTP requests
-- =============================================================

-- pg_cron: permite programar tareas periódicas dentro de PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- pg_net: permite hacer HTTP requests desde PostgreSQL (necesario para llamar Edge Functions)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =============================================================
-- Otorgar permisos al rol postgres para usar pg_cron
-- =============================================================
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- =============================================================
-- Programar la tarea diaria de renovación de suscripciones
-- Se ejecuta todos los días a las 06:00 UTC (01:00 Ecuador)
-- =============================================================
SELECT cron.schedule(
  'daily-subscription-renewal',   -- nombre único del job
  '0 6 * * *',                    -- cron expression: diario a las 06:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://uzsasdbcewymviuelcsi.supabase.co/functions/v1/subscription-renewal',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

/*
-- Opción alternativa (si current_setting no funciona):
-- Reemplazar el bloque del SELECT cron.schedule(...) con esta función wrapper:

-- Crear función wrapper que el cron invocará
CREATE OR REPLACE FUNCTION public.trigger_subscription_renewal()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_key text;
  project_url text := 'https://uzsasdbcewymviuelcsi.supabase.co';
BEGIN
  -- Obtener el service_role_key de los secrets de Supabase
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;

  -- Si no hay key en vault, intentar con la variable de entorno directa
  IF service_key IS NULL THEN
    service_key := current_setting('supabase.service_role_key', true);
  END IF;

  IF service_key IS NULL THEN
    RAISE WARNING 'No se encontró service_role_key para invocar subscription-renewal';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := project_url || '/functions/v1/subscription-renewal',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Programar ejecución diaria a las 06:00 UTC
SELECT cron.schedule(
  'daily-subscription-renewal',
  '0 6 * * *',
  $$ SELECT public.trigger_subscription_renewal(); $$
);
*/
