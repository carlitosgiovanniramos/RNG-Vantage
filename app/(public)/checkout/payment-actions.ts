"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSubscriptionSchema } from "@/lib/validators/subscription";
import {
  kushkiCardChargeSchema,
  kushkiTransferInitSchema,
  manualTransferInitSchema,
} from "@/lib/validators/payment";
import { kushkiFetch, KushkiApiError } from "@/lib/kushki/client";
import { sendEmail } from "@/lib/email/client";
import {
  paymentConfirmedEmail,
  subscriptionActivatedEmail,
} from "@/lib/email/templates";
import type {
  KushkiChargeResponse,
  KushkiTransferResponse,
  KushkiSubscriptionResponse,
} from "@/lib/kushki/types";

/**
 * Cobra una suscripcion con tarjeta a traves de Kushki.
 *
 * Flujo:
 *  1. Valida la entrada y autentica al usuario.
 *  2. Crea la suscripcion (pending) y la transaccion (pending, gateway 'kushki').
 *  3. Cobra en Kushki con el token tokenizado en el cliente (KushkiJS).
 *  4. Si Kushki aprueba: transaccion -> completed, suscripcion -> active.
 *     Si rechaza: transaccion -> failed y se devuelve el error.
 *
 * El cargo con tarjeta es SINCRONO: la respuesta HTTP de Kushki ya
 * indica aprobado/rechazado. El webhook (commit 6) sirve para
 * eventos posteriores (reembolsos, contracargos), no para confirmar.
 */
export async function chargeWithCard(input: {
  service_id: string;
  auto_renew: boolean;
  token: string;
}) {
  // 1. Validar entrada
  const parsed = kushkiCardChargeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de pago invalidos." };
  }
  const { service_id, auto_renew, token } = parsed.data;

  const supabase = await createClient();

  // 2. Usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesion para continuar." };
  }

  // 3. Servicio
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();

  if (serviceError || !service) {
    return { success: false, error: "El servicio no existe o no pudo ser encontrado." };
  }

  if (!service.is_active) {
    return { success: false, error: "El servicio seleccionado no esta activo." };
  }

  // 4. Logica de auto_renew (solo manejo_redes admite renovacion)
  let autoRenew = auto_renew;
  if (service.type !== "manejo_redes") {
    autoRenew = false;
  }

  // 5. Fechas
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  // 6. Validar datos de suscripcion
  const validation = createSubscriptionSchema.safeParse({
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: autoRenew,
  });

  if (!validation.success) {
    return { success: false, error: "Datos de suscripcion invalidos." };
  }

  // 7. Crear suscripcion (pending)
  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({ ...validation.data, status: "pending" })
    .select("id")
    .single();

  if (subscriptionError || !createdSubscription) {
    return { success: false, error: "Error al crear la suscripcion." };
  }

  // 8. Crear transaccion (pending) con cliente admin.
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
      gateway: "kushki",
    })
    .select("id")
    .single();

  if (transactionError || !createdTransaction) {
    return {
      success: false,
      error: "Error al crear la transaccion vinculada.",
      subscription_id: createdSubscription.id,
    };
  }

  // 9. Cobro en Kushki
  let charge: KushkiChargeResponse;
  try {
    charge = await kushkiFetch<KushkiChargeResponse>("/card/v1/charges", {
      method: "POST",
      auth: "private",
      body: {
        token,
        // ATENCION: el desglose de IVA debe confirmarse con la
        // contabilidad de Ruth. Aqui el precio completo se envia como
        // base sin IVA (subtotalIva0). Si el precio ya incluye IVA,
        // hay que separar iva/subtotalIva en el commit de ajuste fiscal.
        amount: {
          subtotalIva: 0,
          subtotalIva0: service.price,
          ice: 0,
          iva: 0,
          currency: "USD",
        },
      },
    });
  } catch (err) {
    // 9a. Cargo rechazado o fallo de red -> transaccion failed
    const message =
      err instanceof KushkiApiError
        ? err.message
        : "No se pudo procesar el pago. Intenta nuevamente.";

    await supabaseAdmin
      .from("transactions")
      .update({
        status: "failed",
        gateway_status:
          err instanceof KushkiApiError ? `error:${err.status}` : "error",
      })
      .eq("id", createdTransaction.id);

    return {
      success: false,
      error: message,
      subscription_id: createdSubscription.id,
      transaction_id: createdTransaction.id,
    };
  }

  // 10. Cargo aprobado -> actualizar transaccion y suscripcion.
  // El cliente YA fue cobrado: si estos updates fallan se devuelve exito
  // igualmente, pero se registra el error para reconciliacion manual.
  const { error: txUpdateError } = await supabaseAdmin
    .from("transactions")
    .update({
      status: "completed",
      gateway_transaction_id: charge.transactionReference,
      gateway_status: "APPROVAL",
    })
    .eq("id", createdTransaction.id);

  if (txUpdateError) {
    console.error(
      `[kushki] Cargo aprobado (ticket ${charge.ticketNumber}) pero fallo al actualizar la transaccion ${createdTransaction.id}:`,
      txUpdateError.message,
    );
  }

  // Suscripcion se activa con cliente admin: el rol authenticated
  // no debe poder auto-activar su propia suscripcion via RLS.
  const { error: subUpdateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", createdSubscription.id);

  if (subUpdateError) {
    console.error(
      `[kushki] Cargo aprobado pero fallo al activar la suscripcion ${createdSubscription.id}:`,
      subUpdateError.message,
    );
  }

  // Notificar al cliente (best-effort: nunca rompe el flujo de pago).
  if (user.email) {
    const emailContent = paymentConfirmedEmail({
      serviceName: service.name,
      amount: service.price,
    });
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  }

  // 11. Resultado
  return {
    success: true,
    subscription_id: createdSubscription.id,
    transaction_id: createdTransaction.id,
    ticket_number: charge.ticketNumber,
    service: {
      name: service.name,
      price: service.price,
    },
  };
}

