# Documentación técnica: card.tsx (components/ui/card.tsx)

Fecha de última actualización: 29/5/2026

Esta sección describe en detalle el componente Card y sus subcomponentes implementados en el archivo components/ui/card.tsx. Está pensada para que un desarrollador nuevo entienda la finalidad, uso y detalles técnicos sin necesidad de revisar el código fuente completo.

## Descripción general

El archivo define un conjunto de componentes para construir tarjetas (cards) consistentes dentro de la UI del proyecto RNG Vantage. El componente principal es Card, que funciona como contenedor flexible y estilizado. A su vez, se proporcionan subcomponentes que representan áreas típicas de una tarjeta:

- CardHeader
- CardTitle
- CardDescription
- CardContent
- CardAction
- CardFooter

Todos los subcomponentes comparten un patrón de composición basado en slots mediante atributos data-slot, permitiendo una organización clara del contenido y facilitando estilos consistentes a través de la aplicación.

El diseño se alinea con Tailwind CSS (clases utilitarias) y utiliza un helper de clases cn para combinar clases por defecto con clases recibidas a través de props.

---

## Responsabilidades

- Proporcionar una estructura de tarjeta reutilizable y estilizable.
- Soportar dos tamaños: default y sm, afectando espaciados y distribución.
- Permitir composición mediante slots (data-slot) para una organización semántica y de estilos.
- Ofrecer un conjunto de subcomponentes para construir tarjetas completas (header, title, description, content, actions y footer).
- Permitir extensibilidad a través de className y props de div estándar (spread de props).

---

## Props / Parámetros

A continuación se listan las props de cada componente, junto con su tipo y una breve descripción.

### Card
- Tipo de props: React.ComponentProps<"div"> & { size?: "default" | "sm" }
- Requerido: No (size es opcional)
- Descripción:
  - className?: string — Clases CSS adicionales para combinar con las por defecto.
  - size?: "default" | "sm" — Tamaño de la tarjeta. Afecta el espaciado y el layout a través de classNames condicionadas (data-[size=sm]).
  - Además, recibe todas las props estándar de un div (children, estilo, id, etc.) mediante spreading {...props}.
- Notas:
  - Se renderiza como un div con data-slot="card" y data-size={size}.
  - Las clases por defecto incluyen un conjunto amplio de utilidades para bordes, color, espaciado y comportamiento de grupo.

### CardHeader
- Tipo de props: React.ComponentProps<"div">
- Requerido: No
- Descripción:
  - className?: string — Clases CSS adicionales para combinar con las por defecto.
  - También acepta todas las props de div mediante {...props}.
- Notas:
  - Se renderiza como un div con data-slot="card-header".
  - Las clases por defecto incluyen estructura de grid, espaciado y manejo de tamaños responsive (size=sm).

### CardTitle
- Tipo de props: React.ComponentProps<"div">
- Requerido: No
- Descripción:
  - className?: string
  - Otros props de div via {...props}
- Notas:
  - data-slot="card-title"
  - Estilo base: texto con tamaño base y alto de línea ajustado; adaptaciones para tamaño sm cuando se aplica group-data-[size=sm]/card:text-sm.

### CardDescription
- Tipo de props: React.ComponentProps<"div">
- Requerido: No
- Descripción:
  - className?: string
  - Otros props de div via {...props}
- Notas:
  - data-slot="card-description"
  - Estilo base: texto más pequeño y con color de texto mutado (text-muted-foreground).

### CardContent
- Tipo de props: React.ComponentProps<"div">
- Requerido: No
- Descripción:
  - className?: string
  - Otros props de div via {...props}
- Notas:
  - data-slot="card-content"
  - Espaciado horizontal adaptado para tamaño default y(sm) mediante group-data-[size=sm]/card:px-3.

### CardAction
- Tipo de props: React.ComponentProps<"div">
- Requerido: No
- Descripción:
  - className?: string
  - Otros props de div via {...props}
- Notas:
  - data-slot="card-action"
  - Alineación y disposición: se posiciona para estar en la esquina superior derecha del grid, facilitando la acción principal de la tarjeta.

