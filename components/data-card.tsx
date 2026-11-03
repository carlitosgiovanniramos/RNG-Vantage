import type { ReactNode } from "react";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

import { AnimatedNumber } from "@/components/animated-number";
import { cn } from "@/lib/utils";

type DataCardTrendDirection = "up" | "down" | "neutral";

type DataCardTrend = {
  value: string;
  direction?: DataCardTrendDirection;
  label?: string;
};

type DataCardProps = {
  title: string;
  value: number;
  format?: "currency" | "number";
  icon?: ReactNode;
  hint?: string;
  href?: string;
  /** Retraso de la animación de entrada en ms */
  delay?: number;
  highlight?: boolean;
  trend?: DataCardTrend;
  className?: string;
};

export function DataCard({
  title,
  value,
  format = "number",
  icon,
  hint,
  href,
  delay = 0,
  highlight = false,
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

  const content = (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-0.5 w-[18%] bg-primary"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          {icon ? (
            <span className="flex size-8 items-center justify-center bg-primary/10 text-primary">
              {icon}
            </span>
          ) : null}
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-2">
        <AnimatedNumber
          value={value}
          format={format}
          className="font-spaceGrotesk text-3xl font-bold tracking-tight text-foreground tabular-nums md:text-4xl"
        />
        {highlight && value > 0 ? (
          <span className="relative mb-2 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
        ) : null}
      </div>

      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}

      {trend ? (
        <div className={cn("mt-2 flex items-center gap-1.5 text-sm font-medium", trendColor)}>
          {direction === "up" ? (
            <TrendingUp className="size-4" />
          ) : direction === "down" ? (
            <TrendingDown className="size-4" />
          ) : null}
          <span>{trend.value}</span>
          {trend.label ? <span className="text-muted-foreground">{trend.label}</span> : null}
        </div>
      ) : null}
    </>
  );

  const classes = cn(
    "animate-rise relative block overflow-hidden border border-border/60 bg-card/80 p-5 backdrop-blur-sm md:p-6",
    className,
  );

  return href ? (
    <Link href={href} className={classes} style={{ animationDelay: `${delay}ms` }}>
      {content}
    </Link>
  ) : (
    <article className={classes} style={{ animationDelay: `${delay}ms` }}>
      {content}
    </article>
  );
}
