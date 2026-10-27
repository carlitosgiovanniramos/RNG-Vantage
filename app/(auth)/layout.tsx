import { AuthCard } from "./auth-card";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-x-clip bg-background px-4 py-24 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(174,41,0,0.17),transparent_52%),radial-gradient(ellipse_at_bottom_right,rgba(174,41,0,0.04),transparent_50%)]" />
      <header className="absolute inset-x-6 top-6 flex items-center justify-between gap-4 sm:inset-x-10 sm:top-8">
        <Link
          href="/"
          aria-label="RGL Estudio, inicio"
          className="flex items-baseline gap-2.5 text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <span className="font-spaceGrotesk text-2xl font-bold tracking-[-0.08em]">RGL<span className="text-primary">.</span></span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Estudio</span>
        </Link>
        <Link
          href="/"
          className="shrink-0 py-2 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Volver al inicio
        </Link>
      </header>
      <div className="relative w-full max-w-[460px] [perspective:1200px]">
        <AuthCard>{children}</AuthCard>
      </div>
    </div>
  );
}
