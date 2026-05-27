-- Almacena el ID de la suscripcion recurrente de Kushki.
--
-- Cuando un cliente paga un servicio manejo_redes con tarjeta y
-- auto-renovacion, Kushki crea una suscripcion que cobra la tarjeta
-- automaticamente cada mes. Este ID permite conciliar cada cobro
-- recurrente cuando llega por el webhook.

alter table public.subscriptions
  add column if not exists gateway_subscription_id text;

-- El webhook busca la suscripcion por este ID en cada cobro recurrente.
-- Indice unico parcial: una fila por suscripcion de Kushki.
create unique index if not exists idx_subscriptions_gateway_sub
  on public.subscriptions(gateway_subscription_id)
  where gateway_subscription_id is not null;
