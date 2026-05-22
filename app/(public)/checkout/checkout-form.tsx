"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CreditCard, Landmark, RefreshCw, Wallet } from "lucide-react";
import { createSubscription } from "./actions";
import { CardForm } from "./card-form";
import { TransferForm } from "./transfer-form";

type PaymentMethod = "card" | "transfer" | "cash";

const PAYMENT_METHODS = [
  { id: "card", label: "Tarjeta", icon: CreditCard },
  { id: "transfer", label: "Transferencia", icon: Landmark },
  { id: "cash", label: "Efectivo", icon: Wallet },
] as const;

export function CheckoutForm({
  serviceId,
  isRecurringService,
  success,
  amount,
}: {
  serviceId: string;
  isRecurringService: boolean;
  success: boolean;
  amount: number;
}) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [autoRenew, setAutoRenew] = useState(isRecurringService);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Flujo manual de efectivo: Ruth confirma el pago manualmente.
  async function handleCashCheckout() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await createSubscription({
        service_id: serviceId,
        auto_renew: autoRenew,
      });
      if (!res.success) {
        setErrorMsg(res.error || "Ocurrio un error inesperado.");
        if (res.error === "Debes iniciar sesion para continuar.") {
          setTimeout(() => {
            const redirect = encodeURIComponent(`/checkout?service_id=${serviceId}`);
            router.push(`/login?redirect=${redirect}`);
          }, 2000);
        }
      } else {
        router.push(`/checkout?service_id=${serviceId}&success=1`);
      }
    } catch {
      setErrorMsg("Error de conexion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <button
        type="button"
        disabled
        className="mt-6 inline-flex h-12 w-full cursor-not-allowed items-center justify-center bg-muted px-5 font-spaceGrotesk text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground opacity-50"
      >
        Confirmar contratacion
      </button>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {errorMsg && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 font-workSans text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {errorMsg}
        </div>
      )}

      {/* Selector de metodo de pago */}
      <div className="grid grid-cols-3 gap-2">
        {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            className={`flex flex-col items-center justify-center gap-1.5 border px-2 py-3 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.1em] transition-colors ${
              method === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Renovacion automatica (compartida por todos los metodos) */}
      <label className="flex cursor-pointer items-start gap-3 border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
        <input
          type="checkbox"
          checked={autoRenew}
          onChange={(e) => setAutoRenew(e.target.checked)}
          disabled={!isRecurringService}
          className="mt-1 h-4 w-4 border-border text-primary"
        />
        <span className="flex gap-3 font-workSans text-sm leading-relaxed">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-medium text-foreground">Renovar automaticamente</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {isRecurringService
                ? "Solo aplica para servicios de manejo de redes."
                : "No aplica a servicios unicos."}
            </span>
          </span>
        </span>
      </label>

      {/* Contenido segun el metodo elegido */}
      {method === "card" && (
        <CardForm serviceId={serviceId} autoRenew={autoRenew} amount={amount} onError={setErrorMsg} />
      )}
      {method === "transfer" && (
        <TransferForm serviceId={serviceId} autoRenew={autoRenew} amount={amount} onError={setErrorMsg} />
      )}
      {method === "cash" && (
        <button
          type="button"
          onClick={handleCashCheckout}
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-between bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          <span>{loading ? "Procesando..." : "Confirmar contratacion"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
