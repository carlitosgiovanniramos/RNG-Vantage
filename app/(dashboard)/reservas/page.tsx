"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReservations,
  updateReservationStatus,
  type ReservationStatus,
} from "./actions";
import type { Database } from "@/types/database";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

type ReservationRow = Database["public"]["Tables"]["reservations"]["Row"];

export default function ReservasAdminPage() {
  const router = useRouter();
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

  const handleStatusUpdate = async (id: string, status: ReservationStatus) => {
    const { success, error } = await updateReservationStatus(id, status);
    if (success) {
      await queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      await refetch();
    } else {
      alert("Error al actualizar: " + error);
    }
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/dashboard");
      return;
    }

    router.back();
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate(res.id, "confirmed")}
            disabled={res.status === "confirmed"}
          >
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleStatusUpdate(res.id, "cancelled")}
            disabled={res.status === "cancelled"}
          >
            Cancelar
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return <div className="p-8 text-center">Cargando reservas...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Error: {error.message}</div>
    );

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Gestión de Reservas</h1>
        <Button type="button" variant="outline" onClick={handleGoBack}>
          Volver atrás
        </Button>
      </div>
      <DataTable
        data={reservations}
        columns={columns}
        pageSize={8}
        filterPlaceholder="Buscar por cliente, email o estado"
      />
    </div>
  );
}
