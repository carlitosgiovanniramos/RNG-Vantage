import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROUTES = ["/dashboard", "/reservas", "/servicios", "/clientes", "/transacciones", "/subscriptions", "/pagos-fallidos"];

export async function middleware(request: NextRequest) {
  // 1. Refresh session tokens (devuelve el usuario: una sola llamada de red)
  const { response, user } = await updateSession(request);

  // 2. Protect admin routes
  const { pathname } = request.nextUrl;
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    // Not authenticated → redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Short-circuit: el rol vive en el JWT (trigger sync_profile_role_to_auth).
    // Si el token ya dice que NO es admin, se redirige sin tocar la BD.
    const jwtRole = (user.app_metadata as Record<string, unknown> | null)?.role;
    if (typeof jwtRole === "string" && jwtRole !== "admin") {
      return NextResponse.redirect(new URL("/catalogo", request.url));
    }

    // Confirmacion en BD (cubre is_active y tokens emitidos antes del sync).
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op: cookies already handled by updateSession
          },
        },
      }
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("role,is_active")
      .eq("id", user.id)
      .maybeSingle(); // .single() lanza error si no existe el perfil; maybeSingle() devuelve null

    if (!profile || profile.role !== "admin" || profile.is_active === false) {
      return NextResponse.redirect(new URL("/catalogo", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Ejecutar el middleware en todo excepto:
     * - _next/static, _next/image (assets de Next)
     * - favicon, service worker, manifest PWA
     * - api/webhooks (el webhook de Kushki se autentica por secreto,
     *   no necesita sesion: ahorra un round trip de auth por evento)
     * - archivos de imagen
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
