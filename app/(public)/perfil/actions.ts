"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cancela una suscripcion del propio cliente.
 *
 * Con Payphone no existe una API de cancelacion de suscripciones;
 * cada cobro es independiente. La cancelacion solo actualiza el estado
 * local y desactiva la renovacion automatica.
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
    .select("id, status")
    .eq("id", subscriptionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription) {
    return { success: false, error: "Suscripcion no encontrada." };
  }
  if (subscription.status === "cancelled") {
    return { success: false, error: "La suscripcion ya esta cancelada." };
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
