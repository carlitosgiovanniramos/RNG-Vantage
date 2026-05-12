# Documentación técnica: calendar.tsx (components/ui/calendar.tsx)

Este archivo implementa un calendario reutilizable basado en react-day-picker, adaptado al estilo y componentes de la tienda RNG Vantage. Es un componente cliente (cliente de Next.js) que envuelve DayPicker para integrar con el sistema de UI propio (Botón, variantes, estilos y utilidades).

- Archivo: components/ui/calendar.tsx
- Nombre exportado: Calendar, CalendarDayButton
- Total de líneas: 222

---

## Descripción general

Calendar es un wrapper de DayPicker que aporta:
- Estilos consistentes con el diseño del proyecto (utilizando la utilidad de classNames cn y getDefaultClassNames de react-day-picker).
- Integración con el componente Button propio del proyecto para renderizado de cada día (CalendarDayButton).
- Soporte para locale y formateadores personalizados.
- Personalización de la estructura interna mediante la propiedad components de DayPicker (Root, Chevron, DayButton, WeekNumber, etc.).
- Opciones de configuración para mostrar días fuera del mes, layout del caption y variantes de botones.

En resumen, es un calendario estilizado y fácilmente integrable con la UI existente, manteniendo compatibilidad con las props de DayPicker.

---

## Responsabilidades

- Proveer una implementación de calendario basada en DayPicker con estilos y comportamiento predefinidos para el proyecto RNG Vantage.
- Expone una interfaz extensible a través de:
  - Props de DayPicker (extendidas).
  - Props propias de estilo y comportamiento (showOutsideDays, captionLayout, buttonVariant, locale, formatters, components).
- Implementar un botón de día (CalendarDayButton) que utiliza el componente Button del proyecto para mayor consistencia visual.
- Gestionar foco en el día seleccionado mediante modifiers.focussed.
- Soportar RTL (derecha a izquierda) mediante clases específicas para las flechas de navegación.

---

## Props / Parámetros

El componente Calendar extiende las props de DayPicker y añade una prop adicional para el estilo del botón.

- CalendarProps (combinación de React.ComponentProps<typeof DayPicker> y props propias):
  - className?: string
    - Clases CSS adicionales para el contenedor principal de DayPicker.
  - classNames?: Partial<Record<string, string>>
    - Mapeo para personalizar clases de las distintas partes de DayPicker (root, months, month, nav, button_previous, button_next, month_caption, dropdowns, dropdown_root, dropdown, caption_label, table, weekdays, weekday, week, week_number_header, week_number, day, range_start, range_middle, range_end, today, outside, disabled, hidden, etc.). Se extiende con defaultClassNames y con los valores de defaultClassNames obtenidos de DayPicker.
  - showOutsideDays?: boolean (default: true)
    - Indica si se deben mostrar los días fuera del mes actual.
  - captionLayout?: string (default: "label")
    - Layout del caption de DayPicker (valor utilizado por DayPicker; por defecto "label").
  - locale?: Locale
    - Objeto de configuración regional utilizado para formateos y textos.
  - formatters?: Record<string, (date: Date) => string> | undefined
    - Funciones de formateo para diferentes partes del calendario. Se añade un formatter por defecto para formatMonthDropdown que usa date.toLocaleString con locale.code.
  - components?: Partial<React.ComponentProps<typeof DayPicker>["components"]> | undefined
    - Permite sobreescribir componentes internos de DayPicker (Root, Chevron, DayButton, WeekNumber, etc.).
  - buttonVariant?: React.ComponentProps<typeof Button>["variant"] (opcional)
    - Variante del botón del DayButton (utilizado dentro de CalendarDayButton). Valor por defecto: "ghost".
  - ...props (rest: React.ComponentProps<typeof DayPicker>)
    - Propiedades adicionales de DayPicker que no hayan sido enumeradas explícitamente.

Notas:
- El componente está construido para que el DayPicker pueda ser configurado de forma rica, manteniendo un diseño coherente con el resto de la UI del proyecto.
- La prop buttonVariant controla visualmente los botones de navegación y de día, integrándose con el color y estilo del botón del proyecto.

---

## Retorna

- Retorna un elemento React (JSX.Element) que representa el DayPicker configurado con:
  - Estilo y estructura personalizados (classNames, Root, Chevron, DayButton, WeekNumber, etc.).
  - Formateadores personalizados (con soporte para locale).
  - Composición de componentes interna para total flexibilidad.
  - Propagación de cualquier prop de DayPicker recibido.

En concreto, el componente devuelve:

