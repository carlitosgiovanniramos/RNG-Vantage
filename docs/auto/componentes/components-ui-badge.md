# Documentación técnica: components/ui/badge.tsx

Archivo: components/ui/badge.tsx
Resumen: Definición de un componente Badge reutilizable y de la configuración de variantes de estilo (badgeVariants) para etiquetas pequeñas en la interfaz. El componente está construido con React, TypeScript y utilidades propias del proyecto (mergeProps, useRender, cn) y utiliza class-variance-authority (cva) para gestionar variantes de estilo.

## Descripción general
Este archivo define dos exportaciones clave del UI de la aplicación RNG Vantage:

- Badge: Un componente React reutilizable que renderiza un span con estilo de badge. Soporta variantes de diseño (default, secondary, destructive, outline, ghost, link) y permite extender props nativos de span (children, id, aria-*, etc.). Implementa un sistema de renderizado mediante el hook useRender, lo que facilita la personalización del renderizado a través de la prop render.
- badgeVariants: Una función de variaciones de clase creada con class-variance-authority (cva) que centraliza el conjunto de estilos y variantes disponibles para el Badge.

El diseño está orientado a consistencia visual y facilidad de uso en diferentes contextos dentro de la aplicación (notificaciones, etiquetas de estado, acciones rápidas, etc.).

## Responsabilidades
- Proporcionar un badge estilizado y accesible para la interfaz.
- Centralizar y exponer las variantes de estilo del badge mediante badgeVariants.
- Permitir la personalización de estilos a través de className y props de span.
- Soportar renderizado personalizado vía la prop render usando useRender.
- Integrar con utilidades de merging de props y construcción de clases (mergeProps, cn).

## Props / Parámetros

A continuación se describen las props relevantes para el componente Badge y para badgeVariants.

### Badge (React component)
Propiedades (propiedades de la interfaz de React):
- className?: string
  - Descripción: Clase CSS adicional a aplicar al badge.
  - Opcional.
- variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
  - Descripción: Variante de estilo a aplicar. Determina el conjunto de clases de Tailwind combinadas por badgeVariants.
  - Opcional (valor por defecto: "default").
- render?: useRender.RenderProp
  - Descripción: Prop opcional utilizada por useRender para personalizar el renderizado del componente. Permite pasar una función o componente para controlar la salida renderizada.
  - Opcional.
- ...props: React props de un span
  - Descripción: Propiedades estándar de un elemento span (children, id, title, aria-*, etc.). Se extienden y se fusionan mediante mergeProps.
  - Opcional.

Tipo de Props (parcial, para referencia técnica):
- useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>

Notas:
- VariantProps<typeof badgeVariants> añade el tipo para la prop variant basada en la definición de badgeVariants.
- La clase base y las variantes se gestionan a través de badgeVariants({ variant }), que se integra con className mediante cn.

### badgeVariants (variants para estilos)
Propiedades:
- variant: { default; secondary; destructive; outline; ghost; link }
  - Descripción: Conjunto de variantes de estilo disponibles. Cada clave corresponde a una plantilla de clases de Tailwind que modifica fondo, color, borde, estado hover, y otros aspectos del badge.
  - Valor por defecto: "default".
  
Ejemplos de variantes (indicadas por el código):
- default: fondo primario y texto de foreground primario, con efecto hover.
- secondary: fondo secundario y color de foreground correspondiente, con efecto hover.
- destructive: estilo con indicaciones de destrucción/alerta (con y sin modo oscuro).
- outline: borde visible con texto correspondiente y efectos hover.
- ghost: fondo suave y cambio de color al pasar cursor.
- link: apariencia tipo enlace con subrayado al pasar el mouse.

## Retorna

- Badge: Un elemento React generado a partir de useRender, típicamente un span (por defecto) con las clases combinadas por badgeVariants y cualquier className adicional proporcionada. Soporta children y otros props de span. La renderización puede ser personalizada vía la prop render. El tipo de retorno es React.ReactElement (o similar, según la implementación de useRender).

