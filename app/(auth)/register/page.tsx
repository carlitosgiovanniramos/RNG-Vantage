"use client";

import { useActionState, useState } from "react";
import { signup } from "@/app/(auth)/actions";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  error: "",
  values: {
    first_name: "",
    last_name: "",
    email: "",
    data_consent: false,
  },
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <Sparkles className="size-3.5" />
          Nuevo registro
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Crear una cuenta
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
            Completa tus datos para registrarte y acceder al sistema con tu
            perfil de cliente.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        {state?.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {state.error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label
              htmlFor="first_name"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Nombre
            </Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="first_name"
                name="first_name"
                type="text"
                required
                defaultValue={state?.values?.first_name ?? ""}
                className="h-12 rounded-2xl border-border/70 bg-background pl-10 text-sm"
                placeholder="Juan Pablo"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label
              htmlFor="last_name"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Apellido
            </Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="last_name"
                name="last_name"
                type="text"
                required
                defaultValue={state?.values?.last_name ?? ""}
                className="h-12 rounded-2xl border-border/70 bg-background pl-10 text-sm"
                placeholder="López Ramos"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={state?.values?.email ?? ""}
              className="h-12 rounded-2xl border-border/70 bg-background pl-10 text-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Contraseña
          </Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
              title="Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
              className="h-12 rounded-2xl border-border/70 bg-background pl-10 pr-12 text-sm"
              placeholder="••••••••"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Usa una contraseña segura de al menos 8 caracteres para mantener tu
            acceso protegido.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="data_consent"
              name="data_consent"
              required
              defaultChecked={Boolean(state?.values?.data_consent)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <div className="space-y-1">
              <Label
                htmlFor="data_consent"
                className="cursor-pointer text-sm font-medium leading-6 text-foreground"
              >
                Acepto la política de tratamiento de datos (LOPDP)
              </Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Es obligatorio para crear tu cuenta. Puedes leer el detalle en
                la política de privacidad.
              </p>
              <Link
                href="/politica-privacidad"
                className="text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Ver política de privacidad
              </Link>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-between rounded-2xl bg-primary px-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
        >
          <span>{isPending ? "Creando cuenta..." : "Registrarse"}</span>
          <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
