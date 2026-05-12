# Documentación técnica — use-admin-realtime.ts

Archivo: hooks/use-admin-realtime.ts

Ruta: hooks/use-admin-realtime.ts

Total de líneas: 39

Fecha de última actualización: 12/5/2026

Descripción general
-------------------
use-admin-realtime.ts es un hook personalizado de React (client-side) que suscribe a cambios en tiempo real de tablas específicas de PostgreSQL a través de Supabase. Su objetivo es permitir que componentes del área administrativa reaccionen de forma inmediata ante eventos de inserción en tablas clave (reservations y transactions) mediante:

- Invalidar la caché de React Query para una clave de consulta dada, forzando la actualización de la UI.
- Mostrar una notificación deToast cuando se inserta un nuevo registro en la tabla correspondiente.

La implementación está orientada a casos de uso de administración de reservas y transacciones, permitiendo refrescar listados/ paneles cuando llegan nuevos datos.

Responsabilidades
---------------
- Suscribirse a cambios en tiempo real para una tabla específica de la base de datos (reservations o transactions) usando Supabase Realtime.
- Invalidar la(s) consulta(s) de React Query asociada(s) mediante la clave proporcionada para asegurar que la UI se actualice con los datos más recientes.
- Mostrar una notificación de toast cuando se inserta un nuevo registro en la tabla objetivo.
- Limpiar la suscripción al desmontar el componente para evitar fugas de memoria.
- Mantener la separación de concerns: la lógica de tiempo real vive en este hook y no en los componentes que consumen datos.

Props / Parámetros
-----------------
Este hook es una función (no devuelve valor) y recibe los siguientes parámetros:

- table: AdminTable
  - Tipo: "reservations" | "transactions"
  - Descripción: Indica la tabla de PostgreSQL a la que se desea subscribir los cambios en tiempo real.
  - Requerido: sí

- queryKey: string
  - Tipo: string
  - Descripción: Clave de la consulta (React Query) que debe invalidarse cuando hay cambios. Se empaqueta como un array [queryKey] al invocar invalidateQueries.
  - Requerido: sí

Notas sobre tipos internos
--------------------------
- AdminTable
  - Descripción: Unión de tipos literal que restringe las tablas soportadas.
  - Valores permitidos: "reservations" | "transactions"

- INSERT_LABELS
  - Descripción: Mapeo de tablas a mensajes de notificación cuando se inserta un nuevo registro.
  - Reservaciones => "Nueva reserva recibida"
  - Transacciones => "Nueva transacción registrada"

Retorna
-------
- void
- Detalle: El hook no devuelve valor; realiza efectos secundarios (suscripción a eventos, invalidación de queries y notificación de toast).

Dependencias
------------
Este hook depende de varias librerías y hooks del proyecto:

- React
  - useEffect para gestionar el ciclo de vida del suscriptor en tiempo real.
- @tanstack/react-query
  - useQueryClient para obtener el cliente de consultas y provocar invalidaciones de caché.
- sonner
  - toast para mostrar notificaciones al usuario.
- use-supabase (hook propio del proyecto)
  - useSupabase para obtener la instancia de Supabase client con configuración de la app.
- Supabase Realtime
  - Suscripción a cambios en tiempo real vía channel y eventos postgres_changes.

Notas técnicas
--------------
- Suscripción y canal:
  - El hook crea un canal con nombre admin-${table} para aislar los cambios por tabla.
  - Se registra un listener para postgres_changes con filtros:
    - event: "*" (todos los eventos)
    - schema: "public"
    - table: valor de table (reservations o transactions)
- Manejo de eventos:
  - En cualquier cambio, se invalida la clave de consulta proporcionada: queryKey se envuelve como [queryKey] al llamar invalidateQueries.
  - Si el payload.eventType es "INSERT", se muestra una toast con INSERT_LABELS[table].
  - El comportamiento está enfocado a notificación de inserciones; otros tipos de cambios (UPDATE/DELETE) no generan toast, pero sí disparan la invalidación.
- Limpieza:
  - Al desmontar el componente, se elimina el canal mediante supabase.removeChannel(channel) para evitar suscripciones pendientes.
- Rendimiento y seguridad:
  - La invalidación de queries se realiza de forma asincrónica (promesas ignoradas con void) para evitar warnings de promesas no manejadas.
  - El hook depende de supabase, queryClient, table y queryKey; cualquier cambio en alguno de estos re-suscribe/actualiza el efecto.
- Consideraciones de entorno:
  - Requiere que el backend de Supabase tenga habilitado Realtime para las tablas públicas indicadas.
  - Los mensajes de notificación dependerán del estado de la UI y de si el flujo de inserciones ocurre en paralelo a otras actualizaciones.

Ejemplos de uso
---------------
Ejemplo 1: Suscribirse a cambios en reservas y refrescar una lista de reservas

```tsx
import { useQuery } from "@tanstack/react-query";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

function ReservationsList() {
  // Supongamos que existe una función fetchReservations para obtener la lista
  const { data: reservations } = useQuery(["reservations-list"], fetchReservations);

  // Suscribirse a cambios en tiempo real para la tabla "reservations"
  // y disparar la invalidación de la query ["reservations-list"]
  useAdminRealtime("reservations", "reservations-list");

  // Renderizado de la lista...
  return (
    <div>
      {/* render reserva */}
    </div>
  );
}
```

Ejemplo 2: Suscribirse a cambios en transacciones

```tsx
import { useQuery } from "@tanstack/react-query";
import { useAdminRealtime } from "@/hooks/use-admin-realtime";

function TransactionsPanel() {
  const { data: transactions } = useQuery(["transactions-list"], fetchTransactions);

  // Suscripción a cambios en la tabla "transactions"
  useAdminRealtime("transactions", "transactions-list");

  // Renderizado...
  return (
    <div>
      {/* render transacciones */}
    </div>
  );
}
```

Notas de implementación relevantes para nuevos desarrolladores
--------------------------------------------------------------
- Este hook está destinado a ser utilizado en componentes que presenten listados o dashboards de administración donde se desea que la UI se actualice cuando lleguen nuevos registros.
- No realiza ningún render; sólo administra efectos secundarios (suscripción, invalidación y notificaciones).
- El mapeo de mensajes para notificaciones está acoplado al tipo de tabla. Si se agrega soporte para nuevas tablas, se deben actualizar AdminTable y INSERT_LABELS.
- Si se requiere notificar de otros eventos (UPDATE/DELETE), se podría extender la lógica para incluir mensajes correspondientes o comportamientos adicionales.

Última actualización
-------------------
12/5/2026

Notas finales
------------
- Este archivo está marcado con "use client", lo que indica que debe ejecutarse en el cliente (navegador) y no en el servidor.
- Asegúrate de que las consultas que se invalidan con queryKey sean coherentes con las claves usadas en useQuery para evitar inconsistencias en la UI tras los eventos de tiempo real.