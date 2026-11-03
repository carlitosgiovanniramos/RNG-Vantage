import type { ServiceType } from "@/types/database";
import { ServiceCard } from "@/components/service-card";
import { ServiceCarousel } from "@/components/service-carousel";
import { createPublicClient } from "@/lib/supabase/public";
import { isHourlyService, toPublicServices } from "@/lib/services";

// Pagina estatica con ISR: se sirve desde el CDN y se regenera como
// maximo cada 5 minutos (los cambios del catalogo tardan eso en verse).
export const revalidate = 300;

/** Bloques del catalogo: cada servicio cae en el bloque de su tipo. */
const SERVICE_GROUPS: {
  id: string;
  title: string;
  description: string;
  types: ServiceType[];
}[] = [
  {
    id: "redes",
    title: "Redes sociales",
    description: "Planes mensuales de estrategia, producción y contenido.",
    types: ["manejo_redes"],
  },
  {
    id: "produccion",
    title: "Producción audiovisual",
    description: "Sesiones de video y fotografía para tu marca.",
    types: ["otro"],
  },
  {
    id: "formacion",
    title: "Formación y asesoría",
    description: "Aprende a crear contenido o recibe una auditoría de tu marca.",
    types: ["capacitacion", "auditoria"],
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
      {/* Encabezado corto con el mismo difuminado del home y el login */}
      <section className="relative -mt-[90px] overflow-hidden bg-background pt-[90px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(174,41,0,0.17),transparent_52%),radial-gradient(ellipse_at_bottom_right,rgba(174,41,0,0.04),transparent_50%)] [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
        />
        <div className="animate-rise relative mx-auto max-w-[1440px] px-4 pb-10 pt-16 sm:px-8 sm:pt-24 lg:px-16">
          <div className="mb-6 inline-block bg-primary px-4 py-1 font-spaceGrotesk text-sm font-medium tracking-[-0.01em] text-white">
            RGL Estudio · Ecuador
          </div>
          <h1 className="mb-5 font-spaceGrotesk text-5xl font-semibold leading-[1] tracking-[-0.055em] text-foreground sm:text-7xl">
            Servicios<span className="text-primary">.</span>
          </h1>
          <p className="max-w-xl font-workSans text-base leading-relaxed text-muted-foreground sm:text-lg">
            Elige el servicio que mejor se adapta a tu negocio. Sin contratos forzosos ni letras pequeñas.
          </p>

          {groups.length > 1 ? (
            <nav aria-label="Categorías de servicios" className="mt-8 flex flex-wrap gap-2">
              {groups.map((group) => (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className="border border-border bg-card px-4 py-2 font-spaceGrotesk text-sm font-semibold tracking-[-0.02em] text-foreground transition-colors hover:border-foreground"
                >
                  {group.title}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1440px] space-y-20 px-4 pb-24 pt-8 sm:px-8 sm:pb-32 lg:px-16">
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

        {groups.map((group) => (
          <ServiceCarousel
            key={group.id}
            id={group.id}
            title={group.title}
            description={group.description}
          >
            {group.services.map((service, i) => (
              <ServiceCard
                key={service.id}
                service={service}
                featured={group.id === "redes" && group.services.length === 3 && i === 1}
              />
            ))}
          </ServiceCarousel>
        ))}
      </div>
    </div>
  );
}