/**
 * Inicia un pago por transferencia bancaria a traves de Kushki.
 *
 * A diferencia del cargo con tarjeta, la transferencia es ASINCRONA:
 * tras este init la transaccion queda en 'pending'. La confirmacion
 * real llega despues por el webhook (commit 6), cuando el cliente
 * completa la transferencia en su banco.
 *
 * Devuelve al cliente la URL de redireccion y/o el codigo de
 * referencia para que el usuario complete el pago (UI: commit 8).
 */
export async function initTransfer(input: {
  service_id: string;
  auto_renew: boolean;
  document_type: string;
  document_id: string;
  email: string;
}) {
  // 1. Validar entrada
  const parsed = kushkiTransferInitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de transferencia invalidos." };
  }
  const { service_id, auto_renew, document_type, document_id, email } = parsed.data;

  const supabase = await createClient();

  // 2. Usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesion para continuar." };
  }

  // 3. Servicio
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();

  if (serviceError || !service) {
    return { success: false, error: "El servicio no existe o no pudo ser encontrado." };
  }

  if (!service.is_active) {
    return { success: false, error: "El servicio seleccionado no esta activo." };
  }

  // 4. Logica de auto_renew (solo manejo_redes admite renovacion)
  let autoRenew = auto_renew;
  if (service.type !== "manejo_redes") {
    autoRenew = false;
  }

  // 5. Fechas
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  // 6. Validar datos de suscripcion
  const validation = createSubscriptionSchema.safeParse({
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: autoRenew,
  });

  if (!validation.success) {
    return { success: false, error: "Datos de suscripcion invalidos." };
  }

  // 7. Crear suscripcion (pending)
  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({ ...validation.data, status: "pending" })
    .select("id")
    .single();

  if (subscriptionError || !createdSubscription) {
    return { success: false, error: "Error al crear la suscripcion." };
  }

  // 8. Crear transaccion (pending) con cliente admin (RLS)
  const supabaseAdmin = createAdminClient();

  const { data: createdTransaction, error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: user.id,
      subscription_id: createdSubscription.id,
      amount: service.price,
      payment_method: "transfer",
      status: "pending",
      gateway: "kushki",
    })
    .select("id")
    .single();

  if (transactionError || !createdTransaction) {
    return {
      success: false,
      error: "Error al crear la transaccion vinculada.",
      subscription_id: createdSubscription.id,
    };
  }

  // 9. Iniciar la transferencia en Kushki
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let transfer: KushkiTransferResponse;
  try {
    transfer = await kushkiFetch<KushkiTransferResponse>("/transfer/v1/init", {
      method: "POST",
      auth: "private",
      body: {
        // ATENCION: el desglose de IVA debe confirmarse con la
        // contabilidad de Ruth (ver misma nota en chargeWithCard).
        amount: {
          subtotalIva: 0,
          subtotalIva0: service.price,
          ice: 0,
          iva: 0,
          currency: "USD",
        },
        callbackUrl: `${siteUrl}/checkout?service_id=${service_id}&transfer=return`,
        userType: "0", // 0 = persona natural
        documentType: document_type,
        documentNumber: document_id,
        email,
        paymentDescription: service.name,
      },
    });
  } catch (err) {
    // 9a. Fallo al iniciar -> transaccion failed
    const message =
      err instanceof KushkiApiError
        ? err.message
        : "No se pudo iniciar la transferencia. Intenta nuevamente.";

    await supabaseAdmin
      .from("transactions")
      .update({
        status: "failed",
        gateway_status:
          err instanceof KushkiApiError ? `error:${err.status}` : "error",
      })
      .eq("id", createdTransaction.id);

    return {
      success: false,
      error: message,
      subscription_id: createdSubscription.id,
      transaction_id: createdTransaction.id,
    };
  }

  // 10. Guardar referencias de Kushki. La transaccion SIGUE 'pending':
  // la confirma el webhook cuando el cliente complete la transferencia.
  await supabaseAdmin
    .from("transactions")
    .update({
      gateway_transaction_id: transfer.transactionId,
      gateway_reference: transfer.pendingReference ?? null,
      gateway_status: "INITIALIZED",
    })
    .eq("id", createdTransaction.id);

  // 11. Resultado: el cliente usa redirect_url o reference (UI commit 8)
  return {
    success: true,
    subscription_id: createdSubscription.id,
    transaction_id: createdTransaction.id,
    transfer: {
      redirect_url: transfer.redirectUrl ?? null,
      reference: transfer.pendingReference ?? null,
    },
    service: {
      name: service.name,
      price: service.price,
    },
  };
}

