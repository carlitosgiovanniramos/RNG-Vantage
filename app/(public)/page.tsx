import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Network, BarChart, GraduationCap, Settings2, TrendingUp, Calendar, Package, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Database, ServiceType } from "@/types/database";

type Service = Omit<Database["public"]["Tables"]["services"]["Row"], "type"> & {
  type: ServiceType;
};

const SERVICE_TYPES: ServiceType[] = [
  "manejo_redes",
  "auditoria",
  "capacitacion",
  "otro",
];

function normalizeServiceType(value: string): ServiceType | null {
  return SERVICE_TYPES.includes(value as ServiceType)
    ? (value as ServiceType)
    : null;
}

const TYPE_ICONS: Record<ServiceType, LucideIcon> = {
  manejo_redes: Network,
  auditoria: BarChart,
  capacitacion: GraduationCap,
  otro: Settings2,
};

function getPriceDisplay(service: Service): string {
  if (service.price === 0) return "Gratis";
  if (service.type === "manejo_redes") return `$${service.price}/mes`;
  return `$${service.price}`;
}

export default async function LandingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("price", { ascending: true })
    .limit(3);

  const landingServices: Service[] = (data ?? [])
    .map((service) => {
      const type = normalizeServiceType(service.type);
      if (!type) return null;
      return { ...service, type } as Service;
    })
    .filter((service): service is Service => Boolean(service));
  return (
    <div className="flex flex-col">
      {/* --- Hero Section --- */}
      {/* -mt-[90px] cancela el espaciador del layout para que la foto cubra detrás del navbar fixed */}
      <section className="relative -mt-[90px] h-screen overflow-hidden">
        {/* Foto de fondo — object-[center_20%] para mostrar la cara */}
        <Image
          alt="RGL Estudio — Ruth Gómez"
          src="/images/ruth-hero.webp"
          fill
          className="object-cover object-[center_20%]"
          sizes="100vw"
          priority
        />
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Contenido centrado verticalmente */}
        <div className="relative z-10 h-full flex items-center px-4 sm:px-8 lg:px-16">
          <div className="max-w-[860px] pt-[90px]">
            <div className="inline-block bg-primary text-white px-4 py-1 font-spaceGrotesk text-xs tracking-widest uppercase mb-6">
              Autoridad en Marketing Digital
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-9xl font-spaceGrotesk font-black tracking-tighter leading-[0.85] mb-8 uppercase text-white">
              RGL Estudio
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl font-workSans max-w-2xl mb-12 text-white/80 leading-relaxed">
              Automatización de ventas, reservas y control financiero para tu emprendimiento de marketing digital. <span className="text-white font-bold">Escala sin límites.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/catalogo">
                <Button variant="default" className="h-auto w-full sm:w-auto rounded-none px-10 py-5 font-spaceGrotesk font-black text-lg uppercase tracking-tight hover:bg-primary/85 active:scale-95">
                  Ver Servicios
                </Button>
              </Link>
              <Link href="/reservar">
                <Button variant="outline" className="h-auto w-full sm:w-auto rounded-none border-4 border-white text-white bg-transparent px-10 py-5 font-spaceGrotesk font-black text-lg uppercase tracking-tight hover:bg-white hover:text-foreground active:scale-95">
                  Reservar Capacitación
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Kinetic Marquee — fuera del hero, aparece al hacer scroll */}
      <div className="bg-foreground py-4 overflow-hidden whitespace-nowrap">
        <div className="flex space-x-20 animate-marquee items-center">
          <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Escala</span>
          <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Automatiza</span>
          <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Controla</span>
          <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Crece</span>
          <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Eficiencia</span>
          <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Scale</span>
          <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Automate</span>
          <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Crece</span>
          <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Controla</span>
        </div>
      </div>

      {/* --- Nuestros Servicios (Bento Grid) --- */}
      {landingServices.length > 0 && (
        <section className="py-20 sm:py-32 px-4 sm:px-8 bg-muted">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-8">
              <div className="max-w-xl">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-spaceGrotesk font-black uppercase tracking-tighter mb-6 text-foreground">
                  Nuestros Servicios
                </h2>
                <p className="text-muted-foreground font-workSans text-base sm:text-lg">
                  Estructuras sólidas para negocios digitales que buscan la excelencia operativa y el crecimiento medible.
                </p>
              </div>
              <div className="font-spaceGrotesk text-sm uppercase tracking-widest text-primary font-bold">
                Servicios / 2026
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-muted">
              {landingServices.map((service, i) => {
                const Icon = TYPE_ICONS[service.type] ?? Settings2;
                const priceStr = getPriceDisplay(service);
                return (
                  <div
                    key={service.id}
                    className="bg-card p-8 sm:p-12 group hover:bg-primary transition-colors duration-500 relative"
                  >
                    <Icon className="h-12 w-12 sm:h-16 sm:w-16 mb-8 sm:mb-12 text-primary group-hover:text-primary-foreground transition-colors" />

                    <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4 text-foreground group-hover:text-primary-foreground transition-colors">
                      {service.name}
                    </h3>

                    <p className="text-muted-foreground mb-8 sm:mb-12 group-hover:text-primary-foreground/80 transition-colors">
                      {service.description ?? "Servicio disponible bajo consulta."}
                    </p>

                    <div className="text-3xl sm:text-4xl font-spaceGrotesk font-black text-foreground group-hover:text-primary-foreground transition-colors">
                      {priceStr}
                    </div>

                    <div className="absolute top-8 right-8 text-muted-foreground/20 font-spaceGrotesk font-black text-5xl sm:text-6xl group-hover:text-primary-foreground/10 select-none">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* --- Cómo Funciona --- */}
      <section className="py-20 sm:py-32 px-4 sm:px-8 bg-foreground text-background">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-16 sm:mb-24">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-spaceGrotesk font-black uppercase tracking-tighter mb-8">
              Cómo Funciona
            </h2>
            <div className="h-1 w-24 sm:w-32 bg-primary"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
            <div className="flex flex-col">
              <div className="text-7xl sm:text-[12rem] font-spaceGrotesk font-black leading-none text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none">
                1
              </div>
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary -mt-16" />
              <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4">Reserva</h3>
              <p className="text-background/60 font-workSans leading-relaxed">
                Agenda una sesión de diagnóstico inicial para entender tus cuellos de botella actuales.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="text-7xl sm:text-[12rem] font-spaceGrotesk font-black leading-none text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none">
                2
              </div>
              <Package className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary -mt-16" />
              <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4">Elige</h3>
              <p className="text-background/60 font-workSans leading-relaxed">
                Selecciona el plan de automatización o servicio que mejor se adapte a tu escala actual.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="text-7xl sm:text-[12rem] font-spaceGrotesk font-black leading-none text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none">
                3
              </div>
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary -mt-16" />
              <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4">Crece</h3>
              <p className="text-background/60 font-workSans leading-relaxed">
                Implementamos y monitoreamos tus resultados mientras tú te enfocas en el core del negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="py-24 sm:py-40 px-4 sm:px-8 relative overflow-hidden bg-background">
        <div className="max-w-[1440px] mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-spaceGrotesk font-black uppercase tracking-tighter mb-12 leading-[1.1] sm:leading-none text-foreground">
            Empieza a transformar <br className="hidden sm:block" /> tu negocio hoy
          </h2>
          <div className="flex justify-center">
            <Link href="/register">
              <Button variant="default" className="h-auto rounded-none px-8 sm:px-16 py-6 sm:py-8 font-spaceGrotesk font-black text-xl sm:text-2xl uppercase tracking-tight hover:bg-primary/85 active:scale-95 shadow-[12px_12px_0px_0px_rgba(44,47,46,1)] dark:shadow-[12px_12px_0px_0px_rgba(245,247,245,1)]">
                Comenzar Ahora
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