- Un DayPicker configurado con:
  - showOutsideDays, captionLayout, locale, formatters, classNames.
  - Components personalizados (Root, Chevron, DayButton, WeekNumber) y otros componentes sobreescritos.
  - Propagación de {...props} al DayPicker final.

---

## Dependencias

Este archivo depende de varias piezas del ecosistema y del proyecto:

- React (cliente; usa hooks y JSX)
- react-day-picker
  - Provee DayPicker, getDefaultClassNames, y tipos DayButton y Locale.
- lucide-react
  - Provee ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon.
- cn (utility de concatenación de clases)
  - importado desde "@/lib/utils".
- Button y buttonVariants
  - importados desde "@/components/ui/button".
- Biblioteca de utilidades del proyecto
  - Uso de variables de CSS como --cell-size, --cell-radius, --radius-md, etc. a través de classNames.
- Locale y formatters
  - Soporta locales y formateos para Month dropdown.

---

## Ejemplos de uso

Ejemplo 1: Uso básico con locale

```tsx
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"

function EjemploCalendario() {
  // Suponiendo que ya tienes un locale preparado similar a la estructura de react-day-picker
  const locale = { code: "es-ES", ...es }

  return (
    <div>
      <Calendar locale={locale} showOutsideDays />
    </div>
  )
}
```

Ejemplo 2: Personalización del botón y override de componentes

```tsx
import { Calendar } from "@/components/ui/calendar"

function CalendarioPersonalizado() {
  return (
    <Calendar
      buttonVariant="outline" // Variante para los DayButtons
      locale={{ code: "en-US" }}
      components={{
        // Sobre-escribir, por ejemplo, WeekendDays o WeekNumber si se desea
      }}
    />
  )
}
```

Ejemplo 3: Uso con formatters personalizados

```tsx
<Calendar
  locale={{ code: "en-US" }}
  formatters={{
    formatMonthDropdown: (date) => date.toLocaleString('en-US', { month: 'short' }),
  }}
/>
```

Notas sobre los ejemplos:
- Los ejemplos asumen que la configuración de locale sigue el formato soportado por react-day-picker.
- Se puede extender o sobreescribir casi cualquier parte del DayPicker mediante la prop components y classNames.

---

## Notas técnicas

- Cliente y rendimiento:
  - Este archivo está marcado como "use client", lo que lo habilita para ejecución en el cliente en Next.js. Esto facilita el manejo de foco y la interacción de usuario ( DayButton con foco ).
  - CalendarDayButton utiliza un ref para gestionar el foco cuando modifiers.focused cambia. Esto mejora la accesibilidad y la experiencia de navegación con teclado.

- Estilos y theming:
  - Se aprovecha getDefaultClassNames de react-day-picker para obtener las clases base del calendario y fusionarlas con estilos propios mediante la utilidad cn.
  - Los estilos usan variables CSS (p. ej. --cell-size, --cell-radius) para una mayor consistencia y adaptabilidad a temas.
  - Soporte RTL: se aplican transformaciones específicas cuando la dirección es RTL, asegurando que las flechas de navegación se roten adecuadamente.

- Composición y extensibilidad:
  - El componente expone la propiedad components para reemplazar o extender componentes internos de DayPicker (Root, Chevron, DayButton, WeekNumber, etc.).
  - DayButton se reemplaza por CalendarDayButton, que a su vez utiliza el Button del proyecto para mantener consistencia visual y comportamental.
  - WeekNumber se renderiza con una celda personalizada para alinear el contenido.

- Accesibilidad:
  - Día seleccionado y rangos se comunican a través de data-attributes, lo que facilita estilos y posibles pruebas.
  - CalendarDayButton maneja foco para accesibilidad y usabilidad.

- Mantenibilidad y compatibilidad:
  - El componente actúa como puente entre DayPicker y el estilo global de RNG Vantage, de modo que cambios en el UI pueden centralizarse en este wrapper.
  - Mantiene compatibilidad con todas las props de DayPicker, permitiendo a usuarios avanzados ajustar comportamientos sin perder integridad visual.

- Limitaciones:
  - La prop classNames y className requieren conocimiento de la estructura de DayPicker para un override efectivo; se recomienda utilizar las claves provistas (root, months, month, nav, etc.) para cambios de estilo.
  - El formulario de locale depende de la configuración que DayPicker espera; si se utilizan locales no soportados, puede haber comportamientos inesperados.

- Última mención de compatibilidad:
  - Dado que se depende de react-day-picker para la lógica del calendario, cualquier cambio mayor en esa librería podría requerir ajustes en este wrapper.

---

## Última actualización

12/5/2026

---

Si necesitas ampliación en alguna sección (por ejemplo, un diagrama de flujo de props, o un checklist de pruebas), puedo añadirlo.