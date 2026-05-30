"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

import { uploadTransferReceipt } from "../checkout/payment-actions";

/**
 * Boton de subida diferida del comprobante de transferencia.
 *
 * Se muestra en el historial de pagos para transacciones de transferencia
 * manual pendientes que aun no tienen comprobante ("subir luego").
 */
export function ReceiptUpload({ transactionId }: { transactionId: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("transaction_id", transactionId);
      formData.append("file", file);

      const res = await uploadTransferReceipt(formData);
      if (!res.success) {
        setError(res.error || "No se pudo subir el comprobante.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 border border-primary/40 bg-primary/10 px-3 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/20"
      >
        <UploadCloud className="h-3.5 w-3.5" />
        Subir comprobante
      </button>
    );
  }

  return (
    <div className="mt-3 w-full space-y-2 border border-border/60 bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 border border-border bg-muted/50 px-3 font-spaceGrotesk text-[0.58rem] font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted">
          Elegir archivo
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
        <span className="max-w-[60%] truncate font-workSans text-xs text-muted-foreground">
          {file ? file.name : "Ningún archivo seleccionado"}
        </span>
      </div>
      {error && (
        <p className="font-workSans text-xs text-red-700 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className="inline-flex h-9 items-center gap-2 bg-primary px-3 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="inline-flex h-9 items-center border border-border px-3 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
