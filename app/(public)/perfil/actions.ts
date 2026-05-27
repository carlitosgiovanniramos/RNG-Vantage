"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kushkiFetch, KushkiApiError } from "@/lib/kushki/client";

/**
 * Cancela una suscripcion del propio cliente.
 *
 * La pertenencia se verifica filtrando por `user_id` (ademas la RLS
 * limita el SELECT a las suscripciones propias). Si la suscripcion
 * tiene un cobro recurrente en Kushki, se cancela primero alli para
 * detener los cobros automaticos.
 */
export async function cancelMySubscription(subscriptionId: string) {
  if (!subscriptionId || typeof subscriptionId !== "string") {
    return { success: false, error: "ID de suscripcion invalido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Debes iniciar sesion." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, gateway_subscription_id")
    .eq("id", subscriptionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return { success: false, error: "Suscripcion no encontrada." };
  }
  if (subscription.status === "cancelled") {
    return { success: false, error: "La suscripcion ya esta cancelada." };
  }

  // Cancelar primero en Kushki para detener los cobros automaticos.
  if (subscription.gateway_subscription_id) {
    try {
      // ATENCION: verificar el endpoint de cancelacion contra la doc
      // vigente de Kushki.
      await kushkiFetch(
        `/subscriptions/v1/card/${subscription.gateway_subscription_id}`,
        { method: "DELETE", auth: "private" },
      );
    } catch (err) {
      const message =
        err instanceof KushkiApiError
          ? `No se pudo cancelar el cobro recurrente: ${err.message}`
          : "No se pudo contactar a la pasarela de pago. Intenta nuevamente.";
      return { success: false, error: message };
    }
  }

  // El rol authenticated no puede actualizar suscripciones via RLS;
  // se usa el cliente admin tras verificar la pertenencia arriba.
  const supabaseAdmin = createAdminClient();
  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled", auto_renew: false })
    .eq("id", subscriptionId);

  if (updateError) {
    console.error(
      `[cancelMySubscription] Error cancelando ${subscriptionId}:`,
      updateError.message,
    );
    return { success: false, error: "Error al cancelar la suscripcion." };
  }

  revalidatePath("/perfil");
  return { success: true };
}

/**
 * Actualiza el metodo de pago (tarjeta) de una suscripcion recurrente
 * gestionada por Kushki. El `token` lo genera KushkiJS en el cliente.
 */
export async function updatePaymentMethod(input: {
  subscription_id: string;
  token: string;
}) {
  if (!input?.subscription_id || !input?.token) {
    return { success: false, error: "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Debes iniciar sesion." };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, gateway_subscription_id")
    .eq("id", input.subscription_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return { success: false, error: "Suscripcion no encontrada." };
  }
  if (!subscription.gateway_subscription_id) {
    return {
      success: false,
      error: "Esta suscripcion no tiene un cobro con tarjeta gestionado por Kushki.",
    };
  }

  try {
    // ATENCION: verificar el endpoint de actualizacion de tarjeta
    // contra la doc vigente de Kushki. Si Kushki no permite actualizar
    // la tarjeta de una suscripcion, la alternativa es cancelar y
    // volver a suscribir.
    await kushkiFetch(
      `/subscriptions/v1/card/${subscription.gateway_subscription_id}`,
      {
        method: "PUT",
        auth: "private",
        body: { token: input.token },
      },
    );
  } catch (err) {
    const message =
      err instanceof KushkiApiError
        ? `No se pudo actualizar la tarjeta: ${err.message}`
        : "No se pudo contactar a la pasarela de pago. Intenta nuevamente.";
    return { success: false, error: message };
  }

  return { success: true };
}
