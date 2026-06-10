import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase publico SIN cookies, para paginas estaticas (ISR).
 *
 * El cliente de `server.ts` lee `cookies()`, lo que obliga a Next a
 * renderizar la pagina dinamicamente en CADA visita (funcion + query a la
 * BD). Las paginas de marketing (landing, catalogo, capacitacion) solo
 * muestran datos publicos, asi que con este cliente pueden prerenderizarse
 * y servirse desde el CDN de Vercel con `export const revalidate = N`.
 *
 * Usar SOLO para datos publicos (catalogo de servicios activos). Nunca
 * para datos del usuario: este cliente no tiene sesion.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
