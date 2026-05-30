/**
 * Etiquetas en español para los valores enum de la base de datos.
 * Centralizadas para mostrar texto consistente en toda la UI (en vez de
 * los valores crudos en ingles como "transfer", "manejo_redes", etc.).
 */

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  pending: "Pendiente",
};

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  failed: "Fallido",
  refunded: "Reembolsado",
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  manejo_redes: "Manejo de Redes",
  auditoria: "Auditoría",
  capacitacion: "Capacitación",
  otro: "Otro",
};

/** Devuelve la etiqueta o el valor crudo como fallback. */
export function labelFor(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "—";
  return map[value] ?? value;
}
