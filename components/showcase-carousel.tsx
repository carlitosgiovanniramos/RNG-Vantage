"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type ShowcaseItem = {
  title: string;
  description: string;
  image: string;
  /** Encuadre de la foto dentro de la tarjeta vertical (object-position). */
  imagePosition?: string;
  href: string;
};

/** Duración del deslizamiento de una tarjeta a la siguiente. */
const SLIDE_MS = 850;
const SWIPE_THRESHOLD_PX = 50;

const arrowClass =
  "flex size-11 items-center justify-center rounded-full border border-foreground/30 text-foreground transition-colors hover:border-foreground";

/**
 * Carrusel infinito de presentación: avanza una tarjeta por clic con un
 * deslizamiento lento y nunca rebobina. Las tarjetas van repetidas tres veces;
 * al salir de la copia central, la fila salta sin animación a la misma
 * tarjeta de esa copia, así el bucle no tiene fin visible.
 * Muestra 1 tarjeta en móvil, 2 en tablet, 3 en laptop y 4 en pantallas anchas.
 */
export function ShowcaseCarousel({ items }: { items: ShowcaseItem[] }) {
  const count = items.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [index, setIndex] = useState(count);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [instant, setInstant] = useState(false);

  // Distancia entre tarjetas (ancho + hueco), recalculada al cambiar el tamaño.
  const measure = useCallback(() => {
    const track = trackRef.current;
    const firstItem = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstItem) return;
    setStep(firstItem.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0"));
    // Reubicar sin animación: al cargar no debe verse la fila deslizándose.
    setInstant(true);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measure]);

  // Tras un salto instantáneo, reactiva la animación en el siguiente cuadro.
  useEffect(() => {
    if (!instant) return;
    const frame = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(frame);
  }, [instant]);

  const indexRef = useRef(count);
  const fallbackRef = useRef<number | null>(null);

  const finishSlide = useCallback(() => {
    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
    setAnimating(false);
    // Fuera de la copia central: vuelve a la misma tarjeta dentro de ella.
    const current = indexRef.current;
    if (current >= 2 * count || current < count) {
      const normalized = (((current % count) + count) % count) + count;
      indexRef.current = normalized;
      setInstant(true);
      setIndex(normalized);
    }
  }, [count]);

  useEffect(
    () => () => {
      if (fallbackRef.current !== null) window.clearTimeout(fallbackRef.current);
    },
    [],
  );

  const go = (target: number) => {
    if (animating || target === index) return;
    indexRef.current = target;
    setAnimating(true);
    setIndex(target);
    // Respaldo: si la transición se interrumpe (p. ej. al redimensionar), no
    // llega transitionend y el carrusel quedaría bloqueado.
    fallbackRef.current = window.setTimeout(finishSlide, SLIDE_MS + 150);
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (delta <= -SWIPE_THRESHOLD_PX) go(index + 1);
    else if (delta >= SWIPE_THRESHOLD_PX) go(index - 1);
  };

  const active = index % count;
  const loopedItems = [0, 1, 2].flatMap((copy) =>
    items.map((item, i) => ({ item, key: `${copy}-${i}`, hidden: copy !== 1 })),
  );

  return (
    <div>
      <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div
          ref={trackRef}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && animating) finishSlide();
          }}
          className="flex gap-6"
          style={{
            transform: `translateX(${-index * step}px)`,
            transition: instant || !step ? "none" : `transform ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          }}
        >
          {loopedItems.map(({ item, key, hidden }) => (
            <a
              key={key}
              href={item.href}
              aria-hidden={hidden || undefined}
              tabIndex={hidden ? -1 : undefined}
              className={cn(
                "group relative flex h-[clamp(300px,52svh,520px)] shrink-0 flex-col justify-end overflow-hidden p-7 text-white",
                "basis-full sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] xl:basis-[calc((100%-4.5rem)/4)]",
              )}
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                style={{ objectPosition: item.imagePosition ?? "center" }}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/85"
              />

              <div className="relative flex items-end justify-between gap-4">
                {/* Título en una línea y descripción con alto fijo de 3 líneas:
                    así los textos quedan a la misma altura en todas las tarjetas. */}
                <div className="min-w-0">
                  <h3 className="truncate font-spaceGrotesk text-2xl font-semibold leading-tight tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 min-h-[4.875em] max-w-xs font-workSans text-base leading-relaxed text-white/85">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className="size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {count > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-6 sm:justify-between">
          <div aria-hidden className="hidden w-[6.5rem] sm:block" />
          <div className="flex items-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(count + i)}
                aria-label={`Ir a ${item.title}`}
                aria-current={i === active ? "true" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === active ? "w-10 bg-foreground" : "w-1.5 bg-foreground/30 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => go(index - 1)} aria-label="Anterior" className={arrowClass}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Siguiente" className={arrowClass}>
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
