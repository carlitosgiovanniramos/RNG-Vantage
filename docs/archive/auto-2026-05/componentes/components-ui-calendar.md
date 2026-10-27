# RNG Vantage - calendar.tsx (components/ui/calendar.tsx)

Documento técnico para el archivo calendar.tsx del proyecto RNG Vantage.

Fecha de última actualización: 29/5/2026

---

## Descripción general

Este archivo define dos componentes React:

- Calendar: un calendario interactivo basado en react-day-picker, con extensas personalizaciones visuales y de comportamiento. Integra el sistema de estilos propio de la aplicación (cn, Button) y soporta opciones de localización, formateo y componentes sustituidos para adaptar la apariencia.
- CalendarDayButton: un Button personalizado que renderiza cada día dentro del DayPicker, añadiendo datos y estilos específicos para gestionar estados como selección simple, rangos y foco.

El objetivo es proporcionar un selector de fechas rico en funcionalidades (incluido soporte para rangos y selección única) con una apariencia coherente con el resto de la UI, comportamiento accesible y compatibilidad con distintos locales.

---

## Responsabilidades

- Proveer un calendario reutilizable para selección de fechas dentro de la app.
- Integrar DayPicker de react-day-picker con estilos y comportamientos propios:
  - Soporte para mostrar días fuera del mes.
  - Cabeceras, navegación y dropdowns de mes.
  - Personalización de componentes (Root, Chevron, DayButton, WeekNumber).
- Gestionar la renderización de cada día a través de CalendarDayButton, que a su vez utiliza el Button del sistema de UI y añade estados visuales para rangos y selección.
- Soportar localización y formato de meses/días a través de locale y formatters personalizados.
- Mantener compatibilidad con RTL (derecha a izquierda) mediante clases específicas.
- Exponer el componente para uso en otras partes de la app (export { Calendar, CalendarDayButton }).

---

## Props / Parámetros

Nota: Este componente es React y está tipado con TypeScript. Las props combinan las de DayPicker con algunas props propias añadidas.

### Calendar (exportado)

Propiedades derivadas de DayPicker, más:

- className: string | undefined
  - Clase adicional para el contenedor del DayPicker.
- classNames: Partial<React.ComponentProps<typeof DayPicker>["classNames"]> | undefined
  - Mapa de clases para personalizar estilos específicos de DayPicker.
- showOutsideDays: boolean (default: true)
  - Muestra los días que están fuera del mes actual.
- captionLayout: "label" | "dropdown" (default: "label")
  - Disposición de las cabeceras de mes (etiqueta o dropdown).
- buttonVariant: Button["variant"] (default: "ghost")
  - Variante del Button utilizado para los días. Se propaga al botón de navegación (anterior/siguiente) a través de la construcción de classNames.
- locale: Locale | undefined
  - Objeto de locale para formateos y textos.
- formatters: Record<string, (date: Date) => string> | undefined
  - Objeto de formateadores. Se extienden con:
    - formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "short" })
- components: Partial<DayPickerProps["components"]> | undefined
  - Permite anular los componentes de DayPicker (Root, Chevron, DayButton, WeekNumber, etc.)
- …props: React.ComponentProps<typeof DayPicker>
  - Todas las demás props de DayPicker, que se envían sin modificaciones.

Ejemplo de uso típico:
- <Calendar locale={locale} showOutsideDays={true} captionLayout="dropdown" />

### CalendarDayButton (internal, no exportado por defecto)

Propiedades:

- className: string | undefined
  - Clases adicionales para el botón del día.
- day: DayButton["day"]
  - Objeto con información de la fecha representada por este botón.
- modifiers: DayButton["modifiers"]
  - Modificadores que indican estados (selected, range_start, range_end, range_middle, focused, etc.).
- locale: Partial<Locale> | undefined
  - Locale para formateos.
- props: React.ComponentProps<typeof DayButton>
  - Propiedades pasadas al DayButton original de react-day-picker.

Comportamiento clave:
- Gestiona el enfoque automático cuando modifiers.focused cambia.
- Renderiza un Button (del UI propio) con múltiples data-attributes para estados (day, range_start, range_end, range_middle, selected-single).
- Aplica clases que fusionan estilos por defecto de DayPicker con las clases propias definidas para la app.

---

## Retorna

- Calendar: JSX.Element que representa un DayPicker completamente configurado y estilizado, con:
  - Cabeceras, navegación y cuadrícula de días.
  - Personalización de componentes (Root, Chevron, DayButton, WeekNumber) para adaptarse al diseño de la app.
  - Formateo de mes y texto en el header según locale.
  - Soporte para rangos y selección única mediante DayButton personalizado.
