-- Endurecimiento de seguridad detectado por los asesores de Supabase.
--
-- 1) Vistas SECURITY DEFINER -> SECURITY INVOKER.
--    La migracion de vistas asumia (incorrectamente) que SECURITY INVOKER
--    era el default. En Postgres las vistas se ejecutan con los privilegios
--    del OWNER salvo que se declare `security_invoker`. Sin esto, un usuario
--    autenticado no-admin podia leer agregados financieros via PostgREST
--    saltandose las politicas RLS de las tablas base.
--    Con security_invoker = on, las vistas respetan la RLS del usuario:
--    el admin ve todo (sus politicas lo permiten) y un cliente solo lo suyo.
alter view public.v_dashboard_summary   set (security_invoker = on);
alter view public.v_monthly_income       set (security_invoker = on);
alter view public.v_service_mix          set (security_invoker = on);
alter view public.v_subscriptions_detail set (security_invoker = on);
alter view public.v_transactions_detail  set (security_invoker = on);

-- 2) Funciones de trigger expuestas como RPC.
--    Son SECURITY DEFINER y estaban EXECUTE-ables por anon/authenticated
--    via /rest/v1/rpc/<fn>. No deben invocarse directamente: solo las
--    dispara el motor de triggers (que no requiere el privilegio EXECUTE).
--    Revocar el acceso cierra la superficie de ataque sin afectar triggers.
revoke execute on function public.handle_new_user()            from anon, authenticated, public;
revoke execute on function public.sync_profile_role_to_auth()  from anon, authenticated, public;
revoke execute on function public.enforce_auto_renew_rule()    from anon, authenticated, public;
revoke execute on function public.trigger_subscription_renewal() from anon, authenticated, public;
