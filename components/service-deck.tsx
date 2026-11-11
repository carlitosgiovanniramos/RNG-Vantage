"use client";

import { useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  PANEL_DARK,
  PANEL_RED,
  ServicePanelContent,
} from "@/components/service-card";
import { getServiceDisplayName, type PublicService } from "@/lib/services";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD_PX = 50;

const arrowClass =
  "absolute top-1/2 z-40 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-foreground/25 bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:border-foreground";

/** "Sesión Audiovisual (6 videos)" para distinguir servicios con el mismo nombre. */
function labelOf(service: PublicService) {
  const { title, detail } = getServiceDisplayName(service);
  return detail ? `${title} (${detail})` : title;
}

const pad = (n: number) => String(n).padStart(2, "0");

type ServiceDeckProps = {
  services: PublicService[];
  /** Servicio que empieza al frente y lleva la etiqueta "Más popular". */
  featuredIndex?: number;
};

/**
 * Mazo giratorio de servicios: el servicio activo va al frente (gris carbón,
 * con todo su contenido) y el anterior y el siguiente asoman detrás a los lados
 * (rojos, sin contenido). Tocar una tarjeta de atrás, usar las flechas o
 * deslizar la trae al frente; el giro da la vuelta sin fin. Arriba, un
 * contador indica el servicio actual y el total del bloque.
 *
 * Con menos de 3 servicios las tarjetas se repiten para que siempre asome una
 * a cada lado y el mazo se vea equilibrado.
 */
export function ServiceDeck({ services, featuredIndex }: ServiceDeckProps) {
  const count = services.length;
  const slots =
    count >= 3 ? services : count === 2 ? [...services, ...services] : [...services, ...services, ...services];
  const slotCount = slots.length;

  const [active, setActive] = useState(
    featuredIndex !== undefined && featuredIndex < count ? featuredIndex : 0,
  );
  const touchStartX = useRef<number | null>(null);

  const go = (slot: number) => setActive(((slot % slotCount) + slotCount) % slotCount);
  const current = count > 0 ? active % count : 0;

  // Posición relativa al frente, en el rango más corto: -1 izquierda, 1 derecha.
  const offsetOf = (slot: number) => {
    let offset = slot - active;
    if (offset > slotCount / 2) offset -= slotCount;
    if (offset < -slotCount / 2) offset += slotCount;
    return offset;
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null || count < 2) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (delta <= -SWIPE_THRESHOLD_PX) go(active + 1);
    else if (delta >= SWIPE_THRESHOLD_PX) go(active - 1);
  };

  if (count === 0) return null;

  return (
    <div>
      <p
        aria-live="polite"
        aria-label={`Servicio ${current + 1} de ${count}`}
        className="mb-6 text-center font-spaceGrotesk text-sm font-semibold tabular-nums tracking-[0.12em] text-muted-foreground"
      >
        <span className="text-foreground">{pad(current + 1)}</span> / {pad(count)}
      </p>

      <div className="relative">
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Servicio anterior"
              className={cn(arrowClass, "left-0")}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Servicio siguiente"
              className={cn(arrowClass, "right-0")}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
        <div className="grid py-2" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {slots.map((service, slot) => {
            const offset = offsetOf(slot);
            const isFront = offset === 0;
            const isSide = Math.abs(offset) === 1;
            const canSelect = isSide && count > 1;

            return (
              <div
                key={`${service.id}-${slot}`}
                aria-hidden={!isFront || undefined}
                onClick={canSelect ? () => go(slot) : undefined}
                className={cn(
                  "relative flex w-[62%] flex-col items-center justify-self-center px-8 py-14 text-center text-white [grid-area:1/1]",
                  "transition-[transform,background-color,opacity] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]",
                  isFront ? PANEL_DARK : PANEL_RED,
                  isFront
                    ? "z-30"
                    : isSide
                      ? cn("z-20", canSelect && "cursor-pointer")
                      : "pointer-events-none z-10 opacity-0",
                )}
                style={{
                  transform: isFront
                    ? "translateX(0) scale(1)"
                    : isSide
                      ? `translateX(${offset * 20}%) scale(0.88)`
                      : "translateX(0) scale(0.8)",
                }}
                title={canSelect ? `Ver ${labelOf(service)}` : undefined}
              >
                <div
                  inert={!isFront}
                  className={cn(
                    "flex w-full flex-1 flex-col items-center transition-opacity duration-500",
                    isFront ? "opacity-100 delay-200" : "opacity-0",
                  )}
                >
                  <ServicePanelContent
                    service={service}
                    dark
                    featured={slot % count === featuredIndex}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
