# DataTable - RNG Vantage

Documentación técnica del archivo: `components/data-table.tsx` (data-table.tsx)

Fecha de última actualización: 29/5/2026

## Descripción general

DataTable es un componente React de tipo cliente (cliente Next.js) que proporciona una tabla genérica y reutilizable con:
- filtrado global por texto
- paginación (configurable por página)
- renderizado personalizado de celdas mediante una función de renderizado por columna
- encabezados y estilo consistentes a través de componentes UI ya existentes en el proyecto

El componente está diseñado para funcionar con cualquier tipo de dato T que extienda un objeto de clave-valor, permitiendo definir columnas dinámicas y personalizar la visualización de cada fila.

Propósito dentro del proyecto:
- Ofrece una tabla estandarizada para mostrar datasets en varias pantallas (listados de ventas, reservas, finanzas, etc.) con búsqueda rápida y paginación sin dependencia de backend adicional.
- Mantener la consistencia visual y el comportamiento (estilos, inicialización de estados, interacción) a través de la aplicación.

## Responsabilidades

- Gestionar estado de la paginación (página actual) y del filtro de búsqueda.
- Filtrar datos de forma global sobre todas las celdas de cada fila.
- Calcular páginas totales y seleccionar el subconjunto de datos a renderizar en la página actual.
- Renderizar una tabla con columnas dinámicas definidas por el usuario.
- Soportar renderización personalizada de celdas por columna.
- Proveer una UI de filtrado y una barra de paginación con botones de navegación.

## Props / Parámetros

El componente tiene dos tipos principales de props: DataTable y DataTableColumn. A continuación se detallan.

### DataTable<T extends Record<string, unknown>> (componente)

- data: T[]
  - Descripción: arreglo de datos a mostrar en la tabla.
  - Tipo: array de objetos genéricos.
  - Requerido: Sí
- columns: DataTableColumn<T>[]
  - Descripción: definición de columnas que se mostrarán en la tabla.
  - Tipo: arreglo de DataTableColumn
  - Requerido: Sí
- pageSize?: number
  - Descripción: tamaño de página para la paginación.
  - Tipo: number
  - Valor por defecto: 10
  - Requerido: No
- filterPlaceholder?: string
  - Descripción: texto de placeholder para el input de filtrado.
  - Tipo: string
  - Valor por defecto: "Filtrar..."
  - Requerido: No
- className?: string
  - Descripción: clases CSS para el contenedor principal del componente.
  - Tipo: string
  - Requerido: No

### DataTableColumn<T> (definición de columna)

- key: keyof T | string
  - Descripción: clave del objeto de datos que corresponde a esta columna.
  - Tipo: keyof T | string
  - Requerido: Sí
- header: string
  - Descripción: texto mostrado en el encabezado de la columna.
  - Tipo: string
  - Requerido: Sí
- className?: string
  - Descripción: clases CSS para la celda/columna.
  - Tipo: string
  - Requerido: No
- render?: (row: T) => React.ReactNode
  - Descripción: función opcional para renderizar el contenido de la celda de una fila específica.
  - Tipo: (row: T) => React.ReactNode
  - Requerido: No
  - Si está presente, se utiliza en lugar del valor por defecto de la columna.

## Retorna

DataTable<T> devuelve un JSX que representa:
- Un contenedor con filtrado y resultados, seguido de la tabla y, finalmente, la barra de paginación.
- Normalmente renderiza:
  - Un input de búsqueda con icono de búsqueda (lucide-react) y placeholder configurable.
  - Un panel de “Resultados” que muestra la cantidad de filas filtradas.
  - Una tabla con encabezados estáticos basados en columns y filas basadas en el subconjunto filtrado y paginado de data.
  - Un estado de "Sin resultados" cuando no hay filas para mostrar.
  - Navegación de página con botones Anterior y Siguiente (deshabilitados en extremos).

La estructura visual depende de los componentes UI de la aplicación (Table, TableHeader, TableRow, TableCell, Button, Input, etc.).

