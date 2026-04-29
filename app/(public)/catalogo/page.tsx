import { createClient } from "@/lib/supabase/server";
import { CatalogoGrid } from "./catalogo-grid";
import { CatalogoHero } from "@/components/catalogo-hero";

export default async function CatalogoPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("price", { ascending: true });

  if (error) {
    console.warn("[CatalogoPage] No se pudieron cargar los servicios:", error.message);
  }

  const safeServices = services ?? [];

  return (
    <div>
      <CatalogoHero />

      <section className="py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto">
          {error && (
            <div className="mb-8 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
              No se pudieron cargar los servicios. Verifica la conexion con Supabase.
            </div>
          )}
          <CatalogoGrid services={safeServices} />
        </div>
      </section>
    </div>
  );
}
