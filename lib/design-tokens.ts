/**
 * RGL Estudio Design Tokens
 *
 * Referencia centralizada de constantes de diseno para el equipo de frontend.
 * Los colores CSS variables estan definidos en app/globals.css (ShadCN theme).
 * Este archivo documenta la intencion de uso y valores semanticos.
 */

export const BRAND = {
  name: "RGL Estudio",
  tagline: "Marketing digital con reservas, ventas y control financiero en un solo panel",
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
  /** Ingresos */
  income: "var(--primary)",
  /** Gastos */
  expense: "var(--destructive)",
  /** Suscripciones activas */
  subscriptions: "#16a34a",
  /** Reservas */
  reservations: "#0284c7",
  /** Conversión / crecimiento */
  growth: "#7c3aed",
} as const;
