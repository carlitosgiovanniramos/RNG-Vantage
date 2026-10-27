-- Agrega 'payphone' como valor permitido en la columna gateway de transactions.
-- El constraint anterior solo aceptaba 'manual' y 'kushki'.
-- Se conserva 'kushki' para no invalidar registros historicos.

alter table public.transactions
  drop constraint if exists transactions_gateway_check;

alter table public.transactions
  add constraint transactions_gateway_check
    check (gateway in ('manual', 'kushki', 'payphone'));
