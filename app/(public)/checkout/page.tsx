import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./checkout-form";

type CheckoutPageProps = {
  searchParams: Promise<{
    service_id?: string;
    success?: string;
    error?: string;
  }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  "service-not-found": "El servicio no existe o no esta activo.",
  "create-failed": "No se pudo crear la suscripcion. Intenta nuevamente.",
  "transaction-failed": "No se pudo registrar la transaccion. Intenta nuevamente.",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const serviceId = params.service_id ?? "";

  if (!serviceId) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
        <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground">Checkout</h1>
        <p className="mt-3 font-workSans text-muted-foreground">
          Selecciona un servicio del catálogo para continuar con la contratación.
        </p>
        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center bg-primary px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir al catálogo
          </Link>
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("id, name, description, type, price, duration_months, is_active")
    .eq("id", serviceId)
    .eq("is_active", true)
    .maybeSingle();

  if (!service) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
        <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground">Servicio no encontrado</h1>
        <p className="mt-3 font-workSans text-muted-foreground">
          Este servicio no está disponible en este momento.
        </p>
        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center bg-primary px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }

  const isRecurringService = service.type === "manejo_redes";
  const priceLabel = isRecurringService
    ? `${formatCurrency(service.price)} / mes`
    : formatCurrency(service.price);
  const serviceNature = isRecurringService
    ? "Suscripcion mensual"
    : "Servicio unico";
  const success = params.success === "1";
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <div className="inline-block bg-primary px-3 py-1 font-spaceGrotesk text-xs font-bold uppercase tracking-widest text-white">
          Contratación
        </div>
        <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">Checkout</h1>
        <p className="font-workSans text-sm text-muted-foreground">
          Confirma los datos antes de crear tu contratación.
        </p>
      </div>

      {success && (
        <div className="mb-6 border border-emerald-200 bg-emerald-50 px-6 py-6 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          <h3 className="mb-2 font-spaceGrotesk text-lg font-black uppercase tracking-tight text-emerald-800 dark:text-emerald-400">
            Solicitud de contratación registrada
          </h3>
          <p className="mb-4 font-workSans text-sm text-emerald-800 dark:text-emerald-200">
            Tu suscripción está pendiente de pago.
          </p>

          <div className="my-4 grid gap-2 border-y border-emerald-200 py-4 dark:border-emerald-800/60">
            <div className="flex justify-between gap-4">
              <span className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Servicio contratado</span>
              <span className="font-workSans text-sm text-right">{service.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Monto a pagar</span>
              <span className="font-workSans text-sm text-right">{formatCurrency(service.price)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Estado</span>
              <span className="bg-amber-100 px-3 py-0.5 font-spaceGrotesk text-xs font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Pendiente de pago
              </span>
            </div>
          </div>

          <div className="border border-emerald-200/60 bg-emerald-100/50 p-4 dark:border-emerald-800/40 dark:bg-emerald-950/40">
            <h4 className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">Datos de transferencia</h4>
            <ul className="space-y-1 font-workSans text-sm text-emerald-900/90 dark:text-emerald-100/90">
              <li><span className="font-bold">Banco:</span> Banco Pichincha</li>
              <li><span className="font-bold">Cuenta:</span> Ahorros 2200000000</li>
              <li><span className="font-bold">Titular:</span> Ruth Noemi Gómez Lescano</li>
              <li><span className="font-bold">Concepto:</span> Pago de suscripción RGL Estudio</li>
            </ul>
          </div>

          <p className="mt-4 font-workSans text-sm text-emerald-900 dark:text-emerald-100">
            Cuando realices el pago, envía el comprobante al administrador. Tu suscripción será activada cuando el pago sea verificado.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 font-workSans text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="border border-border/60 bg-card/80 p-6 backdrop-blur-sm sm:p-8">
        <h2 className="font-spaceGrotesk text-xl font-black uppercase tracking-tight text-foreground">{service.name}</h2>
        <p className="mt-2 font-workSans text-sm text-muted-foreground">{service.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="border border-border/60 bg-muted/60 px-3 py-1 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{serviceNature}</span>
          <span className="border border-border/60 bg-muted/60 px-3 py-1 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Duración: {service.duration_months} mes(es)
          </span>
        </div>
        <p className="mt-5 font-spaceGrotesk text-2xl font-black text-foreground">{priceLabel}</p>

        <CheckoutForm
          serviceId={service.id}
          isRecurringService={isRecurringService}
          success={success}
        />

        {success && (
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex h-11 items-center border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted"
            >
              Volver al catálogo
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
