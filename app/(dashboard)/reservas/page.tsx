"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReservations,
  updateReservationStatus,
} from "./actions";
import type { Database, ReservationStatus } from "@/types/database";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  getReservationDisplayStatus,
  RESERVATION_STATUS_META,
} from "@/lib/reservations";
import { AlarmClock, CalendarCheck2, Clock3, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AdminPageSkeleton } from "@/components/admin-skeleton";
import { DataCard } from "@/components/data-card";
import { FilterSelect } from "@/components/filter-select";
import { toast } from "sonner";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

type ReservationRow = Database["public"]["Tables"]["reservations"]["Row"];

export default function ReservasAdminPage() {
  const queryClient = useQueryClient();
  useAdminRealtime("reservations", "admin-reservations");
  const [statusFilter, setStatusFilter] = useState<
    ReservationStatus | "all" | "overdue"
  >("all");

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

  const handleStatusUpdate = async (id: string, status: ReservationStatus) => {
    const { success, error } = await updateReservationStatus(id, status);
    if (success) {
      await queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      await refetch();
    } else {
      toast.error("Error al actualizar: " + error);
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
        const display = getReservationDisplayStatus(res.status, res.preferred_date);
        const meta = RESERVATION_STATUS_META[display];
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.12em] ${meta.className}`}
          >
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Acciones",
      render: (res) => {
        const isFinal = res.status === "cancelled" || res.status === "completed";
        return (
          <div className="flex flex-wrap gap-2">
            {res.status !== "confirmed" && !isFinal && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em]"
                onClick={() => handleStatusUpdate(res.id, "confirmed")}
              >
                Confirmar
              </Button>
            )}
            {res.status === "confirmed" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 border-emerald-300 bg-emerald-50 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                onClick={() => handleStatusUpdate(res.id, "completed")}
              >
                Completar
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 bg-destructive/15 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-destructive hover:bg-destructive/25"
              onClick={() => handleStatusUpdate(res.id, "cancelled")}
              disabled={isFinal}
            >
              Cancelar
            </Button>
          </div>
        );
      },
    },
  ];

  const pendingCount = reservations.filter((res) => res.status === "pending").length;
  const confirmedCount = reservations.filter(
    (res) => res.status === "confirmed",
  ).length;
  const cancelledCount = reservations.filter(
    (res) => res.status === "cancelled",
  ).length;
  const overdueCount = reservations.filter(
    (res) => getReservationDisplayStatus(res.status, res.preferred_date) === "overdue",
  ).length;
  const filteredReservations =
    statusFilter === "all"
      ? reservations
      : statusFilter === "overdue"
        ? reservations.filter(
            (res) =>
              getReservationDisplayStatus(res.status, res.preferred_date) === "overdue",
          )
        : reservations.filter((res) => res.status === statusFilter);
  const statusTabs = [
    { label: "Todas", value: "all", count: reservations.length },
    { label: "Pendientes", value: "pending", count: pendingCount },
    { label: "Atrasadas", value: "overdue", count: overdueCount },
    { label: "Confirmadas", value: "confirmed", count: confirmedCount },
    { label: "Canceladas", value: "cancelled", count: cancelledCount },
  ] as const;

  if (isLoading) return <AdminPageSkeleton cards={4} />;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10 md:py-12">
      <AdminPageHeader eyebrow="Agenda y seguimiento" title="Gestión de reservas" />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Pendientes"
          value={pendingCount}
          icon={<Clock3 className="size-4" />}
          delay={80}
          highlight
        />
        <DataCard
          title="Atrasadas"
          value={overdueCount}
          icon={<AlarmClock className="size-4" />}
          delay={140}
        />
        <DataCard
          title="Confirmadas"
          value={confirmedCount}
          icon={<CalendarCheck2 className="size-4" />}
          delay={200}
        />
        <DataCard
          title="Canceladas"
          value={cancelledCount}
          icon={<XCircle className="size-4" />}
          delay={260}
        />
      </section>

      <DataTable
        data={filteredReservations}
        toolbar={
          <FilterSelect
            options={statusTabs}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        }
        columns={columns}
        pageSize={5}
        filterPlaceholder="Buscar por cliente, email o estado"
      />
    </div>
  );
}
