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
    <Card className={cn("border border-border/70", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border/60 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </CardTitle>
        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pt-4">
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
