import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  getServiceDisplayName,
  getServiceHighlights,
  getServicePrice,
  type PublicService,
} from "@/lib/services";
import { cn } from "@/lib/utils";

// Paleta de los paneles: rojo profundo (tertiary), más suave a la vista que el
// primary en superficies grandes, y el gris carbón del sitio (valor fijo para
// que no cambie en modo oscuro, donde el texto blanco dejaría de leerse).
export const PANEL_RED = "bg-[#9e2f0e]";
export const PANEL_DARK = "bg-[#2c2f2e]";
const ACCENT = "bg-[#b83a14]";

type ServiceCardProps = {
  service: PublicService;
  /** Posición en la fila: los paneles alternan rojo profundo (pares) y gris carbón (impares). */
  index: number;
  /** Plan destacado: sobresale arriba y abajo y lleva la etiqueta "Más popular". */
  featured?: boolean;
};

/**
 * Contenido de un panel de servicio (centrado, en blanco): etiqueta opcional,
 * nombre, detalle, precio, lo que incluye y botón. Se usa en los paneles del
 * inicio y en el mazo giratorio del catálogo.
 */
export function ServicePanelContent({
  service,
  dark,
  featured = false,
}: {
  service: PublicService;
  /** Panel gris carbón (true) o rojo (false): cambia el estilo del botón y la etiqueta. */
  dark: boolean;
  featured?: boolean;
}) {
  const name = getServiceDisplayName(service);
  const price = getServicePrice(service);
  const highlights = getServiceHighlights(service);

  return (
    <>
      {featured ? (
        <span
          className={cn(
            "mb-5 px-3 py-1 font-spaceGrotesk text-xs font-semibold tracking-[-0.01em] text-white",
            dark ? ACCENT : PANEL_DARK,
          )}
        >
          Más popular
        </span>
      ) : null}

      <h3 className="font-spaceGrotesk text-3xl font-semibold leading-[1] tracking-[-0.05em]">
        {name.title}
      </h3>
      {name.detail ? (
        <p className="mt-2 font-workSans text-sm text-white/70">{name.detail}</p>
      ) : null}

      <p className="mt-5 flex items-baseline justify-center gap-1.5 font-spaceGrotesk">
        <span className="text-4xl font-semibold tracking-[-0.04em]">{price.amount}</span>
        {price.unit ? (
          <span className="font-workSans text-sm text-white/70">{price.unit}</span>
        ) : null}
      </p>

      <ul className="my-8 flex-1 space-y-2 font-workSans text-sm leading-relaxed text-white/85">
        {highlights.map((item) => (
          <li key={item} className="line-clamp-2">
            {item}
          </li>
        ))}
      </ul>

      <Link
        href={`/checkout?service_id=${service.id}`}
        className={cn(
          "group inline-flex h-11 items-center gap-2 px-6 font-spaceGrotesk text-sm font-semibold tracking-[-0.01em] transition-colors duration-300",
          dark
            ? "border border-white text-white hover:bg-white hover:text-[#2c2f2e]"
            : "bg-[#2c2f2e] text-white hover:bg-[#2c2f2e]/85",
        )}
      >
        Contratar
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </>
  );
}

/**
 * Panel público de un servicio. Los paneles van pegados y alternan color,
 * con el contenido centrado: nombre, detalle, precio, lo que incluye y botón.
 */
export function ServiceCard({ service, index, featured = false }: ServiceCardProps) {
  const dark = index % 2 === 1;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center px-8 py-12 text-center text-white",
        dark ? PANEL_DARK : PANEL_RED,
        featured && "z-10 md:-my-6 md:py-[4.5rem]",
      )}
    >
      <ServicePanelContent service={service} dark={dark} featured={featured} />
    </div>
  );
}
