-- Tarea 2 (Carlos): Validacion y refinamiento de politicas RLS
-- Objetivo: asegurar aislamiento de datos y coherencia con flujo real de la app.

-- =============================================================
-- 1) Helper unico para verificar admin
-- =============================================================
-- Usa claims del JWT (si existen) y fallback al rol en profiles.
-- SECURITY DEFINER evita bloqueos por RLS al consultar profiles.
create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  jwt_role text;
  jwt_app_role text;
  jwt_user_role text;
  profile_role text;
begin
  jwt_role := auth.jwt() ->> 'role';
  jwt_app_role := auth.jwt() -> 'app_metadata' ->> 'role';
  jwt_user_role := auth.jwt() -> 'user_metadata' ->> 'role';

  if jwt_role = 'admin' or jwt_app_role = 'admin' or jwt_user_role = 'admin' then
    return true;
  end if;

  select role
  into profile_role
  from public.profiles
  where id = auth.uid()
  limit 1;

  return coalesce(profile_role = 'admin', false);
end;
$$;

grant execute on function public.is_admin() to anon, authenticated, service_role;

-- =============================================================
-- 2) PROFILES
-- =============================================================
-- Mantiene fix antirecursion previo, pero estandariza el check de admin.
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- =============================================================
-- 3) SERVICES
-- =============================================================
drop policy if exists "Admins can view all services" on public.services;
drop policy if exists "Admins can insert services" on public.services;
drop policy if exists "Admins can update services" on public.services;
drop policy if exists "Admins can delete services" on public.services;

create policy "Admins can view all services"
  on public.services for select
  using (public.is_admin());

create policy "Admins can insert services"
  on public.services for insert
  with check (public.is_admin());

create policy "Admins can update services"
  on public.services for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete services"
  on public.services for delete
  using (public.is_admin());

-- =============================================================
-- 4) RESERVATIONS
-- =============================================================
-- Brecha corregida: el flujo publico de /reservar necesita crear reservas sin login.
drop policy if exists "Admins can view all reservations" on public.reservations;
drop policy if exists "Authenticated users can create reservations" on public.reservations;
drop policy if exists "Admins can update reservations" on public.reservations;

create policy "Admins can view all reservations"
  on public.reservations for select
  using (public.is_admin());

create policy "Anyone can create reservations"
  on public.reservations for insert
  with check (
    data_consent = true
    and (
      user_id is null
      or user_id = auth.uid()
    )
  );

create policy "Admins can update reservations"
  on public.reservations for update
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- 5) SUBSCRIPTIONS
-- =============================================================
drop policy if exists "Admins can view all subscriptions" on public.subscriptions;
drop policy if exists "Admins can update subscriptions" on public.subscriptions;

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

create policy "Admins can update subscriptions"
  on public.subscriptions for update
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- 6) TRANSACTIONS
-- =============================================================
drop policy if exists "Admins can view all transactions" on public.transactions;
drop policy if exists "Admins can insert transactions" on public.transactions;
drop policy if exists "Admins can update transactions" on public.transactions;

create policy "Admins can view all transactions"
  on public.transactions for select
  using (public.is_admin());

create policy "Admins can insert transactions"
  on public.transactions for insert
  with check (public.is_admin());

create policy "Admins can update transactions"
  on public.transactions for update
  using (public.is_admin())
  with check (public.is_admin());
