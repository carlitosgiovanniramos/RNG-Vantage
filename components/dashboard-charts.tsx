"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { CHART_COLORS } from "@/lib/design-tokens";

type MonthlyIncomePoint = {
  label: string;
  value: number;
};

type ServiceMixPoint = {
  name: string;
  value: number;
};

type DashboardChartsProps = {
  monthlyIncome: MonthlyIncomePoint[];
  serviceMix: ServiceMixPoint[];
};

const PIE_COLORS = [
  CHART_COLORS.subscriptions,
  CHART_COLORS.reservations,
  CHART_COLORS.growth,
  CHART_COLORS.expense,
  CHART_COLORS.income,
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardCharts({
  monthlyIncome,
  serviceMix,
}: DashboardChartsProps) {
  const hasIncome = monthlyIncome.some((item) => item.value > 0);
  const hasServiceMix = serviceMix.some((item) => item.value > 0);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
      <article className="relative overflow-hidden border border-border/60 bg-card/80 p-6 backdrop-blur-sm md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative space-y-4">
          <div>
            <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.2em] text-primary">
              Ingresos
            </p>
            <h2 className="font-spaceGrotesk text-lg font-black uppercase tracking-[0.12em] text-foreground">
              Ingresos Mensuales
            </h2>
          </div>
          <div className="h-64">
            {hasIncome ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyIncome} barSize={32}>
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "rgba(15, 23, 42, 0.08)",
                      fontSize: 12,
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="value" fill={CHART_COLORS.income} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin datos suficientes para el grafico.
              </div>
            )}
          </div>
        </div>
      </article>

      <article className="relative overflow-hidden border border-border/60 bg-card/80 p-6 backdrop-blur-sm md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative space-y-4">
          <div>
            <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.2em] text-primary">
              Mix de servicios
            </p>
            <h2 className="font-spaceGrotesk text-lg font-black uppercase tracking-[0.12em] text-foreground">
              Ingresos por Tipo
            </h2>
          </div>
          <div className="h-64">
            {hasServiceMix ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={4}
                  >
                    {serviceMix.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "rgba(15, 23, 42, 0.08)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin datos suficientes para el grafico.
              </div>
            )}
          </div>
          {hasServiceMix ? (
            <div className="space-y-2">
              {serviceMix.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-spaceGrotesk text-xs font-bold text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
