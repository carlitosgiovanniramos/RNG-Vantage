-- =============================================================
-- RGL Estudio: listado de clientes con email en una sola consulta
--
-- La vista de Clientes traia los perfiles y luego llamaba a
-- auth.admin.listUsers (hasta 1000 usuarios) solo para obtener emails.
-- Esta funcion une profiles + auth.users dentro de Postgres.
--
-- SECURITY DEFINER para poder leer auth.users; por eso valida el rol
-- admin del JWT (mismo criterio que las politicas RLS de admin).
-- =============================================================

create or replace function public.admin_list_clients()
returns table (
  id uuid,
  first_name text,
  last_name text,
  email text,
  role text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    p.id,
    p.first_name,
    p.last_name,
    coalesce(u.email, 'Sin email')::text as email,
    p.role::text,
    p.is_active,
    p.created_at,
    p.updated_at
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p.role = 'client'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  order by p.created_at desc;
$$;

revoke execute on function public.admin_list_clients() from anon, public;
grant execute on function public.admin_list_clients() to authenticated;
