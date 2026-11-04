import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Package } from "lucide-react";
import { ServiceCard } from "@/components/service-card";
import { createPublicClient } from "@/lib/supabase/public";
import { toPublicServices } from "@/lib/services";

// Pagina estatica con ISR: se sirve desde el CDN y se regenera como
// maximo cada 5 minutos.
export const revalidate = 300;

const MARQUEE_WORDS = [
  "Estrategia",
  "Contenido",
  "Redes",
  "Video",
  "Fotografía",
  "Marca",
  "Publicidad",
];

export default async function LandingPage() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .eq("type", "manejo_redes")
    .order("price", { ascending: true })
    .limit(3);

  const landingServices = toPublicServices(data);
  return (
    <div className="flex flex-col">
      {/* --- Hero Section --- */}
      {/* -mt-[90px] + pt-[90px]: el degradado continúa detrás del menú, como en el login */}
      <section className="relative -mt-[90px] overflow-hidden bg-background pt-[90px]">
        {/* Mismo difuminado que la página de login */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(174,41,0,0.17),transparent_52%),radial-gradient(ellipse_at_bottom_right,rgba(174,41,0,0.04),transparent_50%)] [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
        />

        <div className="relative mx-auto flex min-h-[calc(100svh-90px)] max-w-[1440px] items-center justify-center px-4 py-12 text-center sm:px-8 lg:px-16">
          <div className="animate-rise flex flex-col items-center">
            <div className="mb-6 inline-flex items-center gap-2 bg-foreground/[0.06] px-3 py-1.5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.12em] text-foreground/80">
              <span aria-hidden className="size-1.5 rounded-full bg-[#b83a14]" />
              Marketing · Contenido · Producción audiovisual
            </div>

            <h1 className="mb-12 max-w-5xl font-spaceGrotesk text-5xl font-semibold leading-[1] tracking-[-0.055em] text-foreground sm:text-7xl md:text-8xl">
              Agencia de marketing y publicidad<span className="text-primary">.</span>
            </h1>

            <div className="flex w-full flex-col justify-center gap-6 sm:w-auto sm:flex-row">
              <Link href="/catalogo">
                <Button variant="default" className="h-auto w-full rounded-none px-10 py-5 font-spaceGrotesk text-lg font-semibold tracking-[-0.02em] hover:bg-primary/85 active:scale-95 sm:w-auto">
                  Ver servicios
                </Button>
              </Link>
              <Link href="/reservar">
                <Button variant="outline" className="h-auto w-full rounded-none border-4 border-foreground bg-transparent px-10 py-5 font-spaceGrotesk text-lg font-semibold tracking-[-0.02em] text-foreground hover:bg-foreground hover:text-background active:scale-95 sm:w-auto">
                  Agenda una reunión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Banda animada: la lista va duplicada para que el bucle sea continuo */}
      <div className="bg-foreground/85">
        <div className="overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex w-max items-center">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
                {MARQUEE_WORDS.map((word) => (
                  <span
                    key={word}
                    className="px-7 font-spaceGrotesk text-lg font-semibold tracking-[-0.03em] text-background/25 sm:px-9 sm:text-2xl"
                  >
                    {word}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Nuestros Servicios (Bento Grid) --- */}
      {landingServices.length > 0 && (
        <section className="relative bg-background px-4 pb-20 pt-8 sm:px-8 sm:pb-32 sm:pt-12">
          {/* Continuación del tono cálido del hero, más suave y sin borde visible */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(174,41,0,0.07),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(174,41,0,0.05),transparent_55%)] [mask-image:linear-gradient(to_bottom,transparent,black_30%)]"
          />
          <div className="max-w-[1440px] mx-auto">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-14 gap-8">
              <div className="max-w-xl">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-spaceGrotesk font-semibold leading-[1] tracking-[-0.055em] mb-6 text-foreground">
                  Planes de redes sociales<span className="text-primary">.</span>
                </h2>
                <p className="text-muted-foreground font-workSans text-base sm:text-lg">
                  Estrategia, producción y contenido para tus redes cada mes.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="font-spaceGrotesk text-base font-semibold tracking-[-0.02em] text-primary transition-colors hover:text-primary/70"
              >
                Ver todos los servicios →
              </Link>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 md:py-6">
              {landingServices.map((service, i) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={i}
                  featured={landingServices.length === 3 && i === 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Cómo Funciona --- */}
      <section className="py-20 sm:py-32 px-4 sm:px-8 bg-foreground text-background">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-spaceGrotesk font-semibold leading-[1] tracking-[-0.055em] mb-8">
              Cómo funciona<span className="text-primary">.</span>
            </h2>
            <div className="h-1 w-24 sm:w-32 bg-primary"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
            <div className="flex flex-col">
              <div className="text-7xl sm:text-[12rem] font-spaceGrotesk font-semibold leading-none tracking-[-0.06em] text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none">
                1
              </div>
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary -mt-16" />
              <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-semibold tracking-[-0.04em] mb-4">Agenda</h3>
              <p className="text-background/60 font-workSans leading-relaxed">
                Reserva una reunión de diagnóstico: conocemos tu marca, tus objetivos y tu público.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="text-7xl sm:text-[12rem] font-spaceGrotesk font-semibold leading-none tracking-[-0.06em] text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none">
                2
              </div>
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary -mt-16" />
              <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-semibold tracking-[-0.04em] mb-4">Elige</h3>
              <p className="text-background/60 font-workSans leading-relaxed">
                Escoge el plan de redes, la sesión audiovisual o el servicio que mejor se adapte a tu negocio.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="text-7xl sm:text-[12rem] font-spaceGrotesk font-semibold leading-none tracking-[-0.06em] text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none">
                3
              </div>
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary -mt-16" />
              <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-semibold tracking-[-0.04em] mb-4">Crece</h3>
              <p className="text-background/60 font-workSans leading-relaxed">
                Creamos y publicamos contenido que vende, y medimos los resultados mientras tú te enfocas en tu negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-24 sm:py-40 px-4 sm:px-8 relative overflow-hidden bg-background">
        <div className="max-w-[1440px] mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl md:text-8xl font-spaceGrotesk font-semibold tracking-[-0.055em] mb-12 leading-[1.05] text-foreground">
            Empieza a transformar <br className="hidden sm:block" /> tu negocio hoy<span className="text-primary">.</span>
          </h2>
          <div className="flex justify-center">
            <Link href="/register">
              <Button variant="default" className="h-auto rounded-none px-8 sm:px-16 py-6 sm:py-8 font-spaceGrotesk font-semibold text-xl sm:text-2xl tracking-[-0.02em] hover:bg-primary/85 active:scale-95 shadow-[12px_12px_0px_0px_rgba(148,163,153,0.55)]">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 blur-[80px] sm:blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 blur-[80px] sm:blur-[120px] rounded-full"></div>
      </section>
    </div>
  );
}
