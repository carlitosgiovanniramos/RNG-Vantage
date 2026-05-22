"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, PencilLine, Power, UserCheck, UserRoundX, UsersRound } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getClients, toggleClientActive, updateClient, type ClientRow } from "./actions";

type ClientTableRow = ClientRow & Record<string, unknown>;

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  is_active: true,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function ClientesAdminPage() {
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: clients = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ClientTableRow[], Error>({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const result = await getClients();
      if (result.error) throw new Error(result.error);
      return (result.data ?? []) as ClientTableRow[];
    },
  });

  const activeCount = clients.filter((client) => client.is_active).length;
  const inactiveCount = clients.length - activeCount;

  const refreshClients = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
    await refetch();
  };

  const handleEdit = (client: ClientRow) => {
    setEditingClient(client);
    setFormError(null);
    setFormData({
      first_name: client.first_name ?? "",
      last_name: client.last_name ?? "",
      is_active: client.is_active,
    });
  };

  const handleToggle = async (client: ClientRow) => {
    const nextState = !client.is_active;
    const action = nextState ? "activar" : "desactivar";
    if (!confirm(`¿Seguro que deseas ${action} a este cliente?`)) return;

    const result = await toggleClientActive(client.id, nextState);
    if (result.success) {
      await refreshClients();
    } else {
      alert(result.error ?? "No se pudo actualizar el estado del cliente.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingClient) return;

    setIsSubmitting(true);
    setFormError(null);

    const result = await updateClient(editingClient.id, formData);
    if (result.success) {
      setEditingClient(null);
      setFormData(EMPTY_FORM);
      await refreshClients();
    } else {
      setFormError(result.error ?? "No se pudo actualizar el cliente.");
    }

    setIsSubmitting(false);
  };

  const columns: DataTableColumn<ClientTableRow>[] = [
    {
      key: "client",
      header: "Cliente",
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-border bg-background font-spaceGrotesk text-xs font-black uppercase text-primary">
            {String(client.first_name ?? "C").charAt(0)}
            {String(client.last_name ?? "").charAt(0)}
          </div>
          <div>
            <div className="font-spaceGrotesk text-sm font-black uppercase tracking-[0.08em] text-foreground">
              {client.first_name} {client.last_name}
            </div>
            <div className="text-xs text-muted-foreground">{client.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Registro",
      render: (client) => (
        <span className="text-sm text-foreground/80">{formatDate(client.created_at)}</span>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      render: (client) => (
        <StatusBadge status={client.is_active ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (client) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em]"
            onClick={() => handleEdit(client)}
          >
            <PencilLine className="size-3" />
            Editar
          </Button>
          <Button
            type="button"
            size="sm"
            variant={client.is_active ? "outline" : "default"}
            className="h-8 gap-1.5 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em]"
            onClick={() => handleToggle(client)}
          >
            <Power className="size-3" />
            {client.is_active ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 md:py-10">
      <header className="relative overflow-hidden border border-border/70 bg-card/90 p-6 shadow-[12px_12px_0_var(--border)] backdrop-blur-xl md:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
              Gestion de clientes
            </p>
            <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
              Clientes
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Administra clientes registrados, actualiza sus datos principales y desactiva accesos cuando ya no esten activos.
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
        <article className="border border-border/70 bg-card/90 p-5 backdrop-blur-xl">
          <UsersRound className="mb-4 size-5 text-primary" />
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Total clientes</p>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">{clients.length}</p>
        </article>
        <article className="border border-border/70 bg-card/90 p-5 backdrop-blur-xl">
          <UserCheck className="mb-4 size-5 text-primary" />
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Activos</p>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">{activeCount}</p>
        </article>
        <article className="border border-border/70 bg-card/90 p-5 backdrop-blur-xl">
          <UserRoundX className="mb-4 size-5 text-primary" />
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Inactivos</p>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">{inactiveCount}</p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-spaceGrotesk text-2xl font-black uppercase tracking-[0.08em] text-foreground md:text-3xl">
            Registro de clientes
          </h2>
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {clients.length} cliente(s)
          </p>
        </div>

        {isLoading ? (
          <div className="border border-border/60 bg-card/80 p-8 text-center">Cargando clientes...</div>
        ) : isError ? (
          <div className="border border-border/60 bg-card/80 p-8 text-center text-red-500">Error: {error.message}</div>
        ) : (
          <DataTable
            data={clients}
            columns={columns}
            pageSize={8}
            filterPlaceholder="Buscar por cliente, email o estado"
          />
        )}
      </section>

      <Dialog open={Boolean(editingClient)} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-spaceGrotesk text-base font-black uppercase tracking-[0.12em]">
              Editar cliente
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Nombre
                </label>
                <input
                  value={formData.first_name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, first_name: event.target.value }))}
                  className="mt-2 h-11 w-full border border-border/60 bg-background/90 px-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Apellido
                </label>
                <input
                  value={formData.last_name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, last_name: event.target.value }))}
                  className="mt-2 h-11 w-full border border-border/60 bg-background/90 px-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 border border-border bg-muted/30 p-4">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              <span className="font-spaceGrotesk text-[0.7rem] font-bold uppercase tracking-[0.14em] text-foreground">
                Cliente activo
              </span>
            </label>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 border-border/70 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
                onClick={() => setEditingClient(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 font-spaceGrotesk text-[0.7rem] font-bold uppercase tracking-[0.18em]"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
