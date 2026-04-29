"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/images/yambo-1.jpg", alt: "Laguna de Yambo, Ecuador" },
  { src: "/images/yambo-2.jpg", alt: "Laguna de Yambo al amanecer" },
  { src: "/images/yambo-3.jpg", alt: "Laguna de Yambo vista panorámica" },
];

const INTERVAL = 5000;

export function CatalogoHero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[52vh] overflow-hidden">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 lg:px-16 pb-10">
        <div className="max-w-[1440px] mx-auto w-full">
          <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">
            RGL Estudio · Ecuador
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-spaceGrotesk font-black uppercase tracking-tighter text-white leading-none mb-4">
            Servicios
          </h1>
          <p className="text-white/75 font-workSans text-base sm:text-lg max-w-[520px] leading-relaxed">
            Elige el servicio que mejor se adapta a tu negocio. Sin contratos forzosos ni letras pequeñas.
          </p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-4 right-6 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-500 ${
              i === current ? "w-8 bg-primary" : "w-3 bg-white/40"
            }`}
            aria-label={`Ir a imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
