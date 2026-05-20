"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Home,
  Plus,
  ReceiptText,
  RefreshCw,
} from "lucide-react";

import { DataCard } from "@/components/data-card";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentMethod, TransactionStatus } from "@/types/database";
import {
  createPayment,
  getPaymentFormOptions,
  getTransactions,
  updateTransactionStatus,
  type AdminTransactionRow,
  type CreatePaymentInput,
  type PaymentSubscriptionOption,
} from "./actions";

type TransactionTableRow = Record<string, unknown> & AdminTransactionRow;
type StatusFilter = "all" | TransactionStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "failed", label: "Fallido" },
  { value: "refunded", label: "Reembolsado" },
];

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" },
  { value: "pending", label: "Pendiente" },
];

const TRANSACTION_STATUS_OPTIONS: { value: TransactionStatus; label: string }[] =
  [
    { value: "pending", label: "Pendiente" },
    { value: "completed", label: "Completado" },
    { value: "failed", label: "Fallido" },
    { value: "refunded", label: "Reembolsado" },
  ];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusBadge(status: TransactionStatus) {
  if (status === "completed") {
    return <StatusBadge status="completed" />;
  }

  if (status === "pending") {
    return <StatusBadge status="pending" />;
  }

  return <StatusBadge status="expired" />;
}

function getPaymentLabel(method: PaymentMethod) {
  return (
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ??
    method
  );
}

function isInsideDateRange(transactionDate: string, from: string, to: string) {
  const date = new Date(transactionDate);

  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (date < start) {
      return false;
    }
  }

  if (to) {
    const end = new Date(`${to}T23:59:59`);
    if (date > end) {
      return false;
    }
  }

  return true;
}

