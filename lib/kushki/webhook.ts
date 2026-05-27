import type { KushkiTransactionStatus } from "./types";

/**
 * Logica pura del webhook de Kushki.
 * Sin dependencias de entorno ni de red -> facilmente testeable.
 */

/** Estados internos finales: una transaccion en estos no se reprocesa. */
export const FINAL_TRANSACTION_STATUSES = [
  "completed",
  "failed",
  "refunded",
] as const;

/**
 * Indica si un estado de transaccion es final.
 * Se usa para la idempotencia del webhook.
 */
export function isFinalTransactionStatus(status: string): boolean {
  return (FINAL_TRANSACTION_STATUSES as readonly string[]).includes(status);
}

/** Mapea el estado de Kushki al estado interno de la transaccion. */
export function mapKushkiStatus(
  status: KushkiTransactionStatus,
): "completed" | "failed" | "pending" {
  switch (status) {
    case "APPROVAL":
      return "completed";
    case "DECLINED":
    case "EXPIRED":
      return "failed";
    case "PENDING":
    case "INITIALIZED":
    default:
      return "pending";
  }
}
