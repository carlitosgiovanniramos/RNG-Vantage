import { createClient } from "@/lib/supabase/server";
import { CatalogoGrid } from "./catalogo-grid";

export default async function CatalogoPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services")
    .select("id, name, description, type, price, duration_months")
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("price", { ascending: true });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold">Catalogo de Servicios</h1>
      <p className="mt-2 text-muted-foreground">
        Los servicios de manejo de redes se muestran con precio mensual. Los demas son pago unico.
      </p>

      {error && (
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
          No se pudieron cargar los servicios. Verifica la conexion con Supabase.
        </div>
      )}

      {!error && (!services || services.length === 0) && (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No hay servicios activos en este momento.
        </div>
      )}

      {!error && services && services.length > 0 && <div className="mt-8"><CatalogoGrid services={services} /></div>}
    </section>
  );
}
