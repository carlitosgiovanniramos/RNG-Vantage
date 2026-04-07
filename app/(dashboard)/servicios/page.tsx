"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getServices, createService, deleteService } from "./actions";
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

export default function ServiciosAdminPage() {
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateServiceInput>({
    name: "",
    description: "",
    type: "manejo_redes",
    price: 0,
    duration_months: 1,
    is_active: true,
  });
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

    const { success, error, details } = await createService(formData);

    if (success) {
      alert("Servicio creado exitosamente!");
      setFormData({
        name: "",
        description: "",
        type: "manejo_redes",
        price: 0,
        duration_months: 1,
        is_active: true,
      });
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
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleDelete(service.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      {/* Formulario de Creación */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-fit">
        <h2 className="text-xl font-bold mb-4">Crear Nuevo Servicio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
            {formError?.fieldErrors?.name && (
              <p className="text-red-500 text-xs mt-1">
                {formError.fieldErrors.name[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
            >
              <option value="manejo_redes">Manejo de Redes</option>
              <option value="auditoria">Auditoría</option>
              <option value="capacitacion">Capacitación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio ($)
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meses Duración
              </label>
              <input
                type="number"
                name="duration_months"
                min="1"
                value={formData.duration_months}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-900"
            >
              Activo / Visible
            </label>
          </div>

          {typeof formError === "string" && (
            <p className="text-red-500 text-sm mt-2">{formError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {isSubmitting ? "Guardando..." : "Guardar Servicio"}
          </button>
        </form>
      </div>

      {/* Lista de Servicios */}
      <div className="w-full md:w-2/3">
        <h1 className="text-2xl font-bold mb-6">Catálogo de Servicios</h1>

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
  );
}
