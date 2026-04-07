import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CalendarClock, CreditCard, Repeat, TrendingUp } from "lucide-react";
import { DataCard } from "@/components/data-card";

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: subscriptionsData } = await supabase
    .from("subscriptions")
    .select("id, auto_renew, services(type, price)")
    .eq("status", "active");

  const { data: completedTransactions } = await supabase
    .from("transactions")
    .select("amount")
    .eq("status", "completed")
    .gte("created_at", monthStart.toISOString());

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
  const monthlyIncome = (
    (completedTransactions ?? []) as CompletedTransactionRow[]
  ).reduce(
    (sum: number, transaction: CompletedTransactionRow) =>
      sum + Number(transaction.amount ?? 0),
    0,
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        MRR incluye solo servicios de tipo manejo_redes.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="MRR (solo manejo_redes)"
          value={formatCurrency(mrr)}
          icon={<Repeat className="size-4" />}
        />
        <DataCard
          title="Ingresos del mes"
          value={formatCurrency(monthlyIncome)}
          icon={<TrendingUp className="size-4" />}
        />
        <DataCard
          title="Suscripciones recurrentes"
          value={recurringSubscriptions}
          icon={<CreditCard className="size-4" />}
        />
        <DataCard
          title="Servicios únicos activos"
          value={oneTimeSubscriptions}
          icon={<CalendarClock className="size-4" />}
        />
      </div>

      <div className="mt-4 max-w-sm">
        <DataCard
          title="Reservas pendientes"
          value={pendingReservations ?? 0}
          icon={<CalendarClock className="size-4" />}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/reservas"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ir a Reservas
        </Link>
        <Link
          href="/servicios"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Ir a Servicios
        </Link>
      </div>
    </section>
  );
}
