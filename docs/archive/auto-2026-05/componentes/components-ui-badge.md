# Documentación técnica – RNG Vantage

Archivo: components/ui/badge.tsx  
Nombre: badge.tsx  
Líneas: 53

Este archivo define el componente Badge y su variante de estilos mediante class-variance-authority (cva). Se trata de un badge compacto, diseñado para ser utilizado en la interfaz de usuario de RNG Vantage, con soporte para variantes visuales y renderizado flexible a través del hook de renderizado personalizado.

---

## Descripción general

El archivo implementa un componente Badge que:

- es un span estilizado para mostrarse como una insignia/etiqueta en la interfaz.
- utiliza una variante de estilos gestionada por cva para soportar distintos temas visuales (default, secondary, destructive, outline, ghost, link).
- integra un hook de renderizado personalizado (useRender) para permitir personalizar el renderizado sin cambiar la lógica interna.
- expone badgeVariants para que otros componentes puedan reutilizar las mismas clases de estilo de variante.

La implementación está basada en Tailwind CSS (clases en el string de estilo) y está preparada para condiciones de accesibilidad (focus ring, aria-invalid) y para adaptar el contenido cuando haya iconos incrustados dentro del badge.

---

## Responsabilidades

- Proporcionar un badge breve y reutilizable con un conjunto de variantes de estilo.
- Centralizar la lógica de renderizado y la composición de props a través de useRender y mergeProps.
- Exportar las variantes de estilo (badgeVariants) para uso consistente en otros componentes.
- Aceptar props extendidos de un elemento span y props propios del sistema de renderizado.

---

## Props / Parámetros

Propósito y tipo:

- variante principal: variant
  - Tipo: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
  - Valor por defecto: "default"
  - Descripción: determina la combinación de clases de Tailwind aplicadas al badge, afectando color, fondo, borde y efectos al pasar el cursor.

- className
  - Tipo: string | undefined
  - Descripción: clases CSS adicionales que se deben aplicar al badge.

- render
  - Tipo: depende de useRender.ComponentProps<"span">. Representa una función de renderizado o prop de renderizado del hook useRender. Permite personalizar cómo se renderiza el componente.

- ...props (propiedades del span)
  - Tipo: React.HTMLAttributes<HTMLSpanElement> u otros props estándar de span que proporciona useRender/mergeProps.
  - Descripción: cualquier atributo adicional del elemento span (como id, aria-label, etc.).

Notas sobre el tipo de prop compuesto:

- El tipo de props del Badge es:
  useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>
  Esto significa que combina las props propias del utilitario de renderizado con las variantes definidas por badgeVariants.

Estructura de destructuring en la firma del componente:
- { className, variant = "default", render, ...props }

---

## Retorna

- La función/componente Badge devuelve el resultado del hook useRender. Específicamente, se invoca useRender con:
  - defaultTagName: "span"
  - props: mergeProps<"span">({ className: cn(badgeVariants({ variant }), className) }, props)
  - render: el prop render recibido
  - state: { slot: "badge", variant }

Qué entrega exactamente:
- Un elemento renderizable (por defecto un span) cuyo contenido y etiqueta pueden ser controlados por el hook useRender a través del prop render, manteniendo la clase calculada por badgeVariants({ variant }) y cualquier clase adicional pasada por className.
- La semántica de slot y variant en state sugiere que el hook puede exponer información de renderizado para escenarios de composición, aunque el comportamiento exacto depende de la implementación de useRender.

---

## Dependencias

Este archivo depende de varias librerías y utilidades:

- @base-ui/react/merge-props
  - Función para combinar props de manera segura, preservando las propiedades existentes.
- @base-ui/react/use-render
  - Hook de renderizado que facilita la renderización basada en props y estado, y permite un renderizado personalizado mediante el prop render.
- class-variance-authority (cva, type VariantProps)
  - Utilidad para definir variantes de clase y gestionarlas de forma tipada.
  - badgeVariants se define con cva(...)
- cn (utils)
  - Función utilitaria para concatenar clases condicionales (similar a classNames).
- TypeScript
  - Tipado estático fuerte para las props, variantes y el uso de useRender.

Notas sobre las clases de estilo:
- El string base contiene un conjunto extenso de clases de Tailwind para el estilo del badge (tamaño, espaciado, bordes, tipografías, etc.) y varias condiciones para estados interactivos y modo oscuro.
- Se usan variantes para aplicar combinaciones de clases según el valor de variant.
- Incluye utilidades de accesibilidad y comportamiento de interacción (focus-visible, aria-invalid, etc.).
- Soporta estilos específicos para presencia de iconos (data attributes) y tatuaje de estilos a elementos SVG hijos.

---

## Ejemplos de uso

1) Uso básico con texto dentro del badge:

```tsx
import { Badge } from "@/components/ui/badge"

function Example() {
  return (
    <div>
      <Badge>Nuevo</Badge>
    </div>
  )
}
```

2) Uso con variante visual diferente:

```tsx
import { Badge } from "@/components/ui/badge"

function Example() {
  return (
    <div>
      <Badge variant="secondary">Beta</Badge>
      <Badge variant="ghost" className="ml-2">En curso</Badge>
    </div>
  )
}
```

3) Uso avanzado con render personalizado (usando el hook de renderizado):

```tsx
import { Badge } from "@/components/ui/badge"

function CustomBadge() {
  return (
    <Badge
      variant="outline"
      render={(props) => <button {...props} type="button" aria-label="Custom badge" />}
    >
      Acción
    </Badge>
  )
}
```

Notas:
- El prop render permite adaptar el tipo de elemento en el que se renderiza el badge, aprovechando la API de useRender.
- El contenido entre las etiquetas Badge (“children”) se mostrará dentro del span por defecto, a menos que se use render para cambiar el contenedor.

---

## Notas técnicas

- Diseño de variantes
  - badgeVariants se define con una base de clases muy específica para el diseño deseado (tamaños, bordes, colores, espaciados).
  - Se soportan variantes: default, secondary, destructive, outline, ghost, link.
  - Valor por defecto: default.
- Accesibilidad y estados
  - Clases para focus visible y ring, así como manejo de aria-invalid para estados de invalidez.
  - Estilos especiales para presencia de iconos dentro del badge mediante data attributes.
- Rendimiento y coherencia
  - Se centraliza la generación de clases mediante badgeVariants, lo que facilita cambios globales de estilo de las variantes.
  - El uso de mergeProps y cn ayuda a evitar conflictos de props y garantiza que las clases sean combinadas correctamente.
- Tipado
  - Se aprovecha VariantProps<typeof badgeVariants> para forzar que el prop variant acepte solo los valores definidos.
  - useRender.ComponentProps<"span"> aporta tipado para el renderizado y props del span.
- Reutilización
  - badgeVariants se exporta para que otros componentes puedan reutilizar el conjunto de clases de estilo de las variantes sin recrearlas.

---

## Última actualización

29/5/2026

---

Si necesitas que añada ejemplos de integración con otros componentes de RNG Vantage o más escenarios de renderizado, dime y los incluyo.