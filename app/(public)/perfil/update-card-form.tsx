"use client";

import { Info } from "lucide-react";

/**
 * Con Payphone cada cobro es independiente; no existe una API para
 * actualizar la tarjeta de una suscripcion activa. Para cambiar el
 * metodo de pago el cliente debe cancelar la suscripcion y contratarla
 * de nuevo.
 */
export function UpdateCardForm({
  onClose,
}: {
  subscriptionId: string;
  amount: number;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4 border border-border bg-muted/20 p-4">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="font-workSans text-sm leading-relaxed text-muted-foreground">
          Para cambiar tu tarjeta de pago, cancela esta suscripcion desde el
          panel y vuelvela a contratar con la nueva tarjeta. Tus datos de
          servicio se conservaran hasta la fecha de vencimiento.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-10 items-center border border-border px-4 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted"
      >
        Cerrar
      </button>
    </div>
  );
}