- badgeVariants: No es una función de render, sino una utilidad de variante que devuelve la clase final para el componente Badge cuando se llama badgeVariants({ variant }).

## Dependencias

Este archivo depende de varias librerías y utilidades presentes en el proyecto:

- React (jsx/tsx) y TypeScript
- @base-ui/react/merge-props
  - Función utilitaria para fusionar props de forma segura, preservando propiedades relevantes y evitando sobre-escrituras accidentales.
- @base-ui/react/use-render
  - Hook/utility para renderizado dinámico y slots. Permite especificar defaultTagName, render, y estado interno (state) para el componente.
- class-variance-authority (cva, VariantProps)
  - Herramienta para gestionar variantes de estilos y construir clases CSS de forma declarativa.
- cn (utility de concatenación de clases)
  - Helper para combinar clases condicionales.
- "@/lib/utils"
  - Proporciona cn y posibles utilidades relacionadas (en este caso, cn).

Notas:
- Las clases base del badge están escritas para Tailwind CSS y contemplan estados de acceso y usabilidad (focus-visible, aria-invalid), así como soporte para íconos embebidos (con data attributes meta) y compatibilidad con modo oscuro.

## Ejemplos de uso

1) Uso básico con texto:

- Código:
  <Badge>Nuevo</Badge>

- Descripción:
  Renderiza un badge con la variante por defecto ("default") y el contenido "Nuevo".

2) Uso con variante secundaria:

- Código:
  <Badge variant="secondary">Secundario</Badge>

- Descripción:
  Renderiza un badge con fondo y colores propios de la variante "secondary".

3) Uso con className adicional y render personalizado (opcional):

- Código (con render opcional):
  <Badge variant="outline" className="my-custom-class" render={(props) => <span {...props} />} >
    Editar
  </Badge>

- Descripción:
  Añade una clase extra y demuestra cómo se podría personalizar el render mediante la prop render. En la práctica, render suele usarse para ajustar el marcado o la envoltura, manteniendo la semántica y las props del badge.

Observación:
- El render prop y useRender están diseñados para permitir casos donde se necesite un control más fino sobre la estructura del DOM. En la mayoría de los usos, <Badge>Contenido</Badge> es suficiente.

## Notas técnicas

- Estilización centralizada:
  - badgeVariants usa class-variance-authority (cva) para definir un conjunto de clases base y variantes. Esto facilita la consistencia visual y la extensión futura de variantes sin duplicar código.
- Construcción de clases:
  - Las clases base incluyen: grupos de utilidades para tamaño, alineación, bordes, padding, tipografía, espaciado, transición y estados de foco. También contempla estilos para interacciones con enlaces y estados aria-invalid.
  - La combinación final de clases se realiza con badgeVariants({ variant }) y se fusiona con cualquier className adicional a través de cn y mergeProps.
- Manejo de props:
  - Se emplea mergeProps para combinar las props pasadas con las props calculadas (como className). Esto garantiza que la semántica de los props nativos de span no se pierda.
  - useRender se usa para abstraer el renderizado. El componente especifica defaultTagName: "span" y pasa un estado de slots (slot: "badge", variant) para habilitar renderizados dinámicos.
- Tipado:
  - Se usa VariantProps<typeof badgeVariants> para tipar la prop variant de Badge.
  - useRender.ComponentProps<"span"> aporta tipado para las props típicas de un span y la prop render.
- Extensibilidad:
  - Para añadir nuevas variantes, basta con extender badgeVariants en el archivo, añadiendo nuevas claves en variants.variant y sus correspondientes clases.
  - Para cambiar el comportamiento de renderizado, se puede aprovechar la prop render y la API de useRender sin alterar la semántica de la API pública de Badge.

## Última actualización

12/5/2026

Si necesitas que amplíe la documentación con ejemplos de pruebas, benchmarks de rendimiento o guías de migración entre versiones de variantes, dímelo y lo añado.