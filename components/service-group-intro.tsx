import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type ServiceGroupIntroProps = {
  /** Primera palabra del título, en la tipografía de títulos ("Redes"). */
  titleLead: string;
  /** Resto del título, en cursiva editorial ("sociales"). */
  titleAccent: string;
  /** Lo que ofrece el bloque, en líneas cortas. */
  highlights: string[];
  cta: { label: string; href: string };
  /** Pone el mazo a la izquierda y el texto a la derecha (bloques intercalados). */
  reverse?: boolean;
  /** Contenido del otro lado: el mazo de servicios del bloque. */
  children: ReactNode;
};

/**
 * Bloque del catálogo: de un lado, título grande en dos estilos, lo que
 * ofrece y un botón; del otro, el mazo de servicios. Con `reverse` se
 * invierten los lados para intercalar bloques y el texto se alinea a la
 * derecha, hacia el borde de la página.
 */
export function ServiceGroupIntro({
  titleLead,
  titleAccent,
  highlights,
  cta,
  reverse = false,
  children,
}: ServiceGroupIntroProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-12 lg:gap-16",
        reverse
          ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
          : "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]",
      )}
    >
      <div className={cn(reverse && "lg:order-2 lg:text-right")}>
        <h2 className="text-foreground">
          <span className="block font-spaceGrotesk text-6xl font-bold leading-[0.9] tracking-[-0.05em] sm:text-7xl">
            {titleLead}
          </span>
          <span className="mt-2 block font-serif text-5xl italic leading-none sm:text-6xl">
            {titleAccent}
            <span className="not-italic text-[#b83a14]">.</span>
          </span>
        </h2>

        <ul className="mt-8 space-y-1 font-spaceGrotesk text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <Link
          href={cta.href}
          className="group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-[#2c2f2e] px-8 font-spaceGrotesk text-sm font-semibold text-white transition-colors hover:bg-[#2c2f2e]/85"
        >
          {cta.label}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className={cn(reverse && "lg:order-1")}>{children}</div>
    </div>
  );
}