/**
 * Crea una suscripcion recurrente con tarjeta a traves de Kushki.
 *
 * A diferencia de `chargeWithCard` (cargo unico), crea una suscripcion
 * en Kushki: la pasarela cobra la tarjeta automaticamente cada mes y
 * notifica cada cobro por el webhook. Las transacciones de cada cobro
 * (incluido el primero) las registra el webhook, no esta accion.
 *
 * Solo aplica a servicios `manejo_redes` (los unicos recurrentes).
 */
export async function subscribeWithCard(input: {
  service_id: string;
  auto_renew: boolean;
  token: string;
}) {
  // 1. Validar entrada
  const parsed = kushkiCardChargeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de pago invalidos." };
  }
  const { service_id, token } = parsed.data;

  const supabase = await createClient();

  // 2. Usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Debes iniciar sesion para continuar." };
  }

  // 3. Servicio
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();
  if (serviceError || !service) {
    return { success: false, error: "El servicio no existe o no pudo ser encontrado." };
  }
  if (!service.is_active) {
    return { success: false, error: "El servicio seleccionado no esta activo." };
  }
  // Solo manejo_redes admite suscripcion recurrente.
  if (service.type !== "manejo_redes") {
    return { success: false, error: "Este servicio no admite suscripcion recurrente." };
  }

  // 4. Fechas
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  // 5. Validar datos de suscripcion
  const validation = createSubscriptionSchema.safeParse({
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: true,
  });
  if (!validation.success) {
    return { success: false, error: "Datos de suscripcion invalidos." };
  }

  // 6. Crear suscripcion (pending)
  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({ ...validation.data, status: "pending" })
    .select("id")
    .single();
  if (subscriptionError || !createdSubscription) {
    return { success: false, error: "Error al crear la suscripcion." };
  }

  // 7. Crear la suscripcion recurrente en Kushki
  let kushkiSubscription: KushkiSubscriptionResponse;
  try {
    kushkiSubscription = await kushkiFetch<KushkiSubscriptionResponse>(
      "/subscriptions/v1/card",
      {
        method: "POST",
        auth: "private",
        body: {
          token,
          planName: service.name,
          periodicity: "monthly",
          contactDetails: { email: user.email ?? "" },
          // ATENCION: revisar el desglose de IVA con la contabilidad.
          amount: {
            subtotalIva: 0,
            subtotalIva0: service.price,
            ice: 0,
            iva: 0,
            currency: "USD",
          },
        },
      },
    );
  } catch (err) {
    const message =
      err instanceof KushkiApiError
        ? err.message
        : "No se pudo crear la suscripcion. Intenta nuevamente.";
    return {
      success: false,
      error: message,
      subscription_id: createdSubscription.id,
    };
  }

  // 8. Guardar el ID de Kushki y activar la suscripcion (cliente admin).
  // Las transacciones de cada cobro las registra el webhook.
  const supabaseAdmin = createAdminClient();
  const { error: subUpdateError } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "active",
      gateway_subscription_id: kushkiSubscription.subscriptionId,
    })
    .eq("id", createdSubscription.id);

  if (subUpdateError) {
    console.error(
      `[kushki] Suscripcion creada en Kushki (${kushkiSubscription.subscriptionId}) pero fallo al actualizar la suscripcion ${createdSubscription.id}:`,
      subUpdateError.message,
    );
  }

  // Notificar al cliente (best-effort).
  if (user.email) {
    const emailContent = subscriptionActivatedEmail({
      serviceName: service.name,
      amount: service.price,
    });
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  }

  // 9. Resultado
  return {
    success: true,
    subscription_id: createdSubscription.id,
    gateway_subscription_id: kushkiSubscription.subscriptionId,
    service: {
      name: service.name,
      price: service.price,
    },
  };
}

