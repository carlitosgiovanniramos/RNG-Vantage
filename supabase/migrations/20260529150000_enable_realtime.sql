-- Habilita Supabase Realtime para las tablas que el dashboard admin
-- escucha (useAdminRealtime / realtime-refresher).
--
-- La publicacion `supabase_realtime` estaba vacia, por lo que NUNCA se
-- emitian eventos postgres_changes: el dashboard solo se actualizaba al
-- recargar la pagina. Al agregar las tablas, los INSERT/UPDATE/DELETE se
-- transmiten en vivo (respetando RLS: el admin ve todo, el cliente lo suyo).
--
-- REPLICA IDENTITY FULL permite que Realtime evalue RLS sobre el registro
-- completo en UPDATE/DELETE y entregue todas las columnas del cambio.

alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.reservations;
alter publication supabase_realtime add table public.subscriptions;

alter table public.transactions  replica identity full;
alter table public.reservations  replica identity full;
alter table public.subscriptions replica identity full;
