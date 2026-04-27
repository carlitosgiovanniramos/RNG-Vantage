"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getReservations,
  updateReservationStatus,
  type ReservationStatus,
} from "./actions";
import type { Database } from "@/types/database";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CalendarCheck2,
  Clock3,
  XCircle,
  ChevronDown,
  Eye,
} from "lucide-react";

type ReservationRow = Database["public"]["Tables"]["reservations"]["Row"];

export default function ReservasAdminPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>(
    "all",
  );
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationRow | null>(null);
  const queryClient = useQueryClient();

  const {
    data: reservations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ReservationRow[], Error>({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data, error } = await getReservations();
      if (error) {
        throw new Error(error);
      }
      return (data as ReservationRow[] | null) ?? [];
    },
  });

  // Filtrar reservas por estado
  const filteredReservations = reservations.filter((res) => {
    if (statusFilter === "all") return true;
    return res.status === statusFilter;
  });

  const handleStatusUpdate = async (id: string, status: ReservationStatus) => {
    const { success, error } = await updateReservationStatus(id, status);
    if (success) {
      await queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      await refetch();

      // Mostrar toast de éxito
      const statusLabel = {
        pending: "Pendiente",
        confirmed: "Confirmada",
        cancelled: "Cancelada",
        completed: "Completada",
      }[status];

      toast.success(`Reserva actualizada a ${statusLabel}`, {
        description: `ID: ${id.substring(0, 8)}...`,
      });

      // Cerrar el dialog si está abierto
      setSelectedReservation(null);
    } else {
      toast.error("Error al actualizar", {
        description: error || "Intenta de nuevo más tarde",
      });
    }
  };

  const columns: DataTableColumn<ReservationRow>[] = [
    {
      key: "id",
      header: "ID",
      render: (res) => `${res.id.substring(0, 8)}...`,
    },
    {
      key: "client",
      header: "Cliente",
      render: (res) => (
        <div>
          <div className="font-medium">
            {res.first_name} {res.last_name}
          </div>
          <div className="text-xs text-muted-foreground">{res.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      render: (res) =>
        res.phone || (
          <span className="text-muted-foreground">No especificado</span>
        ),
    },
    {
      key: "preferred_date",
      header: "Fecha / Hora",
      render: (res) =>
        new Date(res.preferred_date).toLocaleString("es-EC", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      key: "status",
      header: "Estado",
      render: (res) => {
        if (res.status === "confirmed") {
          return <StatusBadge status="active" />;
        }

        if (res.status === "cancelled") {
          return <StatusBadge status="expired" />;
        }

        return <StatusBadge status={res.status as "pending" | "completed"} />;
      },
    },
    {
      key: "actions",
      header: "Acciones",
      render: (res) => (
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em]"
                onClick={() => setSelectedReservation(res)}
              >
                <Eye className="mr-1.5 size-3" />
                Ver
              </Button>
            </DialogTrigger>
            {selectedReservation?.id === res.id && (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Detalle de Reserva</DialogTitle>
                  <DialogDescription>
                    Información completa de la reserva y opciones de gestión.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Información Personal */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Información Personal</h4>
                    <div className="space-y-1 rounded-lg bg-muted p-3">
                      <p className="text-sm">
                        <span className="font-medium">Nombre:</span>{" "}
                        {selectedReservation.first_name}{" "}
                        {selectedReservation.last_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span>{" "}
                        {selectedReservation.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Teléfono:</span>{" "}
                        {selectedReservation.phone || "No especificado"}
                      </p>
                    </div>
                  </div>

                  {/* Información de la Reserva */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Información de la Reserva</h4>
                    <div className="space-y-1 rounded-lg bg-muted p-3">
                      <p className="text-sm">
                        <span className="font-medium">ID:</span>{" "}
                        {selectedReservation.id}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Fecha Preferida:</span>{" "}
                        {new Date(
                          selectedReservation.preferred_date,
                        ).toLocaleString("es-EC", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Estado:</span>{" "}
                        {selectedReservation.status === "confirmed" ? (
                          <StatusBadge status="active" />
                        ) : selectedReservation.status === "cancelled" ? (
                          <StatusBadge status="expired" />
                        ) : (
                          <StatusBadge
                            status={
                              selectedReservation.status as
                                | "pending"
                                | "completed"
                            }
                          />
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Notas */}
                  {selectedReservation.notes && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Notas</h4>
                      <p className="rounded-lg bg-muted p-3 text-sm">
                        {selectedReservation.notes}
                      </p>
                    </div>
                  )}

                  {/* Fechas del Sistema */}
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-xs font-medium text-muted-foreground">
                      Información del Sistema
                    </h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        Creada:{" "}
                        {new Date(
                          selectedReservation.created_at,
                        ).toLocaleString("es-EC")}
                      </p>
                      <p>
                        Actualizada:{" "}
                        {new Date(
                          selectedReservation.updated_at,
                        ).toLocaleString("es-EC")}
                      </p>
                    </div>
                  </div>

                  {/* Cambiar Estado */}
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium">Cambiar Estado</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-amber-600/30 bg-amber-50/50 text-amber-900 hover:bg-amber-100 dark:border-amber-600/30 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50"
                        onClick={() => handleStatusUpdate(res.id, "pending")}
                        disabled={res.status === "pending"}
                      >
                        Pendiente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-emerald-600/30 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-600/30 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-950/50"
                        onClick={() => handleStatusUpdate(res.id, "confirmed")}
                        disabled={res.status === "confirmed"}
                      >
                        Confirmada
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 bg-destructive/15 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-destructive hover:bg-destructive/25"
                        onClick={() => handleStatusUpdate(res.id, "cancelled")}
                        disabled={res.status === "cancelled"}
                      >
                        Cancelada
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full">
                    Cerrar
                  </Button>
                </DialogClose>
              </DialogContent>
            )}
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em]"
              >
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={res.status === "pending"}
                onClick={() => handleStatusUpdate(res.id, "pending")}
              >
                Pendiente
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={res.status === "confirmed"}
                onClick={() => handleStatusUpdate(res.id, "confirmed")}
              >
                Confirmada
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={res.status === "completed"}
                onClick={() => handleStatusUpdate(res.id, "completed")}
              >
                Completada
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={res.status === "cancelled"}
                onClick={() => handleStatusUpdate(res.id, "cancelled")}
                className="text-destructive focus:text-destructive"
              >
                Cancelada
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const pendingCount = reservations.filter(
    (res) => res.status === "pending",
  ).length;
  const confirmedCount = reservations.filter(
    (res) => res.status === "confirmed",
  ).length;
  const cancelledCount = reservations.filter(
    (res) => res.status === "cancelled",
  ).length;

  if (isLoading)
    return <div className="p-8 text-center">Cargando reservas...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 md:py-10">
      <header className="relative overflow-hidden border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
              Agenda y seguimiento
            </p>
            <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
              Gestión de Reservas
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Supervisa el estado de las reservas y ejecuta confirmaciones o
              cancelaciones de forma rápida y segura.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Volver al dashboard
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Pendientes
            </p>
            <Clock3 className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">
            {pendingCount}
          </p>
        </article>

        <article className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Confirmadas
            </p>
            <CalendarCheck2 className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">
            {confirmedCount}
          </p>
        </article>

        <article className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Canceladas
            </p>
            <XCircle className="size-4 text-red-600" />
          </div>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">
            {cancelledCount}
          </p>
        </article>
      </section>

      {/* Tabs para filtrar por estado */}
      <div className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
        <Tabs
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as typeof statusFilter)
          }
        >
          <TabsList className="grid w-full grid-cols-4 h-10 bg-muted/50">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Todas
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pendientes ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs sm:text-sm">
              Confirmadas ({confirmedCount})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-xs sm:text-sm">
              Canceladas ({cancelledCount})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value={statusFilter} className="mt-0">
              <DataTable
                data={filteredReservations}
                columns={columns}
                pageSize={8}
                filterPlaceholder="Buscar por cliente, email o teléfono"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
