# Documentación técnica: components/ui/checkbox.tsx

Ruta: components/ui/checkbox.tsx  
Nombre: checkbox.tsx  
Líneas: 30

Descripción breve: Componente Checkbox personalizado que envuelve el componente primitivo de Checkbox deBase UI, aplicando estilos consistentes, con soporte para estados de foco, deshabilitado, inválido y tema oscuro. Expone todas las props del CheckboxPrimitive.Root y añade un icono de verificación (CheckIcon) cuando está seleccionado.

---

## Descripción general

Checkbox es un componente React cliente que actúa como envoltorio estilizado alrededor de CheckboxPrimitive.Root obtenido desde @base-ui/react/checkbox. Su propósito es garantizar una apariencia y comportamiento consistentes en toda la aplicación, integrando temas (claros/oscuro), estados de validación (aria-invalid), y estados de interacción (focus-visible, deshabilitado). El indicador del checkbox (CheckboxPrimitive.Indicator) contiene un icono de verificación (CheckIcon) proporcionado por lucide-react.

- Es un componente “client” (directiva "use client").
- Delegación de props al primitive subyacente para conservar la API.
- Estilos complejos con Tailwind para coherencia con el design system local.

---

## Responsabilidades

- Proveer un checkbox estilizado y accesible con comportamiento consistente.
- Mantener compatibilidad con el estado marcado (data-checked) y estilos correspondientes (data-checked:...).
- Soportar estados de deshabilitado (disabled) y validación (aria-invalid) con estilos visuales adecuados.
- Integrar con el tema oscuro automáticamente mediante clases dark:...
- Pasar todas las props del CheckboxPrimitive.Root al componente subyacente para una API completa (control, handlers, etc.).
- Mostrar un icono de verificación cuando el estado está marcado a través del Indicator.

---

## Props / Parámetros

Este componente es un envoltorio del CheckboxPrimitive.Root y admite todas las props definidas por CheckboxPrimitive.Root.Props, además de una prop adicional explícita:

| Nombre del prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| className | string | No | Clases CSS adicionales para personalizar el estilo del root del checkbox. Se concatenan usando la función cn junto con las clases predeterminadas del componente. |
| ...props | CheckboxPrimitive.Root.Props | No | Todas las props del componente root del primitive. Esto incluye, entre otras, control de estado (checked, defaultChecked), handlers (onCheckedChange), props de accesibilidad y otras configuraciones propias del primitive. Se pasan mediante spread {...props}. |

Notas:
- La API exacta de CheckboxPrimitive.Root.Props depende del paquete @base-ui/react/checkbox; el wrapper no redefine estas props, sino que las reenvía.
- El componente incluye un indicador (CheckboxPrimitive.Indicator) que contiene el icono de verificación cuando el estado está marcado.

---

## Retorna

El componente devuelve un elemento JSX que representa un checkbox estilizado. En su estructura:

- CheckboxPrimitive.Root: el nodo raíz del checkbox, con data-slot="checkbox" y una cadena de clases que define el aspecto, estados de foco, deshabilitado, validación, y soporte para modo oscuro.
- CheckboxPrimitive.Indicator: el contenedor del icono de verificación mostrado cuando el estado es seleccionado (data-checked).
- CheckIcon: icono de verificación de lucide-react renderizado dentro del Indicator.

Formato de retorno: un React element (JSX) que renderiza el checkbox completo y listo para ser usado en la UI.

---

## Dependencias

- "use client": indica que este archivo es un componente cliente de Next.js.
- @base-ui/react/checkbox: CheckboxPrimitive, utilizado como la implementación base del checkbox (Root y Indicator).
- lucide-react: CheckIcon, icono de verificación mostrado cuando está marcado.
- "@/lib/utils": cn (utilidad de concatenación de clases).
- React (tipo de props y composición JSX).

Notas técnicas:
- El componente se apoya fuertemente en clases de Tailwind para estilos, incluyendo estados como disabled, aria-invalid, data-checked, y variantes dark.
- data-slot se utiliza para identificar las partes del checkbox en pruebas o integraciones.
- El diseño admite accesibilidad y transiciones visuales para una mejor experiencia de usuario.

---

## Ejemplos de uso

1) Uso básico con estado controlado

```tsx
import React from "react"
import { Checkbox } from "@/components/ui/checkbox"

function MyForm() {
  const [checked, setChecked] = React.useState(false)

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        aria-label="Acepto términos"
      />
      Acepto los términos y condiciones
    </label>
  )
}
```

2) Uso con estado no controlado (default)

```tsx
import React from "react"
import { Checkbox } from "@/components/ui/checkbox"

function TermsToggle() {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Checkbox defaultChecked={false} aria-label="Suscripción" />
      Suscribirme
    </label>
  )
}
```

Notas de uso:
- Se pueden añadir más props del CheckboxPrimitive.Root según la API del paquete base-ui para manejo de estado, eventos y accesibilidad.
- El componente acepta className para personalización.

---

## Notas técnicas

- Este Checkbox es un wrapper que garantiza consistencia visual y semántica en toda la aplicación.
- El uso de Data Slots (data-slot) facilita pruebas y mapear partes del componente en herramientas de UI.
- La clase principal del Root incluye estilos para:
  - Disposición y tamaño (peer relative flex items center, etc.)
  - Bordes y fondo acorde al tema (border-input, dark:bg-input/30, etc.)
  - Respuesta a estados de focus (focus-visible:border-ring, focus-visible:ring-3, etc.)
  - Estados deshabilitados (disabled:cursor-not-allowed, disabled:opacity-50)
  - Estados de validación aria-invalid (aria-invalid:...)
  - Variantes de estado marcado (data-checked:border-primary, data-checked:bg-primary, data-checked:text-primary-foreground)
- El indicador (CheckboxPrimitive.Indicator) está configurado para centrar el icono y ajustar su tamaño mediante la directiva de clase [&>svg]:size-3.5.
- El icono CheckIcon se renderiza cuando el estado está marcado; si el estado no está marcado, no se muestra contenido adicional en el Indicator.
- No hay lógica de estado local en este archivo; la gestión del estado se delega al usuario a través de props pasados al Root.

Limitaciones conocidas:
- El archivo depende de la API de CheckboxPrimitive.Root de @base-ui/react/checkbox; cambios en esa API podrían requerir actualización de este wrapper.
- El tamaño y el aspecto están fuertemente ligados a las clases de Tailwind y al sistema de diseño existente; personalizaciones profundas podrían requerir ajuste de las clases en la cadena de clase.

---

## Última actualización

29/5/2026

---