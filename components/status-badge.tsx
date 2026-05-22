import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusValue =
  | "pending"
  | "active"
  | "inactive"
  | "expired"
  | "completed"
  | "cancelled"
  | "failed"
  | "refunded";

type StatusBadgeProps = {
  status?: StatusValue | string | null;
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
  inactive: {
    label: "Inactivo",
    className:
      "border-0 bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-200",
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
    label: "Cancelado",
    className:
      "border-0 bg-slate-100 text-slate-900 dark:bg-slate-900/30 dark:text-slate-200",
  },
  failed: {
    label: "Fallido",
    className:
      "border-0 bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200",
  },
  refunded: {
    label: "Reembolsado",
    className:
      "border-0 bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status && status in statusMap ? (status as StatusValue) : "pending";
  const config = statusMap[key];

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
