"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "./actions";
import { CreateServiceInput } from "@/lib/validators/service";
import type { Database } from "@/types/database";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PencilLine, Sparkles, Trash2 } from "lucide-react";

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type CreateServiceFieldErrors = Partial<
  Record<keyof CreateServiceInput, string[]>
>;
type CreateServiceFormError =
  | { fieldErrors?: CreateServiceFieldErrors }
  | string
  | null;

const EMPTY_SERVICE_FORM: CreateServiceInput = {
  name: "",
  description: "",
  type: "manejo_redes",
  price: 0,
  duration_months: 1,
  is_active: true,
};

export default function ServiciosAdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateServiceInput>(EMPTY_SERVICE_FORM);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formError, setFormError] = useState<CreateServiceFormError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formFieldErrors =
    typeof formError === "object" && formError !== null
      ? formError.fieldErrors
      : undefined;

  const {
    data: services = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ServiceRow[], Error>({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await getServices();
      if (error) {
        throw new Error(error);
      }
      return (data as ServiceRow[] | null) ?? [];
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let parsedValue: string | number | boolean = value;
    if (type === "number") {
      parsedValue = value === "" ? 0 : Number(value);
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const result = editingServiceId
      ? await updateService(editingServiceId, formData)
      : await createService(formData);

    const { success, error, details } = result;

    if (success) {
      alert(
        editingServiceId
          ? "Servicio actualizado exitosamente!"
          : "Servicio creado exitosamente!",
      );
      setFormData(EMPTY_SERVICE_FORM);
      setEditingServiceId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      await refetch();
    } else {
      setFormError(details || error || "Error desconocido");
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este servicio?")) return;

    const { success, error } = await deleteService(id);
    if (success) {
      await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      await refetch();
    } else {
      alert("Error al eliminar: " + error);
    }
  };

  const handleStartEdit = (service: ServiceRow) => {
    setEditingServiceId(service.id);
    setFormError(null);
    setFormData({
      name: service.name,
      description: service.description ?? "",
      type: service.type,
      price: service.price,
      duration_months: service.duration_months,
      is_active: service.is_active,
    });
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
    setFormError(null);
    setFormData(EMPTY_SERVICE_FORM);
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/dashboard");
      return;
    }

    router.back();
  };

  const serviceColumns: DataTableColumn<ServiceRow>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (service) => (
        <div>
          <div className="font-spaceGrotesk text-sm font-bold uppercase tracking-[0.08em] text-foreground">
            {service.name}
          </div>
          <div className="max-w-xs truncate text-xs text-muted-foreground/80">
            {service.description || "Sin descripción"}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo / Precio",
      render: (service) => (
        <div>
          <div className="capitalize text-foreground/80">
            {service.type.replace("_", " ")}
          </div>
          <div className="font-spaceGrotesk text-base font-black text-foreground">
            ${service.price} / {service.duration_months}m
          </div>
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      render: (service) => (
        <StatusBadge status={service.is_active ? "active" : "expired"} />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (service) => (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em]"
            onClick={() => handleStartEdit(service)}
          >
            <PencilLine className="size-3" />
            Editar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="h-8 gap-1.5 bg-destructive/15 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em] text-destructive hover:bg-destructive/25"
            onClick={() => handleDelete(service.id)}
          >
            <Trash2 className="size-3" />
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 md:py-10">
      <header className="relative overflow-hidden border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
              Administración de catálogo
            </p>
            <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
              Gestión de Servicios
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Diseña y actualiza servicios con un flujo rápido, limpio y
              controlado para el equipo de RGL Estudio.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
            onClick={handleGoBack}
          >
            <ArrowLeft className="size-4" />
            Volver atrás
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[370px_minmax(0,1fr)]">
        <aside className="h-fit border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:p-7 xl:sticky xl:top-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-spaceGrotesk text-base font-black uppercase tracking-[0.14em] text-foreground">
              {editingServiceId ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>
            <span className="inline-flex h-8 items-center gap-1 bg-primary/10 px-2.5 font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-3" />
              Admin
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-2 h-11 w-full border border-border/60 bg-background/90 px-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                required
              />
              {formFieldErrors?.name && (
                <p className="mt-1 text-xs text-red-500">
                  {formFieldErrors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={4}
                className="mt-2 w-full resize-none border border-border/60 bg-background/90 px-3 py-2 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Tipo
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-2 h-11 w-full border border-border/60 bg-background/90 px-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              >
                <option value="manejo_redes">Manejo de Redes</option>
                <option value="auditoria">Auditoría</option>
                <option value="capacitacion">Capacitación</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Precio ($)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-2 h-11 w-full border border-border/60 bg-background/90 px-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div>
                <label className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Duración
                </label>
                <input
                  type="number"
                  name="duration_months"
                  min="1"
                  value={formData.duration_months}
                  onChange={handleInputChange}
                  className="mt-2 h-11 w-full border border-border/60 bg-background/90 px-3 text-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 accent-primary"
              />
              <label
                htmlFor="is_active"
                className="font-spaceGrotesk text-[0.7rem] font-bold uppercase tracking-[0.14em] text-foreground"
              >
                Activo / Visible
              </label>
            </div>

            {typeof formError === "string" && (
              <p className="mt-2 text-sm text-red-500">{formError}</p>
            )}

            {editingServiceId && (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full border-border/70 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
                onClick={handleCancelEdit}
              >
                Cancelar edición
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full font-spaceGrotesk text-[0.7rem] font-bold uppercase tracking-[0.18em]"
            >
              {isSubmitting
                ? "Guardando..."
                : editingServiceId
                  ? "Guardar cambios"
                  : "Guardar servicio"}
            </Button>
          </form>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-spaceGrotesk text-2xl font-black uppercase tracking-[0.08em] text-foreground md:text-3xl">
              Catálogo de Servicios
            </h2>
            <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {services.length} servicio(s) en catálogo
            </p>
          </div>

          {isLoading ? (
            <div className="border border-border/60 bg-card/80 p-8 text-center">
              Cargando servicios...
            </div>
          ) : isError ? (
            <div className="border border-border/60 bg-card/80 p-8 text-center text-red-500">
              Error: {error.message}
            </div>
          ) : (
            <DataTable
              data={services}
              columns={serviceColumns}
              pageSize={8}
              filterPlaceholder="Buscar por nombre, tipo o descripción"
            />
          )}
        </section>
      </div>
    </div>
  );
}
