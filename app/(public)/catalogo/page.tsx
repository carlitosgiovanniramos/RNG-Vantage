import { createClient } from "@/lib/supabase/server";
import { CatalogoGrid } from "./catalogo-grid";

export default async function CatalogoPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("[CatalogoPage] No se pudieron cargar los servicios:", error.message);
  }

  const safeServices = services ?? [];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-spaceGrotesk font-black uppercase tracking-tighter text-foreground mb-4">
            Servicios
          </h1>
          <p className="text-muted-foreground font-workSans text-base sm:text-lg leading-relaxed max-w-[560px]">
            Elige el servicio que mejor se adapta a tu negocio. Sin contratos forzosos ni letras pequeñas.
          </p>
        </div>

        <CatalogoGrid services={safeServices} />
      </div>
    </section>
  );
}
