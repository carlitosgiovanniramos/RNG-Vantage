import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  /** Acciones propias de la página (botones a la derecha) */
  children?: ReactNode;
};

/** Encabezado común de las vistas del panel admin. */
export function AdminPageHeader({ eyebrow, title, children }: AdminPageHeaderProps) {
  return (
    <header className="animate-rise relative overflow-hidden border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:p-8">
      <div
        aria-hidden
        className="animate-float pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
        </div>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>
    </header>
  );
}

/** Clases para los botones secundarios del encabezado. */
export const headerActionClass =
  "inline-flex h-10 items-center gap-2 border border-border/70 bg-background/80 px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary";
