"use server";

import { createClient } from "@/lib/supabase/server";
import { createReservationSchema } from "@/lib/validators/reservation";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  const [firstName, ...rest] = normalized.split(" ");

  return {
    firstName: firstName ?? "",
    lastName: rest.join(" ") || "N/A",
  };
}

export async function createReservation(data: unknown): Promise<ActionResult> {
  const parsed = createReservationSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Datos inválidos. Verifica el formulario." };
  }

  const { full_name, email, phone, preferred_date, notes, data_consent } = parsed.data;
  const { firstName, lastName } = splitFullName(full_name);

  const supabase = await createClient();

  const { error } = await supabase.from("reservations").insert({
    first_name: firstName,
    last_name: lastName,
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
