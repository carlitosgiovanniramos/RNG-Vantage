"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database";

// Extraemos el tipo exacto de tu base de datos
export type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

export async function getReservations() {
  const supabase = await createClient();

  // 1. Verificación de Autenticación
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  // 2. Consulta a Supabase
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function updateReservationStatus(id: string, status: ReservationStatus) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  // 3. Actualización segura
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id); // .eq() es equivalente a un WHERE parametrizado (Anti-Inyección)

  if (error) return { error: error.message };

  // 4. Revalidar la caché de Next.js para que la tabla se actualice en pantalla
  revalidatePath("/(dashboard)/reservas");
  
  return { success: true };
}