"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createServiceSchema,
  updateServiceSchema,
} from "@/lib/validators/service";

/**
 * Verifica que el llamante sea un admin activo.
 * Defensa en profundidad: ademas de la RLS, las mutaciones de servicios
 * exigen explicitamente el rol admin.
 */
async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "No autorizado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.is_active === false) {
    return { supabase, error: "No autorizado" };
  }

  return { supabase, error: null };
}

export async function getServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function createService(formData: unknown) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  // 1. Validación con Zod (Previene entrada de datos maliciosos)
  const parsedData = createServiceSchema.safeParse(formData);

  if (!parsedData.success) {
    return { error: "Datos inválidos", details: parsedData.error.flatten() };
  }

  // 2. Inserción en Supabase
  const { error } = await supabase.from("services").insert([parsedData.data]);

  if (error) return { error: error.message };

  // 3. Refrescar el dashboard y el catálogo público
  revalidatePath("/servicios");
  revalidatePath("/catalogo");

  return { success: true };
}

export async function updateService(id: string, formData: unknown) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  // Usamos el schema de actualización parcial (Partial Zod Schema)
  const parsedData = updateServiceSchema.safeParse(formData);

  if (!parsedData.success) {
    return { error: "Datos inválidos", details: parsedData.error.flatten() };
  }

  const { error } = await supabase
    .from("services")
    .update(parsedData.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/servicios");
  revalidatePath("/catalogo");

  return { success: true };
}

export async function deleteService(id: string) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/servicios");
  revalidatePath("/catalogo");

  return { success: true };
}
