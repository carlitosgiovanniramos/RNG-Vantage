import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(174,41,0,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(44,47,46,0.08),transparent_30%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-foreground/5 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[1fr_minmax(360px,460px)] lg:px-8">
        <aside className="hidden h-full flex-col gap-8 border border-border/60 bg-background/80 p-8 shadow-[8px_8px_0px_0px_rgba(44,47,46,0.12)] backdrop-blur lg:flex">
          <div className="space-y-6">
            <div className="inline-block bg-primary px-4 py-1 font-spaceGrotesk text-xs font-bold uppercase tracking-widest text-white">
              RGL Estudio
            </div>

            <div className="space-y-4">
              <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Acceso seguro
              </p>
              <h1 className="max-w-xl font-spaceGrotesk text-5xl font-black uppercase tracking-tighter text-foreground">
                Acceso para clientes y administradores.
              </h1>
              <p className="max-w-lg font-workSans text-base leading-7 text-muted-foreground">
                Ingresa y continúa según tu rol.
              </p>
            </div>

            <figure className="relative overflow-hidden border border-border/70 bg-[#e8e3dd]">
              <Image
                src="/images/auth-vantage.gif"
                alt="Visual corporativo Vantage para acceso de clientes y administradores"
                width={800}
                height={400}
                className="h-64 w-full object-cover object-left"
                unoptimized
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/90 via-foreground/45 to-transparent px-4 py-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.16em] text-background">
                visión estratégica de marca
              </figcaption>
            </figure>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 border border-border/70 bg-background/80 p-4">
              <div className="mt-0.5 shrink-0 bg-primary/10 p-2 text-primary">
                <span className="inline-block h-4 w-4 border border-current" />
              </div>
              <p className="font-workSans leading-6">
                Flujo limpio: acceso por rol y registro seguro con LOPDP.
              </p>
            </div>
          </div>
        </aside>

        <main className="mx-auto w-full max-w-md border border-border/70 bg-background/95 p-6 shadow-[8px_8px_0px_0px_rgba(44,47,46,0.10)] backdrop-blur sm:p-8">
          <div className="mb-6 flex justify-end">
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 border border-border/70 bg-background/85 px-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              Panel principal
            </Link>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
