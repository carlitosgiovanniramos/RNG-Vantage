"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ClientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, error: "No autorizado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.is_active === false) {
    return { supabase, error: "No autorizado" };
  }

  return { supabase, error: null };
}

export async function getClients() {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, is_active, created_at, updated_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  let emailById = new Map<string, string>();
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    emailById = new Map(data.users.map((user) => [user.id, user.email ?? "Sin email"]));
  } catch {
    emailById = new Map();
  }

  const clients: ClientRow[] = (profiles ?? []).map((profile) => ({
    ...profile,
    email: emailById.get(profile.id) ?? "No disponible",
    is_active: profile.is_active ?? true,
  }));

  return { data: clients };
}

export async function updateClient(
  id: string,
  formData: { first_name: string; last_name: string; is_active: boolean },
) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const firstName = formData.first_name.trim();
  const lastName = formData.last_name.trim();

  if (firstName.length < 2 || lastName.length < 2) {
    return { error: "Nombre y apellido deben tener al menos 2 caracteres." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      is_active: formData.is_active,
    })
    .eq("id", id)
    .eq("role", "client");

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  return { success: true };
}

export async function toggleClientActive(id: string, isActive: boolean) {
  const { supabase, error: authError } = await ensureAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("role", "client");

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  return { success: true };
}
