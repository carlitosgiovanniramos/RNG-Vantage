import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        RNG-Vantage
      </h1>
      <p className="mt-4 max-w-lg text-lg text-muted-foreground">
        Plataforma de automatizacion de ventas, reservas y control financiero
        para tu emprendimiento de marketing digital.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/catalogo"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ver Servicios
        </Link>
        <Link
          href="/reservar"
          className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 font-medium text-foreground transition-colors hover:bg-accent"
        >
          Reservar Capacitacion
        </Link>
      </div>
      <div className="mt-12 flex gap-6 text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">
          Iniciar Sesion
        </Link>
        <Link href="/politica-privacidad" className="hover:text-foreground">
          Politica de Privacidad
        </Link>
      </div>
    </div>
  );
}
