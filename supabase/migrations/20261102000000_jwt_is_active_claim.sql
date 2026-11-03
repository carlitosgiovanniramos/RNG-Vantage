-- =============================================================
-- RGL Estudio: is_active en el JWT (app_metadata)
--
-- El middleware y las server actions verifican al admin con
-- auth.getClaims() (JWT ES256 validado localmente). Para no consultar
-- profiles en cada navegacion, el JWT debe traer role e is_active.
--
-- Reemplaza sync_profile_role_to_auth (solo sincronizaba role) por
-- sync_profile_to_auth, que sincroniza ambos campos.
-- Nota: el cambio llega al JWT en el siguiente refresh del token (<= 1 h).
-- =============================================================

create or replace function public.sync_profile_to_auth()
returns trigger as $$
begin
  if old.role is distinct from new.role
     or old.is_active is distinct from new.is_active then
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', new.role, 'is_active', new.is_active)
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

revoke execute on function public.sync_profile_to_auth() from anon, authenticated, public;

drop trigger if exists trg_sync_profile_role on public.profiles;
drop trigger if exists trg_sync_profile_to_auth on public.profiles;
create trigger trg_sync_profile_to_auth
  after update of role, is_active on public.profiles
  for each row
  execute function public.sync_profile_to_auth();

drop function if exists public.sync_profile_role_to_auth();

-- Backfill: copia role e is_active actuales a todos los usuarios existentes
update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', p.role, 'is_active', p.is_active)
from public.profiles p
where p.id = u.id;
