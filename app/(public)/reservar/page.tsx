"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

import { createReservationSchema } from "@/lib/validators/reservation";
import { createReservation } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ReservationFormData = z.infer<typeof createReservationSchema>;

export default function ReservarPage() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState<Date | undefined>(undefined);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(createReservationSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      notes: "",
      data_consent: false,
    },
  });

  const dataConsent = useWatch({
    control,
    name: "data_consent",
  });

  async function onSubmit(data: ReservationFormData) {
    const result = await createReservation(data);

    if (!result.success) {
      toast.error("Error al enviar la reserva", {
        description: result.error,
      });
      return;
    }

    toast.success("¡Reserva enviada!", {
      description: "Nos pondremos en contacto contigo pronto.",
    });
    reset();
    setDisplayDate(undefined);
  }

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[640px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-spaceGrotesk font-black uppercase tracking-tighter text-foreground mb-4">
            Reservar
          </h1>
          <p className="text-muted-foreground font-workSans text-base sm:text-lg leading-relaxed">
            Agenda una sesión de diagnóstico inicial. No necesitas cuenta para reservar.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Nombre completo */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name" className="font-spaceGrotesk font-bold text-sm uppercase tracking-wide">
              Nombre completo *
            </Label>
            <Input
              id="full_name"
              placeholder="Juan Pablo López"
              className="h-11 px-3 text-base rounded-none"
              aria-invalid={!!errors.full_name}
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="font-spaceGrotesk font-bold text-sm uppercase tracking-wide">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="h-11 px-3 text-base rounded-none"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="font-spaceGrotesk font-bold text-sm uppercase tracking-wide">
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0991234567"
              className="h-11 px-3 text-base rounded-none"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Fecha preferida */}
          <div className="flex flex-col gap-2">
            <Label className="font-spaceGrotesk font-bold text-sm uppercase tracking-wide">
              Fecha preferida *
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className={`h-11 rounded-none w-full justify-start text-left font-normal px-3 text-base ${
                      !displayDate ? "text-muted-foreground" : ""
                    } ${errors.preferred_date ? "border-destructive ring-3 ring-destructive/20" : ""}`}
                  />
                }
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {displayDate
                  ? format(displayDate, "PPP", { locale: es })
                  : "Selecciona una fecha"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-none border-border shadow-[4px_4px_0px_0px_rgba(44,47,46,0.15)]" align="start">
                <Calendar
                  mode="single"
                  selected={displayDate}
                  onSelect={(date) => {
                    if (date) {
                      setDisplayDate(date);
                      setValue("preferred_date", date.toISOString(), { shouldValidate: true });
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => date <= new Date()}
                  locale={es}
                  className="p-4"
                  classNames={{
                    month_caption: "font-spaceGrotesk font-bold text-sm uppercase tracking-wide",
                  }}
                />
              </PopoverContent>
            </Popover>
            {errors.preferred_date && (
              <p className="text-sm text-destructive">{errors.preferred_date.message}</p>
            )}
          </div>

          {/* Notas */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes" className="font-spaceGrotesk font-bold text-sm uppercase tracking-wide">
              Notas adicionales
            </Label>
            <Textarea
              id="notes"
              placeholder="Cuéntanos sobre tu negocio o qué necesitas..."
              rows={4}
              className="px-3 py-3 text-base rounded-none"
              aria-invalid={!!errors.notes}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Consentimiento LOPDP */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="data_consent"
                checked={dataConsent}
                onCheckedChange={(checked) =>
                  setValue("data_consent", checked === true, { shouldValidate: true })
                }
                aria-invalid={!!errors.data_consent}
              />
              <Label htmlFor="data_consent" className="text-sm font-workSans leading-relaxed cursor-pointer">
                Acepto la{" "}
                <Link href="/politica-privacidad" className="text-primary font-bold hover:underline">
                  Política de Privacidad
                </Link>{" "}
                y el tratamiento de mis datos personales según la LOPDP. *
              </Label>
            </div>
            {errors.data_consent && (
              <p className="text-sm text-destructive">{errors.data_consent.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="h-auto rounded-none w-full py-5 font-spaceGrotesk font-black text-lg uppercase tracking-tight hover:bg-primary/85 active:scale-95 shadow-[8px_8px_0px_0px_rgba(44,47,46,1)] dark:shadow-[8px_8px_0px_0px_rgba(245,247,245,1)] mt-4"
          >
            {isSubmitting ? "Enviando..." : "Reservar Sesión"}
          </Button>
        </form>
      </div>
    </section>
  );
}
