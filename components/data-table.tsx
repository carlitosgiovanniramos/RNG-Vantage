"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: DataTableColumn<T>[];
  pageSize?: number;
  filterPlaceholder?: string;
  /** Controles extra junto al buscador (p. ej. un filtro por estado) */
  toolbar?: ReactNode;
  className?: string;
};

/** Páginas visibles: todas si son pocas; si no, primera, última y vecinas con "…". */
function getPageItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const items: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page++) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

const pageButtonClass =
  "flex size-9 items-center justify-center rounded-full text-sm tabular-nums transition-colors";

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  filterPlaceholder = "Filtrar...",
  toolbar,
  className,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  const filteredData = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [data, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [currentPage, filteredData, pageSize]);

  const resultsLabel = `${filteredData.length} ${filteredData.length === 1 ? "resultado" : "resultados"}`;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setPage(1);
            }}
            placeholder={filterPlaceholder}
            className="h-11 w-full rounded-none border-border/70 bg-background/90 pl-10 font-workSans text-sm shadow-none"
          />
        </div>
        {toolbar}
        <p className="text-sm text-muted-foreground sm:ml-auto">{resultsLabel}</p>
      </div>

      {/* Vista de tabla (escritorio / tablet >= md) */}
      <div className="hidden overflow-hidden border border-border/70 bg-card/90 backdrop-blur-xl md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 bg-foreground hover:bg-foreground">
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={cn(
                      "font-spaceGrotesk px-5 py-4 text-[0.68rem] font-black uppercase tracking-[0.2em] text-background",
                      column.className,
                    )}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((row, index) => (
                  <TableRow
                    key={(row as { id?: string | number }).id ?? index}
                    className={cn(
                      "border-b border-border/50 transition-colors hover:bg-primary/[0.06]",
                      index % 2 === 0 ? "bg-background/40" : "bg-muted/25",
                    )}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${index}-${String(column.key)}`}
                        className={cn("px-5 py-4 font-workSans text-sm text-foreground/90", column.className)}
                      >
                        {column.render
                          ? column.render(row)
                          : String(row[column.key as keyof T] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 py-6 text-center font-workSans text-muted-foreground"
                  >
                    Sin resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Vista de tarjetas (móvil < md): cada fila es una tarjeta apilada */}
      <div className="space-y-3 md:hidden">
        {paginated.length > 0 ? (
          paginated.map((row, index) => (
            <div
              key={(row as { id?: string | number }).id ?? index}
              className="space-y-2 border border-border/70 bg-card/90 p-4"
            >
              {columns.map((column) => (
                <div
                  key={`${index}-${String(column.key)}`}
                  className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0"
                >
                  <span className="font-spaceGrotesk text-[0.58rem] font-black uppercase tracking-[0.16em] text-muted-foreground">
                    {column.header}
                  </span>
                  <span className="text-right font-workSans text-sm text-foreground/90">
                    {column.render
                      ? column.render(row)
                      : String(row[column.key as keyof T] ?? "")}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="border border-border/70 bg-card/90 p-6 text-center font-workSans text-muted-foreground">
            Sin resultados
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-1 pt-1">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
            className={cn(
              pageButtonClass,
              "text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
            )}
          >
            <ChevronLeft className="size-4" />
          </button>

          {getPageItems(currentPage, totalPages).map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="w-6 text-center text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                aria-label={`Página ${item}`}
                aria-current={item === currentPage ? "page" : undefined}
                className={cn(
                  pageButtonClass,
                  item === currentPage
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
            className={cn(
              pageButtonClass,
              "text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
            )}
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
