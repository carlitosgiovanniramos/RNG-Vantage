import Link from "next/link";
import {
  CalendarClock,
  CreditCard,
  Layers,
  Repeat,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { DataCard } from "@/components/data-card";
import { DashboardCharts } from "@/components/dashboard-charts";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { getDashboardMetrics } from "./actions";

export default async function DashboardPage() {
  const { data: metrics, error } = await getDashboardMetrics();

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

  const now = new Date();
  const monthName = new Intl.DateTimeFormat("es-EC", { month: "long" }).format(now);
  const currentMonth = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${now.getFullYear()}`;

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10 md:py-12">
      <RealtimeRefresher tables={["subscriptions", "transactions", "reservations"]} />

      <header className="animate-rise relative overflow-hidden border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:p-8">
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative space-y-2">
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            Panel administrativo
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Resumen general
          </h1>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link
          href="/subscriptions"
          className="animate-rise relative overflow-hidden bg-primary p-6 text-primary-foreground md:p-8 lg:col-span-2"
          style={{ animationDelay: "80ms" }}
        >
          <div
            aria-hidden
            className="animate-float pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_left,black,transparent_70%)]"
          />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
              <Repeat className="size-4" />
              Ingreso recurrente mensual
            </span>
            <div>
              <AnimatedNumber
                value={metrics.mrr}
                format="currency"
                duration={1600}
                className="font-spaceGrotesk text-5xl font-bold tracking-tight tabular-nums md:text-6xl"
              />
              <p className="mt-2 text-sm text-primary-foreground/70">
                MRR · manejo de redes
              </p>
            </div>
          </div>
        </Link>

        <DataCard
          title="Ingresos del mes"
          value={metrics.monthly_income}
          format="currency"
          icon={<TrendingUp className="size-4" />}
          hint={currentMonth}
          href="/transacciones"
          delay={160}
          className="flex flex-col justify-between"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Suscripciones activas"
          value={metrics.active_subscriptions}
          icon={<Users className="size-4" />}
          href="/subscriptions"
          delay={240}
        />
        <DataCard
          title="Recurrentes"
          value={metrics.recurring_subscriptions}
          icon={<CreditCard className="size-4" />}
          href="/subscriptions"
          delay={300}
        />
        <DataCard
          title="Servicios únicos"
          value={metrics.one_time_subscriptions}
          icon={<Layers className="size-4" />}
          href="/servicios"
          delay={360}
        />
        <DataCard
          title="Reservas pendientes"
          value={metrics.pending_reservations}
          icon={<CalendarClock className="size-4" />}
          href="/reservas"
          delay={420}
          highlight
        />
      </div>

      <DashboardCharts
        monthlyIncome={metrics.monthly_income_series}
        serviceMix={metrics.service_mix}
      />
    </section>
  );
}
