import Link from "next/link";
import { CalendarDays, MessageSquareText } from "lucide-react";

// Número en formato internacional sin "+" ni espacios, p. ej. 593991234567.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
const WHATSAPP_MESSAGE = "Hola RGL Estudio, quiero información sobre sus servicios.";

/** Cuadro de llamado a la acción: reservar o escribir por WhatsApp. */
export function CtaBanner() {
  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    : null;

  return (
    <section className="relative overflow-hidden bg-primary px-7 py-10 text-white sm:px-10 sm:py-12">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-6 select-none font-spaceGrotesk text-[9rem] font-black leading-none tracking-tighter text-white/10 sm:text-[12rem]"
      >
        RGL
      </span>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] text-white/90">
            Agenda abierta 2026
          </p>
          <h2 className="font-spaceGrotesk text-3xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-4xl">
            ¿Listo para llevar la imagen de tu marca al siguiente nivel?
          </h2>
          <p className="mt-4 font-workSans text-sm leading-relaxed text-white/85 sm:text-base">
            Coordinamos tu rodaje o plan mensual con 7 días de anticipación.
            <br className="hidden sm:block" /> Cuéntanos sobre tu negocio y estructuramos una propuesta inmediata.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/reservar"
            className="inline-flex h-14 items-center justify-center gap-3 bg-white px-7 font-spaceGrotesk text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            Reservar
            <CalendarDays className="size-4" />
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center gap-3 bg-foreground px-7 font-spaceGrotesk text-sm font-semibold text-white transition-colors hover:bg-foreground/85"
            >
              <span className="max-w-[7rem] text-center leading-tight">Escribir por WhatsApp</span>
              <MessageSquareText className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
