"use client";

import { useActionState, Suspense, useState } from "react";
import { login, resendSignupConfirmation } from "@/app/(auth)/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  error: "",
  values: {
    email: "",
  },
};

const initialResendState = {
  error: "",
  success: "",
  values: {
    email: "",
  },
};

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get("redirect") ?? "";
  const wasRegistered = searchParams.get("registered") === "1";
  const hint = searchParams.get("hint");
  const prefillEmail = searchParams.get("email") ?? "";
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [resendState, resendAction, isResending] = useActionState(
    resendSignupConfirmation,
    initialResendState,
  );
  const shouldShowResend =
    hint === "confirm-or-login" ||
    state?.error?.toLowerCase().includes("confirmar tu correo") ||
    state?.error?.toLowerCase().includes("email not confirmed");

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          <Sparkles className="size-3.5" />
          Acceso seguro
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Iniciar sesión
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
            Ingresa con tu correo y contraseña para continuar al área
            correspondiente.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        {wasRegistered && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            Cuenta creada. Revisa tu correo para confirmarlo antes de iniciar
            sesión.
          </div>
        )}

        {hint === "confirm-or-login" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            Si ya te registraste, revisa tu correo y luego inicia sesión. Evita
            reenviar varias veces seguidas.
          </div>
        )}

        {resendState?.success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {resendState.success}
          </div>
        )}

        {resendState?.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {resendState.error}
          </div>
        )}

        {state?.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {state.error}
          </div>
        )}

        <input type="hidden" name="redirect" value={redirectParams} />

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
              defaultValue={state?.values?.email ?? prefillEmail}
              className="h-12 rounded-2xl border-border/70 bg-background pl-10 text-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Contraseña
            </Label>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
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
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-between rounded-2xl bg-primary px-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90"
        >
          <span>{isPending ? "Iniciando sesión..." : "Ingresar"}</span>
          <ArrowRight className="size-4" />
        </Button>
      </form>

      {shouldShowResend && (
        <form
          action={resendAction}
          className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              ¿No te llegó el correo de confirmación?
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              Puedes pedir un nuevo enlace usando el mismo correo con el que te
              registraste.
            </p>
          </div>
          <Input
            name="email"
            type="email"
            required
            defaultValue={
              state?.values?.email ??
              prefillEmail ??
              resendState?.values?.email ??
              ""
            }
            className="h-12 rounded-2xl border-border/70 bg-background text-sm"
            placeholder="correo@ejemplo.com"
          />
          <Button
            type="submit"
            disabled={isResending}
            variant="outline"
            className="h-12 w-full rounded-2xl border-border/70 bg-background text-sm font-semibold uppercase tracking-[0.16em]"
          >
            {isResending ? "Reenviando..." : "Reenviar confirmación"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={<div className="text-center">Cargando formulario...</div>}
      >
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{" "}
        <Link
          href="/register"
          className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
        >
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
