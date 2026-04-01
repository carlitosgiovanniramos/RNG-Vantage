"use client";

import { useState } from "react";
import Link from "next/link";
import { Network, BarChart, GraduationCap, Settings2, LucideIcon } from "lucide-react";

import type { Database } from "@/types/database";
import type { ServiceType } from "@/types/database";
import { Button } from "@/components/ui/button";

type Service = Database["public"]["Tables"]["services"]["Row"];

const TYPE_LABELS: Record<ServiceType | "Todos", string> = {
  Todos: "Todos",
  manejo_redes: "Redes Sociales",
  auditoria: "Auditoría",
  capacitacion: "Capacitación",
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
  const units: Record<ServiceType, string> = {
    manejo_redes: "/mes",
    auditoria: "/auditoría",
    capacitacion: "/sesión",
    otro: "",
  };
  return {
    main: `$${service.price}`,
    unit: units[service.type],
  };
}

interface CatalogoGridProps {
  services: Service[];
}

export function CatalogoGrid({ services }: CatalogoGridProps) {
  const [activeFilter, setActiveFilter] = useState<ServiceType | "Todos">("Todos");

  const availableTypes = Array.from(new Set(services.map((s) => s.type)));
  const filterOptions: (ServiceType | "Todos")[] = ["Todos", ...availableTypes];

  const filtered =
    activeFilter === "Todos"
      ? services
      : services.filter((s) => s.type === activeFilter);

  return (
    <div>
      {/* Filtros */}
      {availableTypes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {filterOptions.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`font-spaceGrotesk font-bold text-sm uppercase tracking-wide px-5 py-2.5 transition-colors duration-200 ${
                activeFilter === type
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-background py-24 text-center">
            <p className="font-spaceGrotesk text-muted-foreground text-lg">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        ) : (
          filtered.map((service, i) => {
            const Icon = TYPE_ICONS[service.type];
            const { main, unit } = getPriceDisplay(service);

            return (
              <div
                key={service.id}
                className="relative bg-card p-8 sm:p-10 group hover:bg-primary transition-colors duration-500 flex flex-col"
              >
                {/* Número decorativo */}
                <span className="absolute top-6 right-8 font-spaceGrotesk font-black text-6xl text-foreground/10 group-hover:text-primary-foreground/10 select-none transition-colors duration-500">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Icono */}
                <Icon className="h-14 w-14 mb-8 text-primary group-hover:text-primary-foreground transition-colors duration-500 shrink-0" />

                {/* Nombre */}
                <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase tracking-tighter text-foreground group-hover:text-primary-foreground transition-colors duration-500 mb-3">
                  {service.name}
                </h3>

                {/* Descripción */}
                <p className="font-workSans text-muted-foreground group-hover:text-primary-foreground/75 transition-colors duration-500 mb-8 flex-1 leading-relaxed">
                  {service.description ?? "Servicio disponible bajo consulta."}
                </p>

                {/* Precio */}
                <div className="mb-8">
                  <span className="text-3xl sm:text-4xl font-spaceGrotesk font-black text-foreground group-hover:text-primary-foreground transition-colors duration-500">
                    {main}
                  </span>
                  {unit && (
                    <span className="font-workSans text-sm text-muted-foreground group-hover:text-primary-foreground/70 transition-colors duration-500 ml-1">
                      {unit}
                    </span>
                  )}
                  {service.duration_months > 1 && (
                    <p className="font-workSans text-xs text-muted-foreground group-hover:text-primary-foreground/60 transition-colors duration-500 mt-1">
                      Duración: {service.duration_months} meses
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link href={`/checkout?service_id=${service.id}`}>
                  <Button
                    variant="outline"
                    className="w-full rounded-none h-auto py-3 font-spaceGrotesk font-bold text-sm uppercase tracking-wide border-foreground text-foreground group-hover:border-primary-foreground group-hover:text-primary-foreground group-hover:bg-transparent transition-colors duration-500"
                  >
                    Contratar
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