## Dependencias

Este archivo depende de varias librerías y componentes, entre ellos:

- React (useMemo, useState)
- lucide-react (Search icon)
- Componentes UI internos:
  - Button (importado desde @/components/ui/button)
  - Input (importado desde @/components/ui/input)
  - Table, TableBody, TableCell, TableHead, TableHeader, TableRow (importados desde @/components/ui/table)
- Utilidad de clases
  - cn (importado desde @/lib/utils) para concatenar clases CSS de manera segura
- Tipado TypeScript:
  - DataTableColumn<T>
  - DataTableProps<T>

Notas sobre dependencias:
- El componente hace uso de estilos y clases CSS predefinidas en la base de diseño del proyecto (ej., font-family, colores de fondo, bordes, etc.) a través de las clases de Tailwind u otra capa de estilos que define la UI.
- No realiza llamadas a APIs ni lógica de negocio aparte del filtrado y el paginado en el cliente.

## Ejemplos de uso

A continuación se muestra un ejemplo práctico de uso del DataTable con un dataset de usuarios:

```tsx
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const users: User[] = [
  { id: 1, name: "Ana López", email: "ana@example.com", role: "Administrador" },
  { id: 2, name: "Carlos Díaz", email: "carlos@example.com", role: "Venta" },
  // … más usuarios
];

const columns: DataTableColumn<User>[] = [
  { key: "id", header: "ID" },
  { key: "name", header: "Nombre" },
  { key: "email", header: "Correo" },
  {
    key: "role",
    header: "Rol",
    render: (row) => <span className="font-semibold">{row.role}</span>,
  },
];

function UsuariosTable() {
  return (
    <DataTable<User>
      data={users}
      columns={columns}
      pageSize={5}
      filterPlaceholder="Buscar usuarios..."
    />
  );
}
```

Notas del ejemplo:
- Se define un tipo User y un conjunto de columnas. 
- Se utiliza render para personalizar la visualización de la columna Role.
- Se especifica pageSize para controlar cuántos registros se muestran por página.
  
## Notas técnicas

- Generics y tipado:
  - DataTable es genérico en T extends Record<string, unknown>, lo que permite usar cualquier tipo de fila siempre que sea un objeto.
  - DataTableColumn<T> permite especificar el key como keyof T o string, de modo que se pueda mapear a claves existentes o definir claves dinámicas cuando sea necesario.
- Rendering de celdas:
  - Si una columna tiene render, el contenido de la celda se renderiza con render(row).
  - En ausencia de render, se muestra el valor por defecto extraído como String(row[column.key as keyof T] ?? "").
- Filtrado:
  - El filtrado es global, recorriendo todos los valores de cada fila (Object.values(row)) y haciendo una inclusión basada en cadena en minúsculas.
  - El filtro es sensible a presencia de valores nulos/undefined, que se convierten en cadenas vacías para la comparación.
- Paginación:
  - pageSize por defecto es 10.
  - Se calculan totalPages y currentPage para evitar out-of-range y para mantener la experiencia de usuario estable al cambiar datos o filtros.
  - Los botones de navegación deshabilitan cuando se alcanza la primera o la última página.
- Renderización de la tabla:
  - Encabezados generados dinámicamente a partir de columns.
  - Filas generadas a partir de la porción paginada de data.
  - Manejo de “Sin resultados” cuando no hay filas que mostrar.
- Estilos:
  - El componente usa cn para concatenar clases y aplica estilos consistentes con el diseño del proyecto (colores, shadows, bordes, etc.).
  - Las clases están distribuidas para un layout responsive, con barra de filtros adaptándose a pantallas pequeñas y a pantallas grandes.

## Última actualización

29/5/2026

Si necesitas adaptar el DataTable a casos específicos (p. ej., cargar datos desde una API, añadir clasificación por columnas, o habilitar selección de filas), puedo ayudarte a extender este componente manteniendo la compatibilidad con el diseño existente.