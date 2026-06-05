import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { getKushkiConfig } from "@/lib/kushki/config";
import { mapKushkiStatus, isFinalTransactionStatus } from "@/lib/kushki/webhook";

// Schema movido aqui para no depender de lib/validators/payment (refactor Payphone).
const kushkiStatuses = ["APPROVAL", "DECLINED", "INITIALIZED", "PENDING", "EXPIRED"] as const;
const kushkiWebhookSchema = z.object({
  transactionId: z.string().min(1),
  transactionReference: z.string().optional(),
  ticketNumber: z.string().optional(),
  status: z.enum(kushkiStatuses),
  paymentMethod: z.string().optional(),
  amount: z.number().optional(),
  subscriptionId: z.string().optional(),
  eventType: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
import { kushkiFetch } from "@/lib/kushki/client";
import type { KushkiTransactionStatus } from "@/lib/kushki/types";
import { sendEmail } from "@/lib/email/client";
import {
  paymentConfirmedEmail,
  paymentFailedEmail,
  recurringChargeReceiptEmail,
  recurringChargeFailedEmail,
} from "@/lib/email/templates";

/**
 * Webhook de Kushki: concilia el estado de los pagos.
 *
 * Lo usan sobre todo las transferencias bancarias (asincronas):
 * cuando el cliente completa la transferencia, Kushki notifica aqui
 * y la transaccion + suscripcion se actualizan automaticamente.
 *
 * Autenticacion: secreto compartido en el header `x-webhook-secret`,
 * configurado en la consola de Kushki al registrar el webhook.
 *
 * Idempotencia: si la transaccion ya esta en un estado final
 * (completed/failed/refunded) se responde 200 sin reprocesar.
 *
 * Kushki reintenta ante respuestas != 2xx; por eso los eventos
 * validos siempre responden 200 aunque no haya nada que actualizar.
 */

// Se usa el cliente admin (service role) -> runtime Node explicito.
export const runtime = "nodejs";

/** Comparacion en tiempo constante para evitar timing attacks. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Suma meses a una fecha ISO. */
function addMonths(isoDate: string, months: number): string {
  const date = new Date(isoDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

/** Obtiene el correo del cliente para las notificaciones (best-effort). */
async function getUserEmail(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string | null,
): Promise<string | null> {
  if (!userId) return null;
  try {
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Procesa el cobro de una suscripcion recurrente de Kushki.
 *
 * Los cobros mensuales llegan sin transaccion pre-creada: se inserta
 * una transaccion nueva vinculada a la suscripcion. El indice unico
 * sobre gateway_transaction_id garantiza la idempotencia ante webhooks
 * repetidos.
 */
async function handleRecurringCharge(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  event: {
    transactionId: string;
    subscriptionId: string;
    status: KushkiTransactionStatus;
  },
): Promise<NextResponse> {
  const { data: subscription, error: subLookupError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, service_id, ends_at")
    .eq("gateway_subscription_id", event.subscriptionId)
    .maybeSingle();

  if (subLookupError) {
    console.error(
      "[kushki-webhook] Error consultando la suscripcion:",
      subLookupError.message,
    );
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!subscription) {
    console.warn(
      `[kushki-webhook] Suscripcion no encontrada para subscriptionId=${event.subscriptionId}`,
    );
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Monto y duracion desde el servicio contratado.
  const { data: service } = await supabaseAdmin
    .from("services")
    .select("name, price, duration_months")
    .eq("id", subscription.service_id)
    .single();

  const newStatus = mapKushkiStatus(event.status);

  // Registrar el cobro. El indice unico sobre gateway_transaction_id
  // evita duplicados si Kushki reenvia el webhook.
  const { error: insertError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      amount: service?.price ?? 0,
      payment_method: "card",
      status: newStatus,
      gateway: "kushki",
      gateway_transaction_id: event.transactionId,
      gateway_status: event.status,
    });

  if (insertError) {
    // 23505 = violacion de unicidad -> el cobro ya se habia registrado.
    if (insertError.code === "23505") {
      return NextResponse.json(
        { received: true, idempotent: true },
        { status: 200 },
      );
    }
    console.error(
      "[kushki-webhook] Error registrando el cobro recurrente:",
      insertError.message,
    );
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  // Cobro aprobado -> extender la vigencia de la suscripcion.
  if (newStatus === "completed") {
    const duration = Math.max(service?.duration_months ?? 1, 1);
    const { error: extendError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "active",
        ends_at: addMonths(subscription.ends_at, duration),
      })
      .eq("id", subscription.id);

    if (extendError) {
      console.error(
        "[kushki-webhook] Error extendiendo la suscripcion:",
        extendError.message,
      );
      return NextResponse.json(
        { error: "Subscription update failed" },
        { status: 500 },
      );
    }
  }

  // Notificar al cliente del cobro recurrente (best-effort).
  // Si fue rechazado, este es el aviso de dunning.
  if (newStatus === "completed" || newStatus === "failed") {
    const customerEmail = await getUserEmail(supabaseAdmin, subscription.user_id);
    if (customerEmail) {
      const emailContent =
        newStatus === "completed"
          ? recurringChargeReceiptEmail({
              serviceName: service?.name,
              amount: service?.price ?? 0,
            })
          : recurringChargeFailedEmail({ serviceName: service?.name });
      await sendEmail({
        to: customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/**
 * Procesa un contracargo / disputa de Kushki: revierte el cobro
 * (transaccion -> refunded) y suspende la suscripcion vinculada para
 * que la pasarela no siga cobrando.
 */
async function handleChargeback(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  event: { transactionId: string; status: KushkiTransactionStatus },
): Promise<NextResponse> {
  const { data: transaction } = await supabaseAdmin
    .from("transactions")
    .select("id, subscription_id")
    .eq("gateway_transaction_id", event.transactionId)
    .maybeSingle();

  if (!transaction) {
    console.warn(
      `[kushki-webhook] Contracargo: transaccion no encontrada (${event.transactionId})`,
    );
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const { error: txError } = await supabaseAdmin
    .from("transactions")
    .update({
      status: "refunded",
      gateway_status: `chargeback:${event.status}`,
    })
    .eq("id", transaction.id);

  if (txError) {
    console.error(
      "[kushki-webhook] Error marcando el contracargo:",
      txError.message,
    );
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Suspender la suscripcion vinculada.
  if (transaction.subscription_id) {
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("id, gateway_subscription_id")
      .eq("id", transaction.subscription_id)
      .maybeSingle();

    // Si es recurrente, cancelar en Kushki para detener cobros futuros.
    if (subscription?.gateway_subscription_id) {
      try {
        await kushkiFetch(
          `/subscriptions/v1/card/${subscription.gateway_subscription_id}`,
          { method: "DELETE", auth: "private" },
        );
      } catch (err) {
        console.error(
          "[kushki-webhook] Error cancelando suscripcion tras contracargo:",
          err instanceof Error ? err.message : err,
        );
      }
    }

    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled", auto_renew: false })
      .eq("id", transaction.subscription_id);
  }

  console.warn(
    `[kushki-webhook] Contracargo procesado para transactionId=${event.transactionId}`,
  );
  return NextResponse.json({ received: true }, { status: 200 });
}

export async function POST(req: Request) {
  // 1. Verificar el secreto compartido
  const config = getKushkiConfig();
  const providedSecret = req.headers.get("x-webhook-secret");

  if (!providedSecret || !secretsMatch(providedSecret, config.webhookSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parsear y validar el payload
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = kushkiWebhookSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const event = parsed.data;

  // 3. Buscar la transaccion por el id de Kushki
  const supabaseAdmin = createAdminClient();

  // Contracargo / disputa: revierte el cobro y suspende la suscripcion.
  // ATENCION: verificar contra la doc de Kushki como notifica los
  // contracargos (nombre del campo y valor).
  if (event.eventType && event.eventType.toLowerCase() === "chargeback") {
    return handleChargeback(supabaseAdmin, {
      transactionId: event.transactionId,
      status: event.status,
    });
  }

  const { data: transaction, error: lookupError } = await supabaseAdmin
    .from("transactions")
    .select("id, status, subscription_id, user_id, amount")
    .eq("gateway_transaction_id", event.transactionId)
    .maybeSingle();

  if (lookupError) {
    // Error de BD: responder 500 para que Kushki reintente.
    console.error(
      "[kushki-webhook] Error consultando la transaccion:",
      lookupError.message,
    );
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!transaction) {
    // Sin transaccion previa: puede ser el cobro de una suscripcion
    // recurrente (Kushki cobra cada mes sin transaccion pre-creada).
    if (event.subscriptionId) {
      return handleRecurringCharge(supabaseAdmin, {
        transactionId: event.transactionId,
        subscriptionId: event.subscriptionId,
        status: event.status,
      });
    }
    // No existe y no es recurrente: anomalia. Se responde 200 para
    // frenar los reintentos.
    console.warn(
      `[kushki-webhook] Transaccion no encontrada para transactionId=${event.transactionId}`,
    );
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // 4. Idempotencia: estado final -> no reprocesar
  if (isFinalTransactionStatus(transaction.status)) {
    return NextResponse.json(
      { received: true, idempotent: true },
      { status: 200 },
    );
  }

  // 5. Mapear el estado de Kushki al estado interno.
  const newStatus = mapKushkiStatus(event.status);

  // 6. Si el pago fue aprobado, activar PRIMERO la suscripcion vinculada.
  // Se hace antes de marcar la transaccion como final: si esta
  // actualizacion falla y Kushki reintenta, la transaccion sigue sin ser
  // final y el evento se reprocesa por completo.
  // En fallo/expiracion la suscripcion se deja en 'pending'.
  if (newStatus === "completed" && transaction.subscription_id) {
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", transaction.subscription_id);

    if (subError) {
      console.error(
        "[kushki-webhook] Error activando la suscripcion:",
        subError.message,
      );
      return NextResponse.json(
        { error: "Subscription update failed" },
        { status: 500 },
      );
    }
  }

  // 7. Actualizar la transaccion. Si falla, se responde 500 para que
  // Kushki reintente (la transaccion sigue en un estado no final).
  const { error: updateError } = await supabaseAdmin
    .from("transactions")
    .update({
      status: newStatus,
      gateway_status: event.status,
    })
    .eq("id", transaction.id);

  if (updateError) {
    console.error(
      "[kushki-webhook] Error actualizando la transaccion:",
      updateError.message,
    );
    return NextResponse.json(
      { error: "Transaction update failed" },
      { status: 500 },
    );
  }

  // Notificar al cliente del resultado (best-effort). Aplica sobre todo
  // a transferencias, que se confirman de forma asincrona.
  if (newStatus === "completed" || newStatus === "failed") {
    const customerEmail = await getUserEmail(supabaseAdmin, transaction.user_id);
    if (customerEmail) {
      const emailContent =
        newStatus === "completed"
          ? paymentConfirmedEmail({ amount: transaction.amount })
          : paymentFailedEmail({});
      await sendEmail({
        to: customerEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
