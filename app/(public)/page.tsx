import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Network, BarChart, GraduationCap, Settings2, TrendingUp, Calendar, Package, CheckCircle2, type LucideIcon } from "lucide-react";
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

const TYPE_LABELS: Record<ServiceType, string> = {
  manejo_redes: "Redes Sociales",
  auditoria: "Auditoria",
  capacitacion: "Capacitacion",
  otro: "Otro",
};

function getPriceDisplay(service: Service): string {
  if (service.price === 0) return "Gratis";
  if (service.type === "manejo_redes") return `$${service.price}/mes`;
  return `$${service.price}`;
}

function getShortDescription(description?: string | null): string {
  return (description ?? "Servicio disponible bajo consulta.")
    .replace(/^Incluye:\s*/i, "")
    .trim();
}

function getDescriptionItems(description?: string | null): string[] {
  return getShortDescription(description)
    .split(/\. |; /)
    .map((item) => item.replace(/\.$/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {landingServices.map((service, i) => {
                const Icon = TYPE_ICONS[service.type] ?? Settings2;
                const priceStr = getPriceDisplay(service);
                const descriptionItems = getDescriptionItems(service.description);
                const isGrayHover = i % 2 === 0;
                return (
                  <div
                    key={service.id}
                    className={`group relative flex min-h-[470px] flex-col overflow-hidden border p-7 pt-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_rgba(148,163,153,0.45)] sm:p-9 sm:pt-12 ${
                      isGrayHover
                        ? "border-white bg-card hover:border-[#3d4140]/70 hover:bg-[#343736]"
                        : "border-white bg-card hover:border-primary hover:bg-primary"
                    }`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 bg-transparent transition-colors duration-300 ${isGrayHover ? "group-hover:bg-[#686c6a]" : "group-hover:bg-primary"}`} />

                    <div className="mb-8 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center border transition-colors duration-300 ${
                          "border-primary/45 bg-background group-hover:border-primary-foreground/70 group-hover:bg-primary-foreground/10"
                        }`}>
                          <Icon className="h-7 w-7 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                        </div>
                        <span className={`border px-3 py-1 font-spaceGrotesk text-[0.65rem] font-black uppercase tracking-[0.18em] transition-colors duration-300 ${
                          "border-primary/30 bg-primary/5 text-primary group-hover:border-primary-foreground/60 group-hover:bg-primary-foreground/10 group-hover:text-primary-foreground"
                        }`}>
                          {TYPE_LABELS[service.type]}
                        </span>
                      </div>
                      <div className="font-spaceGrotesk select-none text-5xl font-black leading-none text-foreground/10 transition-colors duration-300 group-hover:text-primary-foreground/15 sm:text-6xl">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>

                    <h3 className="mb-5 font-spaceGrotesk text-2xl font-black uppercase leading-[0.98] tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary-foreground sm:text-3xl">
                      {service.name}
                    </h3>

                    <div className="mb-7 flex-1 border-y border-primary/20 py-5 transition-colors duration-300 group-hover:border-primary-foreground/25">
                      <ul className="space-y-3">
                        {descriptionItems.map((item) => (
                          <li key={item} className="flex gap-3 font-workSans text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-primary-foreground/85 sm:text-base">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-4">
                      <div className="font-spaceGrotesk text-3xl font-black text-foreground transition-colors duration-300 group-hover:text-primary-foreground sm:text-4xl">
                        {priceStr}
                      </div>
                      <Link
                        href={`/checkout?service_id=${service.id}`}
                        className={`inline-flex h-10 items-center justify-center border px-4 font-spaceGrotesk text-[0.65rem] font-black uppercase tracking-[0.14em] transition-colors duration-300 ${
                          isGrayHover
                            ? "border-foreground/80 text-foreground hover:bg-foreground hover:text-background group-hover:border-primary-foreground group-hover:text-primary-foreground group-hover:hover:bg-primary-foreground group-hover:hover:text-[#343736]"
                            : "border-foreground/80 text-foreground hover:bg-foreground hover:text-background group-hover:border-primary-foreground group-hover:text-primary-foreground group-hover:hover:bg-primary-foreground group-hover:hover:text-primary"
                        }`}
                      >
                        Contratar
                      </Link>
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
              <Button variant="default" className="h-auto rounded-none px-8 sm:px-16 py-6 sm:py-8 font-spaceGrotesk font-black text-xl sm:text-2xl uppercase tracking-tight hover:bg-primary/85 active:scale-95 shadow-[12px_12px_0px_0px_rgba(148,163,153,0.55)]">
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
