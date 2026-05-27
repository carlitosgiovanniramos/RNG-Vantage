/**
 * Edge Function: dashboard-metrics
 *
 * Centraliza el calculo de metricas financieras y operativas
 * del dashboard administrativo de RGL Estudio en una sola llamada.
 *
 * Metricas retornadas:
 *  - MRR (Monthly Recurring Revenue): ingresos recurrentes mensuales (solo manejo_redes)
 *  - Ingresos del mes actual (transacciones completadas)
 *  - Suscripciones activas (recurrentes vs unicas)
 *  - Reservas pendientes
 *  - Serie historica de ingresos (ultimos 6 meses) para grafico de barras
 *  - Mix de servicios activos para grafico de torta
 *
 * Seguridad:
 *  - Requiere JWT valido en Authorization header
 *  - Solo accesible para usuarios con rol "admin"
 *  - Usa SERVICE_ROLE_KEY para bypassear RLS en las consultas
 */

import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

// ---------- Tipos ----------

type MetricsResponse = {
  mrr: number;
  monthly_income: number;
  active_subscriptions: number;
  recurring_subscriptions: number;
  one_time_subscriptions: number;
  pending_reservations: number;
  monthly_income_series: { label: string; value: number }[];
  service_mix: { name: string; value: number }[];
};

// ---------- Helpers ----------

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date): string {
  return date
    .toLocaleString("es-EC", { month: "short" })
    .replace(".", "");
}

// ---------- Handler ----------

Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  // ----- Validar variables de entorno -----
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return jsonResponse(
      { error: "Missing required environment variables" },
      500,
    );
  }

  // ----- Autenticacion y autorizacion -----
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Unauthorized: Missing Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: "Unauthorized: Invalid JWT token" }, 401);
  }

  const role = user.app_metadata?.role;
  if (role !== "admin") {
    return jsonResponse(
      { error: "Forbidden: Only admins can access dashboard metrics" },
      403,
    );
  }

  // ----- Cliente con SERVICE_ROLE para bypass de RLS -----
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // ----- Calcular rangos de fecha -----
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // ----- Ejecutar las 3 queries en paralelo -----
  const [subscriptionsResult, transactionsResult, reservationsResult] =
    await Promise.all([
      // 1. Suscripciones activas con join de servicios
      supabase
        .from("subscriptions")
        .select("id, auto_renew, services(type, price)")
        .eq("status", "active"),

      // 2. Transacciones completadas de los ultimos 6 meses
      supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", chartStart.toISOString()),

      // 3. Conteo de reservas pendientes
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  if (subscriptionsResult.error) {
    return jsonResponse(
      { error: `Subscriptions query failed: ${subscriptionsResult.error.message}` },
      500,
    );
  }
  if (transactionsResult.error) {
    return jsonResponse(
      { error: `Transactions query failed: ${transactionsResult.error.message}` },
      500,
    );
  }
  if (reservationsResult.error) {
    return jsonResponse(
      { error: `Reservations query failed: ${reservationsResult.error.message}` },
      500,
    );
  }

  // ----- Procesar suscripciones -----
  type ServiceJoin = { type: string; price: number };
  type SubRow = { id: string; auto_renew: boolean; services: ServiceJoin | ServiceJoin[] | null };

  const subscriptions = (subscriptionsResult.data ?? []) as SubRow[];

  function normalizeService(s: ServiceJoin | ServiceJoin[] | null): ServiceJoin | null {
    if (!s) return null;
    return Array.isArray(s) ? s[0] ?? null : s;
  }

  let mrr = 0;
  let recurringSubscriptions = 0;
  const serviceMixCounts = new Map<string, number>();

  for (const sub of subscriptions) {
    const service = normalizeService(sub.services);
    if (!service) continue;

    // Contar mix de servicios
    serviceMixCounts.set(
      service.type,
      (serviceMixCounts.get(service.type) ?? 0) + 1,
    );

    // MRR solo para manejo_redes
    if (service.type === "manejo_redes") {
      mrr += Number(service.price ?? 0);
      recurringSubscriptions += 1;
    }
  }

  const activeSubscriptions = subscriptions.length;
  const oneTimeSubscriptions = activeSubscriptions - recurringSubscriptions;

  // ----- Procesar transacciones -----
  type TxRow = { amount: number | null; created_at: string };
  const transactions = (transactionsResult.data ?? []) as TxRow[];

  let monthlyIncome = 0;
  const incomeByMonth = new Map<string, number>();

  for (const tx of transactions) {
    const amount = Number(tx.amount ?? 0);
    const txDate = new Date(tx.created_at);
    const key = getMonthKey(txDate);

    incomeByMonth.set(key, (incomeByMonth.get(key) ?? 0) + amount);

    // Ingresos del mes actual
    if (txDate >= monthStart) {
      monthlyIncome += amount;
    }
  }

  // ----- Construir serie de ultimos 6 meses -----
  const monthlyIncomeSeries = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = getMonthKey(date);
    return {
      label: formatMonthLabel(date),
      value: Number(incomeByMonth.get(key) ?? 0),
    };
  });

  // ----- Construir mix de servicios -----
  const serviceMix = Array.from(serviceMixCounts.entries()).map(
    ([type, value]) => ({
      name: type.replace(/_/g, " "),
      value,
    }),
  );

  // ----- Respuesta -----
  const metrics: MetricsResponse = {
    mrr,
    monthly_income: monthlyIncome,
    active_subscriptions: activeSubscriptions,
    recurring_subscriptions: recurringSubscriptions,
    one_time_subscriptions: oneTimeSubscriptions,
    pending_reservations: reservationsResult.count ?? 0,
    monthly_income_series: monthlyIncomeSeries,
    service_mix: serviceMix,
  };

  return jsonResponse(metrics);
});
