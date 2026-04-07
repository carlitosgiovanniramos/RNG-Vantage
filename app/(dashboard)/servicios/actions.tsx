"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  createServiceSchema,
  updateServiceSchema,
} from "@/lib/validators/service";

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/servicios");
  revalidatePath("/catalogo");

  return { success: true };
}
