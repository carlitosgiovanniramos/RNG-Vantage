"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        setErrorMsg(res.error || "Ocurrió un error inesperado.");
        if (res.error === "Debes iniciar sesión para continuar.") {
          // Opcionalmente redirigir al login después de unos segundos.
          setTimeout(() => {
            const redirectPath = encodeURIComponent(`/checkout?service_id=${serviceId}`);
            router.push(`/login?redirect=${redirectPath}`);
          }, 2000);
        }
      } else {
        router.push(`/checkout?service_id=${serviceId}&success=1`);
      }
    } catch {
      setErrorMsg("Error de conexión. Intenta nuevamente.");
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

        <label className="flex items-start gap-3 border border-border/60 bg-muted/30 p-4 cursor-pointer">
          <input
            type="checkbox"
            name="auto_renew"
            defaultChecked={isRecurringService}
            disabled={!isRecurringService}
            className="mt-0.5 h-4 w-4 border-border text-primary"
          />
          <span className="font-workSans text-sm leading-relaxed">
            Renovar automáticamente
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {isRecurringService
                ? "Solo aplica para servicios de manejo de redes."
                : "No aplica a servicios únicos."}
            </span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center">
          {success ? (
            <button
              type="button"
              disabled
              className="inline-flex h-12 cursor-not-allowed items-center bg-muted px-5 font-spaceGrotesk text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground opacity-50"
            >
              Confirmar contratación
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            >
              {loading ? "Procesando..." : "Confirmar contratación"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}