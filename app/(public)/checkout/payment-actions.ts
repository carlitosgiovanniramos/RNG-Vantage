"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscriptionSchema } from "@/lib/validators/subscription";
import { kushkiCardChargeSchema, kushkiTransferInitSchema } from "@/lib/validators/payment";
import { kushkiFetch, KushkiApiError } from "@/lib/kushki/client";
import type { KushkiChargeResponse, KushkiTransferResponse } from "@/lib/kushki/types";

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

/**
 * Inicia un pago por transferencia bancaria a traves de Kushki.
 *
 * A diferencia del cargo con tarjeta, la transferencia es ASINCRONA:
 * tras este init la transaccion queda en 'pending'. La confirmacion
 * real llega despues por el webhook (commit 6), cuando el cliente
 * completa la transferencia en su banco.
 *
 * Devuelve al cliente la URL de redireccion y/o el codigo de
 * referencia para que el usuario complete el pago (UI: commit 8).
 */
export async function initTransfer(input: {
  service_id: string;
  auto_renew: boolean;
  document_type: string;
  document_id: string;
  email: string;
}) {
  // 1. Validar entrada
  const parsed = kushkiTransferInitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de transferencia invalidos." };
  }
  const { service_id, auto_renew, document_type, document_id, email } = parsed.data;

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

  // 8. Crear transaccion (pending) con cliente admin (RLS)
  const supabaseAdmin = createAdminClient();

  const { data: createdTransaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: user.id,
      subscription_id: createdSubscription.id,
      amount: service.price,
      payment_method: "transfer",
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

  // 9. Iniciar la transferencia en Kushki
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let transfer: KushkiTransferResponse;
  try {
    transfer = await kushkiFetch<KushkiTransferResponse>("/transfer/v1/init", {
      method: "POST",
      auth: "private",
      body: {
        // ATENCION: el desglose de IVA debe confirmarse con la
        // contabilidad de Ruth (ver misma nota en chargeWithCard).
        amount: {
          subtotalIva: 0,
          subtotalIva0: service.price,
          ice: 0,
          iva: 0,
          currency: "USD",
        },
        callbackUrl: `${siteUrl}/checkout?service_id=${service_id}&transfer=return`,
        userType: "0", // 0 = persona natural
        documentType: document_type,
        documentNumber: document_id,
        email,
        paymentDescription: service.name,
      },
    });
  } catch (err) {
    // 9a. Fallo al iniciar -> transaccion failed
    const message =
      err instanceof KushkiApiError
        ? err.message
        : "No se pudo iniciar la transferencia. Intenta nuevamente.";

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

  // 10. Guardar referencias de Kushki. La transaccion SIGUE 'pending':
  // la confirma el webhook cuando el cliente complete la transferencia.
  await supabaseAdmin
    .from("transactions")
    .update({
      gateway_transaction_id: transfer.transactionId,
      gateway_reference: transfer.pendingReference ?? null,
      gateway_status: "INITIALIZED",
    })
    .eq("id", createdTransaction.id);

  // 11. Resultado: el cliente usa redirect_url o reference (UI commit 8)
  return {
    success: true,
    subscription_id: createdSubscription.id,
    transaction_id: createdTransaction.id,
    transfer: {
      redirect_url: transfer.redirectUrl ?? null,
      reference: transfer.pendingReference ?? null,
    },
    service: {
      name: service.name,
      price: service.price,
    },
  };
}
