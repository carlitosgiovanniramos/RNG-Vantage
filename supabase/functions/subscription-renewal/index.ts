import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  serve: (handler: () => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

type ServiceInfo = {
  type: string;
  duration_months: number;
};

type RenewableSubscription = {
  id: string;
  ends_at: string;
  auto_renew: boolean;
  services: ServiceInfo | ServiceInfo[] | null;
};

function normalizeService(service: ServiceInfo | ServiceInfo[] | null): ServiceInfo | null {
  if (!service) {
    return null;
  }

  return Array.isArray(service) ? (service[0] ?? null) : service;
}

function addMonths(isoDate: string, months: number): string {
  const date = new Date(isoDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, ends_at, auto_renew, services!inner(type, duration_months)")
    .eq("status", "active")
    .lte("ends_at", now);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subscriptions = (data ?? []) as RenewableSubscription[];
  let renewed = 0;
  let expired = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const subscription of subscriptions) {
    const service = normalizeService(subscription.services);

    if (!service) {
      skipped += 1;
      continue;
    }

    // Regla de negocio: solo manejo_redes puede renovarse.
    const canRenewByType = service.type === "manejo_redes";

    if (subscription.auto_renew && canRenewByType) {
      const duration = Math.max(service.duration_months, 1);
      const nextEndsAt = addMonths(subscription.ends_at, duration);

      const { error: renewError } = await supabase
        .from("subscriptions")
        .update({ ends_at: nextEndsAt, status: "active" })
        .eq("id", subscription.id);

      if (renewError) {
        failures.push(`renew:${subscription.id}:${renewError.message}`);
        continue;
      }

      renewed += 1;
      continue;
    }

    const { error: expireError } = await supabase
      .from("subscriptions")
      .update({ status: "expired", auto_renew: false })
      .eq("id", subscription.id);

    if (expireError) {
      failures.push(`expire:${subscription.id}:${expireError.message}`);
      continue;
    }

    expired += 1;
  }

  return new Response(
    JSON.stringify({
      processed: subscriptions.length,
      renewed,
      expired,
      skipped,
      failures,
    }),
    {
      status: failures.length > 0 ? 207 : 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
