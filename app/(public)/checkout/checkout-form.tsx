"use client";

import { useState } from "react";
import { CreditCard, Building2, Landmark, RefreshCw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardForm } from "./card-form";
import { ManualTransferForm } from "./manual-transfer-form";
import { TransferForm } from "./transfer-form";

type PaymentMethod = "transfer" | "card" | "transfer_kushki";

const PAYMENT_METHODS = [
  { id: "transfer", label: "Transferencia", icon: Landmark },
  { id: "card", label: "Tarjeta", icon: CreditCard },
  { id: "transfer_kushki", label: "Transf. Kushki", icon: Building2 },
] as const;

const METHOD_TITLES: Record<PaymentMethod, string> = {
  transfer: "Pago por transferencia",
  card: "Pago con tarjeta",
  transfer_kushki: "Transferencia con Kushki",
};

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
  const [openMethod, setOpenMethod] = useState<PaymentMethod | null>(null);
  const [autoRenew, setAutoRenew] = useState(isRecurringService);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  function handleOpen(method: PaymentMethod) {
    setErrorMsg(null);
    setOpenMethod(method);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setOpenMethod(null);
      setErrorMsg(null);
    }
  }

  return (
    <div className="mt-6 space-y-4">
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

      {/* Selector de metodo de pago: cada boton abre su modal */}
      <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Elige un método de pago
      </p>
      <div className="grid grid-cols-3 gap-2">
        {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleOpen(id)}
            className="flex flex-col items-center justify-center gap-1.5 border border-border bg-muted/30 px-2 py-4 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Modal con el formulario del metodo elegido */}
      <Dialog open={openMethod !== null} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-spaceGrotesk text-base font-black uppercase tracking-[0.12em]">
              {openMethod ? METHOD_TITLES[openMethod] : ""}
            </DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 font-workSans text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              {errorMsg}
            </div>
          )}

          {openMethod === "transfer" && (
            <ManualTransferForm
              serviceId={serviceId}
              autoRenew={autoRenew}
              amount={amount}
              onError={setErrorMsg}
            />
          )}
          {openMethod === "card" && (
            <CardForm
              key={isRecurringService && autoRenew ? "card-recurring" : "card-onetime"}
              serviceId={serviceId}
              autoRenew={autoRenew}
              amount={amount}
              recurring={isRecurringService && autoRenew}
              onError={setErrorMsg}
            />
          )}
          {openMethod === "transfer_kushki" && (
            <TransferForm
              serviceId={serviceId}
              autoRenew={autoRenew}
              amount={amount}
              onError={setErrorMsg}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
