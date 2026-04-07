"use client";

import { useMemo, useState } from "react";

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
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 border border-border/60 bg-card/80 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setPage(1);
          }}
          placeholder={filterPlaceholder}
          className="h-12 w-full border-border/60 bg-background/90 text-sm sm:max-w-sm"
        />
        <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
          {filteredData.length} resultado(s)
        </p>
      </div>

      <div className="overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-0 bg-muted/60 hover:bg-muted/60">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    "font-spaceGrotesk px-5 py-4 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-foreground/75",
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
                  key={index}
                  className={cn(
                    "border-b border-border/40 transition-colors hover:bg-primary/[0.05]",
                    index % 2 === 0 ? "bg-background/35" : "bg-muted/20",
                  )}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${index}-${String(column.key)}`}
                      className={cn("px-5 py-4 text-sm text-foreground/90", column.className)}
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
                  className="h-20 py-6 text-center text-muted-foreground"
                >
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border border-border/50 bg-card/70 px-4 py-3">
        <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
          Página {currentPage} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
