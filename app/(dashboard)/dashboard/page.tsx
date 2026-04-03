import { createClient } from "@/lib/supabase/server";

type ServiceJoin = {
  type: string;
  price: number;
};

type ActiveSubscriptionRow = {
  id: string;
  auto_renew: boolean;
  services: ServiceJoin | ServiceJoin[] | null;
};

function normalizeService(service: ServiceJoin | ServiceJoin[] | null): ServiceJoin | null {
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

  const activeSubscriptions = (subscriptionsData ?? []) as ActiveSubscriptionRow[];

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

  const oneTimeSubscriptions = activeSubscriptions.length - recurringSubscriptions;
  const monthlyIncome = (completedTransactions ?? []).reduce(
    (sum, transaction) => sum + Number(transaction.amount ?? 0),
    0
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        MRR incluye solo servicios de tipo manejo_redes.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">MRR (solo manejo_redes)</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(mrr)}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Ingresos del mes</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(monthlyIncome)}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Suscripciones activas recurrentes</p>
          <p className="mt-2 text-2xl font-bold">{recurringSubscriptions}</p>
        </article>

        <article className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Servicios unicos activos</p>
          <p className="mt-2 text-2xl font-bold">{oneTimeSubscriptions}</p>
        </article>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Reservas pendientes</p>
        <p className="mt-2 text-2xl font-bold">{pendingReservations ?? 0}</p>
      </div>
    </section>
  );
}
