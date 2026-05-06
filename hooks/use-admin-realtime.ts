"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSupabase } from "@/hooks/use-supabase";

type AdminTable = "reservations" | "transactions";

const INSERT_LABELS: Record<AdminTable, string> = {
  reservations: "Nueva reserva recibida",
  transactions: "Nueva transacción registrada",
};

export function useAdminRealtime(table: AdminTable, queryKey: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`admin-${table}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          void queryClient.invalidateQueries({ queryKey: [queryKey] });
          if (payload.eventType === "INSERT") {
            toast.info(INSERT_LABELS[table]);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, table, queryKey]);
}
