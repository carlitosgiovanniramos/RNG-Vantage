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
            <div className="mb-8 border border-red-200 bg-red-50 px-4 py-3 font-workSans text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              No se pudieron cargar los servicios. Verifica la conexión con Supabase.
            </div>
          )}
          <CatalogoGrid services={safeServices} />
        </div>
      </section>
    </div>
  );
}
