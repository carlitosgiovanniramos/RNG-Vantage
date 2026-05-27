"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { chargeWithCard, subscribeWithCard } from "./payment-actions";
import {
  initKushkiCardFields,
  requestCardToken,
  resetKushkiCardFields,
} from "@/lib/kushki/card-fields";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Formulario de pago con tarjeta.
 * La tokenizacion ocurre en el navegador (KushkiJS, campos en iframes):
 * el numero de tarjeta nunca toca nuestro DOM (requisito PCI). El
 * servidor solo recibe el `token`.
 */
export function CardForm({
  serviceId,
  autoRenew,
  amount,
  recurring,
  onError,
}: {
  serviceId: string;
  autoRenew: boolean;
  amount: number;
  /**
   * `true` => suscripcion recurrente (servicio manejo_redes + auto-renovar).
   * El padre re-monta el componente con `key` cuando esto cambia, asi que
   * `recurring` es constante durante toda la vida del componente.
   */
  recurring: boolean;
  onError: (msg: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    initKushkiCardFields(amount, recurring)
      .then(() => {
        if (!cancelled) setSdkReady(true);
      })
      .catch((error) => {
        console.error("Error al inicializar Kushki:", error);
        if (!cancelled) onError("No se pudo cargar la pasarela de pago.");
      });

    return () => {
      cancelled = true;
      resetKushkiCardFields();
    };
    // `recurring` es constante por montaje (el padre re-monta via key).
  }, [amount, onError, recurring]);

  async function handlePay() {
    setLoading(true);
    onError(null);
    try {
      const token = await requestCardToken();

      const res = recurring
        ? await subscribeWithCard({
            service_id: serviceId,
            auto_renew: true,
            token,
          })
        : await chargeWithCard({
            service_id: serviceId,
            auto_renew: autoRenew,
            token,
          });

      if (!res.success) {
        onError(res.error || "No se pudo procesar el pago.");
        if (res.error === "Debes iniciar sesion para continuar.") {
          setTimeout(() => {
            const redirect = encodeURIComponent(`/checkout?service_id=${serviceId}`);
            router.push(`/login?redirect=${redirect}`);
          }, 2000);
        }
        return;
      }
      router.push(`/checkout?service_id=${serviceId}&success=1&method=card`);
    } catch {
      onError("Error al procesar el pago. Revisa los datos de la tarjeta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Titular de la tarjeta
        </label>
        <div id="kushki-card-name" className="h-11 border border-border bg-background px-3" />
      </div>
      <div>
        <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Numero de tarjeta
        </label>
        <div id="kushki-card-number" className="h-11 border border-border bg-background px-3" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Vencimiento
          </label>
          <div id="kushki-card-expiry" className="h-11 border border-border bg-background px-3" />
        </div>
        <div>
          <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            CVV
          </label>
          <div id="kushki-card-cvv" className="h-11 border border-border bg-background px-3" />
        </div>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={loading || !sdkReady}
        className="inline-flex h-12 w-full items-center justify-between bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
      >
        <span>
          {loading
            ? "Procesando..."
            : !sdkReady
              ? "Cargando..."
              : recurring
                ? `Suscribirme · ${formatUsd(amount)}/mes`
                : `Pagar ${formatUsd(amount)}`}
        </span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
