-- =============================================================
-- RNG-Vantage: Correcciones de seguridad y lógica de negocio
-- Aplicado el 2026-04-04 vía Supabase MCP
-- Cubre todos los cambios post-auditoría de la DB
-- =============================================================


-- =============================================================
-- 1. CORRECCIÓN: DEFAULT de subscriptions.status
-- Era 'active', lo que activaba suscripciones sin confirmar pago.
-- Flujo correcto: checkout → 'pending' → admin confirma → 'active'
-- =============================================================
alter table public.subscriptions alter column status set default 'pending';


-- =============================================================
-- 2. CORRECCIÓN: Políticas admin — reemplazar EXISTS(profiles) por app_metadata
-- El patrón EXISTS(SELECT FROM profiles WHERE role='admin') causaba
-- recursión infinita en profiles y usaba el path incorrecto del JWT.
-- En Supabase, auth.jwt() ->> 'role' retorna 'authenticated', no el rol
-- personalizado. El path correcto es app_metadata que mapea a raw_app_meta_data.
-- =============================================================

-- PROFILES
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- RESERVATIONS
drop policy if exists "Admins can view all reservations" on public.reservations;
create policy "Admins can view all reservations"
  on public.reservations for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update reservations" on public.reservations;
create policy "Admins can update reservations"
  on public.reservations for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- SERVICES
drop policy if exists "Admins can view all services" on public.services;
create policy "Admins can view all services"
  on public.services for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can insert services" on public.services;
create policy "Admins can insert services"
  on public.services for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update services" on public.services;
create policy "Admins can update services"
  on public.services for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete services" on public.services;
create policy "Admins can delete services"
  on public.services for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- SUBSCRIPTIONS
drop policy if exists "Admins can view all subscriptions" on public.subscriptions;
create policy "Admins can view all subscriptions"
  on public.subscriptions for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update subscriptions" on public.subscriptions;
create policy "Admins can update subscriptions"
  on public.subscriptions for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- TRANSACTIONS
drop policy if exists "Admins can view all transactions" on public.transactions;
create policy "Admins can view all transactions"
  on public.transactions for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can insert transactions" on public.transactions;
create policy "Admins can insert transactions"
  on public.transactions for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update transactions" on public.transactions;
create policy "Admins can update transactions"
  on public.transactions for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- =============================================================
-- 3. CORRECCIÓN: Política INSERT de reservations
-- Bloqueaba usuarios anónimos. El formulario /reservar es público
-- y user_id es nullable para permitir submissions sin sesión.
-- Nuevo requisito mínimo: data_consent = true.
-- =============================================================
drop policy if exists "Authenticated users can create reservations" on public.reservations;
create policy "Anyone can create reservations"
  on public.reservations for insert to public
  with check (data_consent = true);


-- =============================================================
-- 4. CORRECCIÓN: Políticas de profiles — prevenir escalada de privilegios
-- Sin WITH CHECK, cualquier usuario podía hacer SET role='admin' en su propio perfil.
-- Se restringe a role='client' para usuarios normales.
-- Se agrega política de UPDATE para admins (faltaba completamente).
-- =============================================================
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id and role = 'client');

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'client');

create policy "Admins can update all profiles"
  on public.profiles for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- =============================================================
-- 5. FUNCIÓN + TRIGGER: Sincronizar profiles.role → raw_app_meta_data
-- Cuando un admin cambia profiles.role, el JWT debe reflejar el cambio.
-- El trigger propaga el nuevo role a auth.users.raw_app_meta_data,
-- que Supabase incluye como app_metadata en el JWT del siguiente login.
-- SECURITY DEFINER necesario para escribir en auth.users.
-- SET search_path evita vulnerabilidad de search_path injection.
-- =============================================================
create or replace function public.sync_profile_role_to_auth()
returns trigger as $$
begin
  if old.role is distinct from new.role then
    update auth.users
    set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.role)
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_sync_profile_role on public.profiles;
create trigger trg_sync_profile_role
  after update of role on public.profiles
  for each row
  execute function public.sync_profile_role_to_auth();


-- =============================================================
-- 6. CORRECCIÓN: handle_new_user — inicializar role en JWT desde el registro
-- La función original solo insertaba en profiles. Los usuarios nuevos
-- no tenían role en raw_app_meta_data hasta el primer UPDATE de perfil.
-- Ahora también inicializa role='client' en auth.users para que el JWT
-- sea consistente desde el primer login.
-- Actualizado de full_name → first_name + last_name (migración anterior).
-- =============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  update auth.users
  set raw_app_meta_data = raw_app_meta_data || '{"role": "client"}'::jsonb
  where id = new.id;

  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;


-- =============================================================
-- 7. FUNCIÓN + TRIGGER: Forzar auto_renew=false en servicios únicos
-- Regla de negocio: solo manejo_redes puede renovarse automáticamente.
-- auditoria, capacitacion y otro son pagos únicos → auto_renew siempre false.
-- SECURITY DEFINER para leer services sin restricción de RLS (is_active).
-- IS DISTINCT FROM maneja NULL correctamente si el servicio no existe.
-- =============================================================
create or replace function public.enforce_auto_renew_rule()
returns trigger as $$
declare
  service_type text;
begin
  select type into service_type from public.services where id = new.service_id;

  if service_type is distinct from 'manejo_redes' then
    new.auto_renew := false;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists trg_enforce_auto_renew on public.subscriptions;
create trigger trg_enforce_auto_renew
  before insert or update on public.subscriptions
  for each row
  execute function public.enforce_auto_renew_rule();


-- =============================================================
-- 8. CORRECCIÓN: handle_updated_at — search_path explícito
-- Función SECURITY INVOKER pero se añade search_path por consistencia
-- y para evitar el warning del linter de seguridad de Supabase.
-- =============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public, pg_temp;


-- =============================================================
-- 9. ÍNDICES DE RENDIMIENTO
-- Solo existían índices en PKs. Sin estos, cada query hace full table scan.
-- =============================================================
create index if not exists idx_subscriptions_user_id    on public.subscriptions(user_id);
create index if not exists idx_subscriptions_service_id on public.subscriptions(service_id);
create index if not exists idx_subscriptions_status     on public.subscriptions(status);

create index if not exists idx_transactions_user_id         on public.transactions(user_id);
create index if not exists idx_transactions_subscription_id on public.transactions(subscription_id);

create index if not exists idx_reservations_user_id on public.reservations(user_id);
create index if not exists idx_reservations_status  on public.reservations(status);

create index if not exists idx_services_is_active on public.services(is_active);
create index if not exists idx_services_type      on public.services(type);


-- =============================================================
-- 10. BACKFILL: Sincronizar role en raw_app_meta_data para usuarios existentes
-- Usuarios registrados antes del trigger no tienen role en su JWT.
-- Se sincroniza manualmente para consistencia.
-- =============================================================
update auth.users u
set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', p.role)
from public.profiles p
where p.id = u.id
  and (u.raw_app_meta_data ->> 'role') is distinct from p.role;
