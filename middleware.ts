import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkAdminClaims, isActiveAdminInDb } from "@/lib/auth/admin";

const ADMIN_ROUTES = ["/dashboard", "/reservas", "/servicios", "/clientes", "/transacciones", "/subscriptions", "/pagos-fallidos"];

export async function middleware(request: NextRequest) {
  // 1. Refresca la sesion y verifica el JWT localmente (sin red con ES256)
  const { response, claims, supabase } = await updateSession(request);

  // 2. Protect admin routes
  const { pathname } = request.nextUrl;
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    // Not authenticated → redirect to login
    if (!claims?.sub || !supabase) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // El rol e is_active viven en el JWT (trigger sync_profile_to_auth).
    // Solo se consulta la BD si el token es anterior a esa sincronizacion.
    const check = checkAdminClaims(claims);
    const isAdmin =
      check === "unknown"
        ? await isActiveAdminInDb(supabase, claims.sub)
        : check === "admin";

    if (!isAdmin) {
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
     * - archivos de imagen
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
