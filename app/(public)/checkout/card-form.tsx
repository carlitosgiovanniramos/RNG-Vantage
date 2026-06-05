"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { initPayphonePayment } from "./payment-actions";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

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
  recurring: boolean;
  onError: (msg: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    onError(null);
    try {
      const res = await initPayphonePayment({
        service_id: serviceId,
        auto_renew: autoRenew,
      });

      if (!res.success) {
        onError(res.error || "No se pudo iniciar el pago.");
        return;
      }

      // Redireccion completa al portal de pago de Payphone.
      window.location.href = res.paymentUrl;
    } catch {
      onError("Error al iniciar el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="border border-border bg-muted/30 px-4 py-3">
        <p className="font-workSans text-sm leading-relaxed text-muted-foreground">
          Seras redirigido a <span className="font-semibold text-foreground">Payphone</span> para
          ingresar los datos de tu tarjeta de forma segura. Una vez completado el
          pago regresaras automaticamente a este sitio.
        </p>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-between bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
      >
        <span>
          {loading
            ? "Iniciando pago..."
            : recurring
              ? `Suscribirme · ${formatUsd(amount)}/mes`
              : `Pagar ${formatUsd(amount)} con Payphone`}
        </span>
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <p className="font-workSans text-xs">
          Pago procesado de forma segura por Payphone. Tus datos bancarios nunca
          tocan nuestros servidores.
        </p>
      </div>
    </div>
  );
}
