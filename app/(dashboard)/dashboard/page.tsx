import { createClient } from "@/lib/supabase/server";
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

type ServiceJoin = {
  type: string;
  price: number;
};

type ActiveSubscriptionRow = {
  id: string;
  auto_renew: boolean;
  services: ServiceJoin | ServiceJoin[] | null;
};

type CompletedTransactionRow = {
  amount: number | null;
  created_at: string;
};

function normalizeService(
  service: ServiceJoin | ServiceJoin[] | null,
): ServiceJoin | null {
  if (!service) {
    return null;
  }

  return Array.isArray(service) ? (service[0] ?? null) : service;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatMonthLabel(date: Date): string {
  const label = date.toLocaleString("es-EC", { month: "short" });
  return label.replace(".", "");
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const chartStart = new Date(monthStart);
  chartStart.setMonth(chartStart.getMonth() - 5);

  const { data: subscriptionsData } = await supabase
    .from("subscriptions")
    .select("id, auto_renew, services(type, price)")
    .eq("status", "active");

  const { data: completedTransactions } = await supabase
    .from("transactions")
    .select("amount, created_at")
    .eq("status", "completed")
    .gte("created_at", chartStart.toISOString());

  const { count: pendingReservations } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  const activeSubscriptions = (subscriptionsData ??
    []) as ActiveSubscriptionRow[];

  const mrr = activeSubscriptions.reduce((total, subscription) => {
    const service = normalizeService(subscription.services);

    if (!service || service.type !== "manejo_redes") {
      return total;
    }

    return total + Number(service.price ?? 0);
  }, 0);

  const recurringSubscriptions = activeSubscriptions.filter((subscription) => {
    const service = normalizeService(subscription.services);
    return service?.type === "manejo_redes";
  }).length;

  const oneTimeSubscriptions =
    activeSubscriptions.length - recurringSubscriptions;
  const monthlyIncome = ((completedTransactions ?? []) as CompletedTransactionRow[])
    .filter((transaction) =>
      new Date(transaction.created_at) >= monthStart,
    )
    .reduce(
      (sum: number, transaction: CompletedTransactionRow) =>
        sum + Number(transaction.amount ?? 0),
      0,
    );

  const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });

  const incomeByMonth = ((completedTransactions ?? []) as CompletedTransactionRow[]).reduce(
    (acc, transaction) => {
      const date = new Date(transaction.created_at);
      const key = getMonthKey(date);
      acc.set(key, (acc.get(key) ?? 0) + Number(transaction.amount ?? 0));
      return acc;
    },
    new Map<string, number>(),
  );

  const monthlyIncomeSeries = lastSixMonths.map((date) => {
    const key = getMonthKey(date);
    return {
      label: formatMonthLabel(date),
      value: Number(incomeByMonth.get(key) ?? 0),
    };
  });

  const serviceMixCounts = activeSubscriptions.reduce(
    (acc, subscription) => {
      const service = normalizeService(subscription.services);
      if (!service) return acc;
      acc.set(service.type, (acc.get(service.type) ?? 0) + 1);
      return acc;
    },
    new Map<string, number>(),
  );

  const serviceMixSeries = Array.from(serviceMixCounts.entries()).map(
    ([type, value]) => ({
      name: type.replace(/_/g, " "),
      value,
    }),
  );
  const operationsSummary = [
    {
      label: "Suscripciones activas",
      value: activeSubscriptions.length,
    },
    {
      label: "Recurrencia en manejo de redes",
      value: recurringSubscriptions,
    },
    {
      label: "Reservas por gestionar",
      value: pendingReservations ?? 0,
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
          value={formatCurrency(mrr)}
          icon={<Repeat className="size-5" />}
          className="xl:col-span-2"
        />
        <DataCard
          title="Ingresos del mes"
          value={formatCurrency(monthlyIncome)}
          icon={<TrendingUp className="size-5" />}
        />
        <DataCard
          title="Suscripciones recurrentes"
          value={recurringSubscriptions}
          icon={<CreditCard className="size-5" />}
        />
        <DataCard
          title="Servicios únicos activos"
          value={oneTimeSubscriptions}
          icon={<CalendarClock className="size-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <DataCard
          title="Reservas pendientes"
          value={pendingReservations ?? 0}
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
        monthlyIncome={monthlyIncomeSeries}
        serviceMix={serviceMixSeries}
      />
    </section>
  );
}
