"use server";

import { createClient } from "@/lib/supabase/server";
import { markTransactionAsPaidSchema } from "@/lib/validators/transaction";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server Action: Marcar una transacción como pagada
 * 
 * Cuando Ruth registra que un cliente ya pagó:
 * 1. Cambia la transacción a "completed"
 * 2. Activa automáticamente la suscripción asociada
 * 
 * @param data - { transaction_id, payment_method, notes? }
 * @returns { success: true } o { success: false, error: "..." }
 */
export async function markTransactionAsCompleted(
  data: unknown
): Promise<ActionResult> {
  const parsed = markTransactionAsPaidSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos. Verifica el formulario.",
    };
  }

  const { transaction_id, payment_method, notes } = parsed.data;

  const supabase = await createClient();

  // PASO 1: Verificar que el usuario es admin
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) {
    return { success: false, error: "No estás autenticado." };
  }

  // Verificar que es admin (consultando su rol en profiles)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return {
      success: false,
      error: "Solo administradores pueden registrar pagos.",
    };
  }

  // PASO 2: Obtener la transacción para extraer el subscription_id
  const { data: transaction, error: getError } = await supabase
    .from("transactions")
    .select("id, subscription_id, status")
    .eq("id", transaction_id)
    .single();

  if (getError || !transaction) {
    console.error("[markTransactionAsCompleted] Get error:", getError);
    return {
      success: false,
      error: "Transacción no encontrada.",
    };
  }

  // PASO 3: Actualizar la transacción a "completed"
  const { error: updateTransactionError } = await supabase
    .from("transactions")
    .update({
      status: "completed",
      payment_method: payment_method,
      ...(notes && { notes }),
    })
    .eq("id", transaction_id);

  if (updateTransactionError) {
    console.error(
      "[markTransactionAsCompleted] Update transaction error:",
      updateTransactionError.message
    );
    return {
      success: false,
      error: "No se pudo registrar el pago. Intenta nuevamente.",
    };
  }

  // PASO 4: Activar la suscripción asociada (cambiar a "active")
  if (transaction.subscription_id) {
    const { error: updateSubscriptionError } = await supabase
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", transaction.subscription_id);

    if (updateSubscriptionError) {
      console.error(
        "[markTransactionAsCompleted] Update subscription error:",
        updateSubscriptionError.message
      );
      // Nota: La transacción sí se marcó como pagada, pero falló la activación de la suscripción
      return {
        success: false,
        error: "Pago registrado, pero hubo un error al activar la suscripción.",
      };
    }
  }

  return { success: true };
}

/**
 * Tipo para una fila de transacción en la tabla
 */
export type TransactionRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: "cash" | "transfer" | "card" | "pending";
  created_at: string;
  notes: string | null;
};

/**
 * Server Action: Obtener todas las transacciones
 * Ruth (admin) ve todas las transacciones del sistema
 */
export async function getTransactions(): Promise<
  | { data: TransactionRow[]; error: null }
  | { data: null; error: string }
> {
  const supabase = await createClient();

  // Verificar que el usuario es admin
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) {
    return { data: null, error: "No estás autenticado." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.user.id)
    .single();

  if (profile?.role !== "admin") {
    return { data: null, error: "Solo administradores pueden ver transacciones." };
  }

  // Obtener todas las transacciones ordenadas por fecha (más recientes primero)
  const { data, error } = await supabase
    .from("transactions")
    .select("id, user_id, subscription_id, amount, status, payment_method, created_at, notes")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getTransactions] Error:", error.message);
    return { data: null, error: "No se pudo cargar las transacciones." };
  }

  return { data: (data || []) as TransactionRow[], error: null };
}
