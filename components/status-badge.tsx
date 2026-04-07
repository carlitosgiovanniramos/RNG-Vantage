import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusValue = "pending" | "active" | "expired" | "completed";

type StatusBadgeProps = {
  status: StatusValue;
  className?: string;
};

const statusMap: Record<StatusValue, { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className:
      "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700",
  },
  active: {
    label: "Activo",
    className:
      "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700",
  },
  expired: {
    label: "Expirado",
    className:
      "bg-red-100 text-red-900 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700",
  },
  completed: {
    label: "Completado",
    className:
      "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-700",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
