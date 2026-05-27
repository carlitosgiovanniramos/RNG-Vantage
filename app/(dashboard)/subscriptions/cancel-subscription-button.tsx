"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

import { cancelSubscription } from "./actions";

/**
 * Boton de cancelacion de una suscripcion (panel admin).
 * Solo se muestra para suscripciones activas o pendientes.
 */
export function CancelSubscriptionButton({
  subscriptionId,
  status,
}: {
  subscriptionId: string;
  status: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (status !== "active" && status !== "pending") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  function handleCancel() {
    if (
      !window.confirm(
        "¿Cancelar esta suscripcion? Se detendran los cobros automaticos en la pasarela.",
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await cancelSubscription(subscriptionId);
      if (!res.success) {
        setError(res.error ?? "No se pudo cancelar.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className="inline-flex items-center gap-1 border border-red-300 bg-red-50 px-2.5 py-1 font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.1em] text-red-800 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
      >
        <XCircle className="size-3" />
        {pending ? "Cancelando..." : "Cancelar"}
      </button>
      {error && <p className="mt-1 text-[0.62rem] text-red-700 dark:text-red-400">{error}</p>}
    </div>
  );
}
