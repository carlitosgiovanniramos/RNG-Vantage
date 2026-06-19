# Documentación técnica: components/ui/avatar.tsx

Archivo: avatar.tsx (Ruta: components/ui/avatar.tsx)

Total de líneas: 110

Este archivo define un conjunto de componentes relacionados con Avatares, utilizando la librería de interfaz base y un sistema de estilos basado en clases (probablemente Tailwind). Proporciona un avatar principal y subcomponentes para imagen, fallback, grupo de avatares y contador de grupo, junto con un componente para el badge del avatar.

## Descripción general

El módulo exporta un conjunto de componentes para manejar avatares en la UI:

- Avatar: componente principal basado en AvatarPrimitive.Root.
- AvatarImage: imagen del avatar, basado en AvatarPrimitive.Image.
- AvatarFallback: contenido alternativo cuando no hay imagen, basado en AvatarPrimitive.Fallback.
- AvatarBadge: insignia o badge asociado al avatar.
- AvatarGroup: contenedor para agrupar varios avatares.
- AvatarGroupCount: muestra un contador dentro del contexto de un grupo de avatares.

El diseño se apoya en una estrategia de slots y clases dinámicas para adaptar tamaños y estilos según el tamaño seleccionado (default, sm, lg). Se usan data-slot y data-size para permitir styling específico y una mayor flexibilidad de composición.

## Responsabilidades

- Proporcionar un conjunto de componentes reusables y tipados para avatares.
- Facilitar la composición entre imagen, fallback y badge sin perder la semántica y el comportamiento del avatar.
- Soportar tamaños adaptables (default, sm, lg) mediante clases condicionales basadas en data attributes.
- Mantener consistencia de estilos a través de una utilidad de concatenación de clases (cn) y estilos base de AvatarPrimitive.

## Props / Parámetros

A continuación se describe cada componente exportado y sus props.

### Avatar
- Tipo de componente: React.FC (envoltorio de AvatarPrimitive.Root)
- Propiedades principales:
  - className?: string (opcional) — clases CSS adicionales.
  - size?: "default" | "sm" | "lg" (opcional, predeterminado "default") — tamaño del avatar. Este prop se añade como data-size en el DOM para estilos condicionados.
  - ...props: AvatarPrimitive.Root.Props (propiedades del Root de la librería base)
- Descripción:
  - Envuelve AvatarPrimitive.Root y aplica una clase de grupo y tamaño con soporte para estilos “after” y efectos de borde.
  - Propaga todas las props del AvatarPrimitive.Root, permitiendo personalizar comportamiento (onClick, onAnimationEnd, etc.) si corresponde.

### AvatarImage
- Tipo de componente: React.FC
- Propiedades: AvatarPrimitive.Image.Props
- Parámetros adicionales:
  - className?: string (opcional)
- Descripción:
  - Renderiza AvatarPrimitive.Image con data-slot="avatar-image" y aplica clases para mantener una relación de aspecto cuadrada, rellenar completamente el contenedor y recorte de objeto (object-cover).
  - Propaga todas las props del AvatarPrimitive.Image.

### AvatarFallback
- Tipo de componente: React.FC
- Propiedades: AvatarPrimitive.Fallback.Props
- Parámetros adicionales:
  - className?: string (opcional)
- Descripción:
  - Renderiza AvatarPrimitive.Fallback con data-slot="avatar-fallback" y aplica estilos para centrar contenido, fondo muted y tamaño condicionado por grupo/slot.
  - Propaga todas las props del AvatarPrimitive.Fallback.

### AvatarBadge
- Tipo de componente: React.FC (span)
- Propiedades: React.ComponentProps<"span">
- Parciales:
  - className?: string (opcional via props)
- Descripción:
  - Renderiza un span con data-slot="avatar-badge" y un conjunto de clases para posicionamiento (absoluto, esquina inferior derecha), estilos de fondo, color y bordes.
  - Incluye reglas específicas para tamaños de avatar: sm, default, lg, mediante group-data-[size=...]/avatar.
  - Propaga todas las props del span.

### AvatarGroup
- Tipo de componente: React.FC (div)
- Propiedades: React.ComponentProps<"div">
- Parciales:
  - className?: string (opcional)
- Descripción:
  - Contenedor para agrupar avatares en una fila, con márgenes negativos para superposición (tailwind -space-x-2).
  - Soporta styling específico para slots de avatar mediante data-slot="avatar-group".

### AvatarGroupCount
- Tipo de componente: React.FC (div)
- Propiedades: React.ComponentProps<"div">
- Parciales:
  - className?: string (opcional)
