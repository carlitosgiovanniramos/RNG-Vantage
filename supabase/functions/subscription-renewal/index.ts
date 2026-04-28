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
  price: number;
};

type RenewableSubscription = {
  id: string;
  user_id: string;
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

Deno.serve(async (req) => {
  // CORS Headers y OPTIONS request para endpoints
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" }})
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Verificar la cabecera Authorization para garantizar que es un admin
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Cliente de Supabase usando el token del usuario actual para verificar sus permisos
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid JWT token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Verificamos rol a través de app_metadata (o consultando profiles)
  const role = user.app_metadata?.role;
  if (role !== "admin") {
    return new Response(
      JSON.stringify({ error: "Forbidden: Only admins can trigger subscription renewals" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Cliente con SERVICE_ROLE para poder bypassear RLS al actualizar registros globalmente
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, ends_at, auto_renew, services!inner(type, duration_months, price)")
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

      // PASO 2: Generar la nueva transacción (Recibo pendiente)
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          amount: service.price,
          status: "pending",
          payment_method: "pending",
        });

      if (transactionError) {
        failures.push(`transaction:${subscription.id}:${transactionError.message}`);
        // Nota: la suscripción sí se renovó su fecha, pero falló la creación del recibo.
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
