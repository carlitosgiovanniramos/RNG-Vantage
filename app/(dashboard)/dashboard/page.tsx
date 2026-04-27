"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  Home,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import { DataCard } from "@/components/data-card";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { createClient } from "@/lib/supabase/client";
import { CHART_COLORS } from "@/lib/design-tokens";
import type { Database, TransactionStatus } from "@/types/database";

type ServiceJoin = {
  type: string;
  name: string;
  price: number;
};

type SubscriptionJoin = {
  id: string;
  services: ServiceJoin | ServiceJoin[] | null;
};

type SubscriptionRow = {
  id: string;
  auto_renew: boolean;
  services: ServiceJoin | ServiceJoin[] | null;
};

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"] & {
  subscriptions: SubscriptionJoin | SubscriptionJoin[] | null;
};

type DashboardMetrics = {
  subscriptions: SubscriptionRow[];
  pendingReservations: number;
  transactions: TransactionRow[];
};

type MonthlyIncome = {
  month: string;
  income: number;
};

type ServiceProfitability = {
  name: string;
  value: number;
  fill: string;
};

type RecentTransaction = Record<string, unknown> & {
  id: string;
  amount: number;
  payment_method: string;
  status: TransactionStatus;
  created_at: string;
  serviceType: string;
};

const SERVICE_LABELS: Record<string, string> = {
  manejo_redes: "Manejo de redes",
  auditoria: "Auditoria",
  capacitacion: "Capacitacion",
  otro: "Otro",
  sin_servicio: "Sin servicio",
};

const PIE_COLORS = [
  CHART_COLORS.income,
  CHART_COLORS.subscriptions,
  CHART_COLORS.reservations,
  CHART_COLORS.growth,
  CHART_COLORS.expense,
];

function normalizeService(
  service: ServiceJoin | ServiceJoin[] | null,
): ServiceJoin | null {
  if (!service) {
    return null;
  }

  return Array.isArray(service) ? (service[0] ?? null) : service;
}

function normalizeSubscription(
  subscription: SubscriptionJoin | SubscriptionJoin[] | null,
): SubscriptionJoin | null {
  if (!subscription) {
    return null;
  }

  return Array.isArray(subscription) ? (subscription[0] ?? null) : subscription;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("es-EC", {
    month: "short",
  }).format(date);
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getServiceType(transaction: TransactionRow): string {
  const subscription = normalizeSubscription(transaction.subscriptions);
  const service = normalizeService(subscription?.services ?? null);

  return service?.type ?? "sin_servicio";
}

async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [subscriptionsResult, reservationsResult, transactionsResult] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("id, auto_renew, services(type, name, price)")
        .eq("status", "active"),
      supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("transactions")
        .select(
          "id, user_id, subscription_id, amount, payment_method, status, notes, created_at, updated_at, subscriptions(id, services(type, name, price))",
        )
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: false }),
    ]);

  const error =
    subscriptionsResult.error ??
    reservationsResult.error ??
    transactionsResult.error;

  if (error) {
    throw new Error(error.message);
  }

  return {
    subscriptions: (subscriptionsResult.data ?? []) as SubscriptionRow[],
    pendingReservations: reservationsResult.count ?? 0,
    transactions: (transactionsResult.data ?? []) as TransactionRow[],
  };
}

function DashboardChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="min-h-[340px] border border-border/60 bg-card/85 p-5 backdrop-blur-sm md:p-6">
      <h2 className="font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-foreground">
        {title}
      </h2>
      <div className="mt-6 h-64">{children}</div>
    </article>
  );
}

