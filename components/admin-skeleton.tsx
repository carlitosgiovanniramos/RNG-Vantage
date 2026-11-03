import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted", className)} />;
}

/** Esqueleto de la tabla: buscador, encabezado oscuro y filas. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Bone className="h-11 w-full max-w-sm" />
        <Bone className="ml-auto h-4 w-24" />
      </div>
      <div className="border border-border/70 bg-card/90">
        <Bone className="h-12 bg-foreground/10" />
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-border/50 px-5 py-4 last:border-0"
          >
            <Bone className="h-4 w-1/4" />
            <Bone className="h-4 w-1/5" />
            <Bone className="h-4 w-1/6" />
            <Bone className="ml-auto h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Esqueleto de una vista del panel: encabezado, tarjetas y tabla. */
export function AdminPageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando"
      className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10 md:py-12"
    >
      <div className="space-y-3 border border-border/60 bg-card/85 p-6 md:p-8">
        <Bone className="h-3 w-32" />
        <Bone className="h-9 w-64" />
      </div>
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2",
          cards === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="space-y-6 border border-border/60 bg-card/80 p-5 md:p-6">
            <div className="flex items-center gap-2.5">
              <Bone className="size-8" />
              <Bone className="h-4 w-28" />
            </div>
            <Bone className="h-9 w-16" />
          </div>
        ))}
      </div>
      <TableSkeleton />
    </div>
  );
}
