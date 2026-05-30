"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  className?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  filterPlaceholder = "Filtrar...",
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

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-4 border border-border/70 bg-card/90 p-4 shadow-[8px_8px_0_var(--border)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary" />
          <Input
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setPage(1);
            }}
            placeholder={filterPlaceholder}
            className="h-12 w-full border-border/70 bg-background/90 pl-11 font-workSans text-sm shadow-none"
          />
        </div>
        <div className="border border-border bg-background/80 px-4 py-3 text-right">
          <p className="font-spaceGrotesk text-[0.62rem] font-black uppercase tracking-[0.18em] text-muted-foreground">
            Resultados
          </p>
          <p className="font-spaceGrotesk text-lg font-black text-foreground">
            {filteredData.length}
          </p>
        </div>
      </div>

      {/* Vista de tabla (escritorio / tablet >= md) */}
      <div className="hidden overflow-hidden border border-border/70 bg-card/90 shadow-[8px_8px_0_var(--border)] backdrop-blur-xl md:block">
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
              className="space-y-2 border border-border/70 bg-card/90 p-4 shadow-[6px_6px_0_var(--border)]"
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

      <div className="flex items-center justify-between border border-border/70 bg-card/90 px-4 py-3 shadow-[6px_6px_0_var(--border)]">
        <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
          Pagina {currentPage} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
