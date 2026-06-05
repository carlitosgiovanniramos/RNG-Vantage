"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscriptionSchema } from "@/lib/validators/subscription";
import {
  payphonePaymentSchema,
  manualTransferInitSchema,
} from "@/lib/validators/payment";
import { createPayphonePayment, PayphoneApiError } from "@/lib/payphone/client";
import { getPayphoneConfig } from "@/lib/payphone/config";


/**
 * Inicia un pago con tarjeta via Payphone.
 *
 * Flujo:
 *  1. Valida la entrada y autentica al usuario.
 *  2. Crea la suscripcion (pending) y la transaccion (pending, gateway 'payphone').
 *  3. Llama a Payphone para obtener la URL de pago.
 *  4. Devuelve la URL al cliente; el cliente redirige el navegador ahi.
 *  5. Payphone redirige de vuelta a /pago-respuesta donde se confirma el cobro.
 */
export async function initPayphonePayment(input: {
  service_id: string;
  auto_renew: boolean;
}) {
  const parsed = payphonePaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Datos de pago invalidos." };
  }
  const { service_id, auto_renew } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false as const, error: "Debes iniciar sesion para continuar." };
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();

  if (serviceError || !service) {
    return { success: false as const, error: "El servicio no existe o no pudo ser encontrado." };
  }
  if (!service.is_active) {
    return { success: false as const, error: "El servicio seleccionado no esta activo." };
  }

  // Solo manejo_redes admite renovacion automatica.
  const autoRenew = service.type === "manejo_redes" ? auto_renew : false;

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  const validation = createSubscriptionSchema.safeParse({
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: autoRenew,
  });
  if (!validation.success) {
    return { success: false as const, error: "Datos de suscripcion invalidos." };
  }

  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({ ...validation.data, status: "pending" })
    .select("id")
    .single();
  if (subscriptionError || !createdSubscription) {
    return { success: false as const, error: "Error al crear la suscripcion." };
  }

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
      gateway: "payphone",
    })
    .select("id")
    .single();
  if (transactionError || !createdTransaction) {
    return {
      success: false as const,
      error: "Error al crear la transaccion vinculada.",
      subscription_id: createdSubscription.id,
    };
  }

  const { responseUrl, cancellationUrl } = getPayphoneConfig();

  let payphoneRes: Awaited<ReturnType<typeof createPayphonePayment>>;
  try {
    payphoneRes = await createPayphonePayment({
      // Payphone recibe el monto en dolares enteros (USD): $50.00 → 50.
      amount: Math.round(service.price),
      // UUID sin guiones: evita errores de parsing en el servidor de Payphone.
      clientTransactionId: createdTransaction.id.replace(/-/g, ""),
      reference: service.name,
      email: user.email ?? "",
      responseUrl,
      cancellationUrl: `${cancellationUrl}?service_id=${service_id}&payment_cancelled=1`,
    });
  } catch (err) {
    const message =
      err instanceof PayphoneApiError
        ? err.message
        : "No se pudo iniciar el pago. Intenta nuevamente.";

    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed", gateway_status: "error:init" })
      .eq("id", createdTransaction.id);

    return {
      success: false as const,
      error: message,
      subscription_id: createdSubscription.id,
    };
  }

  // Guardar el ID de Payphone para poder confirmar en /pago-respuesta.
  await supabaseAdmin
    .from("transactions")
    .update({ gateway_transaction_id: String(payphoneRes.transactionId) })
    .eq("id", createdTransaction.id);

  return {
    success: true as const,
    paymentUrl: payphoneRes.paymentUrl,
    subscription_id: createdSubscription.id,
    transaction_id: createdTransaction.id,
  };
}

/** Bucket privado donde se guardan los comprobantes de transferencia. */
const RECEIPTS_BUCKET = "comprobantes";

const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

/**
 * Inicia un pago por transferencia bancaria MANUAL (sin pasarela).
 *
 * Crea la suscripcion (pending) y la transaccion (pending, gateway
 * 'manual', metodo 'transfer'). El cliente transfiere a la cuenta de RGL
 * y sube el comprobante. Ruth verifica y aprueba en el dashboard.
 */
export async function initManualTransfer(input: {
  service_id: string;
  auto_renew: boolean;
}) {
  const parsed = manualTransferInitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Datos de transferencia invalidos." };
  }
  const { service_id, auto_renew } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false as const, error: "Debes iniciar sesion para continuar." };
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();
  if (serviceError || !service) {
    return { success: false as const, error: "El servicio no existe o no pudo ser encontrado." };
  }
  if (!service.is_active) {
    return { success: false as const, error: "El servicio seleccionado no esta activo." };
  }

  const autoRenew = service.type === "manejo_redes" ? auto_renew : false;

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  const validation = createSubscriptionSchema.safeParse({
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: autoRenew,
  });
  if (!validation.success) {
    return { success: false as const, error: "Datos de suscripcion invalidos." };
  }

  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({ ...validation.data, status: "pending" })
    .select("id")
    .single();
  if (subscriptionError || !createdSubscription) {
    return { success: false as const, error: "Error al crear la suscripcion." };
  }

  const supabaseAdmin = createAdminClient();
  const { data: createdTransaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: user.id,
      subscription_id: createdSubscription.id,
      amount: service.price,
      payment_method: "transfer",
      status: "pending",
      gateway: "manual",
    })
    .select("id")
    .single();
  if (transactionError || !createdTransaction) {
    return {
      success: false as const,
      error: "Error al crear la transaccion vinculada.",
      subscription_id: createdSubscription.id,
    };
  }

  return {
    success: true as const,
    subscription_id: createdSubscription.id,
    transaction_id: createdTransaction.id,
    service: {
      name: service.name,
      price: service.price,
    },
  };
}

/**
 * Sube el comprobante de una transferencia manual al bucket privado.
 */
export async function uploadTransferReceipt(formData: FormData) {
  const transactionId = formData.get("transaction_id");
  const file = formData.get("file");

  if (typeof transactionId !== "string" || !transactionId) {
    return { success: false, error: "Transaccion invalida." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecciona una imagen del comprobante." };
  }
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return { success: false, error: "El comprobante debe ser una imagen (JPG, PNG o WEBP)." };
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return { success: false, error: "La imagen no puede superar los 5 MB." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Debes iniciar sesion para continuar." };
  }

  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, user_id, status, payment_method, gateway")
    .eq("id", transactionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!transaction) {
    return { success: false, error: "Transaccion no encontrada." };
  }
  if (transaction.gateway !== "manual" || transaction.payment_method !== "transfer") {
    return { success: false, error: "Esta transaccion no admite comprobante de transferencia." };
  }
  if (transaction.status !== "pending") {
    return { success: false, error: "Esta transaccion ya fue procesada." };
  }

  const extByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = extByType[file.type] ?? "jpg";
  const path = `${user.id}/${transactionId}-${Date.now()}.${ext}`;

  const supabaseAdmin = createAdminClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("[uploadTransferReceipt] Error al subir:", uploadError.message);
    return { success: false, error: "No se pudo subir el comprobante. Intenta nuevamente." };
  }

  const { error: updateError } = await supabaseAdmin
    .from("transactions")
    .update({ receipt_url: path })
    .eq("id", transactionId);

  if (updateError) {
    console.error("[uploadTransferReceipt] Error al guardar ruta:", updateError.message);
    return { success: false, error: "El comprobante se subio pero no se pudo registrar. Avisa al soporte." };
  }

  revalidatePath("/perfil");
  return { success: true };
}
