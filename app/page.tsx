import Link from "next/link";

export default function Home() {
  const socialPlans = [
    {
      name: "Redes Sociales Inicial",
      price: "$299.99 / mes",
      description: "Plan inicial para mantener presencia activa en redes.",
    },
    {
      name: "Redes Sociales Work",
      price: "$319.99 / mes",
      description: "Plan intermedio con mayor frecuencia y estrategia.",
    },
    {
      name: "Redes Sociales Premium",
      price: "$555.00 / mes",
      description: "Plan avanzado para crecimiento acelerado de marca.",
    },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            RNG-Vantage
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Plataforma de automatizacion de ventas, reservas y control financiero
            para emprendimientos de marketing digital.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
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
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {socialPlans.map((plan) => (
            <article key={plan.name} className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <p className="mt-5 text-2xl font-bold">{plan.price}</p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Servicios unicos disponibles desde $25.00 (auditoria, sesiones y produccion audiovisual).
        </p>

        <div className="mt-10 flex justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">
            Iniciar Sesion
          </Link>
          <Link href="/politica-privacidad" className="hover:text-foreground">
            Politica de Privacidad
          </Link>
        </div>
      </section>
    </div>
  );
}
