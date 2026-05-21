"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, PencilLine, Plus, Power, Trash2 } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { CreateServiceInput } from "@/lib/validators/service";
import type { Database, ServiceType } from "@/types/database";
import {
  createService,
  deleteService,
  getServices,
  updateService,
} from "./actions";

type ServiceRow = Omit<
  Database["public"]["Tables"]["services"]["Row"],
  "type"
> & {
  type: ServiceType;
};
type ServiceTableRow = Record<string, unknown> & ServiceRow;
type CreateServiceFieldErrors = Partial<
  Record<keyof CreateServiceInput, string[]>
>;
type CreateServiceFormError =
  | { fieldErrors?: CreateServiceFieldErrors }
  | string
  | null;

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "manejo_redes", label: "Manejo de Redes" },
  { value: "auditoria", label: "Auditoría" },
  { value: "capacitacion", label: "Capacitación" },
  { value: "otro", label: "Otro" },
];

const EMPTY_SERVICE_FORM: CreateServiceInput = {
  name: "",
  description: "",
  type: "manejo_redes",
  price: 0,
  duration_months: 1,
  is_active: true,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDuration(months: number) {
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}

function getServiceTypeLabel(type: ServiceType) {
  return SERVICE_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

function normalizeServiceType(value: string): ServiceType | null {
  return SERVICE_TYPE_OPTIONS.some((option) => option.value === value)
    ? (value as ServiceType)
    : null;
}

export default function ServiciosAdminPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] =
    useState<CreateServiceInput>(EMPTY_SERVICE_FORM);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [formError, setFormError] = useState<CreateServiceFormError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null);

  const formFieldErrors =
    typeof formError === "object" && formError !== null
      ? formError.fieldErrors
      : undefined;

  const {
    data: services = [],
    isLoading,
    isError,
    error,
  } = useQuery<ServiceRow[], Error>({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await getServices();
      if (error) {
        throw new Error(error);
      }

      const raw =
        (data as Database["public"]["Tables"]["services"]["Row"][] | null) ??
        [];

      return raw
        .map((service) => {
          const type = normalizeServiceType(service.type);
          if (!type) return null;
          return { ...service, type };
        })
        .filter((service): service is ServiceRow => Boolean(service));
    },
  });

  const resetForm = () => {
    setFormData(EMPTY_SERVICE_FORM);
    setEditingServiceId(null);
    setFormError(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && !isSubmitting) {
      resetForm();
    }
  };

  const handleOpenNewServiceDialog = () => {
    resetForm();
    setIsDialogOpen(true);
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
    setIsDialogOpen(true);
  };

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = event.target;

    let parsedValue: string | number | boolean = value;
    if (type === "number") {
      parsedValue = value === "" ? 0 : Number(value);
    } else if (type === "checkbox") {
      parsedValue = (event.target as HTMLInputElement).checked;
    }

    setFormData((current) => ({ ...current, [name]: parsedValue }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      ...formData,
      description: formData.description?.trim() || undefined,
      name: formData.name.trim(),
      price: Number(formData.price),
      duration_months: Number(formData.duration_months),
    };

    const result = editingServiceId
      ? await updateService(editingServiceId, payload)
      : await createService(payload);

    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.details || result.error || "Error desconocido");
      toast.error("No se pudo guardar el servicio", {
        description: result.error ?? "Revisa los campos e intenta de nuevo.",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    setIsDialogOpen(false);
    resetForm();
    toast.success(
      editingServiceId
        ? "Servicio actualizado correctamente"
        : "Servicio creado correctamente",
    );
  };

  const handleToggleActive = async (service: ServiceRow) => {
    setUpdatingServiceId(service.id);
    const { success, error } = await updateService(service.id, {
      is_active: !service.is_active,
    });
    setUpdatingServiceId(null);

    if (!success) {
      toast.error("No se pudo cambiar el estado", {
        description: error ?? "Intenta nuevamente.",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    toast.success(
      service.is_active ? "Servicio desactivado" : "Servicio activado",
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este servicio?")) return;

    const { success, error } = await deleteService(id);
    if (!success) {
      toast.error("Error al eliminar", {
        description: error ?? "Intenta nuevamente.",
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    toast.success("Servicio eliminado correctamente");
  };

  const inactiveClass = (service: ServiceRow) =>
    cn(!service.is_active && "opacity-50");

  const serviceColumns: DataTableColumn<ServiceTableRow>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (service) => (
        <div className={inactiveClass(service)}>
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
      header: "Tipo",
      render: (service) => (
        <span className={cn("text-foreground/80", inactiveClass(service))}>
          {getServiceTypeLabel(service.type)}
        </span>
      ),
    },
    {
      key: "price",
      header: "Precio",
      render: (service) => (
        <span
          className={cn(
            "font-spaceGrotesk text-base font-black text-foreground",
            inactiveClass(service),
          )}
        >
          {formatCurrency(Number(service.price ?? 0))}
        </span>
      ),
    },
    {
      key: "duration_months",
      header: "Duración",
      render: (service) => (
        <span className={cn("text-foreground/80", inactiveClass(service))}>
          {formatDuration(Number(service.duration_months ?? 0))}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      render: (service) =>
        service.is_active ? (
          <StatusBadge status="active" />
        ) : (
          <StatusBadge status="inactive" className="opacity-70" />
        ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (service) => (
        <div className={cn("flex flex-wrap gap-2", inactiveClass(service))}>
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
            variant="outline"
            className="h-8 gap-1.5 border-border/70 bg-background/80 px-3 font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.14em]"
            onClick={() => handleToggleActive(service)}
            disabled={updatingServiceId === service.id}
          >
            <Power className="size-3" />
            {service.is_active ? "Desactivar" : "Activar"}
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

  const activeCount = services.filter((service) => service.is_active).length;
  const inactiveCount = services.length - activeCount;

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
          <div className="flex flex-wrap gap-2">
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger
                render={
                  <Button
                    type="button"
                    size="lg"
                    className="h-11 rounded-none px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
                    onClick={handleOpenNewServiceDialog}
                  />
                }
              >
                <Plus className="size-4" />
                Nuevo Servicio
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <DialogHeader>
                    <DialogTitle>
                      {editingServiceId ? "Editar Servicio" : "Nuevo Servicio"}
                    </DialogTitle>
                    <DialogDescription>
                      Completa la información visible en el catálogo y define si
                      el servicio estará activo.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-11"
                        required
                      />
                      {formFieldErrors?.name && (
                        <p className="text-xs text-destructive">
                          {formFieldErrors.name[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleInputChange}
                        rows={4}
                      />
                      {formFieldErrors?.description && (
                        <p className="text-xs text-destructive">
                          {formFieldErrors.description[0]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {SERVICE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formFieldErrors?.type && (
                        <p className="text-xs text-destructive">
                          {formFieldErrors.type[0]}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <Input
                          id="price"
                          type="number"
                          name="price"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                        {formFieldErrors?.price && (
                          <p className="text-xs text-destructive">
                            {formFieldErrors.price[0]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration_months">Duración</Label>
                        <Input
                          id="duration_months"
                          type="number"
                          name="duration_months"
                          min="1"
                          value={formData.duration_months}
                          onChange={handleInputChange}
                          className="h-11"
                          required
                        />
                        {formFieldErrors?.duration_months && (
                          <p className="text-xs text-destructive">
                            {formFieldErrors.duration_months[0]}
                          </p>
                        )}
                      </div>
                    </div>

                    <label
                      htmlFor="is_active"
                      className="flex items-center gap-3 border border-border/60 bg-muted/40 p-3"
                    >
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="font-spaceGrotesk text-[0.7rem] font-bold uppercase tracking-[0.14em] text-foreground">
                        Activo / Visible
                      </span>
                    </label>

                    {typeof formError === "string" && (
                      <p className="text-sm text-destructive">{formError}</p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogOpenChange(false)}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? "Guardando..."
                        : editingServiceId
                          ? "Guardar cambios"
                          : "Guardar servicio"}
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
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Total
          </p>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">
            {services.length}
          </p>
        </article>
        <article className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Activos
          </p>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">
            {activeCount}
          </p>
        </article>
        <article className="border border-border/60 bg-card/80 p-4 backdrop-blur-sm">
          <p className="font-spaceGrotesk text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Inactivos
          </p>
          <p className="mt-2 font-spaceGrotesk text-3xl font-black text-foreground">
            {inactiveCount}
          </p>
        </article>
      </section>

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
            data={services as ServiceTableRow[]}
            columns={serviceColumns}
            pageSize={8}
            filterPlaceholder="Buscar por nombre, tipo o descripción"
          />
        )}
      </section>
    </div>
  );
}
