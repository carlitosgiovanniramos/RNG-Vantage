import { cn } from "@/lib/utils";

/** Logotipo tipográfico "RGL. ESTUDIO" usado en login, registro y panel admin. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-2.5 text-foreground", className)}>
      <span className="font-spaceGrotesk text-2xl font-bold tracking-[-0.08em]">
        RGL<span className="text-primary">.</span>
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Estudio
      </span>
    </span>
  );
}