### CardFooter
- Tipo de props: React.ComponentProps<"div">
- Requerido: No
- Descripción:
  - className?: string
  - Otros props de div via {...props}
- Notas:
  - data-slot="card-footer"
  - Estilo: borde superior, fondo con cierta opacidad, padding y soporte para tamaños sm (group-data-[size=sm]/card:p-3).

---

## Retorna

- Card: React.ReactElement de tipo div con atributos data-slot="card" y data-size, conteniendo sus children.
- CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter: Regresan divs u otros elementos HTML apropiados, con data-slot correspondientes y las clases por defecto fusionadas con cualquier className recibido.

Todos los componentes son presentacionales y están pensados para ser usados en conjunto para construir una tarjeta con varios apartados.

---

## Dependencias

- React
  - Utiliza funcionalidad de React para composing y props typing.
- cn utilitario (importado desde "@/lib/utils")
  - Función de combinación de clases CSS: cn(...classes, className) para fusionar clases por defecto con las proporcionadas por el usuario.
- Tailwind CSS (o configuración equivalente de utilidades)
  - Las clases en className son utilitarias (p. ej., flex, rounded-xl, bg-card, ring-1, etc.).
- data-slot y data-[slot=...] selectors
  - Se utilizan para organizar y aplicar estilos condicionales basados en la composición de la tarjeta sin acoplar el CSS a los componentes exactos.

Notas: Las rutas de importación, como "@/lib/utils" y el uso de className con utilidades de Tailwind, están alineadas con el resto del proyecto RNG Vantage y su configuración de alias.

---

## Ejemplos de uso

Ejemplo mínimo de uso de Card con su cabecera y contenido:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction
} from "@/components/ui/card";

function ExampleCard() {
  return (
    <Card size="default" className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Resumen de la venta</CardTitle>
        <CardDescription>Datos rápidos de la operación</CardDescription>
      </CardHeader>

      <CardContent>
        <p>Here goes the main content of the card.</p>
      </CardContent>

      <CardFooter>
        <CardAction>
          <button>Ver detalles</button>
        </CardAction>
        <span>Fecha: 29/05/2026</span>
      </CardFooter>
    </Card>
  );
}
```

Notas sobre el ejemplo:
- Se puede ajustar size a "default" o "sm" para cambiar espaciados y distribución.
- Los subcomponentes deben utilizarse dentro de Card para mantener la coherencia de los slots y el styling.

---

## Notas técnicas

- Slot-based styling: Cada subcomponente utiliza data-slot para definir su rol dentro de la tarjeta (card, card-header, card-title, etc.). Esto facilita el estilo dependiente del slot sin acoplar lógica adicional.
- Estilos condicionados por tamaño: El componente Card utiliza data-[size=sm] para aplicar ajustes de espaciado y layout cuando el tamaño es pequeño. Esto permite una representación más compacta para tarjetas en listados o móviles.
- Composición flexible: Debido a que cada parte es un componente separado que renderiza su propio contenedor con un data-slot específico, es sencillo personalizar o reestructurar una tarjeta sin tocar la lógica base.
- Tipografía y color: Las clases por defecto incluyen estilos de texto (texto base, título, descripción) y colores (bg-card, text-card-foreground, text-muted-foreground) que deben estar alineados con la paleta de diseño de la aplicación.
- Extensibilidad: Cualquier subcomponente expone props de div estándar; se pueden añadir clases o atributos según necesidad, sin romper la composición.

Limitaciones conocidas:
- No hay lógica de negocio en estos componentes; son puramente presentacionales y dependientes del sistema de estilos.
- El comportamiento exacto de los estilos puede depender de la configuración global de Tailwind y del tema (por ejemplo, bg-card, text-card-foreground) definida en el proyecto.

---

## Última actualización

29/5/2026

---

Si necesitas ampliar la documentación con más ejemplos de uso (p. ej., tarjetas con múltiples CardHeader/ CardContent, o tarjetas con distintos tamaños) o con una guía de migración de estos componentes a una versión futura, puedo prepararla.