export default function TransaccionesAdminPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreatePaymentInput>({
    subscription_id: "",
    amount: 0,
    payment_method: "transfer",
    status: "completed",
    notes: "",
  });
  const queryClient = useQueryClient();

  const {
    data: transactions = [],
    isLoading,
    isError,
    error,
  } = useQuery<AdminTransactionRow[], Error>({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await getTransactions();
      if (error) {
        throw new Error(error);
      }
      return data ?? [];
    },
  });

  const {
    data: subscriptionOptions = [],
    isLoading: isLoadingOptions,
  } = useQuery<PaymentSubscriptionOption[], Error>({
    queryKey: ["payment-form-options"],
    queryFn: async () => {
      const { data, error } = await getPaymentFormOptions();
      if (error) {
        throw new Error(error);
      }
      return data ?? [];
    },
  });

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesStatus =
          statusFilter === "all" || transaction.status === statusFilter;
        const matchesDate = isInsideDateRange(
          transaction.created_at,
          dateFrom,
          dateTo,
        );

        return matchesStatus && matchesDate;
      }),
    [dateFrom, dateTo, statusFilter, transactions],
  );

  const filteredTotal = useMemo(
    () =>
      filteredTransactions.reduce(
        (total, transaction) => total + Number(transaction.amount ?? 0),
        0,
      ),
    [filteredTransactions],
  );

  const completedTotal = useMemo(
    () =>
      filteredTransactions
        .filter((transaction) => transaction.status === "completed")
        .reduce(
          (total, transaction) => total + Number(transaction.amount ?? 0),
          0,
        ),
    [filteredTransactions],
  );

  const resetForm = () => {
    setForm({
      subscription_id: "",
      amount: 0,
      payment_method: "transfer",
      status: "completed",
      notes: "",
    });
  };

  const handleSubscriptionChange = (subscriptionId: string) => {
    const option = subscriptionOptions.find((item) => item.id === subscriptionId);

    setForm((current) => ({
      ...current,
      subscription_id: subscriptionId,
      amount: option?.price ?? current.amount,
    }));
  };

  const handleCreatePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subscription_id) {
      toast.error("Selecciona una suscripción");
      return;
    }

    if (Number(form.amount) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    setIsSubmitting(true);
    const { success, error } = await createPayment({
      ...form,
      amount: Number(form.amount),
      notes: form.notes?.trim() || undefined,
    });
    setIsSubmitting(false);

    if (!success) {
      toast.error("No se pudo registrar el pago", {
        description: error ?? "Intenta nuevamente.",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    setIsDialogOpen(false);
    resetForm();
    toast.success("Pago registrado correctamente");
  };

  const handleStatusUpdate = async (
    transaction: AdminTransactionRow,
    status: TransactionStatus,
  ) => {
    if (transaction.status === status) {
      return;
    }

    const { success, error } = await updateTransactionStatus(
      transaction.id,
      status,
    );

    if (!success) {
      toast.error("No se pudo actualizar la transacción", {
        description: error ?? "Intenta nuevamente.",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    toast.success("Estado de transacción actualizado");
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const columns: DataTableColumn<TransactionTableRow>[] = [
    {
      key: "created_at",
      header: "Fecha",
      render: (tx) => formatDateTime(tx.created_at),
    },
    {
      key: "client_name",
      header: "Cliente",
      render: (tx) => (
        <div>
          <div className="font-medium">{tx.client_name}</div>
          <div className="text-xs text-muted-foreground">
            {tx.user_id ? `${tx.user_id.substring(0, 8)}...` : "Sin usuario"}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      render: (tx) => formatCurrency(Number(tx.amount ?? 0)),
    },
    {
      key: "payment_method",
      header: "Método",
      render: (tx) => getPaymentLabel(tx.payment_method),
    },
    {
      key: "status",
      header: "Estado",
      render: (tx) => getStatusBadge(tx.status),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (tx) => (
        <select
          value={tx.status}
          onChange={(event) =>
            handleStatusUpdate(tx, event.target.value as TransactionStatus)
          }
          className="h-9 min-w-36 border border-border/70 bg-background px-2 text-xs font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-label="Cambiar estado de transacción"
        >
          {TRANSACTION_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8 md:py-10">
      <header className="flex flex-col gap-4 border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            Registro financiero
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Transacciones
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Administra pagos, filtra movimientos y controla el estado financiero
            de las suscripciones.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  size="lg"
                  className="h-11 rounded-none px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
                />
              }
            >
              <Plus className="size-4" />
              Registrar Pago
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <form onSubmit={handleCreatePayment} className="space-y-5">
                <DialogHeader>
                  <DialogTitle>Registrar pago</DialogTitle>
                  <DialogDescription>
                    Registra una transacción asociada a una suscripción activa o
                    pendiente.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscription">Cliente / Servicio</Label>
                    <select
                      id="subscription"
                      value={form.subscription_id}
                      onChange={(event) =>
                        handleSubscriptionChange(event.target.value)
                      }
                      disabled={isLoadingOptions}
                      className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">
                        {isLoadingOptions
                          ? "Cargando suscripciones..."
                          : "Selecciona una suscripción"}
                      </option>
                      {subscriptionOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.client_name} - {option.service_name} (
                          {formatCurrency(option.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            amount: Number(event.target.value),
                          }))
                        }
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Método</Label>
                      <select
                        id="payment_method"
                        value={form.payment_method}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            payment_method: event.target.value as PaymentMethod,
                          }))
                        }
                        className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {PAYMENT_METHOD_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as TransactionStatus,
                        }))
                      }
                      className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {TRANSACTION_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      maxLength={500}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Referencia, observación o detalle interno"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Registrando..." : "Guardar pago"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

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

      <div className="grid gap-5 md:grid-cols-3">
        <DataCard
          title="Total filtrado"
          value={formatCurrency(filteredTotal)}
          icon={<ReceiptText className="size-5" />}
        />
        <DataCard
          title="Ingresos completados"
          value={formatCurrency(completedTotal)}
          icon={<CalendarDays className="size-5" />}
        />
        <DataCard
          title="Resultados"
          value={filteredTransactions.length}
          icon={<RefreshCw className="size-5" />}
        />
      </div>

      <section className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Estado</Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-from">Desde</Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to">Hasta</Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-11"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-none px-4"
            onClick={clearFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      </section>

      <DataTable
        data={filteredTransactions as TransactionTableRow[]}
        columns={columns}
        pageSize={10}
        filterPlaceholder="Buscar por cliente, ID, estado o método"
      />
    </div>
  );
}
