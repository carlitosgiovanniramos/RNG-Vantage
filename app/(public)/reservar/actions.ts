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

  const supabase = await createClient();

  const { error } = await supabase.from("reservations").insert({
    full_name,
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
