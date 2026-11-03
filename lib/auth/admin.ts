import type { JwtPayload, SupabaseClient } from "@supabase/supabase-js";

type AdminClaimsCheck = "admin" | "not-admin" | "unknown";

/**
 * Decide con los claims del JWT si el usuario es un admin activo.
 *
 * El rol e is_active viven en app_metadata (trigger sync_profile_to_auth),
 * asi que normalmente no hace falta consultar la BD. Devuelve "unknown"
 * para tokens emitidos antes de sincronizar is_active.
 */
export function checkAdminClaims(claims: JwtPayload): AdminClaimsCheck {
  const meta = (claims.app_metadata ?? {}) as Record<string, unknown>;
  if (typeof meta.role === "string" && meta.role !== "admin") return "not-admin";
  if (meta.role !== "admin") return "unknown";
  if (meta.is_active === false) return "not-admin";
  if (meta.is_active === true) return "admin";
  return "unknown";
}

/** Confirma en BD el rol y el estado (solo si el JWT no basta). */
export async function isActiveAdminInDb(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(profile && profile.role === "admin" && profile.is_active !== false);
}

/**
 * Verifica la sesion con getClaims(): con claves de firma asimetricas
 * (ES256) el JWT se valida localmente, sin round trip a Supabase Auth.
 */
export async function getAdminSession(
  supabase: SupabaseClient,
): Promise<{ userId: string | null; isAdmin: boolean }> {
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { userId: null, isAdmin: false };

  const check = checkAdminClaims(claims);
  if (check !== "unknown") {
    return { userId: claims.sub, isAdmin: check === "admin" };
  }

  return {
    userId: claims.sub,
    isAdmin: await isActiveAdminInDb(supabase, claims.sub),
  };
}
