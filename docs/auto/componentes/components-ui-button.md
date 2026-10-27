# RNG Vantage – Button component (components/ui/button.tsx)

Descripción general
- Este archivo define un componente Button reutilizable para la UI del proyecto RNG Vantage.
- Es un wrapper del Button primitivo proveniente de @base-ui/react/button, enriquecido con variantes de estilo gestionadas por class-variance-authority (cva).
- Permite seleccionar visualmente el botón mediante variantes de estilo (default, outline, secondary, ghost, destructive, link) y tamaños (default, xs, sm, lg, icon, etc.), manteniendo consistencia con la paleta y el comportamiento de la app.
- Es un componente cliente de Next.js (directiva "use client").

Responsabilidades
- Proveer un Button con variantes tipadas y combinables de forma segura.
- Centralizar la lógica de estilo en buttonVariants para facilitar consistencia y mantenimiento.
- Exponer el helper buttonVariants para posibles usos fuera del componente Button (si es necesario).
- Mantener accesibilidad y comportamientos por defecto (focus-visible, estados disabled, aria-invalid, etc.) a través de las clases CSS.

Propiedades / Parámetros
A continuación se detallan las props disponibles para el componente React Button.

- Name: className
  - Tipo: string | undefined
  - Requerido: no
  - Descripción: Clases CSS adicionales que se concatenan con las clases generadas por buttonVariants.

- Name: variant
  - Tipo: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  - Requerido: no
  - Descripción: Define el estilo visual del botón. Los estilos corresponden a estilos Tailwind predefinidos en el objeto de variantes.
  - Valor por defecto: "default"

- Name: size
  - Tipo: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
  - Requerido: no
  - Descripción: Define el tamaño y Padding del botón. Incluye adaptaciones para iconos y slots dentro del botón.
  - Valor por defecto: "default"

- Nombre adicional de props: ...props ( ButtonPrimitive.Props )
  - Tipo: ButtonPrimitive.Props (combinado con VariantProps<typeof buttonVariants>)
  - Requerido: no
  - Descripción: Propiedades adicionales del botón primitivo subyacente (p. ej., onClick, disabled, aria, etc.). Estas props se propagan tal cual al Button primitivo mediante el spread operator {...props}.

Retorna
- El componente Button devuelve un elemento ButtonPrimitive (del paquete @base-ui/react/button) con:
  - data-slot="button" para identificación en slots si se usa un sistema de slots.
  - className calculado a partir de buttonVariants({ variant, size, className }) para aplicar estilos consistentes.
  - Propiedades restantes propagadas mediante {...props}.
- Tipo de retorno: JSX.Element (Tensor TypeScript: React.Component con props de ButtonPrimitive y variantes).

Dependencias
- @base-ui/react/button
  - Proporciona el Button primitivo utilizado como base para estilos y comportamiento.
- class-variance-authority (cva)
  - Permite definir variantes de estilo tipadas y combinarlas de forma eficiente.
- cn (utilidad de combinación de clases)
  - Función para unir y deduplicar clases CSS de forma segura.
- React (tipos y entorno de ejecución de cliente)
  - El archivo usa la directive "use client" y exporta un componente React.

Notas técnicas
- Implementación basada en cva:
  - buttonVariants define:
    - Variants: variant (default, outline, secondary, ghost, destructive, link) con cadenas de clases detalladas para cada caso.
    - Sizes: size (default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg) con clases que controlan alturas, padding, radios, tamaños de iconos y ajustes específicos cuando hay slots o iconos.
    - defaultVariants: variant y size por defecto (default).
  - Esto facilita añadir nuevos estilos o ajustar la apariencia sin modificar el componente en cada uso.
- Accesibilidad:
  - Incluye focus-visible:ring y otras utilidades para mejorar la accesibilidad al recibir foco.
  - Soporte de estados de interacción y deshabilitado; manejo de aria-invalid para estados de validación.
- Data-slot:
  - data-slot="button" se usa para facilitar el manejo de slots y composición de UI en casos donde se necesite posicionar o identificar el botón en un layout.
- Tipado:
  - El componente utiliza la intersección de ButtonPrimitive.Props y VariantProps<typeof buttonVariants>, lo que garantiza que las props de la capa base y las variantes sean consistentes y type-safe.
- Rendimiento:
  - La combinación de variantes por defecto minimiza repetición de clases y evita churn de estilos en el renderizado.
- Limitaciones:
  - Las clases y variantes están acopladas a Tailwind CSS y a la configuración de clase-variance-authority; cambios en estas dependencias pueden requerir ajustes en las cadenas de clase.

Ejemplos de uso
- Ejemplo básico:
  - Importación:
    - import { Button } from "@/components/ui/button"
  - Uso:
    - <Button onClick={() => console.log("Clicked")}>Click me</Button>

- Ejemplo con variante y tamaño:
  - <Button variant="outline" size="lg" onClick={() => alert("Hello")}>Apertura</Button>

- Ejemplo con iconos (aprox. comportamiento):
  - <Button variant="ghost" size="icon" aria-label="Buscar">
      <svg width="16" height="16" ...>...</svg>
    </Button>
  Nota: El archivo soporta tamaño "icon" y variantes relacionadas para adaptarse a botones que contienen iconos, ajustando tamaños con la variante de tamaño correspondiente.

Última actualización
- 12/5/2026

Notas finales
- Este archivo está diseñado para ser una pieza central y reutilizable de la UI de botones, asegurando consistencia visual y facilidad de mantenimiento mediante el uso de variantes y un único punto de definición de estilos.
- Si se requieren nuevos estilos o tamaños, se deben definir dentro de buttonVariants para mantener coherencia en toda la base de código.