export default function DashboardPage() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<DashboardMetrics, Error>({
    queryKey: ["dashboard-financial-metrics"],
    queryFn: getDashboardMetrics,
  });

  const subscriptions = data?.subscriptions ?? [];
  const transactions = data?.transactions ?? [];
  const completedTransactions = transactions.filter(
    (transaction) => transaction.status === "completed",
  );

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthlyIncome = completedTransactions
    .filter((transaction) => new Date(transaction.created_at) >= monthStart)
    .reduce((sum, transaction) => sum + Number(transaction.amount ?? 0), 0);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    date.setDate(1);

    return {
      key: getMonthKey(date),
      month: formatMonth(date),
      income: 0,
    };
  });

  const monthMap = new Map(months.map((month) => [month.key, month]));

  completedTransactions.forEach((transaction) => {
    const key = getMonthKey(new Date(transaction.created_at));
    const month = monthMap.get(key);

    if (month) {
      month.income += Number(transaction.amount ?? 0);
    }
  });

  const monthlyChartData: MonthlyIncome[] = months.map(({ month, income }) => ({
    month,
    income,
  }));

  const totals = new Map<string, number>();

  completedTransactions.forEach((transaction) => {
    const serviceType = getServiceType(transaction);
    totals.set(
      serviceType,
      (totals.get(serviceType) ?? 0) + Number(transaction.amount ?? 0),
    );
  });

  const serviceChartData: ServiceProfitability[] = Array.from(
    totals.entries(),
  ).map(([type, value], index) => ({
      name: SERVICE_LABELS[type] ?? type,
      value,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));

  const recentTransactions: RecentTransaction[] = transactions.map(
    (transaction) => {
      const serviceType = getServiceType(transaction);

      return {
        id: transaction.id,
        amount: Number(transaction.amount ?? 0),
        payment_method: transaction.payment_method,
        status: transaction.status,
        created_at: transaction.created_at,
        serviceType: SERVICE_LABELS[serviceType] ?? serviceType,
      };
    },
  );

  const columns: DataTableColumn<RecentTransaction>[] = [
    {
      key: "id",
      header: "ID",
      render: (transaction) => `${transaction.id.substring(0, 8)}...`,
    },
    {
      key: "serviceType",
      header: "Servicio",
    },
    {
      key: "amount",
      header: "Monto",
      render: (transaction) => formatCurrency(transaction.amount),
    },
    {
      key: "payment_method",
      header: "Metodo",
      render: (transaction) => transaction.payment_method,
    },
    {
      key: "status",
      header: "Estado",
      render: (transaction) =>
        transaction.status === "completed" ? (
          <StatusBadge status="completed" />
        ) : transaction.status === "pending" ? (
          <StatusBadge status="pending" />
        ) : (
          <StatusBadge status="expired" />
        ),
    },
    {
      key: "created_at",
      header: "Fecha",
      render: (transaction) =>
        new Date(transaction.created_at).toLocaleString("es-EC", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
  ];

  if (isLoading) {
    return <div className="p-8 text-center">Cargando dashboard financiero...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 md:py-10">
      <header className="border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
              Dashboard financiero
            </p>
            <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
              Control Administrativo
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Metricas reales de ingresos, reservas, suscripciones y actividad
              financiera reciente.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
            >
              <Home className="size-4" />
              Panel principal
            </Link>
            <Link
              href="/transacciones"
              className="inline-flex h-11 items-center gap-2 bg-primary px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Transacciones
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DataCard
          title="Ingresos mes"
          value={formatCurrency(monthlyIncome)}
          icon={<TrendingUp className="size-5" />}
        />
        <DataCard
          title="Suscripciones"
          value={subscriptions.length}
          icon={<CreditCard className="size-5" />}
        />
        <DataCard
          title="Reservas"
          value={data?.pendingReservations ?? 0}
          icon={<CalendarClock className="size-5" />}
        />
        <DataCard
          title="Trans."
          value={completedTransactions.length}
          icon={<ReceiptText className="size-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardChartCard title="Ingresos ultimos 6 meses">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${Number(value)}`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Ingresos"]}
                cursor={{ fill: "rgba(174, 41, 0, 0.08)" }}
              />
              <Bar
                dataKey="income"
                fill={CHART_COLORS.income}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardChartCard>

        <DashboardChartCard title="Rentabilidad por tipo de servicio">
          {serviceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {serviceChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sin transacciones completadas para graficar.
            </div>
          )}
        </DashboardChartCard>
      </div>

      <section className="space-y-4">
        <h2 className="font-spaceGrotesk text-lg font-black uppercase tracking-[0.14em] text-foreground">
          Transacciones recientes
        </h2>
        <DataTable
          data={recentTransactions}
          columns={columns}
          pageSize={10}
          filterPlaceholder="Buscar por ID, servicio, estado o metodo"
        />
      </section>
    </section>
  );
}
