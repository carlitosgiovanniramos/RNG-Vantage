"use client";

import { useActionState, useState } from "react";
import { signup } from "@/app/(auth)/actions";
import Link from "next/link";

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
    <div className="flex flex-col gap-6 w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Crear una cuenta</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ingresa tus datos para registrarte
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state?.error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded-md">
            {state.error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="first_name" className="text-sm font-medium">Nombre</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              defaultValue={state?.values?.first_name ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Juan Pablo"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="last_name" className="text-sm font-medium">Apellido</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              defaultValue={state?.values?.last_name ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="López Ramos"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={state?.values?.email ?? ""}
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

        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="data_consent"
            name="data_consent"
            required
            defaultChecked={Boolean(state?.values?.data_consent)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="data_consent" className="text-sm font-medium leading-none">
            Acepto la{" "}
            <Link href="/politica-privacidad" className="underline hover:text-primary">
              política de tratamiento de datos (LOPDP)
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 mt-2"
        >
          {isPending ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>

      <div className="text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
