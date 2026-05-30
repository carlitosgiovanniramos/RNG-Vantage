"use client";

import { Zap } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/utils";
import { CancelSubscriptionButton } from "./cancel-subscription-button";

export type SubscriptionTableRow = {
  id: string;
  created_at: string;
  ends_at: string | null;
  status: string | null;
  auto_renew: boolean | null;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  price: number;
};

export function SubscriptionsTable({ rows }: { rows: SubscriptionTableRow[] }) {
  const columns: DataTableColumn<SubscriptionTableRow>[] = [
    {
      key: "clientName",
      header: "Cliente",
      render: (sub) => (
        <div>
          <div className="font-workSans font-bold text-foreground">{sub.clientName}</div>
          <div className="font-workSans text-xs text-muted-foreground">
            {sub.clientEmail}
          </div>
        </div>
      ),
    },
    {
      key: "serviceName",
      header: "Servicio",
      render: (sub) => (
        <div>
          <div className="font-spaceGrotesk text-sm font-bold uppercase tracking-[0.08em] text-foreground">
            {sub.serviceName}
          </div>
          <div className="text-xs text-muted-foreground/80">
            {formatCurrency(sub.price)}
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Fecha de Inicio",
      render: (sub) =>
        new Date(sub.created_at).toLocaleString("es-EC", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      key: "ends_at",
      header: "Vence",
      render: (sub) =>
        sub.ends_at
          ? new Date(sub.ends_at).toLocaleDateString("es-EC", {
              dateStyle: "medium",
            })
          : "—",
    },
    {
      key: "status",
      header: "Estado",
      render: (sub) => <StatusBadge status={sub.status} />,
    },
    {
      key: "auto_renew",
      header: "Auto-renovacion",
      render: (sub) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.12em] ${
            sub.auto_renew
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          <Zap className="size-3" />
          {sub.auto_renew ? "Activa" : "Manual"}
        </span>
      ),
    },
    {
      key: "id",
      header: "Acciones",
      render: (sub) => (
        <CancelSubscriptionButton subscriptionId={sub.id} status={sub.status} />
      ),
    },
  ];

  return (
    <DataTable
      data={rows}
      columns={columns}
      pageSize={5}
      filterPlaceholder="Buscar por cliente, servicio o estado"
    />
  );
}
