/**
 * Estado "mostrado" de una reserva, DERIVADO del estado guardado + la fecha.
 *
 * No se persiste en la BD: se calcula al vuelo comparando `preferred_date`
 * con la fecha actual. Asi una reserva pendiente cuya fecha ya paso aparece
 * automaticamente como "Atrasada" sin necesidad de un cron ni de cambiar el
 * enum de la base de datos.
 *
 * Estados guardados (BD): pending | confirmed | cancelled | completed.
 * Estados derivados (UI):
 *   - Pendiente  : pendiente, fecha futura
 *   - Hoy        : la fecha es hoy (pendiente o confirmada)
 *   - Atrasada   : pendiente y la fecha ya paso (no se confirmo a tiempo)
 *   - Confirmada : confirmada, fecha futura
 *   - Vencida    : confirmada pero la fecha ya paso (falta cerrarla)
 *   - Completada : marcada como completada
 *   - Cancelada  : cancelada
 */
export type ReservationDisplayStatus =
  | "pending"
  | "today"
  | "overdue"
  | "confirmed"
  | "expired"
  | "completed"
  | "cancelled";

export function getReservationDisplayStatus(
  status: string | null,
  preferredDate: string,
): ReservationDisplayStatus {
  if (status === "cancelled") return "cancelled";
  if (status === "completed") return "completed";

  const date = new Date(preferredDate);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const isToday = date >= startOfToday && date < startOfTomorrow;
  const isPast = date < startOfToday;

  if (status === "confirmed") {
    if (isToday) return "today";
    if (isPast) return "expired";
    return "confirmed";
  }

  // pending (o cualquier estado no reconocido)
  if (isToday) return "today";
  if (isPast) return "overdue";
  return "pending";
}

export const RESERVATION_STATUS_META: Record<
  ReservationDisplayStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  today: {
    label: "Hoy",
    className: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  },
  overdue: {
    label: "Atrasada",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  confirmed: {
    label: "Confirmada",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  expired: {
    label: "Vencida",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  },
  completed: {
    label: "Completada",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};
