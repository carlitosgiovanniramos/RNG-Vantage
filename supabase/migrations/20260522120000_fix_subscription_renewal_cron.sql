-- Corrige la autenticacion del cron de renovacion de suscripciones.
--
-- El job anterior (20260520100000) pasaba el token con
-- current_setting('app.settings.service_role_key'), un GUC que no se
-- define en ninguna migracion -> el cron enviaba un Bearer vacio y la
-- Edge Function respondia 401. Resultado: las suscripciones nunca se
-- renovaban ni expiraban automaticamente.
--
-- Esta migracion usa una funcion wrapper que lee el service_role_key
-- desde Supabase Vault.
--
-- REQUISITO OPERATIVO (una sola vez, fuera de esta migracion):
--   select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
-- La Edge Function subscription-renewal debe estar desplegada con la
-- version que acepta el service_role_key como secreto compartido.

create or replace function public.trigger_subscription_renewal()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  service_key text;
  project_url text := 'https://uzsasdbcewymviuelcsi.supabase.co';
begin
  select decrypted_secret into service_key
  from vault.decrypted_secrets
  where name = 'service_role_key'
  limit 1;

  if service_key is null then
    raise warning '[subscription-renewal] Falta el secreto service_role_key en Vault; cron omitido';
    return;
  end if;

  perform net.http_post(
    url := project_url || '/functions/v1/subscription-renewal',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := '{}'::jsonb
  );
end;
$$;

-- Re-programar el job para que invoque la funcion wrapper.
select cron.unschedule('daily-subscription-renewal')
where exists (select 1 from cron.job where jobname = 'daily-subscription-renewal');

select cron.schedule(
  'daily-subscription-renewal',
  '0 6 * * *',
  $$ select public.trigger_subscription_renewal(); $$
);
