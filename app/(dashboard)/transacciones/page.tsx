"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Home } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

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
  getReceiptSignedUrl,
} from "./actions";
import { PAYMENT_METHOD_LABELS, TRANSACTION_STATUS_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";

export type TransactionRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_method: "cash" | "transfer" | "card" | "pending";
  gateway: string;
  receipt_url: string | null;
  created_at: string;
  notes: string | null;
  client_name?: string;
};

export default function TransaccionesAdminPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("transfer");
  const [statusFilter, setStatusFilter] = useState<
    TransactionRow["status"] | "all"
  >("all");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const queryClient = useQueryClient();
  useAdminRealtime("transactions", "admin-transactions");

  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
    } finally {
      setConfirmLoading(false);
      setConfirmState(null);
    }
  };

  const handleViewReceipt = (tx: TransactionRow) => {
    setSelectedTx(tx);
    setReceiptViewerOpen(true);
    void loadReceipt(tx.id);
  };

  const loadReceipt = async (txId: string) => {
    setReceiptLoading(true);
    setReceiptUrl(null);
    try {
      const res = await getReceiptSignedUrl(txId);
      if (res.success && res.url) {
        setReceiptUrl(res.url);
      } else {
        toast.error(res.error ?? "No se pudo cargar el comprobante");
      }
    } catch {
      toast.error("No se pudo cargar el comprobante");
    } finally {
      setReceiptLoading(false);
    }
  };

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
    setPaymentMethod(tx.payment_method === "pending" ? "transfer" : tx.payment_method);
    setNotes("");
    setReceiptUrl(null);
    setOpenDialog(true);
    if (tx.receipt_url) {
      void loadReceipt(tx.id);
    }
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
        toast.success("Pago registrado exitosamente");
      } else {
        toast.error(result.error ?? "Error al registrar el pago");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const doMarkFailed = async (tx: TransactionRow) => {
    try {
      const result = await markTransactionAsFailed(tx.id);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
        toast.success("Transacción marcada como fallida");
      } else {
        toast.error(result.error ?? "Error al cancelar la transacción");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al cancelar la transacción");
    }
  };

  const handleMarkFailed = (tx: TransactionRow) => {
    setConfirmState({
      open: true,
      title: "Marcar como fallida",
      message:
        "¿Seguro que quieres marcar esta transacción como fallida/cancelada? La suscripción asociada se cancelará.",
      confirmLabel: "Marcar fallida",
      onConfirm: () => doMarkFailed(tx),
    });
  };

  const doCleanExpired = async () => {
    try {
      const result = await cleanExpiredTransactions();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
        toast.success(result.message ?? "Operación completada");
      } else {
        toast.error(result.error ?? "Error al limpiar transacciones expiradas");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al limpiar transacciones expiradas");
    }
  };

  const handleCleanExpired = () => {
    setConfirmState({
      open: true,
      title: "Limpiar expiradas",
      message:
        "¿Revisar y cancelar las transacciones pendientes con más de 24 horas? Esta acción cancelará sus suscripciones.",
      confirmLabel: "Limpiar",
      onConfirm: doCleanExpired,
    });
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
      render: (tx) => PAYMENT_METHOD_LABELS[tx.payment_method] ?? tx.payment_method,
    },
    {
      key: "receipt_url",
      header: "Comprobante",
      render: (tx) =>
        tx.receipt_url ? (
          <button
            type="button"
            onClick={() => handleViewReceipt(tx)}
            className="inline-flex items-center gap-1 bg-emerald-100 px-2.5 py-1 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.12em] text-emerald-800 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          >
            <Eye className="h-3 w-3" />
            Ver
          </button>
        ) : tx.payment_method === "transfer" ? (
          <span className="inline-flex items-center bg-amber-100 px-2.5 py-0.5 font-spaceGrotesk text-[0.6rem] font-bold uppercase tracking-[0.12em] text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            Pendiente
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
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
            <span className="inline-flex items-center bg-red-100 px-2.5 py-0.5 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.12em] text-red-800 dark:bg-red-900/40 dark:text-red-300">
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

          <a
            href="/api/admin/export-transactions"
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            Exportar CSV
          </a>

          <Link
            href="/pagos-fallidos"
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            Pagos fallidos
          </Link>

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
              <SelectValue placeholder="Filtrar">
                {statusFilter === "all"
                  ? "Todos"
                  : TRANSACTION_STATUS_LABELS[statusFilter] ?? "Todos"}
              </SelectValue>
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
            <DialogTitle className="font-spaceGrotesk text-base font-black uppercase tracking-[0.12em]">Registrar Pago</DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4">
              <div className="border border-border/60 bg-muted/40 p-4">
                <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Transacción: {selectedTx.id.substring(0, 12)}...
                </p>
                <p className="mt-1 font-spaceGrotesk text-xl font-black text-foreground">
                  {formatCurrency(Number(selectedTx.amount ?? 0))}
                </p>
              </div>

              {/* Comprobante de transferencia (si existe) */}
              {selectedTx.receipt_url && (
                <div className="space-y-2">
                  <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Comprobante de transferencia
                  </label>
                  {receiptLoading ? (
                    <div className="flex h-40 items-center justify-center border border-border/60 bg-muted/30 text-xs text-muted-foreground">
                      Cargando comprobante...
                    </div>
                  ) : receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={receiptUrl}
                        alt="Comprobante de transferencia"
                        className="max-h-72 w-full border border-border/60 bg-muted/30 object-contain"
                      />
                      <span className="mt-1 block text-center font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-wide text-primary hover:underline">
                        Abrir en tamaño completo
                      </span>
                    </a>
                  ) : (
                    <div className="flex h-20 items-center justify-center border border-border/60 bg-muted/30 text-xs text-muted-foreground">
                      No se pudo cargar el comprobante.
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Método de Pago</label>
                <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
                  <SelectTrigger>
                    <SelectValue>
                      {paymentMethod === "pending"
                        ? "Otro"
                        : PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod}
                    </SelectValue>
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
                <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Notas (opcional)</label>
                <Textarea
                  placeholder="Referencia del banco, comprobante, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-20 font-workSans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  disabled={isSubmitting}
                  className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
                >
                  {isSubmitting ? "Guardando..." : "Registrar Pago"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Visor de comprobante (abre desde la columna Comprobante) */}
      <Dialog open={receiptViewerOpen} onOpenChange={setReceiptViewerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-spaceGrotesk text-base font-black uppercase tracking-[0.12em]">
              Comprobante de transferencia
            </DialogTitle>
          </DialogHeader>

          {receiptLoading ? (
            <div className="flex h-64 items-center justify-center border border-border/60 bg-muted/30 text-sm text-muted-foreground">
              Cargando comprobante...
            </div>
          ) : receiptUrl ? (
            <div className="space-y-3">
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptUrl}
                  alt="Comprobante de transferencia"
                  className="max-h-[60vh] w-full border border-border/60 bg-muted/30 object-contain"
                />
              </a>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-wide text-primary hover:underline"
              >
                Abrir en tamaño completo
              </a>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center border border-border/60 bg-muted/30 text-sm text-muted-foreground">
              No se pudo cargar el comprobante.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación (reemplaza window.confirm) */}
      <Dialog
        open={confirmState?.open ?? false}
        onOpenChange={(open) => {
          if (!open && !confirmLoading) setConfirmState(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-spaceGrotesk text-base font-black uppercase tracking-[0.12em]">
              {confirmState?.title}
            </DialogTitle>
          </DialogHeader>

          <p className="font-workSans text-sm text-muted-foreground">
            {confirmState?.message}
          </p>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmState(null)}
              disabled={confirmLoading}
              className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={runConfirm}
              disabled={confirmLoading}
              className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
            >
              {confirmLoading ? "Procesando..." : confirmState?.confirmLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
