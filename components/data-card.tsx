import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataCardTrendDirection = "up" | "down" | "neutral";

type DataCardTrend = {
  value: string;
  direction?: DataCardTrendDirection;
  label?: string;
};

type DataCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: DataCardTrend;
  className?: string;
};

export function DataCard({
  title,
  value,
  icon,
  trend,
  className,
}: DataCardProps) {
  const direction = trend?.direction ?? "neutral";
  const trendColor =
    direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : direction === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-border/70 bg-card/90 shadow-[8px_8px_0_var(--border)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[10px_10px_0_var(--border)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary"
      />
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <CardTitle className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted-foreground/80">
          {title}
        </CardTitle>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center border border-border bg-background text-primary transition-colors duration-300 group-hover:border-primary/50">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <p className="font-spaceGrotesk text-3xl font-black tracking-tight text-foreground md:text-4xl">
          {value}
        </p>
        {trend ? (
          <div
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              trendColor,
            )}
          >
            {direction === "up" ? (
              <TrendingUp className="size-4" />
            ) : direction === "down" ? (
              <TrendingDown className="size-4" />
            ) : null}
            <span>{trend.value}</span>
            {trend.label ? (
              <span className="text-muted-foreground">{trend.label}</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
