# Documentación técnica – design-tokens.ts (lib/design-tokens.ts)

Este archivo concentra las design tokens del proyecto RNG Vantage. Proporciona constantes semánticas para brand, breakpoints, spacing y colores de gráficos, utilizadas a lo largo del frontend para mantener consistencia de diseño.

## Descripción general

RGL Estudio Design Tokens es una colección centralizada de constantes de diseño para el equipo de frontend. Los valores de colores en CSS se definen principalmente como variables (en app/globals.css, dentro del tema de ShadCN). Este archivo documenta la intención de uso y los valores semánticos de cada token, sin duplicar estilos en el código.

Los tokens exportados son constantes inmutables (as const) para garantizar tipos literales y evitar modificaciones accidentales.

## Responsabilidades

- Proporcionar un conjunto único de tokens de diseño reutilizables en toda la aplicación.
- Estar alineados con el tema CSS definido (ShadCN) para colores y variables de CSS.
- Ofrecer valores tipados en TypeScript para favorecer autocompletado y seguridad de tipos.
- Servir como fuente de verdad para brand, breakpoints, spacing y paleta de colores de gráficos.

## Props / Parámetros

Este archivo no exporta componentes ni funciones. Por lo tanto, no tiene props ni parámetros. Las exportaciones son constantes de tipo objeto:

- BRAND: objeto con nombre y tagline de la marca.
- BREAKPOINTS: objeto con puntos de quiebre (sm, md, lg, xl).
- SPACING: objeto con valores de espaciado para página móvil, página de escritorio y separación entre secciones.
- CHART_COLORS: objeto con asignaciones de colores para gráficos: ingresos, gastos, suscripciones, reservas y crecimiento.

## Retorna

Al ser un módulo de constantes, no "retorna" valores en el sentido tradicional de una función. Se importa para obtener valores estáticos y tipados. Las exportaciones disponibles son:

- BRAND: { name: string; tagline: string } const.
- BREAKPOINTS: { sm: number; md: number; lg: number; xl: number } const.
- SPACING: { pageMobile: string; pageDesktop: string; sectionGap: string } const.
- CHART_COLORS: { income: string; expense: string; subscriptions: string; reservations: string; growth: string } const.

## Dependencias

- No hay dependencias de librerías externas en este módulo.
- El valor CHART_COLORS para income/expense utiliza referencias a variables CSS:
  - income: "var(--primary)"
  - expense: "var(--destructive)"
  Estas referencias asumen que las variables CSS están definidas en app/globals.css (ShadCN theme).
- TypeScript puro con uso de as const para preservar tipos literales.

## Ejemplos de uso

- Importar y usar tokens en código TS/JS:
  - Importación básica:
    import { BRAND, BREAKPOINTS, SPACING, CHART_COLORS } from "../lib/design-tokens";

  - Ejemplo de uso de spacing en un componente (inline styles):
    const containerStyle = {
      padding: SPACING.pageDesktop,
      gap: SPACING.sectionGap,
    };

  - Ejemplo de uso de breakpoints (para referencias en CSS-in-JS o tips de estilo):
    // En un CSS-in-JS hipotético
    // const styles = {
    //   [\`@media (min-width: ${BREAKPOINTS.md}px)\`]: { gridTemplateColumns: "repeat(2, 1fr)" }
    // };

  - Ejemplo de colores para un gráfico:
    // Usar CHART_COLORS.income como color de barras o líneas
    // const colorPrimary = CHART_COLORS.income;

- Ejemplo práctico en JSX (si se usa con estilo en línea):
  /*
  <div style={{ padding: SPACING.pageMobile }}>
    <Chart data={datos} color={CHART_COLORS.income} />
  </div>
  */

## Notas técnicas

- Tipado estricto con as const:
  - Cada objeto (BRAND, BREAKPOINTS, SPACING, CHART_COLORS) está marcado con as const, convirtiendo sus propiedades en tipos literales y readonly. Esto evita que alguien reasigne valores accidentalmente y mejora la seguridad de tipos al consumir estos tokens.
- Semántica y consistencia:
  - BREAKPOINTS utiliza nombres descriptivos (sm, md, lg, xl) y valores numéricos en píxeles.
  - SPACING usa strings con unidades (rem) para representar espaciado de página móvil, página de escritorio y un gap entre secciones.
  - CHART_COLORS:
    - income y expense se conectan con el tema CSS mediante variables: "var(--primary)" y "var(--destructive)". Esto facilita la adaptación a diferentes temas sin cambiar código TS.
    - subscriptions, reservations y growth emplean colores hexadecimales fijos para consistencia visual en gráficos.
- Mantenimiento:
  - Mantener estos tokens en un único lugar facilita la consistencia visual y simplifica cambios de tema o paleta.
  - Si se añaden nuevos gráficos, conviene ampliar CHART_COLORS de forma coherente, manteniendo la convención de nombres.
- Compatibilidad:
  - Dado que algunos valores son referencias a CSS variables, es crucial que app/globals.css defina esas variables para que haya coherencia entre TS y CSS en tiempo de ejecución.

## Última actualización

29/5/2026

Notas: Si se necesita ampliar tokens, conviene seguir la misma estructura y añadir comentarios descriptivos para cada nueva propiedad, manteniendo el formato as const y la semántica utilizada aquí.