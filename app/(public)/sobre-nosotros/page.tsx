import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowRight,
  Camera,
  Megaphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { InstagramFeed } from "./instagram-feed";

/**
 * Posts de Instagram a mostrar (método nativo gratuito).
 * Pega aquí los enlaces de tus posts: en Instagram, abre el post →
 * botón ··· → "Copiar enlace". Ejemplo de formato:
 *   "https://www.instagram.com/p/CXXXXXXXXXX/",
 * Mientras esté vacío se muestra un bloque para seguir el perfil.
 */
const INSTAGRAM_POSTS: string[] = [
  "https://www.instagram.com/p/DYTMzGBMLHh/",
  "https://www.instagram.com/p/DXnd_eHDAVX/",
  "https://www.instagram.com/p/DYj9uMHpFI2/",
];

export const metadata: Metadata = {
  title: "Sobre Nosotros — RGL Estudio",
  description:
    "Conoce a RGL Estudio: marketing digital, creación de contenido y estrategia para hacer crecer tu marca.",
};

const VALUES = [
  {
    icon: Camera,
    title: "Contenido que conecta",
    desc: "Fotografía, video y diseño pensados para detener el scroll y contar tu historia.",
  },
  {
    icon: Megaphone,
    title: "Estrategia real",
    desc: "Planificamos cada publicación y campaña con un objetivo claro, no por publicar.",
  },
  {
    icon: TrendingUp,
    title: "Resultados medibles",
    desc: "Analizamos métricas en META y TikTok Ads para tomar decisiones con datos.",
  },
];

const STATS = [
  { value: "+5", label: "Años creando contenido" },
  { value: "+50", label: "Marcas acompañadas" },
  { value: "100%", label: "Enfoque en tu objetivo" },
];

export default function SobreNosotrosPage() {
  return (
    <div>
      {/* Hero a pantalla completa (bajo el navbar transparente) */}
      <div className="relative -mt-[90px] h-screen w-full overflow-hidden">
        <Image
          src="/images/sobre-nosotros-hero.webp"
          alt="RGL Estudio — creando contenido en Ecuador"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-10 pt-[90px] sm:px-8 lg:px-16">
          <div className="mx-auto w-full max-w-[1440px]">
            <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
              RGL Estudio · Ecuador
            </p>
            <h1 className="mb-4 font-spaceGrotesk text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-6xl md:text-8xl">
              Sobre nosotros
            </h1>
            <p className="mb-8 max-w-[560px] font-workSans text-base leading-relaxed text-white/75 sm:text-lg">
              Somos un estudio de marketing digital que ayuda a marcas y
              emprendedores a crecer con contenido creativo, estrategia y
              presencia real en redes sociales.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex h-12 items-center gap-2 bg-primary px-6 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary/85"
              >
                Ver servicios
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/reservar"
                className="inline-flex h-12 items-center gap-2 border border-white/40 bg-white/10 px-6 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/20"
              >
                Reservar una sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sobre mí */}
      <section className="px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Quiénes somos
            </p>
            <h2 className="mb-6 font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
              Detrás de RGL Estudio
            </h2>
            <div className="space-y-4 font-workSans text-base leading-relaxed text-muted-foreground">
              <p>
                Soy <strong className="text-foreground">Ruth Noemí Gómez</strong>,
                creadora de contenido y estratega digital. RGL Estudio nació de
                una idea simple: que cualquier marca, sin importar su tamaño,
                pueda comunicar lo que hace de forma profesional y auténtica.
              </p>
              <p>
                Trabajamos de la mano contigo para entender tu negocio, definir
                tu voz y construir una presencia digital que realmente conecte
                con tu audiencia. Desde la foto hasta la métrica, cuidamos cada
                detalle.
              </p>
              <p>
                Además, compartimos lo que sabemos: capacitamos a emprendedores
                y equipos para que aprendan a manejar sus propias redes con
                herramientas reales.
              </p>
            </div>
          </div>

          {/* Stats card */}
          <div className="border border-border/60 bg-card p-10 shadow-[8px_8px_0px_0px_rgba(44,47,46,0.10)]">
            <Sparkles className="mb-6 size-8 text-primary" />
            <div className="grid grid-cols-3 gap-6">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="font-spaceGrotesk text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
                    {value}
                  </p>
                  <p className="mt-1 font-workSans text-xs leading-snug text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 border-t border-border/60 pt-6 font-workSans text-sm italic leading-relaxed text-muted-foreground">
              &ldquo;No vendemos publicaciones, construimos marcas que la gente
              recuerda.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Nuestro trabajo / valores */}
      <section className="border-y border-border/60 bg-muted/20 px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12">
            <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Nuestro trabajo
            </p>
            <h2 className="font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
              Cómo trabajamos
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group border border-border/60 bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[8px_8px_0_rgba(148,163,153,0.35)]"
              >
                <div className="mb-6 flex size-12 items-center justify-center border border-primary/30 bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="font-workSans text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portafolio en Instagram (posts reales) */}
      <section className="px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12">
            <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Portafolio
            </p>
            <h2 className="font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
              Nuestro trabajo en Instagram
            </h2>
            <p className="mt-4 max-w-[560px] font-workSans text-base leading-relaxed text-muted-foreground">
              Algunos de los contenidos que hemos creado para nuestras marcas.
              Síguenos para ver todo lo nuevo.
            </p>
          </div>

          <InstagramFeed posts={INSTAGRAM_POSTS} />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-[#2c2f2e] px-4 py-20 text-[#f5f7f5] sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tighter sm:text-4xl">
              ¿Hacemos crecer tu marca?
            </h2>
            <p className="mt-3 max-w-[520px] font-workSans text-base text-[#f5f7f5]/75">
              Cuéntanos sobre tu proyecto y diseñemos juntos una estrategia a tu
              medida.
            </p>
          </div>
          <Link
            href="/reservar"
            className="inline-flex h-14 shrink-0 items-center gap-2 bg-primary px-8 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary/85"
          >
            Reservar una sesión
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
