"use client";

import { useActionState, Suspense, useEffect, useRef, useState } from "react";
import { login } from "@/app/(auth)/actions";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { AuthNotice, ConfirmationHelp, type Notice } from "./login-feedback";
import { AuthSwitchLink } from "../auth-card";

const initialState = {
  error: "",
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
  const notice: Notice | null = state?.error
    ? { kind: "error", message: state.error }
    : wasRegistered
      ? {
          kind: "success",
          message: "Cuenta creada. Revisa tu correo para confirmarlo antes de iniciar sesión.",
        }
      : hint === "confirm-or-login"
        ? {
            kind: "info",
            message: "Si ya te registraste, confirma tu correo y luego inicia sesión.",
          }
        : null;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: state?.values?.email || prefillEmail,
      password: "",
    },
  });

  useEffect(() => {
    reset({
      email: state?.values?.email || prefillEmail,
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

      const hasExternalEmailPrefill = Boolean(state?.values?.email || prefillEmail);
      const emailLooksAutofilled =
        !hasExternalEmailPrefill && emailInput.value.trim().length > 0;
      const passwordLooksAutofilled = passwordInput.value.length > 0;

      if (emailLooksAutofilled || passwordLooksAutofilled) {
        reset({
          email: state?.values?.email || prefillEmail,
          password: "",
        });
      }
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [prefillEmail, reset, state?.values?.email]);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-spaceGrotesk text-[clamp(1.8rem,6vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.055em] text-foreground outline-none">
            Iniciar sesión
          </h1>
        </div>
        <ConfirmationHelp getEmail={() => getValues("email")} />
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="space-y-4"
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
        <AuthNotice notice={notice} />

        <input type="hidden" name="redirect" value={redirectParams} />

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-foreground/80"
          >
            Correo electrónico
          </Label>
          <div className="relative">

            <Input
              id="email"
              type="email"
              required
              {...register("email")}
              autoComplete="email"
              className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 px-3 text-sm shadow-none transition-colors hover:bg-muted focus-visible:border-primary focus-visible:bg-muted focus-visible:ring-0"
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
              className="text-xs font-medium text-foreground/80"
            >
              Contraseña
            </Label>
          </div>
          <div className="relative">

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              {...register("password")}
              autoComplete="current-password"
              className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 pl-3 pr-20 text-sm shadow-none transition-colors hover:bg-muted focus-visible:border-primary focus-visible:bg-muted focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-none px-2 text-[11px] font-medium text-muted-foreground hover:bg-transparent hover:text-primary"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? "Ocultar" : "Mostrar"}
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
          className="mt-1 h-11 w-full rounded-none bg-primary px-5 text-sm font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          {isPending ? "Iniciando sesión..." : "Ingresar"}
        </Button>
      </form>
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

      <p className="text-center text-xs leading-6 text-muted-foreground">
        ¿No tienes una cuenta?{" "}
        <AuthSwitchLink href="/register">
          Regístrate aquí
        </AuthSwitchLink>
      </p>
    </div>
  );
}
