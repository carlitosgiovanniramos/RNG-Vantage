import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * Refresca los tokens de sesion y devuelve el usuario autenticado.
 *
 * Devuelve tambien el `user` para que el middleware NO tenga que llamar
 * a `auth.getUser()` una segunda vez (cada llamada es un round trip de
 * red a Supabase y penaliza el TTFB de todas las paginas).
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  // Visitante anonimo (sin cookies de sesion de Supabase): no hay token
  // que refrescar. Se evita el round trip de red a Supabase Auth, que de
  // otro modo penaliza el TTFB de TODAS las paginas publicas.
  const hasAuthCookies = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  if (!hasAuthCookies) {
    return { response: NextResponse.next({ request }), user: null };
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

  // Do not run code between createServerClient and supabase.auth.getUser().
  // A simple mistake could make it very hard to debug issues with users being
  // randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
