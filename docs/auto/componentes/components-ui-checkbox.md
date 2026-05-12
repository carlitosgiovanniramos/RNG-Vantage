# Documentación técnica: checkbox.tsx

Ruta: components/ui/checkbox.tsx

Nombre: checkbox.tsx

Total de líneas: 30

 Descripción general
Este archivo define un componente React llamado `Checkbox` que actúa como una envoltura (wrapper) estilizada alrededor del componente primitivo de checkbox proporcionado por la librería de UI base (`@base-ui/react/checkbox`). El objetivo es proporcionar una experiencia de usuario consistente con el diseño del proyecto RNG Vantage, incluyendo estilos, estado de accesibilidad y soporte para temas (claro/oscuro).

 El componente se implementa como un componente cliente de Next.js (directiva "use client"), y utiliza un conjunto de utilidades de estilo (Tailwind classes) junto con iconografía de `lucide-react`.

 Responsabilidades
- Proporcionar un checkbox estilizado y accesible, con indicativo de estado cuando está marcado.
- Centralizar la lógica de estilo en un solo lugar para mantener la consistencia visual con el resto de la UI.
- Propagar todos los props recibidos al componente primitivo de la librería (`CheckboxPrimitive.Root`), asegurando compatibilidad con comportamiento controlado/descontrolado, eventos, etc.
- Soportar modos claro/oscuro mediante clases de Tailwind.

 Props / Parámetros
- Props del componente: acepta todas las props del `CheckboxPrimitive.Root.Props` (propiedades del checkbox primitivo). Además, expone un prop adicional específico en la firma del componente:
  - `className?: string` — clase de CSS adicional para personalizar el estilo.

Notas sobre los props:
- El componente desestructura `className` y luego propaga el resto de props mediante `{...props}` al `CheckboxPrimitive.Root`. Esto significa que puedes usar props típicos de un checkbox controlable/descontrolado (p. ej., `checked`, `defaultChecked`, `onCheckedChange`, `aria-invalid`, etc.) tal como lo harías con el componente de base.
- El contenido visual del checkbox se compone de:
  - `CheckboxPrimitive.Root` con atributos de estilo y datos de slot para integración con el diseño del sistema.
  - `CheckboxPrimitive.Indicator` que contiene el icono `CheckIcon` cuando el checkbox está marcado.

 Retorna
- El componente retorna un nodo JSX que corresponde a:
  - Un `CheckboxPrimitive.Root` configurado con:
    - Atributos de slot para identificación (`data-slot="checkbox"`, `data-slot="checkbox-indicator"`).
    - Clases CSS que combinan estilos del proyecto (Tailwind) con el `className` proporcionado.
    - Propagación de todos los props recibidos.
  - Un `CheckboxPrimitive.Indicator` que centra el contenido y contiene el `CheckIcon` de `lucide-react`, que se muestra cuando el estado es marcado.

 Dependencias
- React (Next.js, componente cliente)
- @base-ui/react/checkbox (Checkbox primitivo)
- lucide-react (icono CheckIcon)
- "@/lib/utils" (utilidad `cn` para combinar clases)
- Sistemas de estilos Tailwind (clases como border, ring, dark:, data-checked:, etc.)
- Soporte de accesibilidad (ARIA) implícito a través de props y estado del checkbox

 Ejemplos de uso
A continuación se muestran ejemplos simples de uso del componente en distintas situaciones:

1) Uso básico (controlado)
- Este ejemplo asume un estado controlado en el componente padre.

import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

export default function Example() {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={setChecked}
      aria-label="Aceptar términos"
    />
  )
}

2) Uso en modo descontrolado
- Útil cuando no necesitas gestionar el estado desde el componente padre.

import { Checkbox } from "@/components/ui/checkbox"

export default function Example() {
  return (
    <Checkbox aria-label="Aceptar términos" defaultChecked={false} />
  )
}

Notas sobre el uso:
- El componente está diseñado para integrarse con el sistema de diseño existente, por lo que puedes combinarlo con otros componentes de formulario y contenedores del proyecto.
- El helper `cn` se encarga de fusionar las clases base con cualquier `className` adicional que pases.

 Notas técnicas
- Estilización:
  - El `CheckboxPrimitive.Root` recibe una serie de clases de Tailwind que gestionan tamaño, borde, estado, y adaptaciones para modos claro/oscuro.
  - Se usan utilidades como `data-checked:border-primary`, `data-checked:bg-primary` para reflejar el estado marcado.
  - Compatibilidad con modo oscuro mediante prefijos `dark:` para fondo, borde y estado de marcado.
  - Soporte de estados de accesibilidad (aria-invalid) para indicar errores y aplicar estilos de borde/ring correspondientes.
  - El estado visual del check se maneja mediante el `Indicator`, que centra el `CheckIcon` (de `lucide-react`) cuando está marcado.
- Estructura:
  - El componente es una pieza de UI pura (sin side effects) que solo renderiza el checkbox con su indicator. La lógica de estado (checked, onChange) se maneja a través de las props que se propagan al `CheckboxPrimitive.Root`.
  - Se utilizan atributos de slot (`data-slot`) para facilitar la integración en un sistema de diseño modular o para pruebas automatizadas.
- Rendimiento:
  - El componente es liviano y no introduce complejidad adicional aparte de la envoltura de estilo. Al no crear efectos secundarios, su rendimiento es óptimo para listas y formularios de tamaño moderado.
- Compatibilidad:
  - Dado que depende de `@base-ui/react/checkbox`, la API y comportamiento está alineado con esa librería. Cualquier cambio en esa dependencia podría requerir ajustes menores en este wrapper.

 Última actualización
- 12/5/2026

Notas finales
- Este archivo es una envoltura específica de la UI del proyecto para estandarizar el look-and-feel de checkboxes. Si se requieren variaciones (p. ej., tamaño diferente, iconos alternativos, o estados adicionales como indeterminate), se pueden añadir manteniendo la misma estructura para conservar coherencia en toda la base de código.