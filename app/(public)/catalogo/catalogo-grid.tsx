"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LucideIcon,
  Network,
  Settings2,
} from "lucide-react";

import type { Database, ServiceType } from "@/types/database";
import { Button } from "@/components/ui/button";

type Service = Omit<Database["public"]["Tables"]["services"]["Row"], "type"> & {
  type: ServiceType;
};

const SERVICE_TYPES: ServiceType[] = [
  "manejo_redes",
  "auditoria",
  "capacitacion",
  "otro",
];

function normalizeServiceType(value: string): ServiceType | null {
  return SERVICE_TYPES.includes(value as ServiceType)
    ? (value as ServiceType)
    : null;
}

const TYPE_LABELS: Record<ServiceType | "Todos", string> = {
  Todos: "Todos",
  manejo_redes: "Redes Sociales",
  auditoria: "Auditoria",
  capacitacion: "Capacitacion",
  otro: "Otro",
};

const TYPE_ICONS: Record<ServiceType, LucideIcon> = {
  manejo_redes: Network,
  auditoria: BarChart,
  capacitacion: GraduationCap,
  otro: Settings2,
};

function getPriceDisplay(service: Service): { main: string; unit: string } {
  if (service.price === 0) return { main: "Gratis", unit: "" };

  const unit = service.type === "manejo_redes" ? "/mes" : "";

  return {
    main: `$${service.price}`,
    unit,
  };
}

function getDescriptionItems(description?: string | null): string[] {
  return (description ?? "Servicio disponible bajo consulta.")
    .split(/(?:Incluye:|\. |; )/i)
    .map((item) => item.replace(/\.$/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

interface CatalogoGridProps {
  services: Database["public"]["Tables"]["services"]["Row"][];
}

export function CatalogoGrid({ services }: CatalogoGridProps) {
  const [activeFilter, setActiveFilter] = useState<ServiceType | "Todos">("Todos");
  const normalizedServices: Service[] = services
    .map((service) => {
      const type = normalizeServiceType(service.type);
      if (!type) return null;
      return { ...service, type } as Service;
    })
    .filter((service): service is Service => Boolean(service));

  const availableTypes = Array.from(
    new Set(normalizedServices.map((s) => s.type)),
  );
  const filterOptions: (ServiceType | "Todos")[] = ["Todos", ...availableTypes];

  const filtered =
    activeFilter === "Todos"
      ? normalizedServices
      : normalizedServices.filter((s) => s.type === activeFilter);

  return (
    <div>
      {availableTypes.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-5">
          {filterOptions.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`font-spaceGrotesk px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] transition-colors duration-200 ${
                activeFilter === type
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full border border-border bg-card py-24 text-center">
            <p className="font-spaceGrotesk text-lg text-muted-foreground">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        ) : (
          filtered.map((service, i) => {
            const Icon = TYPE_ICONS[service.type];
            const { main, unit } = getPriceDisplay(service);
            const descriptionItems = getDescriptionItems(service.description);
            const isGrayHover = i % 2 === 0;

            return (
              <div
                key={service.id}
                className={`group relative flex min-h-[520px] flex-col overflow-hidden border border-white bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_rgba(148,163,153,0.45)] sm:p-7 ${
                  isGrayHover
                    ? "hover:border-[#3d4140]/70 hover:bg-[#343736]"
                    : "hover:border-primary hover:bg-primary"
                }`}
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-transparent transition-colors duration-300 ${isGrayHover ? "group-hover:bg-[#686c6a]" : "group-hover:bg-primary"}`} />

                <div className="mb-7 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center border border-primary/45 bg-background transition-colors duration-300 group-hover:border-primary-foreground/70 group-hover:bg-primary-foreground/10">
                      <Icon className="h-7 w-7 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                    </div>
                    <span className="border border-primary/30 bg-primary/5 px-3 py-1 font-spaceGrotesk text-[0.65rem] font-black uppercase tracking-[0.18em] text-primary transition-colors duration-300 group-hover:border-primary-foreground/60 group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground">
                      {TYPE_LABELS[service.type]}
                    </span>
                  </div>
                  <span className="font-spaceGrotesk select-none text-5xl font-black leading-none text-foreground/10 transition-colors duration-300 group-hover:text-primary-foreground/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mb-5 font-spaceGrotesk text-2xl font-black uppercase leading-[0.98] tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary-foreground sm:text-3xl">
                  {service.name}
                </h3>

                <div className="mb-7 flex-1 border-y border-primary/20 py-5 transition-colors duration-300 group-hover:border-primary-foreground/25">
                  <ul className="space-y-3">
                    {descriptionItems.map((item) => (
                      <li key={item} className="flex gap-3 font-workSans text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-primary-foreground/85">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6 grid grid-cols-[1fr_auto] items-end gap-4">
                  <div>
                    <span className="font-spaceGrotesk text-4xl font-black text-foreground transition-colors duration-300 group-hover:text-primary-foreground sm:text-5xl">
                      {main}
                    </span>
                    {unit && (
                      <span className="ml-1 font-workSans text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-primary-foreground/70">
                        {unit}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-2 text-primary transition-colors duration-300 group-hover:border-primary-foreground/60 group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground">
                    <Clock3 className="h-4 w-4 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                    <span className="font-spaceGrotesk text-[0.65rem] font-black uppercase tracking-[0.14em]">
                      {service.duration_months} mes{service.duration_months === 1 ? "" : "es"}
                    </span>
                  </div>
                </div>

                <Link href={`/checkout?service_id=${service.id}`}>
                  <Button
                    variant="outline"
                    className={`h-12 w-full justify-between rounded-none border-foreground/80 bg-transparent px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background group-hover:border-primary-foreground group-hover:text-primary-foreground group-hover:hover:bg-primary-foreground ${
                      isGrayHover
                        ? "group-hover:hover:text-[#343736]"
                        : "group-hover:hover:text-primary"
                    }`}
                  >
                    <span>Contratar</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
