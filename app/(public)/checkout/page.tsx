import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createSubscriptionAction } from "./actions";

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
        <div className="mt-6 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Suscripcion creada con exito.
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

        <form action={createSubscriptionAction} className="mt-6 space-y-4">
          <input type="hidden" name="service_id" value={service.id} />

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

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Confirmar contratacion
          </button>
        </form>
      </div>
    </section>
  );
}
