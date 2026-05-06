import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Users, Award, CalendarCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];

function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(price);
}

const HIGHLIGHTS = [
  { icon: Users, label: "Grupos reducidos", desc: "Máximo 12 participantes por taller para garantizar atención personalizada." },
  { icon: Award, label: "Certificado incluido", desc: "Recibes un certificado de asistencia digital al completar el programa." },
  { icon: CalendarCheck, label: "Horarios flexibles", desc: "Sesiones presenciales y en línea adaptadas a tu agenda." },
];

const STEPS = [
  { number: "01", title: "Reserva tu lugar", desc: "Completa el formulario con tus datos y la fecha preferida." },
  { number: "02", title: "Confirmación", desc: "Te contactamos en 24 horas para confirmar horario y modalidad." },
  { number: "03", title: "Aprende", desc: "Participa en el taller con material incluido y soporte posterior." },
];

export default async function CapacitacionPage() {
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("type", "capacitacion")
    .eq("is_active", true)
    .order("price", { ascending: true });

  const safeServices: Service[] = services ?? [];

  return (
    <div>
      {/* Hero */}
      <div className="relative -mt-[90px] w-full h-screen overflow-hidden">
        <Image
          src="/images/capacitacion.webp"
          alt="RGL Estudio — Capacitación"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 lg:px-16 pb-10 pt-[90px]">
          <div className="max-w-[1440px] mx-auto w-full">
            <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary mb-3">
              RGL Estudio · Ecuador
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-spaceGrotesk font-black uppercase tracking-tighter text-white leading-none mb-4">
              Capacitación
            </h1>
            <p className="text-white/75 font-workSans text-base sm:text-lg max-w-[520px] leading-relaxed mb-8">
              Talleres prácticos de marketing digital y redes sociales para emprendedores, equipos y profesionales.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/reservar"
                className="inline-flex h-12 items-center gap-2 bg-primary px-6 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary/85"
              >
                Reservar lugar
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#programas"
                className="inline-flex h-12 items-center gap-2 border border-white/40 bg-white/10 px-6 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/20"
              >
                Ver programas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <section className="border-b border-border/60 bg-card/50 px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col gap-4 bg-card p-8">
                <div className="flex size-12 items-center justify-center bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">
                    {label}
                  </h3>
                  <p className="font-workSans text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programas */}
      <section id="programas" className="px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12">
            <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Oferta formativa
            </p>
            <h2 className="font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
              Programas disponibles
            </h2>
          </div>

          {safeServices.length === 0 ? (
            <div className="border border-dashed border-border/60 bg-muted/30 px-8 py-20 text-center">
              <GraduationCap className="mx-auto mb-4 size-12 text-muted-foreground/40" />
              <p className="font-spaceGrotesk text-lg font-bold uppercase tracking-tight text-muted-foreground">
                Próximos talleres en camino
              </p>
              <p className="mt-2 font-workSans text-sm text-muted-foreground/70">
                Estamos preparando nuevos programas. Reserva tu lugar y te avisamos cuando estén disponibles.
              </p>
              <Link
                href="/reservar"
                className="mt-8 inline-flex h-12 items-center gap-2 bg-primary px-6 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary/85"
              >
                Avisarme cuando haya cupo
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {safeServices.map((service, i) => (
                <div
                  key={service.id}
                  className="group relative flex flex-col bg-card p-8 transition-colors duration-500 hover:bg-primary sm:p-10"
                >
                  <span
                    aria-hidden
                    className="absolute right-8 top-6 select-none font-spaceGrotesk text-6xl font-black leading-none text-foreground/8 transition-colors duration-500 group-hover:text-primary-foreground/8"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <GraduationCap className="mb-8 size-12 shrink-0 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />

                  <h3 className="mb-3 font-spaceGrotesk text-2xl font-black uppercase tracking-tighter text-foreground transition-colors duration-500 group-hover:text-primary-foreground sm:text-3xl">
                    {service.name}
                  </h3>

                  <p className="mb-8 flex-1 font-workSans text-sm leading-relaxed text-muted-foreground transition-colors duration-500 group-hover:text-primary-foreground/75">
                    {service.description ?? "Taller práctico bajo consulta."}
                  </p>

                  {service.duration_months > 1 && (
                    <p className="mb-4 font-workSans text-xs text-muted-foreground transition-colors duration-500 group-hover:text-primary-foreground/60">
                      Duración: {service.duration_months} meses
                    </p>
                  )}

                  <div className="mb-8">
                    <span className="font-spaceGrotesk text-3xl font-black text-foreground transition-colors duration-500 group-hover:text-primary-foreground sm:text-4xl">
                      {formatPrice(Number(service.price))}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/checkout?service_id=${service.id}`}
                      className="flex-1 inline-flex h-11 items-center justify-center border border-foreground px-4 font-spaceGrotesk text-xs font-black uppercase tracking-wide text-foreground transition-colors duration-500 group-hover:border-primary-foreground group-hover:text-primary-foreground hover:bg-foreground/5"
                    >
                      Contratar
                    </Link>
                    <Link
                      href="/reservar"
                      className="flex-1 inline-flex h-11 items-center justify-center bg-foreground px-4 font-spaceGrotesk text-xs font-black uppercase tracking-wide text-background transition-colors duration-500 group-hover:bg-primary-foreground group-hover:text-primary"
                    >
                      Reservar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-border/60 bg-muted/20 px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-14">
            <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
              Proceso
            </p>
            <h2 className="font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
              Cómo funciona
            </h2>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-3">
            {STEPS.map(({ number, title, desc }) => (
              <div key={number} className="bg-card p-8">
                <p className="mb-4 font-spaceGrotesk text-5xl font-black leading-none tracking-tighter text-primary/20">
                  {number}
                </p>
                <h3 className="mb-3 font-spaceGrotesk text-xl font-black uppercase tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="font-workSans text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Contenido
              </p>
              <h2 className="mb-6 font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
                ¿Qué incluye cada taller?
              </h2>
              <ul className="space-y-4">
                {[
                  "Material digital descargable",
                  "Sesión práctica con casos reales",
                  "Acceso a grabación por 30 días",
                  "Certificado de asistencia",
                  "Soporte vía WhatsApp por 7 días",
                  "Grupo privado de seguimiento",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    <span className="font-workSans text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA card */}
            <div className="border border-border/60 bg-card p-10 shadow-[8px_8px_0px_0px_rgba(44,47,46,0.10)]">
              <p className="mb-2 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Reserva sin compromiso
              </p>
              <h3 className="mb-4 font-spaceGrotesk text-3xl font-black uppercase tracking-tighter text-foreground">
                Agenda tu lugar hoy
              </h3>
              <p className="mb-8 font-workSans text-sm leading-relaxed text-muted-foreground">
                No necesitas una cuenta. Completa el formulario y uno de nuestros asesores te confirma la disponibilidad en menos de 24 horas.
              </p>
              <Link
                href="/reservar"
                className="inline-flex h-14 w-full items-center justify-center gap-2 bg-primary font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary/85"
              >
                Reservar sesión gratuita
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
