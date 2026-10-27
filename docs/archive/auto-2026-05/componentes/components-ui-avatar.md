# Avatar Components (components/ui/avatar.tsx)

Este archivo define un conjunto de componentes de avatar construidos sobre las primitivas de @base-ui/react/avatar. Se utiliza para representar usuarios o entidades con imágenes, sustitutos (fallback) y agrupaciones de avatares. Soporta distintos tamaños y permite componer avatares con imágenes, colgantes (badges) y agrupaciones con contador.

---

## Descripción general

- Proporciona un componente principal Avatar y componentes asociados:
  - AvatarImage: renderiza la imagen del avatar.
  - AvatarFallback: renderiza un fallback (texto o iniciales) cuando no hay imagen disponible.
  - AvatarBadge: muestra un badge superpuesto en la esquina del avatar.
  - AvatarGroup: contenedor para agrupar varios avatares en una fila con superposición.
  - AvatarGroupCount: muestra un contador para la agrupación de avatares.
- Usa las primitivas de diseño de base UI (@base-ui/react/avatar) y un helper de utilidades de clase (cn) para combinar clases.
- Soporta tamaños definidos: default, sm, lg, y aplica estilos condicionales mediante data-slot y data-size para un rendering consistente.

---

## Responsabilidades

- Proveer un conjunto de componentes de avatar reutilizables y tipados para uso consistente a través de la UI.
- Abstraer la lógica de tamaño y la representación visual (imagen, fallback, badge) detrás de componentes simples.
- Facilitar agrupaciones de avatares con superposición y conteo, manteniendo coherencia visual con las variantes de tamaño.
- Integrar con el sistema de estilos (Tailwind-like) y con las convenciones de Slot/Data Slot de las primitivas.

---

## Props / Parámetros

A continuación se detallan los props de cada componente React expuesto en este archivo.

### Avatar

Tabla de props:
- Prop: className
  - Tipo: string | undefined
  - Requerido: no
  - Descripción: Clases CSS opcionales para personalizar el estilo del componente.
- Prop: size
  - Tipo: "default" | "sm" | "lg"
  - Requerido: no
  - Descripción: Tamaño del avatar. El valor se propaga a data-size y se usa para ajustar estilos en CSS.
- Prop: rest of AvatarPrimitive.Root.Props
  - Descripción: Propiedades adicionales proporcionadas por la primitiva Root de @base-ui/react/avatar (p. ej., src, alt, etc., dependiendo de las props disponibles en la versión de la primitiva).

Retorna un Avatar envoltorio (AvatarPrimitive.Root) con data-slot="avatar" y data-size correspondiente, junto con las clases combinadas.

### AvatarImage

Tabla de props:
- Prop: className
  - Tipo: string | undefined
  - Requerido: no
  - Descripción: Clases CSS opcionales para la imagen del avatar.
- Prop: rest of AvatarPrimitive.Image.Props
  - Descripción: Propiedades de la primitiva Image (src, alt, etc.).

Retorna un AvatarPrimitive.Image con data-slot="avatar-image" y estilos de imagen (aspect-square, rounded-full, object-cover).

### AvatarFallback

Tabla de props:
- Prop: className
  - Tipo: string | undefined
  - Requerido: no
  - Descripción: Clases CSS opcionales para el fallback.
- Prop: rest of AvatarPrimitive.Fallback.Props
  - Descripción: Propiedades de la primitiva Fallback (children, etc.).

Retorna un AvatarPrimitive.Fallback con data-slot="avatar-fallback" y estilos para mostrar texto/initials centrados.

### AvatarBadge

Tabla de props:
- Prop: className
  - Tipo: string | undefined
  - Requerido: no
  - Descripción: Clases CSS opcionales para el badge.
- Prop: rest of React.ComponentProps<"span">
  - Descripción: Propiedades estándar de un span (id, style, etc.).

Retorna un span con data-slot="avatar-badge" y estilos para posicionamiento en la esquina inferior derecha y compatibilidad con tamaños (sm/default/lg) mediante selectors de grupo.

### AvatarGroup

Tabla de props:
- Prop: className
  - Tipo: string | undefined
  - Requerido: no
  - Descripción: Clases CSS opcionales para el grupo de avatares.
- Prop: rest of React.ComponentProps<"div">
  - Descripción: Propiedades de un div (children, etc.).

Retorna un div con data-slot="avatar-group" y estilos para mostrar avatares en fila con superposición.

### AvatarGroupCount

