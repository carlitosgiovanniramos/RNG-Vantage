import Link from "next/link";
import type { Database } from "@/types";

type CatalogService = Pick<
  Database["public"]["Tables"]["services"]["Row"],
  "id" | "name" | "description" | "type" | "price" | "duration_months"
>;

type CatalogoGridProps = {
  services: CatalogService[];
};

const SERVICE_TYPE_LABELS: Record<CatalogService["type"], string> = {
  manejo_redes: "Manejo de redes",
  auditoria: "Auditoria",
  capacitacion: "Capacitacion",
  otro: "Servicio unico",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getPriceLabel(service: CatalogService): string {
  if (service.type === "manejo_redes") {
    return `${formatCurrency(service.price)} / mes`;
  }

  return formatCurrency(service.price);
}

function getNatureLabel(serviceType: CatalogService["type"]): string {
  return serviceType === "manejo_redes" ? "Suscripcion mensual" : "Pago unico";
}

export function CatalogoGrid({ services }: CatalogoGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <article
          key={service.id}
          className="flex h-full flex-col rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {SERVICE_TYPE_LABELS[service.type]}
            </span>
            <span className="text-xs text-muted-foreground">{getNatureLabel(service.type)}</span>
          </div>

          <h2 className="mt-4 text-lg font-semibold">{service.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>

          <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            Duracion: {service.duration_months} mes(es)
          </div>

          <p className="mt-4 text-2xl font-bold">{getPriceLabel(service)}</p>

          <Link
            href={`/checkout?service_id=${service.id}`}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Contratar
          </Link>
        </article>
      ))}
    </div>
  );
}
