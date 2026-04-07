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
        "group relative overflow-hidden border border-border/60 bg-card/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/25 via-primary to-primary/25"
      />
      <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
        <CardTitle className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted-foreground/80">
          {title}
        </CardTitle>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
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
