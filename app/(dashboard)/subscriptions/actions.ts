"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

async function ensureAdmin() {
  const supabase = await createClient();
  const { isAdmin } = await getAdminSession(supabase);
  if (!isAdmin) return { error: "No autorizado" };

  return { error: null };
}

/**
 * Cancela una suscripcion (admin).
 *
 * Con Payphone no existe una API de cancelacion de suscripciones;
 * cada cobro es independiente. La cancelacion solo actualiza el estado
 * local y desactiva la renovacion automatica.
 */
export async function cancelSubscription(subscriptionId: string) {
  if (!subscriptionId || typeof subscriptionId !== "string") {
    return { success: false, error: "ID de suscripcion invalido." };
  }

  const { error: authError } = await ensureAdmin();
  if (authError) return { success: false, error: authError };

  const supabaseAdmin = createAdminClient();

  const { data: subscription, error: getError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, status")
    .eq("id", subscriptionId)
    .maybeSingle();

  if (getError || !subscription) {
    return { success: false, error: "Suscripcion no encontrada." };
  }
  if (subscription.status === "cancelled") {
    return { success: false, error: "La suscripcion ya esta cancelada." };
  }

  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled", auto_renew: false })
    .eq("id", subscriptionId);

  if (updateError) {
    console.error(
      `[cancelSubscription] Error al cancelar ${subscriptionId}:`,
      updateError.message,
    );
    return { success: false, error: "Error al cancelar la suscripcion." };
  }

  revalidatePath("/subscriptions");
  return { success: true };
}
