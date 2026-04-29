"use client";

import { useActionState, Suspense, useEffect, useRef, useState } from "react";
import { login, resendSignupConfirmation } from "@/app/(auth)/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

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
  const formRef = useRef<HTMLFormElement | null>(null);
  const allowNativeSubmitRef = useRef(false);
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: state?.values?.email ?? prefillEmail,
      password: "",
    },
  });

  useEffect(() => {
    reset({
      email: state?.values?.email ?? prefillEmail,
      password: "",
    });
  }, [prefillEmail, reset, state?.values?.email]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const form = formRef.current;
      if (!form) {
        return;
      }

      const emailInput = form.elements.namedItem("email") as HTMLInputElement | null;
      const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;

      if (!emailInput || !passwordInput) {
        return;
      }

      const hasExternalEmailPrefill = Boolean(state?.values?.email ?? prefillEmail);
      const emailLooksAutofilled =
        !hasExternalEmailPrefill && emailInput.value.trim().length > 0;
      const passwordLooksAutofilled = passwordInput.value.length > 0;

      if (emailLooksAutofilled || passwordLooksAutofilled) {
        reset({
          email: state?.values?.email ?? prefillEmail,
          password: "",
        });
      }
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [prefillEmail, reset, state?.values?.email]);

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="inline-block bg-primary px-3 py-1 font-spaceGrotesk text-xs font-bold uppercase tracking-widest text-white">
          Acceso seguro
        </div>

        <div className="space-y-2">
          <h1 className="font-spaceGrotesk text-4xl font-black uppercase tracking-tighter text-foreground sm:text-5xl">
            Iniciar sesión
          </h1>
          <p className="max-w-sm font-workSans text-sm leading-6 text-muted-foreground">
            Ingresa para continuar.
          </p>
        </div>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="space-y-6"
        noValidate
        onSubmit={(event) => {
          if (allowNativeSubmitRef.current) {
            allowNativeSubmitRef.current = false;
            return;
          }

          event.preventDefault();
          const formElement = event.currentTarget;
          void handleSubmit(() => {
            allowNativeSubmitRef.current = true;
            formElement.requestSubmit();
          })(event);
        }}
      >
        {wasRegistered && (
          <div className="rounded-none border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            Cuenta creada. Revisa tu correo para confirmarlo antes de iniciar
            sesión.
          </div>
        )}

        {hint === "confirm-or-login" && (
          <div className="rounded-none border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            Si ya te registraste, confirma tu correo y luego inicia sesión.
          </div>
        )}

        {resendState?.success && (
          <div className="rounded-none border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {resendState.success}
          </div>
        )}

        {resendState?.error && (
          <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {resendState.error}
          </div>
        )}

        {state?.error && (
          <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
            {state.error}
          </div>
        )}

        <input type="hidden" name="redirect" value={redirectParams} />

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              {...register("email")}
              className="h-12 rounded-none border-border/70 bg-background pl-10 text-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <Label
              htmlFor="password"
              className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground"
            >
              Contraseña
            </Label>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              {...register("password")}
              className="h-12 rounded-none border-border/70 bg-background pl-10 pr-12 text-sm"
              placeholder="••••••••"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-none text-muted-foreground hover:text-foreground"
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
          {errors.password ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-none bg-primary px-5 font-spaceGrotesk text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
        >
          {isPending ? "Iniciando sesión..." : "Ingresar"}
        </Button>
      </form>

      {shouldShowResend && (
        <form
          action={resendAction}
          className="space-y-3 rounded-none border border-dashed border-border/70 bg-muted/30 p-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              ¿No llegó el correo?
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              Reenvía el enlace con tu mismo correo.
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
            className="h-12 rounded-none border-border/70 bg-background text-sm"
            placeholder="correo@ejemplo.com"
          />
          <Button
            type="submit"
            disabled={isResending}
            variant="outline"
            className="h-12 w-full rounded-none border-border/70 bg-background font-spaceGrotesk text-sm font-bold uppercase tracking-[0.16em]"
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
