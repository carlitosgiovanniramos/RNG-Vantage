"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { getTransactions, type TransactionRow } from "./actions";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function TransaccionesAdminPage() {
  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
  } = useQuery<TransactionRow[], Error>({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await getTransactions();
      if (error) {
        throw new Error(error);
      }
      return data ?? [];
    },
  });

  const columns: DataTableColumn<TransactionRow>[] = [
    {
      key: "id",
      header: "ID",
      render: (tx) => `${tx.id.substring(0, 8)}...`,
    },
    {
      key: "amount",
      header: "Monto",
      render: (tx) => formatCurrency(Number(tx.amount ?? 0)),
    },
    {
      key: "payment_method",
      header: "Método",
      render: (tx) => tx.payment_method,
    },
    {
      key: "status",
      header: "Estado",
      render: (tx) => {
        if (tx.status === "completed") {
          return <StatusBadge status="completed" />;
        }

        if (tx.status === "pending") {
          return <StatusBadge status="pending" />;
        }

        return <StatusBadge status="expired" />;
      },
    },
    {
      key: "created_at",
      header: "Fecha",
      render: (tx) =>
        new Date(tx.created_at).toLocaleString("es-EC", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
  ];

  if (isLoading) {
    return <div className="p-8 text-center">Cargando transacciones...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Registro de Transacciones</h1>
      <DataTable
        data={transactions}
        columns={columns}
        pageSize={10}
        filterPlaceholder="Buscar por ID, estado o método"
      />
    </div>
  );
}
