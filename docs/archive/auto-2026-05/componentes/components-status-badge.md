## Descripción general

StatusBadge es un componente de React escrito en TypeScript que renderiza un badge (etiqueta) estilizado para representar el estado de una entidad (orden, reserva, etc.) dentro de RNG Vantage. El componente toma un estado (status) y lo mapea a una etiqueta legible en español, junto con estilos de Tailwind que varían según el estado y soportan modo oscuro. Este componente se utiliza para garantizar una representación visual consistente de estados en la UI.

## Responsabilidades

- Convertir un valor de estado en un label legible (en español) y en un conjunto de estilos visuales.
- Proporcionar un fallback seguro (pendiente) si el estado no es reconocible.
- Permitir extensión mediante la modificación o ampliación del mapa de estados.
- Integrarse con el componente de UI Badge y con utilidades de clase para construir la clase final del elemento.

## Props / Parámetros

- status: StatusValue | string | null (opcional)
  - Tipo: StatusValue | string | null
  - Descripción: estado que se quiere mostrar. Si el valor no está en el mapa de estados, se usa pendente por defecto.
- className: string (opcional)
  - Descripción: clases CSS adicionales para personalizar el badge, fusionadas con las clases por defecto y las del estado.

Tipo StatusValue (permitido):
- "pending"
- "active"
- "inactive"
- "expired"
- "completed"
- "cancelled"
- "failed"
- "refunded"

## Retorna

- Un elemento Badge (componente UI) con:
  - variant="outline"
  - className: combinación de clases base, las específicas del estado y cualquier className adicional pasado por props
  - contenido: label en español correspondiente al estado

Formato devuelto:
- <Badge variant="outline" className="...">Label</Badge>

La etiqueta mostrada para cada estado se gestiona mediante el mapa statusMap, y si el estado no es reconocido se utiliza "Pendiente".

## Dependencias

- "@/components/ui/badge" (componente Badge)
- "@/lib/utils" (función cn para combinar clases)
- Tipos y estructuras: StatusValue y statusMap en este archivo

Notas:
- Los estilos por estado están definidos explícitamente en statusMap y aprovechan Tailwind CSS con variantes para modo claro/oscuro.
- El mapeo de estados a labels está en español para consistencia de la interfaz de usuario.

## Ejemplos de uso

Ejemplo mínimo:
- Mostrar un badge para un estado activo
  - <StatusBadge status="active" />

Ejemplos con estilo adicional:
- Agregar margen adicional y mantener el estilo del estado
  - <StatusBadge status="expired" className="mt-2" />

Ejemplo con valor no reconocido:
- Se mostrará Pendiente por defecto
  - <StatusBadge status="unknown" />

Ejemplo sin props (default):
- Se mostrará Pendiente por defecto
  - <StatusBadge />

## Notas técnicas

- Lógica de selección de estado:
  - Se verifica si status es una clave válida dentro de statusMap. Si es válido, se usa ese valor; de lo contrario, se optiona "pending".
  - Implementación: const key = status && status in statusMap ? (status as StatusValue) : "pending";
- Tipado:
  - StatusValue es un union estricto de valores conocidos. El prop status admite string o null para permitir casos donde no hay estado definido.
- Rendimiento:
  - El componente realiza un acceso directo a un mapa (O(1)) para obtener label y clases; no hay renderizaciones adicionales ni efectos secundarios.
- Estilo:
  - Usa clases de Tailwind para estilos de fondo, texto y borde, con variantes específicas para cada estado y soporte de modo oscuro.
  - El badge base incluye formato tipográfico consistente (font-spaceGrotesk, tamaño, mayúsculas, tracking).
- Extensibilidad:
  - Para soportar nuevos estados, basta con extender statusMap con la nueva clave de StatusValue y sus label/clases correspondientes.
- Dependencias de diseño:
  - Requiere el componente Badge y la utilidad de concatenación de clases (cn). Asegúrate de que estén disponibles y correctamente importados en el proyecto.

## Última actualización

29/5/2026

Si necesitas adaptar el comportamiento para otros tipos de entidades o añadir más estados, dime qué valores quieres soportar y los estilos correspondientes, y puedo ayudarte a actualizar la documentación o el código.