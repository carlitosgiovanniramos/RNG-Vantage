import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusValue = "pending" | "active" | "expired" | "completed" | "cancelled";

type StatusBadgeProps = {
  status: StatusValue;
  className?: string;
};

const statusMap: Record<StatusValue, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className:
      "border-0 bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  },
  active: {
    label: "Activo",
    className:
      "border-0 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  expired: {
    label: "Expirado",
    className:
      "border-0 bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
  },
  completed: {
    label: "Completado",
    className:
      "border-0 bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-200",
  },
  cancelled: {
    label: "Cancelada",
    className:
      "border-0 bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-spaceGrotesk h-6 rounded-none px-2.5 text-[0.65rem] font-bold uppercase tracking-[0.16em]",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
