import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Versión en blanco para fondos oscuros (p. ej. el hero del home) */
  inverted?: boolean;
};

/** Logotipo tipográfico "RGL. ESTUDIO" usado en el sitio, login y panel admin. */
export function BrandLogo({ className, inverted = false }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "flex items-baseline gap-2.5 transition-colors duration-300",
        inverted ? "text-white" : "text-foreground",
        className,
      )}
    >
      <span className="font-spaceGrotesk text-2xl font-bold tracking-[-0.08em]">
        RGL<span className="text-primary">.</span>
      </span>
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.22em] transition-colors duration-300",
          inverted ? "text-white/70" : "text-muted-foreground",
        )}
      >
        Estudio
      </span>
    </span>
  );
}
