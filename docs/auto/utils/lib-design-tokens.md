# Documentación técnica – design-tokens.ts

Archivo: lib/design-tokens.ts  
Nombre: design-tokens.ts  
Total de líneas: 46

Descripción general
- Este archivo define un conjunto centralizado de tokens de diseño utilizados por el frontend del proyecto RNG Vantage.
- Proporciona valores semánticos para branding, puntos de quiebre (breakpoints), espaciado y colores para gráficos.
- Los colores para gráficos se basan en variables CSS definidas globalmente (en app/globals.css con el tema ShadCN) en conjunto con valores hexadecimales explícitos para ciertos casos.
- El objetivo es mantener una fuente de verdad única para estilos y facilitar la coherencia visual en toda la aplicación.

Responsabilidades
- Exportar constantes de diseño inmutables que pueden ser importadas por componentes y páginas.
- Definir estructuras tipadas y estables con as const para favorecer inferencia de tipos en TypeScript.
- Proporcionar mapeos semánticos para:
  - BRAND: información de marca (nombre y tagline).
  - BREAKPOINTS: puntos de quiebre para diseño responsive.
  - SPACING: estándares de espaciado y offsets utilizados en layout.
  - CHART_COLORS: colores usados en gráficos, con integración a CSS variables cuando corresponde.

Propósitos y estructura de las exportaciones
- BRAND
  - Tipo: { name: string; tagline: string } const
  - Uso: proveer nombre de la marca y lema para uso en UI y documentación.
- BREAKPOINTS
  - Tipo: { sm: number; md: number; lg: number; xl: number } const
  - Uso: definir tamaños de viewport para diseño responsive (mobile-first).
- SPACING
  - Tipo: { pageMobile: string; pageDesktop: string; sectionGap: string } const
  - Uso: estandarizar paddings y gaps entre secciones a través de la app.
- CHART_COLORS
  - Tipo: { income: string; expense: string; subscriptions: string; reservations: string; growth: string } const
  - Uso: definir paletas de colores para gráficos. Integra CSS variables cuando corresponde (var(--primary), var(--destructive)) y colores hexadecimales fijos para otros casos.

Dependencias
- Variables CSS definidas en app/globals.css (ShadCN theme) para CHART_COLORS:
  - income usa "var(--primary)"
  - expense usa "var(--destructive)"
- No depende de bibliotecas externas dentro de este archivo; es un conjunto de constantes TypeScript.
- Uso de as const para garantizar literales inmutables y mejoras de tipado en tiempo de compilación.

Ejemplos de uso
- Importar y usar tokens en componentes:
  - Importación típica:
    - import { CHART_COLORS, SPACING, BREAKPOINTS } from 'lib/design-tokens';
  - Uso en un gráfico:
    - const colorIngreso = CHART_COLORS.income;
    - const colorGastos = CHART_COLORS.expense;
  - Uso de espaciado en un contenedor:
    - style={{ padding: SPACING.pageMobile }}
  - Uso de breakpoint en código CSS-in-JS o clases:
    - @media (min-width: BREAKPOINTS.md) { ... }

  Ejemplo mínimo:
  - import { CHART_COLORS, SPACING, BREAKPOINTS } from 'lib/design-tokens';
  - const styles = {
      padding: SPACING.pageDesktop,
      backgroundColor: CHART_COLORS.income,
    };

Notas técnicas
- Tipado estricto: cada exportación está marcada como const with as const para que sus tipos sean literales, lo que favorece la seguridad tipográfica en todo el código.
- Semántica de colores:
  - Los colores de ingresos y gastos se vinculan a variables CSS, permitiendo que el tema cambie dinámicamente si se ajustan las variables globales.
  - Las demás categorías (suscripciones, reservas, crecimiento) usan colores fijos para estabilidad visual cuando no se quiere depender de variables CSS.
- Consistencia: este archivo sirve como fuente de verdad para valores de UI comunes (branding, espaciamiento y colores de gráficos), asegurando consistencia entre módulos y equipos.
- Extensibilidad: si se requieren nuevos tokens de diseño, se pueden añadir como nuevas claves dentro de las estructuras exportadas conservando la convención as const.

Última actualización
- 12/5/2026

Notas finales
- Este archivo está diseñado para que cualquier nuevo desarrollador pueda entender rápidamente qué valores se utilizan para branding, espaciado, breakpoints y colores de gráficos, sin necesidad de inspeccionar múltiples archivos dispersos.
- No se añaden lógicas de negocio ni efectos dinámicos; es puramente una colección de constantes de diseño.