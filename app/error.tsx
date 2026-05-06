"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(180,19,64,0.10),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(44,47,46,0.06),transparent_35%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(44,47,46,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(44,47,46,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative w-full max-w-lg space-y-8">
        <div className="border border-border/60 bg-card/90 p-8 shadow-[8px_8px_0px_0px_rgba(44,47,46,0.12)] backdrop-blur-sm sm:p-12">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-block bg-destructive px-3 py-1 font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-widest text-white">
                  Error del servidor
                </div>
                <h1 className="font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
                  Algo salió mal
                </h1>
              </div>
            </div>

            <p className="font-workSans text-sm leading-7 text-muted-foreground">
              Ocurrió un error inesperado. Puedes intentar recargar la página o volver al panel principal.
            </p>

            {error.digest && (
              <div className="border border-border/50 bg-muted/40 px-4 py-3">
                <p className="font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Código de referencia
                </p>
                <p className="mt-1 font-workSans text-xs text-muted-foreground/80">
                  {error.digest}
                </p>
              </div>
            )}

            <div
              aria-hidden
              className="border-t border-border/50 pt-6 font-spaceGrotesk text-[4rem] font-black leading-none tracking-tighter text-foreground/5 select-none sm:text-[6rem]"
            >
              500
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={reset}
                className="inline-flex h-12 items-center gap-2 bg-primary px-5 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
              >
                <RefreshCw className="size-4" />
                Reintentar
              </button>
              <Link
                href="/"
                className="inline-flex h-12 items-center gap-2 border border-border/70 bg-background/80 px-5 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted"
              >
                <ArrowLeft className="size-4" />
                Panel principal
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center font-spaceGrotesk text-[0.65rem] font-bold uppercase tracking-[0.22em] text-muted-foreground/60">
          RGL Estudio · Sistema de gestión
        </p>
      </div>
    </div>
  );
}
