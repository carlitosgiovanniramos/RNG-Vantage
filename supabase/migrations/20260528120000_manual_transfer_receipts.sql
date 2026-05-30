-- Transferencia manual con comprobante.
--
-- Flujo: el cliente transfiere a la cuenta de RGL Estudio y sube una
-- foto del comprobante. La transaccion queda 'pending' (gateway 'manual',
-- payment_method 'transfer') hasta que Ruth verifique el comprobante y la
-- apruebe (completed) o la rechace (failed) desde el dashboard.

-- Ruta del comprobante en el bucket privado 'comprobantes'.
-- NULL mientras el cliente no haya subido el comprobante ("subir luego").
alter table public.transactions
  add column if not exists receipt_url text;

-- Bucket privado para los comprobantes de transferencia.
-- Privado: las imagenes (datos financieros del cliente) solo se acceden
-- mediante URL firmada temporal generada en el servidor (cliente admin).
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

-- Las subidas y lecturas se hacen desde Server Actions con el cliente
-- admin (service_role, que omite RLS). Por eso NO se agregan politicas
-- de acceso publico al bucket: queda cerrado por defecto.
