"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSupabase } from "@/hooks/use-supabase";

type ServerTable = "subscriptions" | "reservations" | "transactions";

const INSERT_LABELS: Partial<Record<ServerTable, string>> = {
  subscriptions: "Nueva suscripción registrada",
};

export function RealtimeRefresher({ tables }: { tables: ServerTable[] }) {
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const channels = tables.map((table) =>
      supabase
        .channel(`refresh-${table}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          (payload) => {
            router.refresh();
            if (payload.eventType === "INSERT" && INSERT_LABELS[table]) {
              toast.info(INSERT_LABELS[table]);
            }
          },
        )
        .subscribe(),
    );

    return () => {
      channels.forEach((channel) => void supabase.removeChannel(channel));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router]);

  return null;
}
