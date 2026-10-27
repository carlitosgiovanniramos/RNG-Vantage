# RNG Vantage - use-admin-realtime.ts

Archivo: hooks/use-admin-realtime.ts

Formato: TypeScript, hook de React para suscripción en tiempo real.

Clasificación: Cliente (directiva "use client").

- Propósito: Proporcionar una suscripción en tiempo real a cambios en tablas específicas de PostgreSQL mediante Supabase Realtime. Al producirse cambios, invalida las consultas de React Query asociadas y, en el caso de inserciones, muestra una notificación al usuario.

---

## Descripción general

useAdminRealtime es un hook de React que se conecta a un canal de tiempo real de Supabase para una tabla administrativa específica (reservations o transactions). Cada vez que se detecta un cambio en la tabla publica, invalida una clave de consulta de React Query para forzar la recarga de datos. Si el cambio corresponde a una inserción, muestra una notificación informativa con un mensaje predefinido para ese tipo de entidad.

- Soporta dos tablas administrativas: reservations y transactions.
- Invalida las queries de React Query mediante una clave de consulta proporcionada por el usuario del hook.
- Muestra una notificación “Nueva reserva recibida” o “Nueva transacción registrada” cuando se inserta una fila.

---

## Responsabilidades

- Establecer una suscripción en tiempo real a la tabla especificada a través de Supabase Realtime.
- Invalidar la(s) consulta(s) de React Query asociadas a la clave proporcionada cuando haya cambios en la tabla.
- Mostrar una notificación de toast cuando se detecta una inserción (INSERT) en la tabla correspondiente.
- Limpiar la suscripción al desmontar el componente para evitar memory leaks.

---

## Props / Parámetros

Déficit de tipos y descripción de cada parámetro de la función:

- table: AdminTable
  - Tipo: "reservations" | "transactions"
  - Descripción: Tabla a la que se suscribe en tiempo real. Limita el hook a estas dos opciones.
- queryKey: string
  - Tipo: string
  - Descripción: Clave base utilizada para invalidar la(s) query(es) de React Query. Internamente se envuelve en un array al llamar a invalidateQueries, es decir se invalida { queryKey: [queryKey] }.

Notas:
- AdminTable está definido como un tipo discriminado:
  - reservations
  - transactions
- INSERT_LABELS es un mapeo estático para generar el texto de las notificaciones en función de la tabla.

---

## Retorna

- Retorno: void
- Formato: No devuelve valor; es un hook que registra efectos secundarios (suscripción en tiempo real) al montar y los limpia al desmontar.

---

## Dependencias

- React: useEffect
- @tanstack/react-query: useQueryClient (para invalidar consultas cacheadas)
- Sonner: toast (para notificaciones)
- use-supabase: hook personalizado que expone la instancia de Supabase para la suscripción en tiempo real
- Supabase Realtime: channel, on, subscribe, removeChannel (manejo de eventos "postgres_changes" en el esquema público de la tabla)

Resumen de flujo:
- Crear canal con nombre admin-${table}
- Suscribirse a postgres_changes para eventos de cualquier tipo en la tabla del esquema público
- Al recibir un payload:
  - invalidateQueries({ queryKey: [queryKey] })
  - si payload.eventType === "INSERT", mostrar toast.info con INSERT_LABELS[table]
- En limpieza, eliminar el canal

---

## Ejemplos de uso

Ejemplo mínimo de uso dentro de un componente cliente:

```tsx
"use client";

import { useAdminRealtime } from "@/hooks/use-admin-realtime";

export function ReservationsAdminPanel() {
  // Revalidar la lista de reservas cuando cambie la fuente de datos
  useAdminRealtime("reservations", "reservations-list");

  return (
    <div>
      {/* … contenido del panel … */}
    </div>
  );
}
```

Ejemplo adicional para transacciones:

```tsx
"use client";

import { useAdminRealtime } from "@/hooks/use-admin-realtime";

export function TransactionsAdminPanel() {
  useAdminRealtime("transactions", "transactions-list");

  return (
    <div>
      {/* … contenido del panel … */}
    </div>
  );
}
```

Notas de uso:
- queryKey debe corresponder a la clave base de la consulta que almacena los datos relevantes. El hook siempre invalidará un query con key [queryKey].
- El hook solo notifica en caso de INSERT y solo para las tablas soportadas.

---

## Notas técnicas

- Arquitectura de suscripción:
  - Se crea un canal con nombre admin-${table}, separando suscripciones por tabla para evitar interferencias.
  - Se suscribe a eventos de postgres_changes con event: "*", schema: "public" y la tabla especificada.
  - La callback maneja el payload y actualiza la cache de React Query y/o muestra notificaciones según el tipo de evento.
- Invalidation de caché:
  - Se utiliza queryClient.invalidateQueries({ queryKey: [queryKey] }) para forzar la recarga de datos de las queries relacionadas.
  - La clave de invalidación se construye a partir del parámetro queryKey (string) recibido por el hook.
- Notificaciones:
  - Para inserciones (INSERT), se muestra un toast.info con un mensaje específico:
    - reservations -> "Nueva reserva recibida"
    - transactions -> "Nueva transacción registrada"
- Limpieza de recursos:
  - Al desmontar, se llama supabase.removeChannel(channel) para evitar suscripciones huérfanas.
- Tipos y seguridad:
  - AdminTable es un tipo limitado a "reservations" o "transactions", reduciendo el riesgo de suscripciones a tablas no deseadas.
  - El hook está marcado con "use client", asegurando su uso en componentes cliente.
- Rendimiento y consideraciones:
  - Cada cambio en la tabla provoca invalidación de la consulta indicada, lo cual puede disparar re-renders si hay componentes suscritos a esa clave.
  - La suscripción se mantiene activa mientras el componente esté montado; la limpieza es necesaria para evitar fugas de memoria.
- Limitaciones:
  - El hook está diseñado para tablas específicas y para eventos en el esquema público. No maneja otros esquemas o tablas fuera de las definidas.
  - Las notificaciones solo se disparan para eventos de tipo INSERT.
  - La estructura de payload depende de la API de Supabase; el código asume que payload.eventType existe y puede ser "INSERT".

---

## Última actualización

29/5/2026

---

Si necesitas que adapte la documentación a un formato distinto o que añada ejemplos adicionales (por ejemplo, con manejo de errores o pruebas), dímelo y lo ajusto.