"use client";

import { useState } from "react";
import { ArrowRight, Clock3, Copy } from "lucide-react";
import { initTransfer } from "./payment-actions";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const DOCUMENT_TYPES = [
  { value: "CC", label: "Cedula" },
  { value: "RUC", label: "RUC" },
  { value: "PP", label: "Pasaporte" },
] as const;

/**
 * Formulario de pago por transferencia bancaria (Kushki).
 *
 * Tras iniciar la transferencia:
 *  - si Kushki devuelve redirect_url -> se envia al usuario a su banco;
 *  - si devuelve un codigo de referencia -> se muestran las instrucciones.
 * La transaccion queda 'pending' y la confirma el webhook.
 */
export function TransferForm({
  serviceId,
  autoRenew,
  amount,
  onError,
}: {
  serviceId: string;
  autoRenew: boolean;
  amount: number;
  onError: (msg: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState<string>("CC");
  const [documentId, setDocumentId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ reference: string | null } | null>(null);

  async function handleInitTransfer() {
    setLoading(true);
    onError(null);
    try {
      const res = await initTransfer({
        service_id: serviceId,
        auto_renew: autoRenew,
        document_type: documentType,
        document_id: documentId,
        email,
      });

      if (!res.success || !res.transfer) {
        onError(res.error || "No se pudo iniciar la transferencia.");
        return;
      }

      // Si Kushki devuelve URL de redireccion, se envia al usuario alli.
      if (res.transfer.redirect_url) {
        window.location.href = res.transfer.redirect_url;
        return;
      }

      // Si no, se muestran las instrucciones con el codigo de referencia.
      setResult({ reference: res.transfer.reference });
    } catch {
      onError("Error de conexion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  function copyReference() {
    if (result?.reference) {
      navigator.clipboard.writeText(result.reference);
    }
  }

  // --- Estado 2: instrucciones tras iniciar la transferencia ------------
  if (result) {
    return (
      <div className="space-y-4 border border-border bg-muted/30 p-5">
        <div className="flex items-center gap-2 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
          <Clock3 className="h-4 w-4" />
          Esperando confirmacion del pago
        </div>

        <p className="font-workSans text-sm text-muted-foreground">
          Completa la transferencia por{" "}
          <strong className="text-foreground">{formatUsd(amount)}</strong>. Tu
          suscripcion se activara automaticamente cuando el pago sea confirmado.
        </p>

        {result.reference && (
          <div>
            <div className="mb-1 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Codigo de referencia
            </div>
            <div className="flex items-center justify-between gap-3 border border-border bg-background px-3 py-2">
              <span className="font-workSans text-sm text-foreground">{result.reference}</span>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex items-center gap-1 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-wide text-primary hover:opacity-80"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </button>
            </div>
          </div>
        )}

        <p className="font-workSans text-xs text-muted-foreground">
          Puedes cerrar esta pagina: la confirmacion llega automaticamente.
        </p>
      </div>
    );
  }

  // --- Estado 1: formulario de datos del pagador ------------------------
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Tipo de documento
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="h-11 w-full border border-border bg-background px-3 font-workSans text-sm text-foreground"
        >
          {DOCUMENT_TYPES.map((doc) => (
            <option key={doc.value} value={doc.value}>
              {doc.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Numero de documento
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          placeholder="Ej. 1712345678"
          className="h-11 w-full border border-border bg-background px-3 font-workSans text-sm text-foreground"
        />
      </div>

      <div>
        <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Correo electronico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          className="h-11 w-full border border-border bg-background px-3 font-workSans text-sm text-foreground"
        />
      </div>

      <button
        type="button"
        onClick={handleInitTransfer}
        disabled={loading || !documentId || !email}
        className="inline-flex h-12 w-full items-center justify-between bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
      >
        <span>{loading ? "Procesando..." : `Pagar ${formatUsd(amount)} por transferencia`}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
