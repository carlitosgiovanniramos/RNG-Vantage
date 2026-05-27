"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  initKushkiCardFields,
  requestCardToken,
  resetKushkiCardFields,
} from "@/lib/kushki/card-fields";
import { updatePaymentMethod } from "./actions";

/**
 * Formulario para actualizar la tarjeta de una suscripcion recurrente.
 * Solo debe haber uno montado a la vez (la instancia del SDK de Kushki
 * es de modulo); el panel padre garantiza esa exclusividad.
 */
export function UpdateCardForm({
  subscriptionId,
  amount,
  onClose,
}: {
  subscriptionId: string;
  amount: number;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    initKushkiCardFields(amount, true)
      .then(() => {
        if (!cancelled) setSdkReady(true);
      })
      .catch((err) => {
        console.error("Error al inicializar Kushki:", err);
        if (!cancelled) setError("No se pudo cargar la pasarela de pago.");
      });

    return () => {
      cancelled = true;
      resetKushkiCardFields();
    };
  }, [amount]);

  async function handleUpdate() {
    setLoading(true);
    setError(null);
    try {
      const token = await requestCardToken();
      const res = await updatePaymentMethod({
        subscription_id: subscriptionId,
        token,
      });
      if (!res.success) {
        setError(res.error || "No se pudo actualizar la tarjeta.");
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError("Error al procesar la tarjeta. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 font-workSans text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
        Tarjeta actualizada. Los proximos cobros usaran la nueva tarjeta.
      </div>
    );
  }

  return (
    <div className="space-y-3 border border-border bg-muted/20 p-4">
      <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Nueva tarjeta
      </p>
      <div id="kushki-card-name" className="h-11 border border-border bg-background px-3" />
      <div id="kushki-card-number" className="h-11 border border-border bg-background px-3" />
      <div className="grid grid-cols-2 gap-3">
        <div id="kushki-card-expiry" className="h-11 border border-border bg-background px-3" />
        <div id="kushki-card-cvv" className="h-11 border border-border bg-background px-3" />
      </div>

      {error && (
        <p className="font-workSans text-xs text-red-700 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUpdate}
          disabled={loading || !sdkReady}
          className="inline-flex h-10 items-center bg-primary px-4 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Guardando..." : !sdkReady ? "Cargando..." : "Guardar tarjeta"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center border border-border px-4 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
