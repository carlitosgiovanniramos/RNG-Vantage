"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { chargeWithCard } from "./payment-actions";

import { IKushki, init } from "@kushki/js-sdk";
import { ICard, initCardToken } from "@kushki/js-sdk/Card";

function formatUsd(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

let kushkiInstance: IKushki | null = null;
let cardInstance: ICard | null = null;

/**
 * BLOQUE A — IMPLEMENTAR CON KUSHKIJS.
 * Carga el SDK e instala los campos de tarjeta (hosted fields en iframes)
 * dentro de los contenedores #kushki-card-number / -expiry / -cvv.
 */
async function initKushkiCardFields(amount: number, isSubscription: boolean): Promise<void> {
  const merchantId = process.env.NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID;
  if (!merchantId) {
    throw new Error("Missing NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID");
  }

  // 1. Inicializar la instancia base de Kushki
  kushkiInstance = await init({
    inTest: process.env.NEXT_PUBLIC_KUSHKI_ENV !== "production",
    publicCredentialId: merchantId,
  });

  // 2. Inicializar los campos de la tarjeta (hosted fields)
  cardInstance = await initCardToken(kushkiInstance, {
    currency: "USD",
    amount: {
      subtotalIva: 0,
      subtotalIva0: amount,
      iva: 0,
    },
    isSubscription: isSubscription,
    fields: {
      cardholderName: {
        selector: "kushki-card-name",
        placeholder: "Ej: Juan Perez",
      },
      cardNumber: {
        selector: "kushki-card-number",
        placeholder: "0000 0000 0000 0000",
      },
      expirationDate: {
        selector: "kushki-card-expiry",
        placeholder: "MM/YY",
      },
      cvv: {
        selector: "kushki-card-cvv",
        placeholder: "123",
      },
    },
    styles: {
      container: {
        height: "100%",
        display: "flex",
        alignItems: "center",
      },
      input: {
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        fontFamily: "inherit",
        fontSize: "14px",
        color: "inherit",
      },
    },
  });
}

/**
 * BLOQUE B — IMPLEMENTAR CON KUSHKIJS.
 * Solicita el token de la tarjeta usando la instancia del BLOQUE A.
 * Contrato: devuelve un string `token` no vacio, o lanza un error
 * (lo captura el catch de handlePay).
 */
async function requestCardToken(): Promise<string> {
  if (!cardInstance) {
    throw new Error("Card SDK no ha sido inicializado");
  }

  const response = await cardInstance.requestToken();
  if (!response || !response.token) {
    throw new Error("No se pudo obtener el token de la tarjeta");
  }

  return response.token;
}

/**
 * Formulario de pago con tarjeta.
 * La tokenizacion ocurre en el navegador (KushkiJS, campos en iframes):
 * el numero de tarjeta nunca toca nuestro DOM (requisito PCI). El
 * servidor solo recibe el `token`.
 */
export function CardForm({
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
  const [sdkReady, setSdkReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    
    // Solo inicializa si no esta listo
    if (!sdkReady) {
      initKushkiCardFields(amount, autoRenew)
        .then(() => {
          if (!cancelled) setSdkReady(true);
        })
        .catch((error) => {
          console.error("Error al inicializar Kushki:", error);
          if (!cancelled) onError("No se pudo cargar la pasarela de pago.");
        });
    }

    return () => {
      cancelled = true;
    };
  }, [onError, amount, autoRenew, sdkReady]);

  async function handlePay() {
    setLoading(true);
    onError(null);
    try {
      const token = await requestCardToken();

      const res = await chargeWithCard({
        service_id: serviceId,
        auto_renew: autoRenew,
        token,
      });

      if (!res.success) {
        onError(res.error || "No se pudo procesar el pago.");
        if (res.error === "Debes iniciar sesion para continuar.") {
          setTimeout(() => {
            const redirect = encodeURIComponent(`/checkout?service_id=${serviceId}`);
            router.push(`/login?redirect=${redirect}`);
          }, 2000);
        }
        return;
      }
      router.push(`/checkout?service_id=${serviceId}&success=1`);
    } catch {
      onError("Error al procesar el pago. Revisa los datos de la tarjeta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Titular de la tarjeta
        </label>
        <div id="kushki-card-name" className="h-11 border border-border bg-background px-3" />
      </div>
      <div>
        <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Numero de tarjeta
        </label>
        <div id="kushki-card-number" className="h-11 border border-border bg-background px-3" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Vencimiento
          </label>
          <div id="kushki-card-expiry" className="h-11 border border-border bg-background px-3" />
        </div>
        <div>
          <label className="mb-1 block font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            CVV
          </label>
          <div id="kushki-card-cvv" className="h-11 border border-border bg-background px-3" />
        </div>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={loading || !sdkReady}
        className="inline-flex h-12 w-full items-center justify-between bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
      >
        <span>
          {loading ? "Procesando..." : !sdkReady ? "Cargando..." : `Pagar ${formatUsd(amount)}`}
        </span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