- Descripción:
  - Contenedor para mostrar un recuento o indicador dentro de un grupo de avatares.
  - Incluye estilos para tamaño, fondo muted y anillos, con adaptaciones por tamaño del avatar en el grupo (size=lg, size=sm, etc.).

## Retorna

Cada componente devuelve un JSX.Element correspondiente al avatar o a su subcomponente relacionado:

- Avatar: JSX.Element que corresponde a AvatarPrimitive.Root con atributos de slot y tamaño, más clases combinadas.
- AvatarImage: JSX.Element que corresponde a AvatarPrimitive.Image con data-slot y clases específicas (aspect-ratio, object-fit).
- AvatarFallback: JSX.Element que corresponde a AvatarPrimitive.Fallback con data-slot y clases visuales para fallback.
- AvatarBadge: JSX.Element span con data-slot y clases de estilo posicionadas.
- AvatarGroup: JSX.Element div con data-slot y clases para agrupamiento.
- AvatarGroupCount: JSX.Element div con data-slot y clases para mostrar el conteo dentro del grupo.

Todos devuelven elementos React (JSX) aptos para ser renderizados en una UI de React/Next.js.

## Dependencias

- React
- @base-ui/react/avatar: biblioteca de componentes de avatar que provee AvatarPrimitive.Root, AvatarPrimitive.Image, AvatarPrimitive.Fallback, etc.
- cn de "@/lib/utils": utilidad para unir/concatenar clases CSS de manera segura.
- Estilos basados en clases (probablemente Tailwind) y el uso de data-slot y data-size para aplicar estilos condicionales.

Notas sobre implementación:
- Uso de data-slot para identificar partes del avatar en la composición (avatar, avatar-image, avatar-fallback, avatar-badge, avatar-group, avatar-group-count).
- Estilos condicionados por data-[size=...] para adaptar tamaños sin duplicar clases.
- El componente Avatar hace uso de un Wrapper group-avatar para permitir estilos dependientes del tamaño mediante las clases en cn().
- El código está marcado con "use client" al inicio, indicando que es código de cliente (cliente de React).

## Ejemplos de uso

- Avatar básico con imagen y fallback:
```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function UserAvatar() {
  return (
    <Avatar size="default">
      <AvatarImage src="/images/user-123.jpg" alt="User 123" />
      <AvatarFallback>UN</AvatarFallback>
    </Avatar>
  );
}
```

- Avatar de tamaño grande con fallback:
```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function LargeUserAvatar() {
  return (
    <Avatar size="lg">
      <AvatarImage src="/images/user-456.jpg" alt="User 456" />
      <AvatarFallback>UT</AvatarFallback>
      {/* Opcional: AvatarBadge si se desea un indicador */}
      <AvatarBadge>✓</AvatarBadge>
    </Avatar>
  );
}
```

- Grupo de avatares con conteo:
```tsx
import { AvatarGroup, Avatar, AvatarImage, AvatarFallback, AvatarGroupCount } from "@/components/ui/avatar";

function AvatarGroupExample() {
  return (
    <AvatarGroup>
      <Avatar size="default">
        <AvatarImage src="/images/u1.jpg" alt="U1" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarImage src="/images/u2.jpg" alt="U2" />
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>3</AvatarGroupCount>
    </AvatarGroup>
  );
}
```

Notas sobre ejemplos:
- Se muestran ejemplos básicos de composición para Avatar con imagen y fallback.
- Se muestra un uso de AvatarGroup y AvatarGroupCount para ilustrar agrupamiento y conteo.

## Notas técnicas

- Tipado explícito: cada componente usa tipos provenientes de AvatarPrimitive (Root.Image.Fallback) o de React para garantizar compatibilidad con la librería base.
- Extensibilidad: el avatar principal acepta cualquier prop de AvatarPrimitive.Root, permitiendo handlers y configuraciones propias de la librería base.
- Rendimiento: la implementación es principalmente de renderización y composición con clases. No hay lógica asíncrona ni efectos costosos. El uso de cn() facilita la concatenación de múltiples clases sin duplicados.
- Estilos responsivos: el uso de data-size y distintas variantes de grupo (group-data-...) posibilita cambios de tamaño y visibilidad de elementos internos (p. ej., ocultar/mostrar SVGs dentro del grupo) sin cambiar el código de cada subcomponente.
- Accesibilidad: se mantienen prácticas estándar de accesibilidad mediante la semántica de etiquetas y la estructura de componentes de avatar. (Ten en cuenta que los detalles de ARIA no están explícitos en este archivo; podrían estar gestionados por AvatarPrimitive.)

## Última actualización

12/5/2026

Si necesitas más ejemplos o una guía de migración para una versión específica de @base-ui/react/avatar, puedo ampliarla.