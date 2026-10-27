# Documentación técnica – button.tsx (components/ui/button.tsx)

Descripción general
- Archivo: components/ui/button.tsx
- Nombre del componente: Button
- Propósito: Proporcionar un botón reutilizable y consistente dentro de RNG Vantage. Es un envoltorio (wrapper) del Button del sistema base de UI (@base-ui/react/button) que añade variantes visuales y tamaños mediante la utilidad de variaciones de class-variance-authority (cva). Implementa estilos con Tailwind para diversos estados y temas (luz/oscuridad) y expone una API de props convenientemente tipada.
- Tipo de componente: Componente React de cliente (“use client”).

Responsabilidades
- Proveer un botón estandarizado con variantes de estilo (default, outline, secondary, ghost, destructive, link).
- Proveer variantes de tamaño (default, xs, sm, lg, y variantes icon como icon-xs, icon-sm, icon-lg).
- Centralizar la lógica de composición de clases mediante cva y cn para generar la clase final del botón.
- Pasar a través de las props al Button_Primitivo (ButtonPrimitive) del UI base (@base-ui/react/button), manteniendo compatibilidad y extensibilidad.
- Exponer el helper buttonVariants para uso externo en caso de necesitar las clases generadas sin renderizar el botón.

Props / Parámetros
A continuación se listan las props relevantes del componente Button. Incluye las props heredadas del Button primitivo y las variantes gestionadas por buttonVariants.

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| className | string | opcional | Clases CSS adicionales para personalizar el botón. Se combinan con las clases generadas por buttonVariants. |
| variant | "default" | opcional | Variante visual del botón. Valores posibles: default, outline, secondary, ghost, destructive, link. Si no se especifica, por defecto se aplica "default". |
| size | "default" | opcional | Tamaño y espaciado del botón. Valores: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg. Si no se especifica, por defecto se aplica "default". |
| ...props | ButtonPrimitive.Props & VariantProps<typeof buttonVariants> | opcional | Propiedades adicionales heredadas de ButtonPrimitive (del UI base) y las variantes definidas por buttonVariants. Esto permite pasar atributos estándar de un botón y manejar eventos, aria, etc. |

Retorna
- Devuelve un elemento React del tipo ButtonPrimitive, con:
  - data-slot="button" (atributo de slot para bibliotecas de diseño)
  - className generado por buttonVariants({ variant, size, className })
  - todas las props pasadas mediante spread operator {...props}
- Forma de retorno: JSX.Element

Dependencias
- React (a través de Next.js) – para el componente React.
- @base-ui/react/button – Button primitivo base del que se envuelve el componente.
- class-variance-authority (cva) – para definir y gestionar variantes y tamaños del botón.
- cn (utilidad de concatenación de clases) desde "@/lib/utils" – para combinar cadenas de clase de forma segura.
- Tailwind CSS – conjunto de estilos utilizado en las clases de variación (ej. bg-primary, text-primary-foreground, etc.).

Ejemplos de uso
- Uso básico
  ```tsx
  import { Button } from "@/components/ui/button"

  export default function Example() {
    return (
      <Button onClick={() => console.log("Clicked!")}>
        Clic aquí
      </Button>
    )
  }
  ```

- Uso con variante y tamaño
  ```tsx
  import { Button } from "@/components/ui/button"

  export default function AdvancedExample() {
    return (
      <>
        <Button variant="outline" size="sm">Guardar</Button>
        <Button variant="destructive" size="lg">Eliminar</Button>
        <Button variant="link" size="default">Ver más</Button>
      </>
    )
  }
  ```

Notas técnicas
- Implementación de variantes:
  - Se define buttonVariants con cva, que combina un conjunto de clases base muy extensas (primer parámetro del cva) con variantes específicas para “variant” y “size”.
  - Variantes cubiertas: default, outline, secondary, ghost, destructive, link.
  - Tamaños cubiertos: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg.
  - Se definen valores por defecto en defaultVariants: variant = "default", size = "default".
- Estilos y estados:
  - El conjunto base de clases abarca: alineación, tamaño, bordes, tipografías, comportamiento en estados de interacción, foco, deshabilitado, validación ARIA, y reglas específicas para SVGs internos.
  - Incluye estados de accesibilidad y compatibilidad con modo oscuro (dark:...).
  - Soporta data-slot y estructura de “button group” para composición de UI.
- Composición de clases:
  - La clase final del botón se obtiene con cn(buttonVariants({ variant, size, className })).
  - Esto garantiza que cualquier className adicional se aplique sin romper la lógica de variantes.
- Arquitectura:
  - Este archivo actúa como adaptador/envoltorio para centralizar el estilo de botones y garantizar consistencia a lo largo de la aplicación.
  - Mantiene compatibilidad con el Button primitivo del @base-ui, permitiendo heredar todas las props relevantes del botón nativo y de la librería UI base.
- Rendimiento:
  - La construcción de clases se hace en una operación de bajo costo en tiempo de render, sin efectos colaterales.
  - El componente es ligero y orientado a ser reusado en múltiples partes de la UI.

Última actualización
- 29/5/2026

Observaciones finales
- Este botón está diseñado para ser el control de interacción principal de la UI, con variantes y tamaños que cubren la mayoría de casos de uso en la aplicación.
- Si en el futuro se requiere un nuevo estilo de botón, se puede añadir como nueva variante dentro de buttonVariants sin necesidad de crear un nuevo componente.