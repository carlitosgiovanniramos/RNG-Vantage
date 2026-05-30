"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Copy,
  Landmark,
  Upload,
  UploadCloud,
} from "lucide-react";

import {
  RGL_BANK_ACCOUNT,
  BANK_ACCOUNT_FIELDS,
} from "@/lib/payments/bank-account";
import { initManualTransfer, uploadTransferReceipt } from "./payment-actions";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

type Stage = "account" | "upload" | "later" | "done";

/**
 * Formulario de pago por transferencia bancaria MANUAL.
 *
 * 1. Muestra la cuenta de RGL Estudio a la cual transferir.
 * 2. El cliente elige "Subir comprobante ahora" o "Subir luego".
 *    Ambas crean la orden (suscripcion + transaccion pending).
 * 3. Si sube ahora, envia la foto del comprobante; si elige luego,
 *    puede subirlo despues desde su perfil.
 * 4. Ruth verifica el comprobante en el dashboard y aprueba/rechaza.
 */
export function ManualTransferForm({
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
  const [stage, setStage] = useState<Stage>("account");
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  /** Crea la orden pendiente. `mode` decide a que paso ir despues. */
  async function createOrder(mode: "upload" | "later") {
    setLoading(true);
    onError(null);
    try {
      const res = await initManualTransfer({
        service_id: serviceId,
        auto_renew: autoRenew,
      });

      if (!res.success || !res.transaction_id) {
        onError(res.error || "No se pudo registrar la transferencia.");
        if (res.error === "Debes iniciar sesion para continuar.") {
          setTimeout(() => {
            const redirect = encodeURIComponent(`/checkout?service_id=${serviceId}`);
            router.push(`/login?redirect=${redirect}`);
          }, 2000);
        }
        return;
      }

      setTransactionId(res.transaction_id);
      setStage(mode);
    } catch {
      onError("Error de conexion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!transactionId || !file) return;
    setLoading(true);
    onError(null);
    try {
      const formData = new FormData();
      formData.append("transaction_id", transactionId);
      formData.append("file", file);

      const res = await uploadTransferReceipt(formData);
      if (!res.success) {
        onError(res.error || "No se pudo subir el comprobante.");
        return;
      }
      setStage("done");
    } catch {
      onError("Error de conexion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  function copyAccountNumber() {
    navigator.clipboard.writeText(RGL_BANK_ACCOUNT.accountNumber);
  }

  // --- Datos de la cuenta (compartido por varios estados) ---------------
  const accountCard = (
    <div className="space-y-3 border border-border bg-muted/30 p-5">
      <div className="flex items-center gap-2 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-foreground">
        <Landmark className="h-4 w-4 text-primary" />
        Cuenta para transferir
      </div>

      <dl className="space-y-2">
        {BANK_ACCOUNT_FIELDS.map(({ label, key }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0 last:pb-0"
          >
            <dt className="font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </dt>
            <dd className="flex items-center gap-2 text-right font-workSans text-sm font-medium text-foreground">
              {RGL_BANK_ACCOUNT[key]}
              {key === "accountNumber" && (
                <button
                  type="button"
                  onClick={copyAccountNumber}
                  className="inline-flex items-center gap-1 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-wide text-primary hover:opacity-80"
                >
                  <Copy className="h-3 w-3" />
                  Copiar
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="font-workSans text-sm text-muted-foreground">
        Transfiere{" "}
        <strong className="text-foreground">{formatUsd(amount)}</strong> a esta
        cuenta y sube el comprobante para que verifiquemos tu pago.
      </p>
    </div>
  );

  // --- Estado: orden creada, esperando subir luego ----------------------
  if (stage === "later") {
    return (
      <div className="space-y-4">
        {accountCard}
        <div className="space-y-2 border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
            <Clock3 className="h-4 w-4" />
            Orden registrada
          </div>
          <p className="font-workSans text-sm text-amber-900 dark:text-amber-200">
            Realiza la transferencia y sube el comprobante desde tu perfil
            cuando lo tengas. Tu suscripcion se activara cuando verifiquemos el
            pago.
          </p>
          <button
            type="button"
            onClick={() => router.push("/perfil")}
            className="inline-flex h-10 items-center gap-2 bg-primary px-4 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir a mi perfil
          </button>
        </div>
      </div>
    );
  }

  // --- Estado: comprobante enviado --------------------------------------
  if (stage === "done") {
    return (
      <div className="space-y-3 border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Comprobante enviado
        </div>
        <p className="font-workSans text-sm text-emerald-900 dark:text-emerald-200">
          Recibimos tu comprobante. Verificaremos la transferencia y activaremos
          tu suscripcion. Puedes seguir el estado en tu perfil.
        </p>
        <button
          type="button"
          onClick={() => router.push("/perfil")}
          className="inline-flex h-10 items-center gap-2 bg-primary px-4 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ver mis suscripciones
        </button>
      </div>
    );
  }

  // --- Estado: subir comprobante ahora ----------------------------------
  if (stage === "upload") {
    return (
      <div className="space-y-4">
        {accountCard}
        <div className="space-y-3 border border-border bg-background p-5">
          <span className="block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Foto del comprobante
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 border border-border bg-muted/50 px-4 font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted">
              Elegir archivo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            <span className="max-w-[60%] truncate font-workSans text-sm text-muted-foreground">
              {file ? file.name : "Ningún archivo seleccionado"}
            </span>
          </div>
          <p className="font-workSans text-xs text-muted-foreground">
            Formatos: JPG, PNG o WEBP. Máximo 5 MB.
          </p>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file}
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            <UploadCloud className="h-4 w-4" />
            {loading ? "Enviando..." : "Enviar comprobante"}
          </button>
        </div>
      </div>
    );
  }

  // --- Estado inicial: cuenta + eleccion de cuando subir ----------------
  return (
    <div className="space-y-4">
      {accountCard}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => createOrder("upload")}
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 bg-primary px-4 font-spaceGrotesk text-[0.7rem] font-black uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          <Upload className="h-4 w-4" />
          {loading ? "Procesando..." : "Subir comprobante ahora"}
        </button>
        <button
          type="button"
          onClick={() => createOrder("later")}
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 border border-border bg-muted/30 px-4 font-spaceGrotesk text-[0.7rem] font-black uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          <Clock3 className="h-4 w-4" />
          Subir luego
        </button>
      </div>
    </div>
  );
}