- CalendarDayButton: JSX.Element (Button) utilizado para cada día dentro del DayPicker, con estilos y data-attributes para estados de selección y rango.

La salida es renderizada en el árbol de UI de la aplicación donde se importe.

---

## Dependencias

- react-day-picker
  - Proporciona DayPicker, getDefaultClassNames, DayButton, Locale, y el mecanismo de componentes personalizados (Root, Chevron, DayButton, WeekNumber, etc.).
- lucide-react
  - Iconos utilizados para las flechas de navegación (ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon).
- cn (utilidad de clases)
  - Combina múltiples strings de clase de forma segura.
- Button (componentes/ui/button)
  - Botón reutilizable de la UI de la app. Se usa dentro de CalendarDayButton para renderizar cada día.
- Otros: Tipos y utilidades de la app (p. ej. tokens CSS y clases como --cell-size, --cell-radius) usados a través de classNames y cn.

Notas:
- La implementación utiliza getDefaultClassNames() para heredar las clases por defecto de DayPicker y luego extiende/overrides para adaptar al diseño de la app.
- Se definen estilos complejos con clases de utilidad (parecidas a Tailwind) y tokens CSS variables para tamaño, radio y colores.

---

## Ejemplos de uso

- Importación y uso básico:

  - import { Calendar } from "@/components/ui/calendar";

  - const locale = { code: "es" }; // ejemplo de locale
  - <Calendar locale={locale} showOutsideDays={true} captionLayout="dropdown" />

- Uso con formato personalizado y variantes:

  - <Calendar
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: "long" }),
      }}
      buttonVariant="ghost"
    />

- Reemplazo de componentes (avanzado):

  - <Calendar
      locale={locale}
      components={{
        DayButton: (props) => <CalendarDayButton locale={locale} {...props} />,
      }}
    />

---

## Notas técnicas

- Integración y personalización de DayPicker:
  - Se utiliza getDefaultClassNames para obtener las clases base de DayPicker y se las extiende mediante classNames para adaptar la UI.
  - Los nombres de clases se componen con la utilidad cn y se apoyan en tokens CSS (p. ej., --cell-size, --cell-radius) para mantener consistencia visual.
  - RTL: se insertan reglas específicas para RTL usando expresiones String.raw para aplicar rotaciones a flechas cuando la dirección es RTL.

- Componentes sustituidos:
  - Root: envuelto en un div con data-slot="calendar" para mantener compatibilidad con slots de DayPicker.
  - Chevron: renderiza los iconos de navegación (izquierda, derecha y abajo) mediante lucide-react.
  - DayButton: reimplementado como CalendarDayButton para aplicar estilos y atributos de datos personalizables.
  - WeekNumber: renderizado en una celda con estructura específica para alinear números de semana.

- Gestión de foco:
  - CalendarDayButton utiliza un useEffect para enfocar el botón si modifiers.focused es true. Esto mejora la accesibilidad y la navegación con teclado.

- Accesibilidad y atributos de datos:
  - Los DayButton renderizados exponen data-attributes como data-day, data-selected-single, data-range-start, data-range-end, data-range-middle para facilitar estilos y pruebas.
  - Se utilizan roles y propiedades de DayPicker para mantener compatibilidad con lectores de pantalla.

- Formateo de meses:
  - formatMonthDropdown se define para devolver un mes abreviado según locale.code, mejorando la legibilidad en el dropdown de mes.

- Compatibilidad con rangos:
  - Los modificadores (range_start, range_end, range_middle) se utilizan para aplicar estilos distintos a los días conforme a la selección de rango.

- Rendimiento y mantenibilidad:
  - No se observa memoización explícita de los componentes; cada renderizado depende de los props de DayPicker.
  - La personalización está centralizada en el archivo, facilitando cambios de estilo futuros sin necesidad de tocar lógica de negocio.

- Limitaciones:
  - La documentación refleja exactamente lo que el código implementa. No se asume soporte de funcionalidades no presentes en el archivo.
  - Si se requiere una lógica de selección fuera de lo soportado por DayPicker (nuevas modalidades de selección), habría que extender props y/o componentes.

---

## Última actualización

29/5/2026

---

Si necesitas ejemplos adicionales o una guía de migración para cambiar la versión de react-day-picker, puedo prepararte una sección adicional con pasos detallados.