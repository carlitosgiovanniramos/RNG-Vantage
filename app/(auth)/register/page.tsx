"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { signup } from "@/app/(auth)/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { AuthSwitchLink } from "../auth-card";
import { AuthNotice } from "../login/login-feedback";

const initialState = {
  error: "",
  values: {
    full_name: "",
    first_name: "",
    last_name: "",
    email: "",
    data_consent: false,
  },
};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const allowNativeSubmitRef = useRef(false);
  const [state, formAction, isPending] = useActionState(signup, initialState);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: state?.values?.first_name ?? "",
      last_name: state?.values?.last_name ?? "",
      email: state?.values?.email ?? "",
      password: "",
      confirm_password: "",
      data_consent: Boolean(state?.values?.data_consent),
    },
  });

  useEffect(() => {
    reset({
      first_name: state?.values?.first_name ?? "",
      last_name: state?.values?.last_name ?? "",
      email: state?.values?.email ?? "",
      password: "",
      confirm_password: "",
      data_consent: Boolean(state?.values?.data_consent),
    });
  }, [
    reset,
    state?.values?.data_consent,
    state?.values?.email,
    state?.values?.first_name,
    state?.values?.last_name,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const form = formRef.current;
      if (!form) {
        return;
      }

      const firstNameInput = form.elements.namedItem("first_name") as HTMLInputElement | null;
      const lastNameInput = form.elements.namedItem("last_name") as HTMLInputElement | null;
      const emailInput = form.elements.namedItem("email") as HTMLInputElement | null;
      const passwordInput = form.elements.namedItem("password") as HTMLInputElement | null;
      const confirmPasswordInput = form.elements.namedItem("confirm_password") as HTMLInputElement | null;

      if (
        !firstNameInput ||
        !lastNameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmPasswordInput
      ) {
        return;
      }

      const hasExternalProfilePrefill = Boolean(
        state?.values?.first_name || state?.values?.last_name || state?.values?.email,
      );
      const profileLooksAutofilled =
        !hasExternalProfilePrefill &&
        (firstNameInput.value.trim().length > 0 ||
          lastNameInput.value.trim().length > 0 ||
          emailInput.value.trim().length > 0);
      const passwordsLookAutofilled =
        passwordInput.value.length > 0 || confirmPasswordInput.value.length > 0;

      if (profileLooksAutofilled || passwordsLookAutofilled) {
        reset({
          first_name: state?.values?.first_name ?? "",
          last_name: state?.values?.last_name ?? "",
          email: state?.values?.email ?? "",
          password: "",
          confirm_password: "",
          data_consent: Boolean(state?.values?.data_consent),
        });
      }
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    reset,
    state?.values?.data_consent,
    state?.values?.email,
    state?.values?.first_name,
    state?.values?.last_name,
  ]);

  return (
    <div className="space-y-5">
      <h1 className="font-spaceGrotesk text-[clamp(1.8rem,6vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.055em] text-foreground outline-none">
        Crear cuenta
      </h1>

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
        <AuthNotice notice={state?.error ? { kind: "error", message: state.error } : null} />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 sm:col-span-1">
            <Label
              htmlFor="first_name"
              className="text-xs font-medium text-foreground"
            >
              Nombre
            </Label>
            <div className="relative">
              <Input
                id="first_name"
                autoComplete="given-name"
                type="text"
                required
                {...register("first_name")}
                className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 px-4 text-sm shadow-none hover:bg-muted focus-visible:border-primary focus-visible:ring-0"
              />
            </div>
            {errors.first_name ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.first_name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label
              htmlFor="last_name"
              className="text-xs font-medium text-foreground"
            >
              Apellido
            </Label>
            <div className="relative">
              <Input
                id="last_name"
                autoComplete="family-name"
                type="text"
                required
                {...register("last_name")}
                className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 px-4 text-sm shadow-none hover:bg-muted focus-visible:border-primary focus-visible:ring-0"
              />
            </div>
            {errors.last_name ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                {errors.last_name.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-medium text-foreground"
          >
            Correo electrónico
          </Label>
          <div className="relative">

            <Input
              id="email"
              autoComplete="email"
              type="email"
              required
              {...register("email")}
              className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 px-4 text-sm shadow-none hover:bg-muted focus-visible:border-primary focus-visible:ring-0"
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="group space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-medium text-foreground"
          >
            Contraseña
          </Label>
          <div className="relative">

            <Input
              id="password"
              autoComplete="new-password"
              aria-describedby="password-guidance"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
              title="Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
              {...register("password")}
              className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 pl-4 pr-20 text-sm shadow-none hover:bg-muted focus-visible:border-primary focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-none px-2 text-xs text-muted-foreground hover:text-foreground"
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
          {!errors.password && (
            <p id="password-guidance" className="hidden text-xs leading-5 text-muted-foreground group-focus-within:block">
              8+ caracteres, mayúscula, minúscula, número y símbolo.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirm_password"
            className="text-xs font-medium text-foreground"
          >
            Confirmar contraseña
          </Label>
          <div className="relative">

            <Input
              id="confirm_password"
              autoComplete="new-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              {...register("confirm_password")}
              className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 pl-4 pr-20 text-sm shadow-none hover:bg-muted focus-visible:border-primary focus-visible:ring-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-none px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmación"
                  : "Mostrar confirmación"
              }
            >
              {showConfirmPassword ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
          {errors.confirm_password ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.confirm_password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="data_consent"
              required
              {...register("data_consent")}
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <Label htmlFor="data_consent" className="block cursor-pointer text-xs font-normal leading-5 text-muted-foreground">
              Acepto la{" "}
              <Link href="/politica-privacidad" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 hover:text-primary">
                política de privacidad
              </Link>.
            </Label>
          </div>
          {errors.data_consent && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.data_consent.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full rounded-none bg-primary px-5 text-sm font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80"
        >
          {isPending ? "Creando cuenta..." : "Registrarse"}
        </Button>
      </form>

      <p className="text-center text-xs leading-6 text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <AuthSwitchLink href="/login">
          Inicia sesión
        </AuthSwitchLink>
      </p>
    </div>
  );
}
