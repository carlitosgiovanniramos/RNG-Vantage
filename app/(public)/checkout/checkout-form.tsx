"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { createSubscription } from "./actions";

export function CheckoutForm({
  serviceId,
  isRecurringService,
  success,
}: {
  serviceId: string;
  isRecurringService: boolean;
  success: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const autoRenew = formData.get("auto_renew") === "on";

    try {
      const res = await createSubscription({ service_id: serviceId, auto_renew: autoRenew });

      if (!res.success) {
        setErrorMsg(res.error || "Ocurrio un error inesperado.");
        if (res.error === "Debes iniciar sesion para continuar.") {
          setTimeout(() => {
            const redirectPath = encodeURIComponent(`/checkout?service_id=${serviceId}`);
            router.push(`/login?redirect=${redirectPath}`);
          }, 2000);
        }
      } else {
        router.push(`/checkout?service_id=${serviceId}&success=1`);
      }
    } catch {
      setErrorMsg("Error de conexion. Intenta nuevamente.");
    } finally {
      if (!success) {
        setLoading(false);
      }
    }
  }

  return (
    <>
      {errorMsg && (
        <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 font-workSans text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="service_id" value={serviceId} />

        <label className="flex cursor-pointer items-start gap-3 border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
          <input
            type="checkbox"
            name="auto_renew"
            defaultChecked={isRecurringService}
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

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
          {success ? (
            <button
              type="button"
              disabled
              className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center bg-muted px-5 font-spaceGrotesk text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground opacity-50"
            >
              Confirmar contratacion
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-between bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            >
              <span>{loading ? "Procesando..." : "Confirmar contratacion"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </>
  );
}
