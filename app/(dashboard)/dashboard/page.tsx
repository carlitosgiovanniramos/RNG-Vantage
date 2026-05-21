import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  Home,
  Repeat,
  TrendingUp,
} from "lucide-react";
import { DataCard } from "@/components/data-card";
import { DashboardCharts } from "@/components/dashboard-charts";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { getDashboardMetrics } from "./actions";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default async function DashboardPage() {
  const { data: metrics, error, source } = await getDashboardMetrics();

  if (error || !metrics) {
    return (
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/30">
          <p className="font-spaceGrotesk text-lg font-bold text-red-700 dark:text-red-300">
            Error al cargar métricas
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error ?? "No se pudieron obtener los datos del dashboard."}
          </p>
        </div>
      </section>
    );
  }

  const operationsSummary = [
    {
      label: "Suscripciones activas",
      value: metrics.active_subscriptions,
    },
    {
      label: "Recurrencia en manejo de redes",
      value: metrics.recurring_subscriptions,
    },
    {
      label: "Reservas por gestionar",
      value: metrics.pending_reservations,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-10 px-6 py-10 md:py-14">
      <RealtimeRefresher tables={["subscriptions", "transactions", "reservations"]} />
      <header className="relative overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-sm md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 left-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative space-y-6">
          <div className="space-y-2">
            <p className="font-spaceGrotesk text-[0.7rem] font-bold uppercase tracking-[0.22em] text-primary">
              Control estratégico
            </p>
            <h1 className="font-spaceGrotesk text-4xl font-black uppercase tracking-tight text-foreground md:text-5xl">
              Dashboard Administrativo
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Visualiza el rendimiento comercial de RGL Estudio con foco en
              ingresos, suscripciones y operaciones activas. El cálculo de MRR
              considera únicamente servicios de tipo manejo_redes.
            </p>
            {source === "edge-function" && (
              <span className="inline-flex items-center gap-1.5 rounded-none border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Edge Function activa
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center gap-2 border border-border/60 bg-background/85 px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-muted"
            >
              Panel principal
              <Home className="size-4" />
            </Link>
            <Link
              href="/reservas"
              className="inline-flex h-12 items-center gap-2 bg-primary px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ir a Reservas
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/servicios"
              className="inline-flex h-12 items-center gap-2 border border-border/60 bg-background/85 px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-muted"
            >
              Ir a Servicios
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/subscriptions"
              className="inline-flex h-12 items-center gap-2 border border-border/60 bg-background/85 px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-muted"
            >
              Ir a Suscripciones
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/transacciones"
              className="inline-flex h-12 items-center gap-2 bg-primary px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Consultar Transacciones
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DataCard
          title="MRR (solo manejo_redes)"
          value={formatCurrency(metrics.mrr)}
          icon={<Repeat className="size-5" />}
          className="xl:col-span-2"
        />
        <DataCard
          title="Ingresos del mes"
          value={formatCurrency(metrics.monthly_income)}
          icon={<TrendingUp className="size-5" />}
        />
        <DataCard
          title="Suscripciones recurrentes"
          value={metrics.recurring_subscriptions}
          icon={<CreditCard className="size-5" />}
        />
        <DataCard
          title="Servicios únicos activos"
          value={metrics.one_time_subscriptions}
          icon={<CalendarClock className="size-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <DataCard
          title="Reservas pendientes"
          value={metrics.pending_reservations}
          icon={<CalendarClock className="size-5" />}
        />
        <article className="relative overflow-hidden border border-border/60 bg-card/80 p-6 backdrop-blur-sm md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative space-y-5">
            <h2 className="font-spaceGrotesk text-lg font-black uppercase tracking-[0.12em] text-foreground">
              Resumen Operativo
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {operationsSummary.map((item) => (
                <div
                  key={item.label}
                  className="border border-border/50 bg-background/80 px-4 py-4"
                >
                  <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 font-spaceGrotesk text-2xl font-black text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <DashboardCharts
        monthlyIncome={metrics.monthly_income_series}
        serviceMix={metrics.service_mix}
      />
    </section>
  );
}
