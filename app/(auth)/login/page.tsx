"use client";

import { useActionState, Suspense, useState } from "react";
import { login, resendSignupConfirmation } from "@/app/(auth)/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
    initialResendState
  );
  const shouldShowResend =
    hint === "confirm-or-login" ||
    state?.error?.toLowerCase().includes("confirmar tu correo") ||
    state?.error?.toLowerCase().includes("email not confirmed");

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
      {wasRegistered && (
        <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md">
          Cuenta creada. Revisa tu correo para confirmarlo antes de iniciar sesión.
        </div>
      )}

      {hint === "confirm-or-login" && (
        <div className="p-3 text-sm text-amber-900 bg-amber-100 rounded-md">
          Si ya te registraste, revisa tu correo y luego inicia sesión. Evita reenviar varias veces seguidas.
        </div>
      )}

      {resendState?.success && (
        <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md">
          {resendState.success}
        </div>
      )}

      {resendState?.error && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {resendState.error}
        </div>
      )}

      {state?.error && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {state.error}
        </div>
      )}

      <input type="hidden" name="redirect" value={redirectParams} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state?.values?.email ?? prefillEmail}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
            title="Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-20 text-sm"
            placeholder="••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Iniciando sesión..." : "Ingresar"}
        </button>
      </form>

      {shouldShowResend && (
        <form action={resendAction} className="flex flex-col gap-3 rounded-md border p-3">
          <p className="text-sm font-medium">¿No te llegó el correo de confirmación?</p>
          <input
            name="email"
            type="email"
            required
            defaultValue={state?.values?.email ?? prefillEmail ?? resendState?.values?.email ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="correo@ejemplo.com"
          />
          <button
            type="submit"
            disabled={isResending}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input hover:bg-accent disabled:opacity-50"
          >
            {isResending ? "Reenviando..." : "Reenviar correo de confirmación"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <Suspense fallback={<div className="text-center">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>

      <div className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
