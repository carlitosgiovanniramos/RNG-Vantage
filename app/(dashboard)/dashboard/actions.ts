"use server";

import { createClient } from "@/lib/supabase/server";

export type DashboardMetrics = {
  mrr: number;
  monthly_income: number;
  active_subscriptions: number;
  recurring_subscriptions: number;
  one_time_subscriptions: number;
  pending_reservations: number;
  monthly_income_series: { label: string; value: number }[];
  service_mix: { name: string; value: number }[];
};

/**
 * Invoca la Edge Function `dashboard-metrics` para obtener
 * todas las metricas financieras y operativas en una sola llamada.
 *
 * Fallback: si la Edge Function no esta disponible (ej. desarrollo local),
 * ejecuta las queries directamente desde el server component.
 */
export async function getDashboardMetrics(): Promise<{
  data: DashboardMetrics | null;
  error: string | null;
  source: "edge-function" | "fallback";
}> {
  const supabase = await createClient();

  // Intentar invocar la Edge Function
  try {
    const { data, error } = await supabase.functions.invoke("dashboard-metrics", {
      method: "GET",
    });

    if (!error && data) {
      return { data: data as DashboardMetrics, error: null, source: "edge-function" };
    }

    // Si falla la Edge Function, usar fallback
    console.warn(
      "[dashboard-metrics] Edge Function no disponible, usando fallback:",
      error?.message ?? "Unknown error",
    );
  } catch (err) {
    console.warn(
      "[dashboard-metrics] Edge Function no disponible, usando fallback:",
      err instanceof Error ? err.message : err,
    );
  }

  // ---------- FALLBACK: queries directas ----------
  return getFallbackMetrics(supabase);
}

/**
 * Fallback que replica la logica de la Edge Function
 * ejecutando queries directas desde el server component.
 * Util para desarrollo local sin Supabase Edge Functions.
 */
async function getFallbackMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{
  data: DashboardMetrics | null;
  error: string | null;
  source: "fallback";
}> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [subscriptionsResult, transactionsResult, reservationsResult] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("id, auto_renew, services(type, price)")
        .eq("status", "active"),
      supabase
        .from("transactions")
        .select("amount, created_at")
        .eq("status", "completed")
        .gte("created_at", chartStart.toISOString()),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  if (subscriptionsResult.error || transactionsResult.error || reservationsResult.error) {
    const msg = [
      subscriptionsResult.error?.message,
      transactionsResult.error?.message,
      reservationsResult.error?.message,
    ]
      .filter(Boolean)
      .join("; ");
    return { data: null, error: msg, source: "fallback" };
  }

  // Procesar suscripciones
  type ServiceJoin = { type: string; price: number };
  type SubRow = {
    id: string;
    auto_renew: boolean;
    services: ServiceJoin | ServiceJoin[] | null;
  };

  const subscriptions = (subscriptionsResult.data ?? []) as SubRow[];

  function normalizeService(
    s: ServiceJoin | ServiceJoin[] | null,
  ): ServiceJoin | null {
    if (!s) return null;
    return Array.isArray(s) ? (s[0] ?? null) : s;
  }

  let mrr = 0;
  let recurringSubscriptions = 0;
  const serviceMixCounts = new Map<string, number>();

  for (const sub of subscriptions) {
    const service = normalizeService(sub.services);
    if (!service) continue;

    serviceMixCounts.set(
      service.type,
      (serviceMixCounts.get(service.type) ?? 0) + 1,
    );

    if (service.type === "manejo_redes") {
      mrr += Number(service.price ?? 0);
      recurringSubscriptions += 1;
    }
  }

  // Procesar transacciones
  type TxRow = { amount: number | null; created_at: string };
  const transactions = (transactionsResult.data ?? []) as TxRow[];

  let monthlyIncome = 0;
  const incomeByMonth = new Map<string, number>();

  function getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function formatMonthLabel(date: Date): string {
    return date.toLocaleString("es-EC", { month: "short" }).replace(".", "");
  }

  for (const tx of transactions) {
    const amount = Number(tx.amount ?? 0);
    const txDate = new Date(tx.created_at);
    const key = getMonthKey(txDate);

    incomeByMonth.set(key, (incomeByMonth.get(key) ?? 0) + amount);

    if (txDate >= monthStart) {
      monthlyIncome += amount;
    }
  }

  const monthlyIncomeSeries = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = getMonthKey(date);
    return {
      label: formatMonthLabel(date),
      value: Number(incomeByMonth.get(key) ?? 0),
    };
  });

  const serviceMix = Array.from(serviceMixCounts.entries()).map(
    ([type, value]) => ({
      name: type.replace(/_/g, " "),
      value,
    }),
  );

  return {
    data: {
      mrr,
      monthly_income: monthlyIncome,
      active_subscriptions: subscriptions.length,
      recurring_subscriptions: recurringSubscriptions,
      one_time_subscriptions: subscriptions.length - recurringSubscriptions,
      pending_reservations: reservationsResult.count ?? 0,
      monthly_income_series: monthlyIncomeSeries,
      service_mix: serviceMix,
    },
    error: null,
    source: "fallback",
  };
}
