/**
 * RGL Estudio Design Tokens
 *
 * Referencia centralizada de constantes de diseno para el equipo de frontend.
 * Los colores CSS variables estan definidos en app/globals.css (ShadCN theme).
 * Este archivo documenta la intencion de uso y valores semanticos.
 */

export const BRAND = {
  name: "RGL Estudio",
  tagline: "Automatizacion de ventas, reservas y control financiero",
} as const;

export const BREAKPOINTS = {
  /** Mobile-first: base */
  sm: 640,
  /** Tablet */
  md: 768,
  /** Desktop */
  lg: 1024,
  /** Wide */
  xl: 1280,
} as const;

export const SPACING = {
  /** Padding de pagina en mobile */
  pageMobile: "1rem",
  /** Padding de pagina en desktop */
  pageDesktop: "2rem",
  /** Gap entre secciones */
  sectionGap: "3rem",
} as const;

export const CHART_COLORS = {
  /** Ingresos / positivo */
  income: "var(--chart-1)",
  /** Gastos / secundario */
  expense: "var(--chart-2)",
  /** Suscripciones activas */
  subscriptions: "var(--chart-3)",
  /** Reservas */
  reservations: "var(--chart-4)",
  /** Otros */
  other: "var(--chart-5)",
} as const;
