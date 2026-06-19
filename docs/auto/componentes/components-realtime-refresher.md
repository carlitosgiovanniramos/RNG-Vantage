# RealtimeRefresher (components/realtime-refresher.tsx)

Documentación técnica del componente React client-side utilizado en RNG Vantage para refrescar datos en tiempo real al detectar cambios en la base de datos a través de Supabase.

---

## Descripción general

RealtimeRefresher es un componente React de cliente (client) que establece canales de suscripción en Supabase para tablas específicas. Cuando ocurren cambios en las tablas indicadas (subscribing a postgres_changes), el componente:

- Refresca la página actual mediante router.refresh() para actualizar los datos mostrados.
- Muestra un toast informativo cuando se produce un INSERT en la tabla "subscriptions" (según la configuración de INSERT_LABELS).

No renderiza UI; su salida es nula (retorna null) y se utiliza exclusivamente para efectos secundarios (subscribirse a cambios en tiempo real).

---

## Responsabilidades

- Configurar suscripciones en tiempo real para una o varias tablas especificadas.
- Detectar cambios en la base de datos (postgres_changes) y refrescar la ruta actual con Next.js.
- Mostrar toasts informativos para eventos relevantes (p. ej., inserciones en ciertas tablas).
- Limpiar/remover las suscripciones al desmontarse el componente para evitar filtraciones de memoria.
- Mantener la lógica encapsulada y reutilizable para distintas tablas del dominio (subscriptions, reservations, transactions).

---

## Props / Parámetros

- tables: ServerTable[]
  - Tipo: arreglo de constantes de cadena
  - Descripción: lista de tablas de las que se quiere escuchar cambios en tiempo real.
  - Valores posibles (tipo ServerTable):
    - "subscriptions"
    - "reservations"
    - "transactions"

Notas:
- Solo en la tabla "subscriptions" se define una label para toasts (INSERT_LABELS). No hay labels para las demás tablas.
- El componente utiliza estas tablas para construir canales con nombres como "refresh-subscriptions", "refresh-reservations", "refresh-transactions".

---

## Retorna

- null: el componente no devuelve JSX visible y no renderiza UI. Su único efecto es establecer suscripciones y, en respuesta a eventos, invocar router.refresh() y mostrar toasts según corresponda.

---

## Dependencias

- React (useEffect)
- Next.js (router.refresh de next/navigation)
- Supabase (real-time channels vía supabase.channel, .on, .subscribe, y .removeChannel)
- Hook personalizado useSupabase ( "@/hooks/use-supabase" ) que devuelve la instancia de cliente de Supabase
- Sonner (toast) para mostrar notificaciones al usuario
- Tipado TypeScript para ServerTable y el mapeo INSERT_LABELS

Detalles relevantes:
- INSERT_LABELS es un Partial<Record<ServerTable, string>>. Actualmente solo define una etiqueta para subscriptions: "Nueva suscripción registrada".
- El efecto useEffect está configurado con dependencias [supabase, router]. Esto implica que, si el prop tables cambia, las suscripciones no se actualizan en caliente (observación importante respecto al comportamiento esperado). Se incluye un comentario para deshabilitar la regla de dependencias de ESLint.

---

## Ejemplos de uso

Ejemplo 1: Suscribirse para escuchar cambios en subscriptions y reservations.

```tsx
import { RealtimeRefresher } from "@/components/realtime-refresher";

function AdminPanel() {
  return (
    <>
      {/* Otras partes de la UI */}
      <RealtimeRefresher tables={["subscriptions", "reservations"]} />
    </>
  );
}
```

Ejemplo 2: Suscribirse solo a transactions.

```tsx
import { RealtimeRefresher } from "@/components/realtime-refresher";

function Dashboard() {
  return (
    <>
      {/* Otros componentes */}
      <RealtimeRefresher tables={["transactions"]} />
    </>
  );
}
```

Notas sobre uso:
- Dado que el componente no renderiza UI, debe colocarse en páginas o componentes que existan durante la vida útil del usuario para mantener las suscripciones activas.
- Si no se necesita refrescar la página completa tras cada cambio, este comportamiento podría requerir una implementación adicional para actualizar datos específicos sin recargar toda la ruta.

---

## Notas técnicas

- Tipo de tablas soportadas: solo las definidas en ServerTable ("subscriptions" | "reservations" | "transactions").
- Inserciones con etiqueta: actualmente solo se muestra un toast para inserciones en la tabla "subscriptions" gracias a INSERT_LABELS. Para otras tablas o acciones, no se muestra toast.
- Dependencias del efecto:
  - El efecto utiliza supabase y router como dependencias. No depende directamente de el arreglo tables, ya que eslint-desactivado para la regla de dependencias exhaustivas. Esto implica que cambios en props.tables no renovarán las suscripciones sin que el componente se desmonte y vuelva a montar.
- Limpieza: al desmontar, se eliminan las suscripciones mediante supabase.removeChannel para cada canal creado.
- Rendimiento/escala:
  - Si tables contiene varios elementos, se crean múltiples canales (uno por tabla). Cada canal escucha en la ruta de la base de datos y dispara router.refresh() en cualquier evento.
  - El uso de router.refresh() provoca una revalidación de datos de la ruta en Next.js, lo que puede significar recargar datos en páginas con data fetching estático o dinámico. Considerar efectos en UI/UX si se dispara con alta frecuencia.
- Seguridad y permisos:
  - Depende de la configuración de Supabase y de permisos de PostgreSQL para las tablas indicadas. Los cambios deben ser accesibles para que el cliente reciba eventos via real-time.

- Notas de código relevantes:
  - "use client" al inicio indica que es un componente del lado del cliente.
  - Se utiliza un mapeo estático INSERT_LABELS para toasts; si se añaden nuevas tablas, es necesario extender este mapeo para soportar notificaciones específicas.
  - eslint-disable-next-line react-hooks/exhaustive-deps está presente para evitar que la lista de dependencias incluya tables; su inclusión podría cambiar comportamiento, pero también podría hacer que las suscripciones se actualicen de forma más dinámica.

---

## Última actualización

12/5/2026

---

Si necesitas que añada ejemplos de pruebas (unitarias/ integraciones) o una versión con manejo dinámico de cambios en props.tables, dime y lo desarrollo.