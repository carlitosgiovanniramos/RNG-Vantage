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
          <div className="font-medium">{service.name}</div>
          <div className="max-w-xs truncate text-xs text-muted-foreground">
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
          <div className="capitalize">{service.type.replace("_", " ")}</div>
          <div className="font-semibold">
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
          <Button size="sm" variant="outline" onClick={() => handleStartEdit(service)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(service.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto space-y-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={handleGoBack}>
          Volver atrás
        </Button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
      {/* Formulario de Creación */}
      <div className="w-full lg:w-1/3 bg-surface-container-lowest p-8 h-fit border-0 space-y-6">
        <h2 className="text-lg font-black uppercase tracking-[0.18em]">
          {editingServiceId ? "Editar Servicio" : "Crear Nuevo Servicio"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-2 block w-full bg-background px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
              required
            />
            {formError?.fieldErrors?.name && (
              <p className="text-red-500 text-xs mt-1">
                {formError.fieldErrors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              className="mt-2 block w-full bg-background px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Tipo
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-2 block w-full bg-background px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="manejo_redes">Manejo de Redes</option>
              <option value="auditoria">Auditoría</option>
              <option value="capacitacion">Capacitación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Precio ($)
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-2 block w-full bg-background px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Meses Duración
              </label>
              <input
                type="number"
                name="duration_months"
                min="1"
                value={formData.duration_months}
                onChange={handleInputChange}
                className="mt-2 block w-full bg-background px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
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
              className="text-sm font-medium text-foreground"
            >
              Activo / Visible
            </label>
          </div>

          {typeof formError === "string" && (
            <p className="text-red-500 text-sm mt-2">{formError}</p>
          )}

          {editingServiceId && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCancelEdit}
            >
              Cancelar edición
            </Button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:bg-primary/50"
          >
            {isSubmitting
              ? "Guardando..."
              : editingServiceId
                ? "Guardar cambios"
                : "Guardar Servicio"}
          </button>
        </form>
      </div>

      {/* Lista de Servicios */}
      <div className="w-full lg:w-2/3">
        <h1 className="text-4xl font-black tracking-tight mb-8 space-grotesk">Catálogo de Servicios</h1>

        {isLoading ? (
          <div className="text-center p-8">Cargando servicios...</div>
        ) : isError ? (
          <div className="text-center p-8 text-red-500">
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
      </div>

      </div>
    </div>
  );
}
