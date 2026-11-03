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
 * Obtiene las metricas del dashboard desde las vistas SQL
 * (v_dashboard_summary, v_monthly_income, v_service_mix).
 *
 * Las 3 consultas van en paralelo (un solo round trip efectivo) y las
 * vistas usan security_invoker, asi que respetan la RLS del admin.
 * Antes se invocaba la Edge Function `dashboard-metrics`, que sumaba un
 * salto extra (y arranque en frio) para calcular lo mismo.
 */
export async function getDashboardMetrics(): Promise<{
  data: DashboardMetrics | null;
  error: string | null;
}> {
  const supabase = await createClient();
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
    return { data: null, error: msg };
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
  };
}

