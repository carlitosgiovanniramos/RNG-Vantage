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
    } catch (err) {
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
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="service_id" value={serviceId} />

        <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
          <input
            type="checkbox"
            name="auto_renew"
            defaultChecked={isRecurringService}
            disabled={!isRecurringService}
            className="mt-0.5 h-4 w-4 rounded border-border"
          />
          <span>
            Renovar automaticamente
            <span className="block text-muted-foreground">
              {isRecurringService
                ? "Solo aplica para servicios de manejo de redes."
                : "No aplica a servicios unicos: se forzara auto_renew = false."}
            </span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {success ? (
            <button
              type="button"
              disabled
              className="inline-flex h-10 items-center justify-center rounded-md bg-muted px-4 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
            >
              Confirmar contratacion
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : "Confirmar contratacion"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}