Tabla de props:
- Prop: className
  - Tipo: string | undefined
  - Requerido: no
  - Descripción: Clases CSS opcionales para el contenedor del contador.
- Prop: rest of React.ComponentProps<"div">
  - Descripción: Propiedades de un div.

Retorna un div con data-slot="avatar-group-count" y estilos que muestran un círculo con conteo, adaptándose al tamaño del grupo mediante clases condicionales.

---

## Retorna

- Avatar: JSX.Element – envoltorio de la primitiva Root con tamaño y clases aplicadas.
- AvatarImage: JSX.Element – imagen del avatar.
- AvatarFallback: JSX.Element – fallback visual para cuando no hay imagen.
- AvatarBadge: JSX.Element – badge superpuesto.
- AvatarGroup: JSX.Element – contenedor para agrupar avatares.
- AvatarGroupCount: JSX.Element – contador dentro del grupo.

Cada componente devuelve el elemento de la librería base (AvatarPrimitive) correspondiente o un span/div configurado con data-slot, listas de clases y props propagados.

---

## Dependencias

- React
- @base-ui/react/avatar: proporciona las primitivas Avatar (Root), Avatar.Image, Avatar.Fallback, etc.
- A helper utilitario cn (presumiblemente una función para combinar className): importado desde "@/lib/utils" y utilizado para concatenar clases de forma segura.
- Estilos/Convenciones de clase parecidos a Tailwind CSS (clases como rounded-full, object-cover, data-... selectors, etc.).
- El directive "use client" al inicio del archivo indica que estos componentes deben ejecutarse en el cliente (client-side).

Notas sobre integración:
- El uso de data-slot y data-size facilita la personalización y composición mediante estilos de la biblioteca base UI.
- Las clases en la cadena cn incluyen variantes por tamaño (p. ej., data-[size=lg]:size-10) para ajustar visualmente el componente según el tamaño seleccionado.

---

## Ejemplos de uso

Ejemplo 1: Avatar con imagen y fallback
```tsx
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar"

export function UserAvatar({ user }) {
  return (
    <Avatar size="default">
      <AvatarImage src={user.avatarUrl} alt={user.name} />
      <AvatarFallback>{user.initials}</AvatarFallback>
    </Avatar>
  )
}
```

Ejemplo 2: Avatar con badge y tamaño pequeño
```tsx
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "./components/ui/avatar"

export function UserAvatarWithStatus({ user }) {
  return (
    <Avatar size="sm">
      <AvatarImage src={user.avatarUrl} alt={user.name} />
      <AvatarFallback>{user.initials}</AvatarFallback>
      <AvatarBadge>✓</AvatarBadge>
    </Avatar>
  )
}
```

Ejemplo 3: Grupo de avatares con conteo
```tsx
import { AvatarGroup, Avatar, AvatarImage, AvatarFallback, AvatarGroupCount } from "./components/ui/avatar"

export function AvatarTeam({ members }) {
  return (
    <AvatarGroup>
      {members.map((m) => (
        <Avatar key={m.id} size="default">
          <AvatarImage src={m.avatarUrl} alt={m.name} />
          <AvatarFallback>{m.initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+{members.length - 3}</AvatarGroupCount>
    </AvatarGroup>
  )
}
```

Notas sobre estos ejemplos:
- Se aprovechan las subcomponentes para componer avatares con imagen y fallback.
- AvatarGroup y AvatarGroupCount permiten mostrar múltiples avatares de forma compacta con superposición.

---

## Notas técnicas

- Diseño y rendimiento:
  - Se delega la renderización visual a las primitivas de @base-ui/react/avatar, manteniendo una capa de presentación estilística mediante clases de Tailwind-like y el helper cn.
  - El tamaño se maneja mediante data-size y clases condicionadas (p. ej., data-[size=lg]:size-10) para adaptar reglas de estilo sin lógica adicional.
- Accesibilidad:
  - Los props de imágenes y textos de fallback deben proveer alt/textos descriptivos cuando se use AvatarImage o AvatarFallback.
  - El uso del wrapper y de las estructuras de imagen/fallback facilita una experiencia de ARIA adecuada cuando la biblioteca base maneja roles y atributos accesibles.
- Extensibilidad:
  - El diseño permite añadir más subcomponentes en el futuro (p. ej., AvatarSkeleton, AvatarHint) sin alterar la API existente, manteniendo la consistencia con las primitivas base UI.

---

## Última actualización

29/5/2026

---