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
 * usando vistas SQL precalculadas en vez de queries directas.
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

  const [summaryResult, incomeResult, mixResult] = await Promise.all([
    supabase.from("v_dashboard_summary").select("*").single(),
    supabase.from("v_monthly_income").select("*").order("month"),
    supabase.from("v_service_mix").select("*"),
  ]);

  if (summaryResult.error || incomeResult.error || mixResult.error) {
    const msg = [
      summaryResult.error?.message,
      incomeResult.error?.message,
      mixResult.error?.message,
    ]
      .filter(Boolean)
      .join("; ");
    return { data: null, error: msg, source: "fallback" };
  }

  const summary = summaryResult.data;

  // Construir serie de 6 meses (rellenar meses sin datos con 0)
  const incomeByMonth = new Map(
    (incomeResult.data ?? []).map((row: { month: string; total: number }) => [
      row.month,
      Number(row.total),
    ]),
  );

  function getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function formatMonthLabel(date: Date): string {
    return date.toLocaleString("es-EC", { month: "short" }).replace(".", "");
  }

  const monthlyIncomeSeries = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = getMonthKey(date);
    return {
      label: formatMonthLabel(date),
      value: incomeByMonth.get(key) ?? 0,
    };
  });

  const serviceMix = (mixResult.data ?? []).map(
    (row: { service_type: string; count: number }) => ({
      name: row.service_type.replace(/_/g, " "),
      value: Number(row.count),
    }),
  );

  return {
    data: {
      mrr: Number(summary.mrr),
      monthly_income: Number(summary.monthly_income),
      active_subscriptions: Number(summary.active_subscriptions),
      recurring_subscriptions: Number(summary.recurring_subscriptions),
      one_time_subscriptions: Number(summary.one_time_subscriptions),
      pending_reservations: Number(summary.pending_reservations),
      monthly_income_series: monthlyIncomeSeries,
      service_mix: serviceMix,
    },
    error: null,
    source: "fallback",
  };
}

