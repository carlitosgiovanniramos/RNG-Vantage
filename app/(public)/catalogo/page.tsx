import type { ServiceType } from "@/types/database";
import { ServiceDeck } from "@/components/service-deck";
import { ServiceGroupIntro, type ServiceGroupIntroProps } from "@/components/service-group-intro";
import { ShowcaseCarousel, type ShowcaseItem } from "@/components/showcase-carousel";
import { createPublicClient } from "@/lib/supabase/public";
import { isHourlyService, toPublicServices } from "@/lib/services";

// Pagina estatica con ISR: se sirve desde el CDN y se regenera como
// maximo cada 5 minutos (los cambios del catalogo tardan eso en verse).
export const revalidate = 300;

/** Bloques del catalogo: cada servicio cae en el bloque de su tipo. */
const SERVICE_GROUPS: {
  id: string;
  title: string;
  types: ServiceType[];
  intro: Omit<ServiceGroupIntroProps, "children" | "reverse">;
}[] = [
  {
    id: "redes",
    title: "Redes sociales",
    types: ["manejo_redes"],
    intro: {
      titleLead: "Redes",
      titleAccent: "sociales",
      highlights: [
        "Planificación estratégica",
        "Producción audiovisual mensual",
        "Spots y fotografía para redes",
        "Informes y análisis de métricas",
      ],
      cta: { label: "Cotiza tu plan mensual", href: "/reservar" },
    },
  },
  {
    id: "produccion",
    title: "Producción audiovisual",
    types: ["otro"],
    intro: {
      titleLead: "Producción",
      titleAccent: "audiovisual",
      highlights: [
        "Videos de presentación",
        "Paquetes de 2, 6 y 15 videos",
        "Sesiones fotográficas",
        "Modelos para producciones",
      ],
      cta: { label: "Agenda tu sesión", href: "/reservar" },
    },
  },
  {
    id: "formacion",
    title: "Formación y asesoría",
    types: ["capacitacion", "auditoria"],
    intro: {
      titleLead: "Formación",
      titleAccent: "y asesoría",
      highlights: [
        "Curso de marketing de 3 meses",
        "Auditoría de marca",
        "Estrategia de contenido",
        "Métricas en Meta Ads y TikTok Ads",
      ],
      cta: { label: "Reserva una reunión", href: "/reservar" },
    },
  },
];

/**
 * Tarjetas del carrusel de presentación: una por línea de servicio.
 * Fotos de Unsplash (licencia libre de uso comercial), guardadas en
 * public/images/servicios:
 *   redes        https://unsplash.com/photos/husQ4tkR8Z8
 *   produccion   https://unsplash.com/photos/SWTHldDCpHM
 *   fotografia   https://unsplash.com/photos/1CstmUgoSpY
 *   capacitacion https://unsplash.com/photos/gYf49RB7bvE
 *   auditoria    https://unsplash.com/photos/G-cJ-hO2oyA
 */
const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    title: "Redes sociales",
    description: "Estrategia, producción y contenido mensual para que tu marca publique con constancia.",
    image: "/images/servicios/redes.webp",
    imagePosition: "center",
    href: "#redes",
  },
  {
    title: "Producción audiovisual",
    description: "Videos con guion, dirección y equipo profesional para presentar tu marca.",
    image: "/images/servicios/produccion.webp",
    imagePosition: "center 65%",
    href: "#produccion",
  },
  {
    title: "Fotografía",
    description: "Sesiones de retrato, graduación o marca con 50 fotografías editadas.",
    image: "/images/servicios/fotografia.webp",
    imagePosition: "42% center",
    href: "#produccion",
  },
  {
    title: "Capacitación",
    description: "Aprende a crear, editar y medir tu propio contenido en un curso de 3 meses.",
    image: "/images/servicios/capacitacion.webp",
    imagePosition: "40% center",
    href: "#formacion",
  },
  {
    title: "Auditoría de marca",
    description: "Analizamos tu marca y tu estrategia de contenido para trazar el siguiente paso.",
    image: "/images/servicios/auditoria.webp",
    imagePosition: "35% center",
    href: "#formacion",
  },
];

export default async function CatalogoPage() {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    console.warn("[CatalogoPage] No se pudieron cargar los servicios:", error.message);
  }

  const services = toPublicServices(data);
  const groups = SERVICE_GROUPS.map((group) => ({
    ...group,
    // Por precio, con los extras por hora (p. ej. modelo) al final
    services: services
      .filter((service) => group.types.includes(service.type))
      .sort((a, b) => Number(isHourlyService(a)) - Number(isHourlyService(b)) || a.price - b.price),
  })).filter((group) => group.services.length > 0);

  return (
    <div className="flex flex-col">
      {/* Encabezado + carrusel de presentación, con el difuminado del home y el login */}
      <section className="relative -mt-[90px] flex min-h-svh flex-col justify-center overflow-hidden bg-background pt-[90px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(174,41,0,0.17),transparent_52%),radial-gradient(ellipse_at_bottom_right,rgba(174,41,0,0.04),transparent_50%)] [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
        />
        <div className="animate-rise relative mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 pb-8 pt-6 text-center sm:px-8 lg:px-16">
          <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-spaceGrotesk text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            <span className="bg-foreground/[0.08] px-3 py-1 text-foreground">Nuestros</span>
            <span className="text-[#b83a14]">Servicios</span>
          </h1>
        </div>

        <div className="animate-rise relative w-full px-4 pb-6 sm:px-8 lg:px-12" style={{ animationDelay: "120ms" }}>
          <ShowcaseCarousel items={SHOWCASE_ITEMS} />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] space-y-24 px-4 pb-24 pt-12 sm:space-y-32 sm:px-8 sm:pb-32 lg:px-16">
        {error ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 font-workSans text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            No se pudieron cargar los servicios. Verifica la conexión con Supabase.
          </div>
        ) : null}

        {!error && groups.length === 0 ? (
          <div className="border border-border bg-card py-24 text-center">
            <p className="font-spaceGrotesk text-lg text-muted-foreground">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        ) : null}

        {groups.map((group, groupIndex) => (
          <section key={group.id} id={group.id} aria-label={group.title} className="scroll-mt-28">
            <ServiceGroupIntro {...group.intro} reverse={groupIndex % 2 === 1}>
              <ServiceDeck
                services={group.services}
                featuredIndex={group.id === "redes" && group.services.length === 3 ? 1 : undefined}
              />
            </ServiceGroupIntro>
          </section>
        ))}
      </div>
    </div>
  );
}
