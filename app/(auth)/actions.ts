"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthFormState = {
  error: string;
  values?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    data_consent?: boolean;
  };
};

type ResendConfirmationState = {
  error: string;
  success: string;
  values?: {
    email?: string;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function mapSupabaseAuthError(errorMessage: string): string {
  const normalized = errorMessage.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Credenciales inválidas";
  }

  if (normalized.includes("email rate limit exceeded")) {
    return "Demasiados intentos seguidos. Espera unos minutos antes de volver a intentarlo.";
  }

  if (normalized.includes("user already registered")) {
    return "Ese correo ya está registrado. Inicia sesión o confirma tu correo.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Debes confirmar tu correo electrónico antes de iniciar sesión.";
  }

  if (normalized.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres";
  }

  return errorMessage;
}

export async function login(_prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient();
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) || null;

  if (!email || !password) {
    return {
      error: "Por favor, completa todos los campos",
      values: { email },
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      error: "Ingresa un correo electrónico válido",
      values: { email },
    };
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return {
      error:
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
      values: { email },
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const loginError = mapSupabaseAuthError(error.message);

    return {
      error: loginError,
      values: { email },
    };
  }

  // Get user role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  let resolvedRole = profile?.role ?? "client";

  // Self-heal: if profile row is missing, create it for this authenticated user.
  if (!profile) {
    const metadataFirstName =
      typeof data.user.user_metadata?.first_name === "string"
        ? data.user.user_metadata.first_name
        : null;

    const metadataLastName =
      typeof data.user.user_metadata?.last_name === "string"
        ? data.user.user_metadata.last_name
        : null;

    const { error: insertProfileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      first_name: metadataFirstName,
      last_name: metadataLastName,
      role: "client",
      data_consent_at: new Date().toISOString(),
    });

    if (!insertProfileError) {
      resolvedRole = "client";
    }
  }

  if (resolvedRole === "admin") {
    redirect(redirectTo || "/dashboard");
  } else {
    redirect(redirectTo || "/catalogo");
  }
}

export async function signup(_prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient();
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = formData.get("password") as string;
  const first_name = ((formData.get("first_name") as string) ?? "").trim();
  const last_name = ((formData.get("last_name") as string) ?? "").trim();
  const data_consent = formData.get("data_consent") as string;
  const acceptedConsent = data_consent === "on" || data_consent === "true";

  if (!email || !password || !first_name || !last_name) {
    return {
      error: "Por favor, completa todos los campos requeridos",
      values: { first_name, last_name, email, data_consent: acceptedConsent },
    };
  }

  if (first_name.length < 2) {
    return {
      error: "El nombre debe tener al menos 2 caracteres",
      values: { first_name, last_name, email, data_consent: acceptedConsent },
    };
  }

  if (last_name.length < 2) {
    return {
      error: "El apellido debe tener al menos 2 caracteres",
      values: { first_name, last_name, email, data_consent: acceptedConsent },
    };
  }

  if (!acceptedConsent) {
    return {
      error: "Debes aceptar la política de tratamiento de datos (LOPDP)",
      values: { first_name, last_name, email, data_consent: false },
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
      },
    },
  });

  if (error) {
    const normalizedError = error.message.toLowerCase();

    // Common case in Supabase: account may already exist or confirmation email was just sent.
    // Move user to login flow instead of trapping them in repeated sign-up attempts.
    if (
      normalizedError.includes("email rate limit exceeded") ||
      normalizedError.includes("user already registered")
    ) {
      redirect(`/login?email=${encodeURIComponent(email)}&hint=confirm-or-login`);
    }

    const signupError = mapSupabaseAuthError(error.message);

    return {
      error: signupError,
      values: { first_name, last_name, email, data_consent: acceptedConsent },
    };
  }

  if (data.user && data.session) {
    // Record LOPDP consent timestamp in the profile
    await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        first_name,
        last_name,
        role: "client",
        data_consent_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  }

  // If no session is returned, email confirmation is required by Supabase.
  if (!data.session) {
    redirect(`/login?registered=1&email=${encodeURIComponent(email)}`);
  }

  redirect("/catalogo");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resendSignupConfirmation(
  _prevState: ResendConfirmationState,
  formData: FormData
) {
  const supabase = await createClient();
  const email = ((formData.get("email") as string) ?? "").trim();

  if (!email) {
    return {
      error: "Ingresa tu correo para reenviar la confirmación",
      success: "",
      values: { email: "" },
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      error: "Ingresa un correo electrónico válido",
      success: "",
      values: { email },
    };
  }

  const redirectUrl =
    process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/login`
      : undefined;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: redirectUrl
      ? {
          emailRedirectTo: redirectUrl,
        }
      : undefined,
  });

  if (error) {
    return {
      error: mapSupabaseAuthError(error.message),
      success: "",
      values: { email },
    };
  }

  return {
    error: "",
    success: "Te enviamos un nuevo correo de confirmación. Revisa también spam o promociones.",
    values: { email },
  };
}