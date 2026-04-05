"use server";

import { createClient } from "@/lib/supabase/server";
import { createReservationSchema } from "@/lib/validators/reservation";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function createReservation(data: unknown): Promise<ActionResult> {
  const parsed = createReservationSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Datos inválidos. Verifica el formulario." };
  }

  const { full_name, email, phone, preferred_date, notes, data_consent } = parsed.data;

  // La DB usa first_name + last_name (migración 20260402). Dividimos aquí para no
  // cambiar el formulario público que muestra un único campo "Nombre completo".
  const nameParts = full_name.trim().split(/\s+/);
  const first_name = nameParts[0];
  const last_name = nameParts.slice(1).join(" ") || "";

  const supabase = await createClient();

  const { error } = await supabase.from("reservations").insert({
    first_name,
    last_name,
    email,
    phone: phone || null,
    preferred_date,
    notes: notes || null,
    data_consent,
    user_id: null,
  });

  if (error) {
    console.error("[createReservation]", error.message);
    return { success: false, error: "No se pudo guardar la reserva. Intenta nuevamente." };
  }

  return { success: true };
}
