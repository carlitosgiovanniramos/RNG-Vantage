import Link from "next/link";
import { CheckCircle2, Clock3, CreditCard, FileCheck2, ReceiptText, ShieldCheck } from "lucide-react";
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

function getDescriptionItems(description?: string | null): string[] {
  return (description ?? "Servicio disponible bajo consulta.")
    .split(/(?:Incluye:|\. |; )/i)
    .map((item) => item.replace(/\.$/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const serviceId = params.service_id ?? "";

  if (!serviceId) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
        <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground">Checkout</h1>
        <p className="mt-3 font-workSans text-muted-foreground">
          Selecciona un servicio del catalogo para continuar con la contratacion.
        </p>
        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center bg-primary px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
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
        <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground">Servicio no encontrado</h1>
        <p className="mt-3 font-workSans text-muted-foreground">
          Este servicio no esta disponible en este momento.
        </p>
        <div className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center bg-primary px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
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
  const descriptionItems = getDescriptionItems(service.description);
  const success = params.success === "1";
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-block bg-primary px-3 py-1 font-spaceGrotesk text-xs font-bold uppercase tracking-widest text-white">
            Contratacion
          </div>
          <h1 className="font-spaceGrotesk text-4xl font-black uppercase leading-none tracking-tight text-foreground sm:text-5xl">
            Resumen del servicio
          </h1>
          <p className="max-w-2xl font-workSans text-sm text-muted-foreground">
            Revisa el alcance, la duracion y el valor antes de confirmar la contratacion.
          </p>
        </div>
        <div className="grid grid-cols-3 border border-border bg-card text-center">
          {["Servicio", "Pago", "Confirmacion"].map((step, index) => (
            <div key={step} className="min-w-24 border-r border-border px-4 py-3 last:border-r-0">
              <div className="font-spaceGrotesk text-lg font-black text-primary">0{index + 1}</div>
              <div className="font-spaceGrotesk text-[0.62rem] font-black uppercase tracking-[0.16em] text-muted-foreground">
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      {success && (
        <div className="mb-6 border border-emerald-200 bg-emerald-50 px-6 py-6 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          <h3 className="mb-2 font-spaceGrotesk text-lg font-black uppercase tracking-tight text-emerald-800 dark:text-emerald-400">
            Solicitud de contratacion registrada
          </h3>
          <p className="mb-4 font-workSans text-sm text-emerald-800 dark:text-emerald-200">
            Tu suscripcion esta pendiente de pago.
          </p>

          <div className="my-4 grid gap-2 border-y border-emerald-200 py-4 dark:border-emerald-800/60">
            <div className="flex justify-between gap-4">
              <span className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Servicio contratado</span>
              <span className="text-right font-workSans text-sm">{service.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Monto a pagar</span>
              <span className="text-right font-workSans text-sm">{formatCurrency(service.price)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
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
              <li><span className="font-bold">Titular:</span> Ruth Noemi Gomez Lescano</li>
              <li><span className="font-bold">Concepto:</span> Pago de suscripcion RGL Estudio</li>
            </ul>
          </div>

          <p className="mt-4 font-workSans text-sm text-emerald-900 dark:text-emerald-100">
            Cuando realices el pago, envia el comprobante al administrador. Tu suscripcion sera activada cuando el pago sea verificado.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 font-workSans text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="border border-border bg-card">
          <div className="border-b border-border p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="border border-border bg-muted/60 px-3 py-1 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">{serviceNature}</span>
              <span className="inline-flex items-center gap-2 border border-border bg-muted/60 px-3 py-1 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 text-primary" />
                {service.duration_months} mes{service.duration_months === 1 ? "" : "es"}
              </span>
            </div>
            <h2 className="font-spaceGrotesk text-3xl font-black uppercase leading-none tracking-tight text-foreground sm:text-4xl">
              {service.name}
            </h2>
          </div>

          <div className="grid gap-0 md:grid-cols-[1fr_220px]">
            <div className="p-6 sm:p-8">
              <h3 className="mb-4 font-spaceGrotesk text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                Alcance incluido
              </h3>
              <ul className="space-y-4">
                {descriptionItems.map((item) => (
                  <li key={item} className="flex gap-3 border-b border-border/70 pb-4 font-workSans text-sm leading-relaxed text-muted-foreground last:border-b-0 last:pb-0">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-muted/30 p-6 md:border-l md:border-t-0">
              <h3 className="mb-4 font-spaceGrotesk text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                Detalles
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="font-spaceGrotesk text-[0.66rem] font-black uppercase tracking-[0.16em] text-muted-foreground">Tipo</div>
                  <div className="mt-1 font-workSans text-sm text-foreground">{serviceNature}</div>
                </div>
                <div>
                  <div className="font-spaceGrotesk text-[0.66rem] font-black uppercase tracking-[0.16em] text-muted-foreground">Duracion</div>
                  <div className="mt-1 font-workSans text-sm text-foreground">{service.duration_months} mes{service.duration_months === 1 ? "" : "es"}</div>
                </div>
                <div>
                  <div className="font-spaceGrotesk text-[0.66rem] font-black uppercase tracking-[0.16em] text-muted-foreground">Estado inicial</div>
                  <div className="mt-1 font-workSans text-sm text-foreground">Pendiente de pago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="border border-border bg-card p-6 sm:p-7 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border border-border bg-background">
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">Total a pagar</h3>
              <p className="font-workSans text-xs text-muted-foreground">Se genera como transaccion pendiente.</p>
            </div>
          </div>

          <div className="border-y border-border py-6">
            <p className="font-spaceGrotesk text-5xl font-black tracking-tight text-foreground">{priceLabel}</p>
          </div>

          <div className="my-6 space-y-3">
            <div className="flex items-center gap-3 font-workSans text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              Pago por transferencia bancaria.
            </div>
            <div className="flex items-center gap-3 font-workSans text-sm text-muted-foreground">
              <FileCheck2 className="h-4 w-4 text-primary" />
              Activacion despues de verificar el comprobante.
            </div>
            <div className="flex items-center gap-3 font-workSans text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Sin renovacion para servicios unicos.
            </div>
          </div>

          <CheckoutForm
            serviceId={service.id}
            isRecurringService={isRecurringService}
            success={success}
            amount={service.price}
          />

          {success && (
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/catalogo"
                className="inline-flex h-11 items-center border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted"
              >
                Volver al catalogo
              </Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
