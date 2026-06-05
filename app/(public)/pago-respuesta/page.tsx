import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { confirmPayphonePayment, PayphoneApiError } from "@/lib/payphone/client";
import { PAYPHONE_STATUS } from "@/lib/payphone/types";
import { sendEmail } from "@/lib/email/client";
import { paymentConfirmedEmail, paymentFailedEmail } from "@/lib/email/templates";

// Fuerza runtime Node para poder usar el cliente admin de Supabase.
export const runtime = "nodejs";

/** Obtiene el email del cliente para notificaciones (best-effort). */
async function getUserEmail(userId: string | null): Promise<string | null> {
  if (!userId) return null;
  try {
    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Confirma el pago con Payphone y actualiza la base de datos.
 *
 * Idempotente: si la transaccion ya esta en estado final se devuelve
 * el resultado almacenado sin volver a llamar a Payphone.
 */
async function processPayphoneReturn(params: {
  payphoneId: string;
  clientTransactionId: string;
}): Promise<
  | { outcome: "success"; serviceName?: string; amount?: number }
  | { outcome: "failed"; reason: string }
  | { outcome: "invalid" }
> {
  const { payphoneId, clientTransactionId } = params;

  // Validar que los parametros sean utilizables.
  const payphoneIdNum = parseInt(payphoneId, 10);
  if (isNaN(payphoneIdNum) || payphoneIdNum <= 0) {
    return { outcome: "invalid" };
  }

  const supabaseAdmin = createAdminClient();

  // Buscar la transaccion por el ID numerico que Payphone envia en ?id=
  // (guardado como gateway_transaction_id al crear el pago).
  const { data: transaction, error: txError } = await supabaseAdmin
    .from("transactions")
    .select("id, status, subscription_id, user_id, amount")
    .eq("gateway_transaction_id", String(payphoneIdNum))
    .maybeSingle();

  if (txError || !transaction) {
    return { outcome: "invalid" };
  }

  // Idempotencia: si ya esta en estado final mostrar el resultado guardado.
  if (transaction.status === "completed") {
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("service_id")
      .eq("id", transaction.subscription_id ?? "")
      .maybeSingle();
    const { data: svc } = sub?.service_id
      ? await supabaseAdmin
          .from("services")
          .select("name, price")
          .eq("id", sub.service_id)
          .maybeSingle()
      : { data: null };
    return { outcome: "success", serviceName: svc?.name, amount: svc?.price };
  }
  if (transaction.status === "failed" || transaction.status === "refunded") {
    return { outcome: "failed", reason: "El pago fue rechazado o cancelado." };
  }

  // Verificar el estado con Payphone antes de actualizar.
  let confirmed: Awaited<ReturnType<typeof confirmPayphonePayment>>;
  try {
    confirmed = await confirmPayphonePayment(payphoneIdNum, clientTransactionId);
  } catch (err) {
    const message =
      err instanceof PayphoneApiError
        ? err.message
        : "No se pudo verificar el pago con Payphone.";
    // Marcar como fallida para no dejar la transaccion en pending indefinidamente.
    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed", gateway_status: "error:confirm" })
      .eq("id", transaction.id);
    return { outcome: "failed", reason: message };
  }

  const approved = confirmed.statusCode === PAYPHONE_STATUS.APPROVED;
  const newStatus = approved ? "completed" : "failed";
  const gatewayStatus = approved
    ? `approved:${confirmed.authorizationCode ?? ""}`
    : `declined:${confirmed.statusMessage ?? ""}`;

  // Si fue aprobado, activar la suscripcion ANTES de marcar la transaccion
  // como final: si esto falla y Payphone reintenta el callback, la
  // transaccion sigue pendiente y se reprocesa correctamente.
  if (approved && transaction.subscription_id) {
    const { error: subError } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "active" })
      .eq("id", transaction.subscription_id);

    if (subError) {
      console.error(
        "[pago-respuesta] Error activando suscripcion:",
        subError.message,
      );
    }
  }

  await supabaseAdmin
    .from("transactions")
    .update({
      status: newStatus,
      gateway_status: gatewayStatus,
    })
    .eq("id", transaction.id);

  // Notificar al cliente (best-effort).
  const customerEmail = await getUserEmail(transaction.user_id);
  if (customerEmail) {
    const emailContent = approved
      ? paymentConfirmedEmail({ amount: transaction.amount })
      : paymentFailedEmail({});
    await sendEmail({
      to: customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    }).catch(() => {});
  }

  if (!approved) {
    return { outcome: "failed", reason: confirmed.statusMessage ?? "Pago rechazado." };
  }

  // Obtener nombre del servicio para la pantalla de exito.
  let serviceName: string | undefined;
  let servicePrice: number | undefined;
  if (transaction.subscription_id) {
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("service_id")
      .eq("id", transaction.subscription_id)
      .maybeSingle();
    if (sub?.service_id) {
      const { data: svc } = await supabaseAdmin
        .from("services")
        .select("name, price")
        .eq("id", sub.service_id)
        .maybeSingle();
      serviceName = svc?.name;
      servicePrice = svc?.price;
    }
  }

  return { outcome: "success", serviceName, amount: servicePrice };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PagoRespuestaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; clientTransactionId?: string }>;
}) {
  const params = await searchParams;

  const result = await processPayphoneReturn({
    payphoneId: params.id ?? "",
    clientTransactionId: params.clientTransactionId ?? "",
  });

  if (result.outcome === "invalid") {
    return (
      <ResultLayout>
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h1 className="mt-4 font-spaceGrotesk text-2xl font-black uppercase tracking-[0.1em]">
          Parametros invalidos
        </h1>
        <p className="mt-2 font-workSans text-sm text-muted-foreground">
          No se pudo identificar la transaccion. Si crees que esto es un error,
          contacta al soporte.
        </p>
        <LinkButton href="/checkout">Volver al inicio</LinkButton>
      </ResultLayout>
    );
  }

  if (result.outcome === "failed") {
    return (
      <ResultLayout>
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 font-spaceGrotesk text-2xl font-black uppercase tracking-[0.1em]">
          Pago no procesado
        </h1>
        <p className="mt-2 font-workSans text-sm text-muted-foreground">
          {result.reason}
        </p>
        <p className="mt-1 font-workSans text-xs text-muted-foreground">
          Puedes intentarlo de nuevo o elegir otro metodo de pago.
        </p>
        <LinkButton href="/checkout">Intentar de nuevo</LinkButton>
      </ResultLayout>
    );
  }

  return (
    <ResultLayout>
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
      <h1 className="mt-4 font-spaceGrotesk text-2xl font-black uppercase tracking-[0.1em]">
        ¡Pago aprobado!
      </h1>
      {result.serviceName && (
        <p className="mt-2 font-workSans text-sm text-muted-foreground">
          Tu suscripcion a{" "}
          <span className="font-semibold text-foreground">{result.serviceName}</span> ha
          sido activada exitosamente.
        </p>
      )}
      <p className="mt-1 font-workSans text-xs text-muted-foreground">
        Recibirás un correo de confirmacion en breve.
      </p>
      <LinkButton href="/perfil">Ver mis suscripciones</LinkButton>
    </ResultLayout>
  );
}

// ---------------------------------------------------------------------------
// UI helpers
// ---------------------------------------------------------------------------

function ResultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-2 text-center">{children}</div>
    </div>
  );
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-6 inline-flex h-11 items-center justify-center border border-primary bg-transparent px-6 font-spaceGrotesk text-sm font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </Link>
  );
}