/** Bucket privado donde se guardan los comprobantes de transferencia. */
const RECEIPTS_BUCKET = "comprobantes";

/** Tipos de imagen aceptados y tamano maximo del comprobante (5 MB). */
const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

/**
 * Inicia un pago por transferencia bancaria MANUAL (sin pasarela).
 *
 * Crea la suscripcion (pending) y la transaccion (pending, gateway
 * 'manual', metodo 'transfer'). El cliente transfiere a la cuenta de RGL
 * y sube el comprobante (ahora o luego). Ruth verifica el comprobante en
 * el dashboard y aprueba (completed) o rechaza (failed) la transaccion.
 *
 * No contacta a Kushki: la conciliacion es manual.
 */
export async function initManualTransfer(input: {
  service_id: string;
  auto_renew: boolean;
}) {
  // 1. Validar entrada
  const parsed = manualTransferInitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de transferencia invalidos." };
  }
  const { service_id, auto_renew } = parsed.data;

  const supabase = await createClient();

  // 2. Usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Debes iniciar sesion para continuar." };
  }

  // 3. Servicio
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", service_id)
    .single();
  if (serviceError || !service) {
    return { success: false, error: "El servicio no existe o no pudo ser encontrado." };
  }
  if (!service.is_active) {
    return { success: false, error: "El servicio seleccionado no esta activo." };
  }

  // 4. Logica de auto_renew (solo manejo_redes admite renovacion)
  let autoRenew = auto_renew;
  if (service.type !== "manejo_redes") {
    autoRenew = false;
  }

  // 5. Fechas
  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(startsAt.getMonth() + (service.duration_months || 1));

  // 6. Validar datos de suscripcion
  const validation = createSubscriptionSchema.safeParse({
    user_id: user.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    auto_renew: autoRenew,
  });
  if (!validation.success) {
    return { success: false, error: "Datos de suscripcion invalidos." };
  }

  // 7. Crear suscripcion (pending)
  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({ ...validation.data, status: "pending" })
    .select("id")
    .single();
  if (subscriptionError || !createdSubscription) {
    return { success: false, error: "Error al crear la suscripcion." };
  }

  // 8. Crear transaccion (pending, manual) con cliente admin (RLS).
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
      success: false,
      error: "Error al crear la transaccion vinculada.",
      subscription_id: createdSubscription.id,
    };
  }

  // 9. Resultado: el cliente ve la cuenta y sube el comprobante.
  return {
    success: true,
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
 *
 * Verifica que la transaccion pertenezca al usuario, este pendiente y sea
 * de tipo transferencia manual. La subida y la actualizacion se hacen con
 * el cliente admin (las politicas RLS impiden que el rol authenticated
 * escriba en transactions). El archivo se guarda en
 * `${user.id}/${transaction_id}-${timestamp}.<ext>`.
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

  // Verificar pertenencia y estado de la transaccion.
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

  // Subir al bucket privado con el cliente admin.
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
