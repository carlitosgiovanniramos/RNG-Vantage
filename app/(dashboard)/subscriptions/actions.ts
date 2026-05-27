"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kushkiFetch, KushkiApiError } from "@/lib/kushki/client";

/**
 * Verifica que el llamante sea un admin activo.
 */
async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.is_active === false) {
    return { error: "No autorizado" };
  }

  return { error: null };
}

/**
 * Cancela una suscripcion.
 *
 * Si la suscripcion tiene un cobro recurrente activo en Kushki
 * (`gateway_subscription_id`), primero se cancela en la pasarela para
 * detener los cobros automaticos. Solo si Kushki confirma la
 * cancelacion se marca la suscripcion local como `cancelled`.
 */
export async function cancelSubscription(subscriptionId: string) {
  if (!subscriptionId || typeof subscriptionId !== "string") {
    return { success: false, error: "ID de suscripcion invalido." };
  }

  const { error: authError } = await ensureAdmin();
  if (authError) return { success: false, error: authError };

  const supabaseAdmin = createAdminClient();

  // Obtener la suscripcion.
  const { data: subscription, error: getError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, status, gateway_subscription_id")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (getError || !subscription) {
    return { success: false, error: "Suscripcion no encontrada." };
  }

  if (subscription.status === "cancelled") {
    return { success: false, error: "La suscripcion ya esta cancelada." };
  }

  // Si hay un cobro recurrente en Kushki, cancelarlo PRIMERO. Si esto
  // falla no se cancela localmente: marcar la suscripcion como cancelada
  // mientras Kushki sigue cobrando seria peor que no hacer nada.
  if (subscription.gateway_subscription_id) {
    try {
      // ATENCION: verificar el endpoint exacto de cancelacion contra la
      // documentacion vigente de Kushki.
      await kushkiFetch(
        `/subscriptions/v1/card/${subscription.gateway_subscription_id}`,
        { method: "DELETE", auth: "private" },
      );
    } catch (err) {
      const message =
        err instanceof KushkiApiError
          ? `No se pudo cancelar el cobro recurrente en Kushki: ${err.message}`
          : "No se pudo contactar a la pasarela de pago. Intenta nuevamente.";
      return { success: false, error: message };
    }
  }

  // Cancelar la suscripcion local y desactivar la auto-renovacion.
  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled", auto_renew: false })
    .eq("id", subscriptionId);

  if (updateError) {
    console.error(
      `[cancelSubscription] Error al cancelar la suscripcion ${subscriptionId}:`,
      updateError.message,
    );
    return { success: false, error: "Error al cancelar la suscripcion." };
  }

  revalidatePath("/subscriptions");
  return { success: true };
}
