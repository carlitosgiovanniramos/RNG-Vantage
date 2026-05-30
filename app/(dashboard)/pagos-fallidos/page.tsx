import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

type FailedTransaction = {
  id: string;
  user_id: string | null;
  amount: number;
  status: string;
  payment_method: string;
  gateway: string;
  gateway_status: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  failed: "Fallida",
  refunded: "Reembolsada / Contracargo",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Vista de monitoreo: transacciones fallidas y contracargos, para que
 * el admin les de seguimiento. Ruta protegida por el middleware.
 */
export default async function PagosFallidosPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      "id, user_id, amount, status, payment_method, gateway, gateway_status, created_at",
    )
    .in("status", ["failed", "refunded"])
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (transactions ?? []) as FailedTransaction[];

  const userIds = Array.from(
    new Set(rows.map((t) => t.user_id).filter((id): id is string => Boolean(id))),
  );
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", userIds)
    : { data: [] };
  const nameById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
    ]),
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8 md:py-10">
      <header className="flex flex-col gap-3 border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            Monitoreo
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground">
            Pagos con incidencias
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transacciones fallidas y contracargos para seguimiento.
          </p>
        </div>
        <Link
          href="/transacciones"
          className="inline-flex h-10 items-center gap-2 border border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
          Transacciones
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="border border-border/60 bg-card/80 p-6 text-sm text-muted-foreground">
          No hay pagos fallidos ni contracargos registrados. Todo en orden.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-col gap-2 border border-border/60 bg-card/85 p-4 text-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-workSans font-bold text-foreground">
                  {nameById.get(tx.user_id ?? "") || "Sin cliente"}
                </p>
                <p className="font-workSans text-xs text-muted-foreground">
                  {formatDate(tx.created_at)} · {tx.payment_method} · {tx.gateway}
                </p>
                {tx.gateway_status && (
                  <p className="font-workSans text-xs text-muted-foreground/80">
                    Detalle pasarela: {tx.gateway_status}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-spaceGrotesk text-base font-black text-foreground">
                  {formatCurrency(tx.amount)}
                </span>
                <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.12em] text-red-800 dark:bg-red-900/40 dark:text-red-300">
                  {STATUS_LABELS[tx.status] ?? tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
