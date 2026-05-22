-- Permite al administrador activar o desactivar clientes sin eliminar su historial.
alter table public.profiles
  add column if not exists is_active boolean not null default true;

create index if not exists idx_profiles_role_is_active
  on public.profiles(role, is_active);
