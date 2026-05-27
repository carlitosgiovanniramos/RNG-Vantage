"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markTransactionAsPaidSchema } from "@/lib/validators/transaction";
import { sendEmail } from "@/lib/email/client";
import { paymentConfirmedEmail } from "@/lib/email/templates";

/**
 * Tipo para una fila de transacción en la tabla
 */
type TransactionRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: "cash" | "transfer" | "card" | "pending";
  created_at: string;
  notes: string | null;
  client_name?: string;
};

/**
 * Server Action: Marcar una transacción como pagada
 * 
 * Cuando Ruth registra que un cliente ya pagó:
 * 1. Cambia la transacción a "completed"
 * 2. Activa automáticamente la suscripción asociada
 * 
 * @param data - { transaction_id, payment_method, notes? }
 */
export async function markTransactionAsCompleted(data: unknown) {
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
    .select("role, is_active")
    .eq("id", user.user.id)
    .single();

  if (profileError || profile?.role !== "admin" || profile?.is_active === false) {
    return {
      success: false,
      error: "Solo administradores pueden registrar pagos.",
    };
  }

  // PASO 2: Obtener la transacción para extraer el subscription_id
  const { data: transaction, error: getError } = await supabase
    .from("transactions")
    .select("id, subscription_id, status, user_id, amount")
    .eq("id", transaction_id)
    .single();

  if (getError || !transaction) {
    console.error("[markTransactionAsCompleted] Get error:", getError);
    return {
      success: false,
      error: "Transacción no encontrada.",
    };
  }

  if (transaction.status !== "pending") {
    return {
      success: false,
      error: "Esta transacción ya fue procesada.",
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
      return {
        success: false,
        error: "Pago registrado, pero hubo un error al activar la suscripción.",
      };
    }
  }

  // Notificar al cliente que su pago fue confirmado (best-effort).
  if (transaction.user_id) {
    try {
      const admin = createAdminClient();
      const { data: authUser } = await admin.auth.admin.getUserById(
        transaction.user_id,
      );
      const customerEmail = authUser?.user?.email;
      if (customerEmail) {
        const emailContent = paymentConfirmedEmail({ amount: transaction.amount });
        await sendEmail({
          to: customerEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }
    } catch (err) {
      console.error("[markTransactionAsCompleted] Error enviando correo:", err);
    }
  }

  return { success: true };
}

/**
 * Server Action: Obtener todas las transacciones
 * Ruth (admin) ve todas las transacciones del sistema
 */
export async function getTransactions() {
  const supabase = await createClient();

  // Verificar que el usuario es admin
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) {
    return { data: null, error: "No estás autenticado." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.user.id)
    .single();

  if (profile?.role !== "admin" || profile?.is_active === false) {
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

  const transactions = (data || []) as TransactionRow[];

  const userIds = Array.from(
    new Set(transactions.map((tx) => tx.user_id).filter(Boolean)),
  );

  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds)
    : { data: [] };

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  const withClientNames = transactions.map((tx) => {
    const profile = profilesById.get(tx.user_id);
    const clientName = profile
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : "";
    return {
      ...tx,
      client_name: clientName || "Sin cliente",
    };
  });

  return { data: withClientNames, error: null };
}

/**
 * Server Action: Marcar transacción como fallida/cancelada
 * 
 * Cambia el estado a "failed" si estaba "pending"
 * y cancela la suscripción asociada.
 */
export async function markTransactionAsFailed(transaction_id: string) {
  if (!transaction_id || typeof transaction_id !== "string") {
    return { success: false, error: "ID inválido." };
  }

  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) return { success: false, error: "No estás autenticado." };

  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.user.id).single();
  if (profile?.role !== "admin" || profile?.is_active === false) return { success: false, error: "No autorizado." };

  const { data: transaction, error: getError } = await supabase
    .from("transactions")
    .select("id, subscription_id, status")
    .eq("id", transaction_id)
    .single();

  if (getError || !transaction) return { success: false, error: "Transacción no encontrada." };
  if (transaction.status !== "pending") return { success: false, error: "La transacción ya no está pendiente." };

  const { error: updateTxError } = await supabase
    .from("transactions")
    .update({ status: "failed", notes: "Cancelada por admin" })
    .eq("id", transaction_id);

  if (updateTxError) return { success: false, error: "Error al cancelar la transacción." };

  if (transaction.subscription_id) {
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", transaction.subscription_id);
  }

  return { success: true };
}

/**
 * Server Action: Limpiar transacciones expiradas (> 24 horas pendientes)
 * 
 * Pasa las transacciones "pending" con más de 24 horas a "failed"
 * y sus suscripciones a "cancelled".
 */
export async function cleanExpiredTransactions() {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { success: false, error: "No estás autenticado." };

  const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.user.id).single();
  if (profile?.role !== "admin" || profile?.is_active === false) return { success: false, error: "No autorizado." };

  // Calcular la fecha hace 24 horas
  const date24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Buscar transacciones pendientes antiguas
  const { data: expiredTxs } = await supabase
    .from("transactions")
    .select("id, subscription_id")
    .eq("status", "pending")
    .lt("created_at", date24hAgo);

  if (!expiredTxs || expiredTxs.length === 0) {
    return { success: true, count: 0, message: "No hay transacciones expiradas." };
  }

  let count = 0;
  for (const tx of expiredTxs) {
    const { error: txError } = await supabase
      .from("transactions")
      .update({ status: "failed", notes: "Expirada (no se registró pago en 24h)" })
      .eq("id", tx.id);
      
    if (!txError) {
      if (tx.subscription_id) {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("id", tx.subscription_id);
      }
      count++;
    }
  }

  return { success: true, count, message: `Se limpiaron ${count} transacciones expiradas.` };
}
