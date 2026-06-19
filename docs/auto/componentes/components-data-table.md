# DataTable (components/data-table.tsx)

Este archivo define un componente genérico de tabla con capacidad de filtrado, paginación y renderizado personalizado por columna. Es utilizado para mostrar datasets de forma organizada y navegable dentro de RNG Vantage.

## Descripción general

DataTable es un componente React cliente que renderiza una tabla basada en un conjunto de datos genérico T[], con:

- Cabeceras configurables por columna.
- Filtrado en cliente que busca texto en todas las columnas.
- Paginación con tamaño de página configurable.
- Renderización customizada de celdas por columna (opcional).
- Estilos consistentes con el tema de UI de la aplicación (usando componentes UI y utilidades de clase).

La implementación favorece la reutilización sobre diferentes tipos de datos, permitiendo especificar cómo se deben renderizar las celdas de cada columna.

## Responsabilidades

- Renderizar una barra de filtrado y mostrar la cantidad de resultados.
- Generar filtrado en cliente para el conjunto de datos, buscando el texto ingresado en cualquier valor de la fila.
- Implementar paginación del conjunto filtrado, con cálculo de páginas y navegación entre ellas.
- Renderizar una tabla con cabeceras configurables, filas de datos y celdas que soportan renderización personalizada.
- Manejar el estado de página y filtro de forma aislada dentro del componente.
- Proporcionar una experiencia de usuario consistente con el tema visual de la aplicación (tipografías, colores, tamaños, etc.).

## Props / Parámetros

### DataTableColumn<T>

Tipo de una columna de la tabla. Define cómo se debe mostrar cada columna en una fila.

- key: keyof T | string
  - Clave de la fila que corresponde a esta columna (si no se usa render, se mostrará el valor convertido a string a partir de esta clave).
  - Requerido.
- header: string
  - Título de la columna mostrado en la cabecera.
  - Requerido.
- className?: string
  - Clases CSS opcionales aplicadas a la celda de cabecera (y también se utilizan para las celdas cuando renderiza).
- render?: (row: T) => React.ReactNode
  - Función opcional para renderizar el contenido de la celda a partir de la fila actual.
  - Si se proporciona, se usa para renderizar la celda; de lo contrario se intenta mostrar el valor de row[column.key].

### DataTableProps<T extends Record<string, unknown>>

- data: T[]
  - Conjunto de datos a visualizar. Requerido.
- columns: DataTableColumn<T>[]
  - Configuración de las columnas (cabeceras y renderizado). Requerido.
- pageSize?: number
  - Tamaño de página (número de filas por página). Opcional; valor por defecto: 10.
- filterPlaceholder?: string
  - Texto de placeholder del input de filtrado. Opcional; valor por defecto: "Filtrar...".
- className?: string
  - Clases CSS adicionales para el contenedor principal del componente. Opcional.

Notas sobre el comportamiento de las props:
- El filtrado es sensible a todos los valores de la fila. Se convierten a cadena, se normalizan a minúsculas y se verifica si incluyen la consulta.
- Si no hay resultados tras el filtrado, se muestra una fila indicando “Sin resultados”.
- El paginado se recalcula ante cambios en el conjunto filtrado; la página actual se mantiene dentro del rango válido y se reinicia a la primera página al cambiar el filtro.

## Retorna

DataTable<T> devuelve un ReactElement que renderiza:

- Un panel superior con un Input de filtrado y un contador de resultados.
- Una tabla estructurada con:
  - TableHeader y TableRow para las cabeceras, renderizando cada columna con TableHead.
  - TableBody con filas paginadas; cada fila utiliza TableRow y, dentro, TableCell para cada columna.
  - Un posible estado de “Sin resultados” si no hay filas para renderizar.
- Un panel inferior con información de la página actual y controles de navegación (Anterior y Siguiente).
- Comportamiento de paginación: Actualiza la página al usar los botones, deshabilitando cuando no hay página previa/siguiente.

Formato de salida en pantalla:
- Texto en español para indicadores de paginación y acciones (Página X de Y, Anterior, Siguiente, Filtrar..., Sin resultados).

## Dependencias

- React (hooks: useMemo, useState)
- Componentes UI internos:
  - Button, Input
  - Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- Utilidades:
  - cn (función de concatenación de clases)
- Tipado genérico de TypeScript:
  - DataTableColumn<T>, DataTableProps<T>

Notas sobre dependencias externas:
- Los componentes UI (Button, Input, Table) se importan desde la ruta de componentes de UI del proyecto ( "@/components/ui/..." ).
- La utilidad cn se importa de "@/lib/utils" para construir clases condicionales.

## Ejemplos de uso

Ejemplo mínimo (sin render personalizado):

```tsx
import { DataTable, DataTableColumn } from "@/components/data-table"; // o ruta correcta según el proyecto

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  { id: 1, name: "Ana García", email: "ana@example.com" },
  { id: 2, name: "Luis Pérez", email: "luis@example.com" },
  { id: 3, name: "Marta Ruiz", email: "marta@example.com" },
];

const columns: DataTableColumn<User>[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Nombre" },
  { key: "email", header: "Correo" },
];

// En algún render/layout
<DataTable data={users} columns={columns} />
```

Ejemplo con render personalizado:

```tsx
const columns: DataTableColumn<User>[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Nombre", render: (row) => <span className="font-semibold">{row.name}</span> },
  { key: "email", header: "Correo" },
];
```

Este enfoque permite que una columna muestre contenido distinto al valor bruto de la fila, por ejemplo con estilos, componentes o enlaces.

## Notas técnicas

- Comportamiento de filtrado:
  - El filtrado realiza una búsqueda en todas las columnas de cada fila.
  - Si no hay texto de filtro, se devuelve la data original sin cambios.
  - El estado de página se resetea a 1 cuando el usuario cambia el texto de filtrado.
- Paginación:
  - pageSize por defecto es 10.
  - totalPages se calcula como max(1, ceil(filteredData.length / pageSize)).
  - currentPage se ajusta para no exceder totalPages.
  - Los controles de navegación deshabilitan buttons apropiadamente (Anterior deshabilitado en la primera página, Siguiente deshabilitado en la última).
- Rendering de celdas:
  - Si una columna define render, se usa render(row).
  - En ausencia de render, se muestra String(row[column.key as keyof T] ?? "").
  - El key de las filas utiliza el índice de la iteración (index) para ayudar a React a identificar filas; esto puede tener implicaciones si el orden de filas cambia dinámicamente. En escenarios con reordenamientos o filas dinámicas críticas, podría considerarse usar un identificador único de la fila (si está disponible) como key.
- Rendimiento:
  - useMemo se utiliza para evitar recomputaciones de filtrado y paginación a menos que data, filter, currentPage o pageSize cambien.
  - El filtrado en cliente implica recorrer todas las filas y, para cada una, valores de todas las columnas, lo que puede impactar en datasets muy grandes.
- Estilos:
  - Las clases CSS siguen el esquema de Tailwind CSS o utilidades similares, con nombres como border-border, bg-card, text-foreground, etc. Esto depende del tema del proyecto.
  - La apariencia está diseñada para integrarse con el diseño existente del proyecto RNG Vantage.

## Última actualización

12/5/2026

---

Si necesitas, puedo adaptar la documentación para un formato específico (por ejemplo, para una wiki interna o para una página de referência de componentes) o añadir ejemplos más complejos (por ejemplo, con selección de filas, acciones por fila o integración con API).