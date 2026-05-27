-- Anade columnas de conciliacion para la pasarela de pagos (Kushki).
-- El flujo manual existente queda intacto: las transacciones sin pasarela
-- toman 'manual' por defecto.

alter table public.transactions
  add column if not exists gateway text not null default 'manual'
    check (gateway in ('manual', 'kushki'));

-- ID de transaccion que devuelve Kushki. Clave para conciliar el webhook.
alter table public.transactions
  add column if not exists gateway_transaction_id text;

-- Codigo de referencia que ve el cliente al hacer una transferencia bancaria.
alter table public.transactions
  add column if not exists gateway_reference text;

-- Estado crudo reportado por Kushki, para auditoria.
alter table public.transactions
  add column if not exists gateway_status text;

-- El webhook busca la transaccion por gateway_transaction_id.
-- Indice UNICO parcial: garantiza que un mismo pago de Kushki no se
-- registre dos veces y acelera el lookup. Las filas 'manual' (NULL)
-- quedan fuera del indice.
create unique index if not exists idx_transactions_gateway_txn
  on public.transactions(gateway_transaction_id)
  where gateway_transaction_id is not null;
