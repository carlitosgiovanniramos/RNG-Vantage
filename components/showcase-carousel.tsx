"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const arrowClass =
  "flex size-11 items-center justify-center rounded-full border border-foreground/30 text-foreground transition-colors hover:border-foreground";

/**
 * Carrusel de presentación con tarjetas altas de foto. Muestra tarjetas
 * completas: 1 en móvil, 2 en tablet y 3 en escritorio. Los puntos marcan la
 * posición y las flechas dan la vuelta: después de la última vuelve a la primera.
 */
export function ShowcaseCarousel({ items }: { items: ShowcaseItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ first: 0, visible: 1 });

  const getStep = useCallback(() => {
    const track = trackRef.current;
    const firstItem = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstItem) return 0;
    return firstItem.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
  }, []);

  const update = useCallback(() => {
    const track = trackRef.current;
    const step = getStep();
    if (!track || !step) return;
    const itemWidth = (track.firstElementChild as HTMLElement).offsetWidth;
    setState({
      first: Math.round(track.scrollLeft / step),
      // El último hueco entre tarjetas no cuenta: N tarjetas ocupan N*paso - hueco.
      visible: Math.max(1, Math.round((track.clientWidth + step - itemWidth) / step)),
    });
  }, [getStep]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [update]);

  const scrollToIndex = (index: number) => {
    trackRef.current?.scrollTo({ left: index * getStep(), behavior: "smooth" });
  };

  const positions = Math.max(1, items.length - state.visible + 1);
  const current = Math.min(state.first, positions - 1);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className={cn(
              "group relative flex h-[clamp(300px,52svh,520px)] shrink-0 snap-start flex-col justify-between overflow-hidden p-7 text-white",
              "basis-full sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]",
            )}
          >
            <Image
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
              className="object-cover"
              style={{ objectPosition: item.imagePosition ?? "center" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/55"
            />

            <div className="relative">
              <h3 className="font-spaceGrotesk text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
                {item.title}
              </h3>
              <p className="mt-3 max-w-xs font-workSans text-base leading-relaxed text-white/85">
                {item.description}
              </p>
            </div>

            <ArrowRight className="relative size-6 self-end transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        ))}
      </div>

      {positions > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-6 sm:justify-between">
          <div aria-hidden className="hidden w-[6.5rem] sm:block" />
          <div className="flex items-center gap-2">
            {Array.from({ length: positions }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Ir a la posición ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === current ? "w-10 bg-foreground" : "w-1.5 bg-foreground/30 hover:bg-foreground/50",
                )}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => scrollToIndex(current <= 0 ? positions - 1 : current - 1)}
              aria-label="Anterior"
              className={arrowClass}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(current >= positions - 1 ? 0 : current + 1)}
              aria-label="Siguiente"
              className={arrowClass}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
