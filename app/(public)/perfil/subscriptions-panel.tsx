"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useConfirm } from "@/components/use-confirm";
import { formatCurrency } from "@/lib/utils";
import { cancelMySubscription } from "./actions";

export type SubscriptionPanelItem = {
  id: string;
  status: string | null;
  starts_at: string | null;
  ends_at: string | null;
  auto_renew: boolean | null;
  serviceName: string;
  serviceType: string;
  price: number;
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  pending: "Pendiente",
  expired: "Vencida",
  cancelled: "Cancelada",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  expired: "bg-slate-100 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-EC", { dateStyle: "medium" });
}

/**
 * Lista interactiva de suscripciones del cliente: permite cancelar la
 * suscripcion (desactiva la renovacion automatica).
 */
export function SubscriptionsPanel({ items }: { items: SubscriptionPanelItem[] }) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<{ id: string; message: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirm();

  if (items.length === 0) {
    return (
      <div className="border border-border/60 bg-card/80 p-6 text-sm text-muted-foreground">
        Aun no tienes suscripciones. Puedes revisar el catalogo para contratar un
        servicio.
      </div>
    );
  }

  async function handleCancel(id: string) {
    const ok = await confirm({
      title: "Cancelar suscripción",
      message: "¿Cancelar esta suscripción? Se detendrán los cobros automáticos.",
      confirmLabel: "Cancelar suscripción",
      cancelLabel: "Volver",
      destructive: true,
    });
    if (!ok) return;

    setActionError(null);
    setCancellingId(id);
    startTransition(async () => {
      const res = await cancelMySubscription(id);
      setCancellingId(null);
      if (!res.success) {
        setActionError({ id, message: res.error ?? "No se pudo cancelar." });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const status = item.status ?? "pending";
        const canCancel = status === "active" || status === "pending";
        const isCancelling = pending && cancellingId === item.id;

        return (
          <article
            key={item.id}
            className="flex flex-col gap-3 border border-border/60 bg-card/85 p-5 text-sm backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-spaceGrotesk text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                  {item.serviceName}
                </p>
                <p className="font-workSans text-xs text-muted-foreground">
                  Tipo: {item.serviceType} · {formatCurrency(item.price)}
                </p>
                <p className="mt-2 font-workSans text-xs text-muted-foreground">
                  Inicio: {formatDate(item.starts_at)} · Vence:{" "}
                  {formatDate(item.ends_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.12em] ${
                    STATUS_STYLES[status] ?? STATUS_STYLES.pending
                  }`}
                >
                  {STATUS_LABELS[status] ?? "Pendiente"}
                </span>
                <span
                  className={`px-2.5 py-0.5 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.12em] ${
                    item.auto_renew
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.auto_renew ? "Auto" : "Manual"}
                </span>
              </div>
            </div>

            {canCancel && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
                <button
                  type="button"
                  onClick={() => handleCancel(item.id)}
                  disabled={isCancelling}
                  className="inline-flex h-9 items-center border border-red-300 bg-red-50 px-3 font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.12em] text-red-800 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                >
                  {isCancelling ? "Cancelando..." : "Cancelar suscripcion"}
                </button>
              </div>
            )}

            {actionError?.id === item.id && (
              <p className="font-workSans text-xs text-red-700 dark:text-red-400">
                {actionError.message}
              </p>
            )}
          </article>
        );
      })}
      {confirmDialog}
    </div>
  );
}
