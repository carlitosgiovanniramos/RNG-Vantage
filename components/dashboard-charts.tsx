"use client";

import type { ReactNode } from "react";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
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

const TOOLTIP_STYLE = {
  borderRadius: 0,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontSize: 12,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 border border-dashed border-border/70 text-muted-foreground">
      <span className="flex size-10 items-center justify-center bg-muted/60">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function DashboardCharts({
  monthlyIncome,
  serviceMix,
}: DashboardChartsProps) {
  const hasIncome = monthlyIncome.some((item) => item.value > 0);
  const hasServiceMix = serviceMix.some((item) => item.value > 0);
  const mixTotal = serviceMix.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <article
        className="animate-rise border border-border/60 bg-card/80 p-6 backdrop-blur-sm"
        style={{ animationDelay: "500ms" }}
      >
        <h2 className="font-spaceGrotesk text-base font-bold text-foreground">
          Ingresos mensuales
        </h2>
        <div className="mt-6 h-64">
          {hasIncome ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyIncome} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.35 }} />
                    <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.income}
                  strokeWidth={2.5}
                  fill="url(#incomeFill)"
                  animationDuration={1400}
                  activeDot={{ r: 5, strokeWidth: 0, fill: CHART_COLORS.income }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<BarChart3 className="size-5" />}
              text="Aún no hay ingresos registrados"
            />
          )}
        </div>
      </article>

      <article
        className="animate-rise border border-border/60 bg-card/80 p-6 backdrop-blur-sm"
        style={{ animationDelay: "580ms" }}
      >
        <h2 className="font-spaceGrotesk text-base font-bold text-foreground">
          Ingresos por tipo
        </h2>
        {hasServiceMix ? (
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
            <div className="relative h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                    animationDuration={1200}
                  >
                    {serviceMix.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-spaceGrotesk text-2xl font-bold text-foreground">
                  {mixTotal}
                </span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
            </div>
            <ul className="w-full space-y-3">
              {serviceMix.map((item, index) => {
                const percent = mixTotal > 0 ? Math.round((item.value / mixTotal) * 100) : 0;
                return (
                  <li key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        {item.name}
                      </span>
                      <span className="font-medium tabular-nums text-foreground">{percent}%</span>
                    </div>
                    <div className="h-1 bg-muted">
                      <div
                        className="h-full transition-[width] duration-1000 ease-out"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="mt-6 h-64">
            <EmptyState
              icon={<PieChartIcon className="size-5" />}
              text="Sin ventas por tipo todavía"
            />
          </div>
        )}
      </article>
    </section>
  );
}
