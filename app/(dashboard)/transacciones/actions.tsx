"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type TransactionRow =
  Database["public"]["Tables"]["transactions"]["Row"];

export async function getTransactions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: (data ?? []) as TransactionRow[] };
}
