import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { JwtPayload, SupabaseClient } from "@supabase/supabase-js";

/**
 * Refresca los tokens de sesion y devuelve los claims del JWT.
 *
 * Usa getClaims() en vez de getUser(): con claves de firma asimetricas
 * (ES256) el token se verifica localmente con la JWKS en cache, sin
 * round trip a Supabase Auth en cada navegacion. Devuelve tambien el
 * cliente para reutilizarlo si hace falta consultar la BD.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  claims: JwtPayload | null;
  supabase: SupabaseClient | null;
}> {
  // Visitante anonimo (sin cookies de sesion de Supabase): no hay token
  // que refrescar. Se evita el round trip de red a Supabase Auth, que de
  // otro modo penaliza el TTFB de TODAS las paginas publicas.
  const hasAuthCookies = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  if (!hasAuthCookies) {
    return { response: NextResponse.next({ request }), claims: null, supabase: null };
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug issues with users being
  // randomly logged out.
  const { data } = await supabase.auth.getClaims();

  return { response: supabaseResponse, claims: data?.claims ?? null, supabase };
}
