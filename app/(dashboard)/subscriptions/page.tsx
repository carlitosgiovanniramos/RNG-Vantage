import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8 md:py-10">
      <header className="flex flex-col gap-4 border border-border/60 bg-card/85 p-6 backdrop-blur-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">
            Ciclo comercial
          </p>
          <h1 className="font-spaceGrotesk text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Suscripciones
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Volver al dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 border border-border/70 bg-background/80 px-4 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted"
          >
            <Home className="size-4" />
            Panel principal
          </Link>
        </div>
      </header>

      <div className="border border-border/60 bg-card/80 p-6 text-muted-foreground backdrop-blur-sm">
        Este módulo está en construcción.
      </div>
    </div>
  );
}
