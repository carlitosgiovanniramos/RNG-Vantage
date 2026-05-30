# RealtimeRefresher (components/realtime-refresher.tsx)

Descripción general
- RealtimeRefresher es un componente React de cliente (client component) utilizado para suscribirse a cambios en tiempo real de tablas específicas a través de Supabase.
- Escucha eventos de cambios en Postgres para las tablas indicadas y, cuando ocurre un cambio, fuerza la actualización de la ruta actual mediante router.refresh(). 
- Si el evento es un INSERT en una tabla para la cual hay un label definido en INSERT_LABELS, muestra una notificación toast con ese mensaje.
- No renderiza UI; devuelve null y funciona únicamente por efectos secundarios.

Responsabilidades
- Crear y suscribirse a canales de cambios en tiempo real para cada tabla especificada.
- Detectar eventos de cambios (postgres_changes) y:
  - Forzar la actualización de la página actual (router.refresh()).
  - Mostrar notificaciones toast para INSERT cuando exista un label definido para la tabla correspondiente.
- Limpiar y eliminar los canales de suscripción al desmontarse (cleanup en useEffect).
- Soportar tablas definidas por el tipo ServerTable: "subscriptions" | "reservations" | "transactions".

Props / Parámetros
- tables: ServerTable[]
  - Tipo: ServerTable[]
  - Requerido: sí
  - Descripción: lista de tablas a las que se desea escuchar en tiempo real.
  - ServerTable es un alias de tipo:
    - "subscriptions" | "reservations" | "transactions"
- Nota: Dentro del archivo, se define INSERT_LABELS como un mapeo parcial para asociar mensajes a ciertas tablas. Actualmente solo tiene:
  - subscriptions -> "Nueva suscripción registrada"
  - Las otras tablas no tienen label definido (INSERT_LABELS[tabla] sería undefined).

Retorna
- Null: el componente no renderiza UI y se utiliza exclusivamente para efectos secundarios (suscripciones a canales de tiempo real).

Dependencias
- React
  - useEffect
- Next.js (app router)
  - useRouter de "next/navigation" para forzar la recarga de la ruta actual mediante router.refresh()
- Supabase (cliente)
  - useSupabase (hook personalizado) para obtener la instancia de supabase
  - supabase.channel(...) para crear canales de escucha
  - channel.on("postgres_changes", { event, schema, table }, handler).subscribe()
  - supabase.removeChannel(channel) para limpiar suscripciones
- Notificaciones
  - toast de "sonner" para mostrar mensajes emergentes
- Tipado
  - TypeScript: ServerTable, INSERT_LABELS, y tipado de props

Ejemplos de uso
- Ejemplo mínimo con una sola tabla:
  - <RealtimeRefresher tables={["subscriptions"]} />
- Ejemplo con múltiples tablas:
  - <RealtimeRefresher tables={["subscriptions", "reservations", "transactions"]} />
- Este componente debe ser colocado dentro de un árbol de componentes de la aplicación donde hay un proveedor de Supabase disponible y el router de Next.js está activo.

Notas técnicas
- Canal de suscripción:
  - Cada tabla recibe un canal separado con el nombre pattern "refresh-${table}".
  - La suscripción escucha eventos de postgres_changes con:
    - event: "*"
    - schema: "public"
    - table: (nombre de la tabla)
- Manejo de eventos:
  - En cada evento recibido, se ejecuta router.refresh() para actualizr la vista actual.
  - Si payload.eventType === "INSERT" y existe un label definido en INSERT_LABELS para la tabla, se muestra un toast con ese mensaje.
  - INSERT_LABELS es un registro parcial: solo algunas tablas tienen mensajes configurados (actualmente solo "subscriptions").
- Limpieza:
  - Al desmontar, se eliminan todas las suscripciones de canal creadas para evitar pérdidas de memoria.
- Dependencias en useEffect:
  - El hook usa supabase y router como dependencias principales.
  - Existe una directiva para deshabilitar la regla de eslint por react-hooks/exhaustive-deps para evitar re-suscripción innecesaria si supabase/router cambian; el efecto se ejecuta al inicio y cuando supabase o router cambian.
- Rendimiento y escalabilidad:
  - El componente crea un canal independiente por tabla, lo cual es adecuado para un conjunto limitado de tablas. Si en el futuro se añaden muchas tablas, podría considerarse consolidar o gestionar dinámicamente la cantidad de listeners.
- Compatibilidad:
  - Requiere que useSupabase proporcione una instancia válida de supabase y que el proyecto esté configurado para usar el app router de Next.js.

Última actualización
- 29/5/2026

Ejemplo de implementación mínima en Markdown (para copiar rápidamente)
- Importante: coloca RealtimeRefresher dentro del árbol de componentes donde necesites escuchar cambios en tiempo real.

```tsx
import { RealtimeRefresher } from "./components/realtime-refresher";

function App() {
  return (
    <div>
      {/* Otros componentes de la app */}
      <RealtimeRefresher tables={["subscriptions", "reservations"]} />
    </div>
  );
}
```

Notas finales
- Este archivo está diseñado para ser ligero y funcional sin depender de UI. Su objetivo es asegurar que la UI muestre datos actualizados cuando ocurren cambios relevantes en la base de datos y proporcionar notificaciones cuando corresponde.
- Si en el futuro se desea activar notificaciones para otras tablas, basta con añadir entradas en INSERT_LABELS para las tablas deseadas.