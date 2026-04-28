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
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-3 text-muted-foreground">
          Selecciona un servicio del catalogo para continuar con la contratacion.
        </p>
        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ir al catalogo
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
        <h1 className="text-3xl font-bold">Servicio no encontrado</h1>
        <p className="mt-3 text-muted-foreground">
          Este servicio no esta disponible en este momento.
        </p>
        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Volver al catalogo
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
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Confirma los datos antes de crear tu contratacion.
      </p>

      {success && (
        <div className="mt-6 rounded-md border border-emerald-300 bg-emerald-50 px-6 py-6 text-emerald-900 shadow-sm dark:bg-emerald-950/20 dark:text-emerald-50">
          <h3 className="mb-2 text-xl font-bold text-emerald-800 dark:text-emerald-400">
            Solicitud de contratación registrada
          </h3>
          <p className="mb-4 text-emerald-800 dark:text-emerald-200">
            Tu suscripción está pendiente de pago.
          </p>

          <div className="my-4 grid gap-2 border-y border-emerald-200 py-4 dark:border-emerald-800/60">
            <div className="flex justify-between">
              <span className="font-semibold">Servicio contratado:</span>
              <span className="text-right">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Monto a pagar:</span>
              <span className="text-right">{formatCurrency(service.price)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="font-semibold">Estado:</span>
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Pendiente de pago
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-100/50 p-4 dark:bg-emerald-950/40">
            <h4 className="mb-2 font-semibold">Datos de transferencia:</h4>
            <ul className="space-y-1 text-sm text-emerald-900/90 dark:text-emerald-100/90">
              <li>
                <span className="font-medium">Banco:</span> Banco Pichincha
              </li>
              <li>
                <span className="font-medium">Cuenta:</span> Ahorros 2200000000
              </li>
              <li>
                <span className="font-medium">Titular:</span> Ruth Noemi Gómez Lescano
              </li>
              <li>
                <span className="font-medium">Concepto:</span> Pago de suscripción RGL Estudio
              </li>
            </ul>
          </div>

          <p className="mt-4 text-sm font-medium text-emerald-900 dark:text-emerald-100">
            Cuando realices el pago, envía el comprobante al administrador. Tu suscripción será activada cuando el pago sea verificado.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">{service.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-muted px-3 py-1 font-medium">{serviceNature}</span>
          <span className="rounded-full bg-muted px-3 py-1 font-medium">
            Duracion: {service.duration_months} mes(es)
          </span>
        </div>
        <p className="mt-5 text-2xl font-bold">{priceLabel}</p>

        <CheckoutForm
          serviceId={service.id}
          isRecurringService={isRecurringService}
          success={success}
        />

        {success && (
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Volver al catalogo
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
