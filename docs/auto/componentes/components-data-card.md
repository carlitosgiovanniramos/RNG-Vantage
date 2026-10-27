# Documentación técnica – DataCard (components/data-card.tsx)

Fecha de última actualización: 12/5/2026

Este archivo define el componente DataCard, una tarjeta de datos reutilizable para mostrar métricas en el dashboard. Es un componente presentacional que integra el sistema de tarjetas (Card) ya existente en el proyecto, con soporte opcional para un icono y una tendencia (up/down/neutral).

## Descripción general

DataCard es un componente React/TypeScript que renderiza una tarjeta con:

- un título
- un valor principal
- un icono opcional
- una sección de tendencia opcional que puede indicar incremento, decremento o neutralidad, con un valor de tendencia y una etiqueta opcional

El diseño está implementado con el sistema de tarjetas del proyecto (Card, CardHeader, CardContent, CardTitle) y estilos Tailwind para consistencia visual y respuestas a temas claro/oscuro.

## Responsabilidades

- Mostrar un conjunto estético y coherente de datos numéricos (valor) dentro de una tarjeta.
- Soportar un icono opcional que acompaña al título.
- Soportar una sección de tendencia que:
  - Indica la dirección con íconos de TrendingUp/TrendingDown cuando corresponda.
  - Cambia color según la dirección (up: verde, down: rojo, neutral: neutro).
  - Muestra el valor de la tendencia y una etiqueta adicional si está proporcionada.
- Mantener una interfaz limpia y extensible para uso en dashboards.

## Props / Parámetros

A continuación se detalla la interfaz del componente y de sus tipos relacionados.

- DataCardProps (propiedades del componente DataCard)
  - title: string (requerido)
    - Título mostrado en la cabecera de la tarjeta.
  - value: string | number (requerido)
    - Valor principal mostrado en la tarjeta.
  - icon?: ReactNode (opcional)
    - Icono o elemento React para mostrar junto al título.
  - trend?: DataCardTrend (opcional)
    - Objeto con información de la tendencia.
  - className?: string (opcional)
    - Clases adicionales para personalizar el estilo de la tarjeta.

- DataCardTrend
  - value: string (requerido)
    - Valor de la tendencia (p. ej. "+12%", "-3%").
  - direction?: DataCardTrendDirection (opcional)
    - Dirección de la tendencia: "up", "down" o "neutral".
    - Si no se especifica, se asume "neutral".
  - label?: string (opcional)
    - Etiqueta adicional para contextualizar la tendencia.

- DataCardDirection (DataCardTrendDirection)
  - "up" | "down" | "neutral"

Notas sobre el comportamiento:
- direction se obtiene como trend?.direction ?? "neutral".
- El color de la tendencia es:
  - "up"  => text-emerald-600 (con modo oscuro: text-emerald-400)
  - "down"=> text-red-600 (con modo oscuro: text-red-400)
  - "neutral" => text-muted-foreground
- Si trend está presente, se renderiza una fila con el icono correspondiente (TrendingUp si direction === "up", TrendingDown si direction === "down"), seguido del value de la tendencia y, si existe, la label.

## Retorna

DataCard devuelve un JSX.Element que representa una tarjeta (Card) con:
- CardHeader que contiene el título y, opcionalmente, el icono.
- CardContent que muestra el valor principal y, si existe, la sección de tendencia.
- Un div decorativo en la parte superior (barra con gradiente) para acentos visuales.

Formato de retorno: JSX.Element (renderizado en el árbol de componentes de la página donde se use).

## Dependencias

- React (tipos: ReactNode) y TypeScript.
- lucide-react: para los íconos TrendingUp y TrendingDown.
- "@/components/ui/card": Card, CardContent, CardHeader, CardTitle (componente de tarjetas del proyecto).
- "@/lib/utils": cn (utilidad para combinar clases CSS de Tailwind).
- Tailwind CSS (estilos y utilidades de clase).
- Estilos específicos de la aplicación (clases como bg-card/85, text-muted-foreground, etc.).

## Ejemplos de uso

Ejemplo básico (sin icono y sin tendencia):

```tsx
import { DataCard } from "@/components/data-card";

export default function DashboardRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DataCard
        title="Ventas totales"
        value={12345}
      />
    </div>
  );
}
```

Ejemplo con icono y tendencia positiva:

```tsx
import { DataCard } from "@/components/data-card";
import { TrendingUp } from "lucide-react";

export default function DashboardRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DataCard
        title="Ventas mensuales"
        value={54321}
        icon={<span className="h-5 w-5" aria-label="ventas" style={{ display: "inline-block" }}>💹</span>}
        trend={{ value: "+8%", direction: "up", label: " vs mes anterior" }}
      />
      <DataCard
        title="Reservas"
        value="1,234"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: "-2%", direction: "down" }}
      />
      <DataCard
        title="Promedio de venta"
        value="$89.99"
      />
    </div>
  );
}
```

Notas sobre el ejemplo:
- En el primer DataCard, se utiliza un icono simple (emoji) para ilustrar el prop icon.
- En el segundo DataCard, se muestra un icono de TrendingUp como parte del icono de la tarjeta y se especifica una tendencia decreciente.
- El tercer DataCard no utiliza icono ni tendencia.

## Notas técnicas

- Arquitectura y estilo:
  - DataCard es un componente presentacional que depende del sistema de tarjetas del proyecto (Card, CardHeader, CardContent, CardTitle) para mantener consistencia visual.
  - El color de la tendencia se gestiona mediante una lógica de selección de clases (trendColor) en función de direction. Esto facilita el soporte de dark mode a través de las utilidades de Tailwind.
  - El encabezado incluye un título estilizado con fuente específica (font-spaceGrotesk) y un tamaño reducido para el título, respetando el diseño de tarjetas.
  - El icono (si se proporciona) se muestra en un contenedor con fondo suave y color primario para resaltar sin perder legibilidad.
  - Se añade una barra decorativa superior (aria-hidden) para un acento visual sin impacto en accesibilidad.
- Accesibilidad:
  - El div decorativo tiene aria-hidden para no interferir con lectura de lectores de pantalla.
  - Si se utiliza el icono, este es proporcionado como ReactNode, permitiendo flexibilidad en el tipo de ícono y su accesibilidad (p. ej., roles o etiquetas si se decide).
- Rendimiento:
  - La lógica de renderizado es simple y dependiente de props; no hay estados internos ni efectos. Esto favorece la previsibilidad y facilita pruebas unitarias.
- Extensibilidad:
  - El componente está diseñado para ser utilizado en varios contextos dentro de dashboards. El prop className permite añadir estilos adicionales sin cambiar la implementación interna.

## Última actualización

12/5/2026

Observaciones finales:
- Este resumen describe con precisión el comportamiento y las entidades expuestas por el archivo data-card.tsx.
- Si se agregan nuevas variantes de tendencia o estilos, se recomienda extender DataCardTrendDirection y la lógica de trendColor de forma controlada para evitar romper la compatibilidad del componente.