"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type ServiceCarouselProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
};

const arrowClass =
  "flex size-11 items-center justify-center border border-border bg-card text-foreground transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-30";

/**
 * Bloque del catálogo con carrusel horizontal: 3 tarjetas visibles en
 * escritorio, 2 en tablet y 1 en móvil. Las flechas aparecen solo si hay
 * más tarjetas de las que caben.
 */
export function ServiceCarousel({ id, title, description, children }: ServiceCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const [state, setState] = useState({ first: 0, visible: items.length, overflow: false });

  const update = useCallback(() => {
    const track = trackRef.current;
    const firstItem = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstItem) return;
    const step = firstItem.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    const first = Math.round(track.scrollLeft / step);
    const visible = Math.max(1, Math.round((track.clientWidth + 1) / step));
    setState({ first, visible, overflow: track.scrollWidth > track.clientWidth + 1 });
  }, []);

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

  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current;
    const firstItem = track?.firstElementChild as HTMLElement | null;
    if (!track || !firstItem) return;
    const step = firstItem.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    track.scrollBy({ left: direction * step * state.visible, behavior: "smooth" });
  };

  const last = Math.min(items.length, state.first + state.visible);
  const atStart = state.first <= 0;
  const atEnd = last >= items.length;

  return (
    <section id={id} className="scroll-mt-28">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="font-spaceGrotesk text-3xl font-semibold leading-[1] tracking-[-0.05em] text-foreground sm:text-4xl">
            {title}
            <span className="text-primary">.</span>
          </h2>
          <p className="mt-2 font-workSans text-base text-muted-foreground">{description}</p>
        </div>

        {state.overflow ? (
          <div className="flex items-center gap-3">
            <span className="font-workSans text-sm tabular-nums text-muted-foreground" aria-live="polite">
              {last > state.first + 1 ? `${state.first + 1}–${last}` : last} de {items.length}
            </span>
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={atStart}
              aria-label={`Anteriores en ${title}`}
              aria-controls={`${id}-track`}
              className={arrowClass}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={atEnd}
              aria-label={`Siguientes en ${title}`}
              aria-controls={`${id}-track`}
              className={arrowClass}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        id={`${id}-track`}
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex shrink-0 snap-start basis-[85%]",
              "sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]",
              "[&>*]:w-full",
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
