"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Home } from "lucide-react";
import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getTransactions,
  markTransactionAsCompleted,
  markTransactionAsFailed,
  cleanExpiredTransactions,
} from "./actions";

export type TransactionRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: "cash" | "transfer" | "card" | "pending";
  created_at: string;
  notes: string | null;
  client_name?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function TransaccionesAdminPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [statusFilter, setStatusFilter] = useState<
    TransactionRow["status"] | "all"
  >("all");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

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

  const handleOpenDialog = (tx: TransactionRow) => {
    setSelectedTx(tx);
    setPaymentMethod("cash");
    setNotes("");
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!selectedTx) return;

    setIsSubmitting(true);
    try {
      const result = await markTransactionAsCompleted({
        transaction_id: selectedTx.id,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });

      if (result.success) {
        setOpenDialog(false);
        queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
        alert("✅ Pago registrado exitosamente");
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkFailed = async (tx: TransactionRow) => {
    if (!confirm("¿Estás seguro de que quieres marcar esta transacción como fallida/cancelada?")) return;
    
    try {
      const result = await markTransactionAsFailed(tx.id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
        alert("✅ Transacción marcada como fallida");
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al cancelar la transacción");
    }
  };

  const handleCleanExpired = async () => {
    if (!confirm("¿Revisar y cancelar transacciones pendientes con más de 24 horas?")) return;
    
    try {
      const result = await cleanExpiredTransactions();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
        alert(`✅ Operación completada: ${result.message}`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al limpiar transacciones expiradas");
    }
  };

  const columns: DataTableColumn<TransactionRow>[] = [
    {
      key: "id",
      header: "ID",
      render: (tx) => `${tx.id.substring(0, 8)}...`,
    },
    {
      key: "client_name",
      header: "Cliente",
      render: (tx) => tx.client_name || "Sin cliente",
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
        if (tx.status === "failed" || tx.status === "refunded") {
          return (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-300">
              {tx.status === "failed" ? "Fallido" : "Cancelado"}
            </span>
          );
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
    {
      key: "actions",
      header: "Acciones",
      render: (tx) => (
        <div className="flex gap-2 items-center">
          {tx.status === "pending" ? (
            <>
              <Button size="sm" onClick={() => handleOpenDialog(tx)}>
                Registrar Pago
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleMarkFailed(tx)}>
                Marcar Fallido
              </Button>
            </>
          ) : (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {tx.status === "completed" ? "Completado" : "Cancelado"}
            </span>
          )}
        </div>
      ),
    },
  ];

  const filteredTransactions =
    statusFilter === "all"
      ? transactions
      : transactions.filter((tx) => tx.status === statusFilter);
  const totalFiltered = filteredTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount ?? 0),
    0,
  );

  if (isLoading) {
    return <div className="p-8 text-center">Cargando transacciones...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8 md:py-10">
      <header className="flex flex-col gap-4 border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            Registro financiero
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Transacciones
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCleanExpired}
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            Limpiar Expiradas (24h)
          </Button>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Volver al dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            <Home className="size-4" />
            Panel principal
          </Link>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-4 border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
        <div className="min-w-[180px] space-y-2">
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Estado
          </p>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as TransactionRow["status"] | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="failed">Fallido</SelectItem>
              <SelectItem value="refunded">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto border border-border/60 bg-background/80 px-4 py-3">
          <p className="font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Total filtrado
          </p>
          <p className="mt-1 font-spaceGrotesk text-2xl font-black text-foreground">
            {formatCurrency(totalFiltered)}
          </p>
        </div>
      </section>

      <DataTable
        data={filteredTransactions}
        columns={columns}
        pageSize={5}
        filterPlaceholder="Buscar por ID, estado o método"
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  Transacción: {selectedTx.id.substring(0, 12)}...
                </p>
                <p className="text-lg font-semibold">
                  {formatCurrency(Number(selectedTx.amount ?? 0))}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Método de Pago</label>
                <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="pending">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notas (opcional)</label>
                <Textarea
                  placeholder="Referencia del banco, comprobante, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Registrar Pago"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
