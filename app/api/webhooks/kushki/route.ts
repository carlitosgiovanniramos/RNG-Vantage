import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getKushkiConfig } from "@/lib/kushki/config";
import { kushkiWebhookSchema } from "@/lib/validators/payment";
import { mapKushkiStatus, isFinalTransactionStatus } from "@/lib/kushki/webhook";

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


export async function POST(req: Request) {
  // 1. Verificar el secreto compartido
  const config = getKushkiConfig();
  const providedSecret = req.headers.get("x-webhook-secret");

  if (!providedSecret || providedSecret !== config.webhookSecret) {
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

  const { data: transaction, error: lookupError } = await supabaseAdmin
    .from("transactions")
    .select("id, status, subscription_id")
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
    // No existe: anomalia. Se responde 200 para frenar los reintentos.
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

  // 5. Mapear estado y actualizar la transaccion
  const newStatus = mapKushkiStatus(event.status);

  await supabaseAdmin
    .from("transactions")
    .update({
      status: newStatus,
      gateway_status: event.status,
    })
    .eq("id", transaction.id);

  // 6. Si el pago fue aprobado, activar la suscripcion vinculada.
  // En fallo/expiracion la suscripcion se deja en 'pending' (el cliente
  // puede reintentar; el admin puede revisarla manualmente).
  if (newStatus === "completed" && transaction.subscription_id) {
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", transaction.subscription_id);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
