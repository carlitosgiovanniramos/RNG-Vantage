# DataCard (components/data-card.tsx)

Descripción general
- DataCard es un componente React que presenta información clave en una tarjeta estilizada. Muestra un título, un valor destacado, un icono opcional y una tendencia opcional (con iconos de tendencia, coloración y etiqueta). Está construido con los componentes de UI propios del proyecto y está diseñado para ser reutilizable en paneles de métricas y KPIs dentro de RNG Vantage.

## Responsabilidades
- Renderizar una tarjeta (Card) con encabezado y contenido.
- Mostrar un título y un valor principal con estilo tipográfico definido.
- Opcionalmente renderizar un icono a la derecha del encabezado.
- Opcionalmente renderizar una tendencia con:
  - dirección (up, down, neutral)
  - icono de tendencia correspondiente
  - valor de tendencia (string)
  - etiqueta opcional
- Aplicar estilos consistentes con el tema (modo claro/oscuro) y efectos de hover.
- Permitir extensión mediante className adicional para personalizar estilos desde el consumidor.

## Props / Parámetros

Tabla de props del componente DataCard

| Nombre | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| title | string | Sí | Título de la tarjeta mostrado en el encabezado. |
| value | string | Sí | Valor principal a mostrar (puede ser string o number). |
| icon | ReactNode | No | Icono opcional que se muestra en el encabezado, dentro de un contenedor estilizado a la derecha. |
| trend | DataCardTrend | No | Objeto que define la tendencia a mostrar. Si se proporciona, se renderiza la fila de tendencia. |
| className | string | No | Clase CSS adicional para personalizar el estilo de la tarjeta. |

Definiciones auxiliares de tipos (internos al archivo)
- DataCardTrendDirection | "up" | "down" | "neutral"
- DataCardTrend
  - value: string
  - direction?: DataCardTrendDirection
  - label?: string

Notas sobre valores por defecto
- Si trend no se proporciona, no se renderiza la sección de tendencia.
- direction por defecto cuando trend está presente es "neutral".

## Retorna
- Retorna un elemento React (JSX) que representa una Card con:
  - Encabezado: título y, opcionalmente, un icono.
  - Contenido: el valor principal y, si aplica, la sección de tendencia.
- Estructura interna:
  - Card (wrapper) con estilos de borde, fondo y sombras.
  - Div decorativo superior (barra del color primario) para acentos visuales.
  - CardHeader con título y, si existe, icono.
  - CardContent con el valor y opcionalmente la sección de tendencia (icono de subida/bajada, valor de tendencia y etiqueta).

## Dependencias
- React: ReactNode para tipar el icono.
- lucide-react: TrendingUp y TrendingDown para indicar la dirección de la tendencia.
- "@/components/ui/card": Card, CardContent, CardHeader, CardTitle (componente de UI reutilizable del proyecto).
- "@/lib/utils": cn (utilidad de concatenación de clases).
- Tipado TypeScript incluido en el propio archivo.

Notas sobre estilo y comportamiento
- La clase de Card utiliza Tailwind CSS (o un sistema similar) y combina estilos dinámicos con la utilidad cn para aceptar className externa.
- La tonalidad de la tendencia depende de la dirección:
  - up: text-emerald-600 (claro) / text-emerald-400 (oscuro)
  - down: text-red-600 (claro) / text-red-400 (oscuro)
  - neutral: text-muted-foreground
- Si trend.direction === "up" o "down", se renderiza el icono de TrendingUp/TrendingDown correspondiente.
- Si trend.label se proporciona, se muestra como un texto adicional al lado de la tendencia.

## Ejemplos de uso

Ejemplo 1: Tarjeta de ventas con tendencia al alza
- Este ejemplo muestra una tarjeta con título "Ventas Totales", valor numérico, un icono y una tendencia positiva.

```tsx
import { DataCard } from "@/components/data-card";
import { DollarSign } from "lucide-react";

function Ejemplo() {
  return (
    <DataCard
      title="Ventas Totales"
      value={ "$124.500" }
      icon={<DollarSign />} 
      trend={{ value: "+12%", direction: "up", label: "Este Mes" }}
    />
  );
}
```

Ejemplo 2: Tarjeta de usuarios activos sin tendencia
```tsx
import { DataCard } from "@/components/data-card";

function Ejemplo() {
  return (
    <DataCard
      title="Usuarios Activos"
      value={42}
      icon={null}
    />
  );
}
```

Notas sobre estilo de uso
- El componente está diseñado para funcionar bien dentro de dashboards y paneles de métricas, pudiendo reutilizarse con diferentes iconos y valores sin necesidad de lógica adicional.

## Notas técnicas

- Rendimiento y rendimiento visual
  - El componente es declarativo y no realiza lógica de negocio; depende del estado externo para los valores y tendencias.
  - Usa clases utilitarias para hover y transición para una experiencia de usuario suave.
- Accesibilidad
  - El div decorativo superior tiene aria-hidden para evitar lectura por lectores de pantalla.
  - El contenido del encabezado utiliza CardHeader/CardTitle semánticos proporcionados por el diseño de UI del proyecto.
- Estilización
  - Se apoya en Tailwind (o un sistema equivalente) para estilos de tipografía, colores y efectos de hover.
  - Los colores para la tendencia se ajustan automáticamente según la dirección (up/down/neutral).
- Extensibilidad
  - El prop className permite aplicar estilos adicionales desde el consumidor sin alterar la lógica interna.
  - El icono es opcional; si se proporciona, se renderiza en un contenedor estilizado al lado del título.

## Última actualización
29/5/2026

Notas finales
- Este archivo está implementado como un componente reutilizable y componenente dentro de la colección de UI del proyecto RNG Vantage. No introduce dependencias o comportamientos fuera de lo que ya está definido en el diseño de tarjetas y métricas del sistema. Si se requiere adaptar el comportamiento de la tendencia o el aspecto visual, se deben ajustar las clases de estilo o la lógica de color en este archivo o en las utilidades relacionadas.