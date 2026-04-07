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
    <Card className={cn("border-0 bg-gradient-to-br from-surface-container-lowest to-surface/40 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground/70 space-grotesk">
          {title}
        </CardTitle>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <p className="text-3xl font-black tracking-tight">{value}</p>
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
