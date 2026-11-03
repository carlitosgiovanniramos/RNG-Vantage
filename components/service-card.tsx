import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  CheckCircle2,
  Clapperboard,
  GraduationCap,
  Network,
  type LucideIcon,
} from "lucide-react";

import type { ServiceType } from "@/types/database";
import {
  getServiceDisplayName,
  getServiceHighlights,
  getServicePrice,
  type PublicService,
} from "@/lib/services";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<ServiceType, LucideIcon> = {
  manejo_redes: Network,
  auditoria: BarChart,
  capacitacion: GraduationCap,
  otro: Clapperboard,
};

type ServiceCardProps = {
  service: PublicService;
  /** Resalta la tarjeta (línea roja, etiqueta "Más popular" y botón en rojo) */
  featured?: boolean;
};

/** Tarjeta pública de un servicio: ícono, nombre, 3 viñetas, precio y botón de contratar. */
export function ServiceCard({ service, featured = false }: ServiceCardProps) {
  const Icon = TYPE_ICONS[service.type];
  const name = getServiceDisplayName(service);
  const price = getServicePrice(service);
  const highlights = getServiceHighlights(service);

  return (
    <div
      className={cn(
        "relative flex flex-col border bg-card p-7 sm:p-8",
        featured ? "border-primary/40" : "border-border",
      )}
    >
      {featured ? (
        <>
          <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
          <span className="absolute right-0 top-1.5 bg-primary px-3 py-1 font-spaceGrotesk text-[0.65rem] font-black uppercase tracking-[0.18em] text-primary-foreground">
            Más popular
          </span>
        </>
      ) : null}

      <div className="mb-7 flex size-12 items-center justify-center border border-primary/40 bg-primary/5">
        <Icon className="size-6 text-primary" />
      </div>

      <h3 className="font-spaceGrotesk text-2xl font-black uppercase leading-[0.98] tracking-tight text-foreground sm:text-3xl">
        {name.title}
      </h3>
      {name.detail ? (
        <p className="mt-2 font-workSans text-base text-muted-foreground">{name.detail}</p>
      ) : null}

      <ul className="my-6 flex-1 space-y-3 border-t border-primary/20 pt-6">
        {highlights.map((item) => (
          <li key={item} className="flex gap-3 font-workSans text-sm leading-relaxed text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="line-clamp-2">{item}</span>
          </li>
        ))}
      </ul>

      <p className="mb-5 flex items-baseline gap-1.5 border-t border-primary/20 pt-5 font-spaceGrotesk text-foreground">
        <span className="text-4xl font-black tracking-tight sm:text-5xl">{price.amount}</span>
        {price.unit ? (
          <span className="font-workSans text-sm font-medium text-muted-foreground">{price.unit}</span>
        ) : null}
      </p>

      <Link
        href={`/checkout?service_id=${service.id}`}
        className={cn(
          "inline-flex h-12 w-full items-center justify-between border px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] transition-colors duration-300",
          featured
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/85"
            : "border-foreground/80 text-foreground hover:bg-foreground hover:text-background",
        )}
      >
        <span>Contratar</span>
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
