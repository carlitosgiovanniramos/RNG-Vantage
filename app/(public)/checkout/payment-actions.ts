"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscriptionSchema } from "@/lib/validators/subscription";
import { kushkiCardChargeSchema } from "@/lib/validators/payment";
import { kushkiFetch, KushkiApiError } from "@/lib/kushki/client";
import type { KushkiChargeResponse } from "@/lib/kushki/types";

/**
 * Cobra una suscripcion con tarjeta a traves de Kushki.
 *
 * Flujo:
 *  1. Valida la entrada y autentica al usuario.
 *  2. Crea la suscripcion (pending) y la transaccion (pending, gateway 'kushki').
 *  3. Cobra en Kushki con el token tokenizado en el cliente (KushkiJS).
 *  4. Si Kushki aprueba: transaccion -> completed, suscripcion -> active.
 *     Si rechaza: transaccion -> failed y se devuelve el error.
 *
 * El cargo con tarjeta es SINCRONO: la respuesta HTTP de Kushki ya
 * indica aprobado/rechazado. El webhook (commit 6) sirve para
 * eventos posteriores (reembolsos, contracargos), no para confirmar.
 */
export async function chargeWithCard(input: {
  service_id: string;
  auto_renew: boolean;
  token: string;
}) {
  // 1. Validar entrada
  const parsed = kushkiCardChargeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de pago invalidos." };
  }
  const { service_id, auto_renew, token } = parsed.data;

  const supabase = await createClient();

  // 2. Usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesion para continuar." };
  }

  // 3. Servicio
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();

  if (serviceError || !service) {
    return { success: false, error: "El servicio no existe o no pudo ser encontrado." };
  }

  if (!service.is_active) {
    return { success: false, error: "El servicio seleccionado no esta activo." };
  }

  // 4. Logica de auto_renew (solo manejo_redes admite renovacion)
  let autoRenew = auto_renew;
  if (service.type !== "manejo_redes") {
    autoRenew = false;
  }

  // 5. Fechas
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  // 6. Validar datos de suscripcion
  const validation = createSubscriptionSchema.safeParse({
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: autoRenew,
  });

  if (!validation.success) {
    return { success: false, error: "Datos de suscripcion invalidos." };
  }

  // 7. Crear suscripcion (pending)
  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({ ...validation.data, status: "pending" })
    .select("id")
    .single();

  if (subscriptionError || !createdSubscription) {
    return { success: false, error: "Error al crear la suscripcion." };
  }

  // 8. Crear transaccion (pending) con cliente admin.
  // Las politicas RLS de "transactions" impiden insertar al rol authenticated.
  const supabaseAdmin = createAdminClient();

  const { data: createdTransaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: user.id,
      subscription_id: createdSubscription.id,
      amount: service.price,
      payment_method: "card",
      status: "pending",
      gateway: "kushki",
    })
    .select("id")
    .single();

  if (transactionError || !createdTransaction) {
    return {
      success: false,
      error: "Error al crear la transaccion vinculada.",
      subscription_id: createdSubscription.id,
    };
  }

  // 9. Cobro en Kushki
  let charge: KushkiChargeResponse;
  try {
    charge = await kushkiFetch<KushkiChargeResponse>("/card/v1/charges", {
      method: "POST",
      auth: "private",
      body: {
        token,
        // ATENCION: el desglose de IVA debe confirmarse con la
        // contabilidad de Ruth. Aqui el precio completo se envia como
        // base sin IVA (subtotalIva0). Si el precio ya incluye IVA,
        // hay que separar iva/subtotalIva en el commit de ajuste fiscal.
        amount: {
          subtotalIva: 0,
          subtotalIva0: service.price,
          ice: 0,
          iva: 0,
          currency: "USD",
        },
      },
    });
  } catch (err) {
    // 9a. Cargo rechazado o fallo de red -> transaccion failed
    const message =
      err instanceof KushkiApiError
        ? err.message
        : "No se pudo procesar el pago. Intenta nuevamente.";

    await supabaseAdmin
      .from("transactions")
      .update({
        status: "failed",
        gateway_status:
          err instanceof KushkiApiError ? `error:${err.status}` : "error",
      })
      .eq("id", createdTransaction.id);

    return {
      success: false,
      error: message,
      subscription_id: createdSubscription.id,
      transaction_id: createdTransaction.id,
    };
  }

  // 10. Cargo aprobado -> actualizar transaccion y suscripcion
  await supabaseAdmin
    .from("transactions")
    .update({
      status: "completed",
      gateway_transaction_id: charge.transactionReference,
      gateway_status: "APPROVAL",
    })
    .eq("id", createdTransaction.id);

  // Suscripcion se activa con cliente admin: el rol authenticated
  // no debe poder auto-activar su propia suscripcion via RLS.
  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", createdSubscription.id);

  // 11. Resultado
  return {
    success: true,
    subscription_id: createdSubscription.id,
    transaction_id: createdTransaction.id,
    ticket_number: charge.ticketNumber,
    service: {
      name: service.name,
      price: service.price,
    },
  };
}
