"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ReservationStatus } from "@/types/database";

/**
 * Verifica que el llamante sea un admin activo.
 * Defensa en profundidad sobre la RLS de la tabla reservations.
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

export async function getReservations() {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function updateReservationStatus(id: string, status: ReservationStatus) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  // 3. Actualización segura
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id); // .eq() es equivalente a un WHERE parametrizado (Anti-Inyección)

  if (error) return { error: error.message };

  // 4. Revalidar la caché de Next.js para que la tabla se actualice en pantalla
  revalidatePath("/reservas");
  
  return { success: true };
}