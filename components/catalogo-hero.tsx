import Image from "next/image";

export function CatalogoHero() {
  return (
    <div className="relative -mt-[90px] w-full h-screen overflow-hidden">
      <Image
        src="/images/catalogo-hero.webp"
        alt="RGL Estudio — Servicios"
        fill
        className="object-cover object-[center_80%]"
        sizes="100vw"
        priority
      />

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 lg:px-16 pb-10 pt-[90px]">
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
    </div>
  );
}
