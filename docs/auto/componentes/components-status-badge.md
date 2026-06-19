## Descripción general

El archivo components/status-badge.tsx define el componente StatusBadge, un componente de presentación que renderiza un distintivo de estado (badge) para representar el estado de pedidos, reservas u otros procesos dentro de RNG Vantage. El badge utiliza un mapeo estático statusMap para traducir un valor de estado a una etiqueta legible en español y a estilos visuales consistentes (colores y fondo) adaptados a temas claro/oscuro. Si se pasa un valor de estado no reconocido, el componente cae de forma segura a Pendiente.

El componente se apoya en:
- Badge: componente de UI para mostrar el distintivo.
- cn: utilidad de combinación de clases CSS.

Este enfoque facilita la consistencia visual y simplifica la adición de nuevos estados en el futuro mediante la extensión de statusMap.

## Responsabilidades

- Interpretar un valor de estado (status) y seleccionar la etiqueta y estilos correspondientes.
- Proporcionar un valor por defecto (pendiente) cuando el estado no es válido o no está en el mapa.
- Permitir extensibilidad mediante la prop className adicional y el uso de estilos adaptables al tema (dark mode).
- Exponer el tipo StatusValue para que otros módulos puedan reutilizar la enumeración de estados permitidos.

## Props / Parámetros

A continuación se detallan las propiedades públicas del componente StatusBadge.

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| status | StatusValue | opcional | Valor del estado a mostrar. Puede ser uno de los valores de StatusValue o cualquier cadena. Si el valor no coincide con statusMap, se renderiza como Pendiente por defecto. |
| className | string | opcional | Clases CSS adicionales para extender o sobrescribir el estilo del badge. |

Notas:
- StatusValue es un tipo exportado desde este módulo que define los estados permitidos: "pending", "active", "expired", "completed", "cancelled", "failed" y "refunded".

## Retorna

- Un elemento React (ReactElement) que representa un Badge con variante "outline".
- El texto mostrado (config.label) y la combinación de clases (config.className) se obtienen a partir de statusMap según el valor de status.
- Si status no es válido, se utiliza "pending" como clave por defecto.

Formato de retorno: un componente Badge que envuelve el texto label correspondiente.

## Dependencias

- "@/components/ui/badge" (Badge): componente de UI utilizado para renderizar el distintivo.
- "@/lib/utils" (cn): utilidad para concatenar clases CSS de forma segura.
- Tailwind CSS (implícito): clases como bg-*, text-*, dark:* y otras utilidades para estilos rápidos.
- TypeScript: tipado de StatusValue y StatusBadgeProps.

## Ejemplos de uso

Ejemplos prácticos de uso del componente:

- Uso básico con estado activo
```tsx
import { StatusBadge } from "@/components/status-badge";

<StatusBadge status="active" />
```

- Uso con estado cancelado y clases personalizadas
```tsx
import { StatusBadge } from "@/components/status-badge";

<StatusBadge status="cancelled" className="mt-2" />
```

- Uso con un valor no reconocido (se renderizará como Pendiente)
```tsx
import { StatusBadge } from "@/components/status-badge";

<StatusBadge status="unknown-status" />
```

## Notas técnicas

- Mapeo estático: statusMap es un objeto de mapeo estático que asocia cada StatusValue con una etiqueta en español y un conjunto de className para estilos visuales. Este enfoque facilita la consistencia y la extensión futura.
- Seguridad de estado: el código determina la clave a usar mediante la verificación: status && status in statusMap ? (status as StatusValue) : "pending". Esto garantiza que, si se pasa un valor no contemplado, NO se produce fallo y se muestra Pendiente.
- Personalización de estilos: además de los estilos del statusMap, se admite className adicional para sobrescribir o añadir estilos. El orden de concatenación en cn es baseStyles, config.className y luego className del usuario.
- Accesibilidad y consistencia: se utiliza el badge con variante "outline" para mantener una apariencia consistente entre estados y facilitar la lectura en diferentes fondos.
- Extensibilidad: para añadir nuevos estados, basta ampliar statusMap con una nueva clave de StatusValue y su correspondiente label y className; no se requieren cambios en la lógica de renderizado.

## Última actualización

12/5/2026

Notas finales:
- El componente es de tipo puro (sin efectos secundarios) y depende únicamente de props para su renderizado.
- No hay dependencias de estado ni efectos asincrónicos; es adecuado para su uso en listas, tablas y componentes de resumen donde se requieren indicadores de estado visuales.