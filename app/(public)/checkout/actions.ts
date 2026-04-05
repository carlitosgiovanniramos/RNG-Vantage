"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ServiceType } from "@/types";

function isRecurringService(type: ServiceType): boolean {
  return type === "manejo_redes";
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function buildCheckoutUrl(serviceId: string, params: Record<string, string>): string {
  const search = new URLSearchParams({ service_id: serviceId, ...params });
  return `/checkout?${search.toString()}`;
}

export async function createSubscriptionAction(formData: FormData) {
  const serviceId = (formData.get("service_id") as string | null)?.trim() ?? "";

  if (!serviceId) {
    redirect("/catalogo?error=service-missing");
  }

  const requestedAutoRenew = formData.get("auto_renew") === "on";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectPath = encodeURIComponent(`/checkout?service_id=${serviceId}`);
    redirect(`/login?redirect=${redirectPath}`);
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, type, price, duration_months, is_active")
    .eq("id", serviceId)
    .maybeSingle();

  if (serviceError || !service || !service.is_active) {
    redirect(buildCheckoutUrl(serviceId, { error: "service-not-found" }));
  }

  // Regla de negocio: solo manejo_redes es renovable.
  const autoRenew = isRecurringService(service.type) ? requestedAutoRenew : false;
  const startsAt = new Date();
  const endsAt = addMonths(startsAt, Math.max(service.duration_months, 1));

  let supabaseAdmin: ReturnType<typeof createAdminClient>;
  try {
    supabaseAdmin = createAdminClient();
  } catch {
    redirect(buildCheckoutUrl(serviceId, { error: "create-failed" }));
  }

  const { data: createdSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      service_id: service.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "pending", // Flujo correcto: pending -> admin confirma pago -> active
      auto_renew: autoRenew,
    })
    .select("id")
    .single();

  if (subscriptionError || !createdSubscription) {
    redirect(buildCheckoutUrl(serviceId, { error: "create-failed" }));
  }

  const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
    user_id: user.id,
    subscription_id: createdSubscription.id,
    amount: service.price,
    payment_method: "pending",
    status: "pending",
    notes: "Transaccion creada automaticamente desde checkout",
  });

  if (transactionError) {
    await supabaseAdmin.from("subscriptions").delete().eq("id", createdSubscription.id);
    redirect(buildCheckoutUrl(serviceId, { error: "transaction-failed" }));
  }

  redirect(buildCheckoutUrl(serviceId, { success: "1" }));
}
