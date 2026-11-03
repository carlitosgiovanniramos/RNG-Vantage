"use client";

import { ListFilter } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption<T extends string> = {
  label: string;
  value: T;
  count?: number;
};

type FilterSelectProps<T extends string> = {
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nombre del criterio, usado para accesibilidad */
  label?: string;
};

/** Combo box compacto para filtrar las tablas del panel admin. */
export function FilterSelect<T extends string>({
  options,
  value,
  onChange,
  label = "estado",
}: FilterSelectProps<T>) {
  const current = options.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as T)}>
      <SelectTrigger
        aria-label={`Filtrar por ${label}`}
        className="h-11 min-w-44 gap-2 rounded-none border-border/70 bg-background/90 px-3"
      >
        <ListFilter className="size-4 text-primary" />
        <SelectValue>
          {current ? (
            <span className="flex items-center gap-2">
              {current.label}
              {typeof current.count === "number" ? (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {current.count}
                </span>
              ) : null}
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-none">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-none py-2">
            <span className="flex w-full items-center justify-between gap-6">
              {option.label}
              {typeof option.count === "number" ? (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {option.count}
                </span>
              ) : null}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
