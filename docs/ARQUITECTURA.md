# Arquitectura y Diseño Técnico

Este documento detalla la arquitectura de alto nivel del proyecto RNGVantage, incluyendo el stack tecnológico, la estructura de directorios, la base de datos y los flujos principales.

## Stack Tecnológico

El proyecto está construido sobre un stack moderno y escalable:
- **Framework Frontend**: Next.js 15 (App Router)
- **Estilos y UI**: Tailwind CSS v4, componentes basados en Shadcn UI
- **Backend / Base de Datos**: Supabase (PostgreSQL 17, Auth, Edge Functions, Realtime)
- **Manejo de Estado y Datos**: TanStack Query (React Query)
- **Formularios y Validación**: React Hook Form + Zod
- **Gráficos y Visualización**: Recharts

## Estructura del Proyecto

El código fuente está organizado siguiendo las convenciones de Next.js App Router:

```text
app/
  (auth)/        → login, register (flujos de autenticación)
  (public)/      → landing, catalogo, capacitacion, reservar, checkout, politica-privacidad
  (dashboard)/   → dashboard, servicios, reservas, subscriptions, transacciones
components/      → navbar, footer, data-table, data-card, status-badge, dashboard-charts, realtime-refresher
lib/
  supabase/      → client.ts, server.ts, admin.ts, middleware.ts
  validators/    → service.ts
hooks/           → use-admin-realtime.ts, use-supabase.ts
types/           → database.ts, index.ts
supabase/
  functions/     → dashboard-metrics, subscription-renewal, payment-webhook, hello-world
  migrations/    → 5 migraciones secuenciales en SQL
```

## Diagrama de Base de Datos (ER)

El proyecto utiliza PostgreSQL (Supabase) con 5 tablas principales y 5 vistas SQL optimizadas:

### Tablas
1. **`profiles`**: Perfiles de usuario extendidos. FK hacia `auth.users(id)`. Define el `role` (`admin` o `client`).
2. **`services`**: Catálogo de servicios ofrecidos (tipo, precio, duración, estado activo/inactivo).
3. **`subscriptions`**: Suscripciones adquiridas por los usuarios. FK a `profiles(id)` y `services(id)`. Maneja fechas de inicio/fin y el flag `auto_renew`.
4. **`transactions`**: Historial de pagos y recibos. FK a `profiles(id)` y opcionalmente a `subscriptions(id)`. Estados: pending, completed, failed, refunded.
5. **`reservations`**: Citas y reservas de los clientes. FK a `profiles(id)` (opcional).

### Vistas Optimizadas (Lectura para el Dashboard)
1. **`v_dashboard_summary`**: Resumen financiero consolidado (MRR, ingresos del mes, suscripciones activas, reservas pendientes).
2. **`v_monthly_income`**: Ingresos mensuales agrupados por mes (últimos 6 meses) de transacciones completadas.
3. **`v_service_mix`**: Conteo de suscripciones activas agrupadas por tipo de servicio.
4. **`v_subscriptions_detail`**: Join de `subscriptions`, `services` y `profiles` para el listado del panel administrativo.
5. **`v_transactions_detail`**: Join de `transactions`, `profiles` y `subscriptions` para el listado de pagos.

## Flujo de Autenticación

El sistema utiliza Supabase Auth apoyado en Next.js Middleware:
1. **Roles y Sincronización**: Cuando se crea un usuario, un trigger en PostgreSQL (`handle_new_user`) crea el perfil en `public.profiles` y un trigger adicional (`sync_role_to_app_metadata`) sincroniza el campo `role` hacia el objeto JWT interno de Supabase (`auth.users.raw_app_meta_data`).
2. **Protección de Rutas**: El archivo `middleware.ts` intercepta las peticiones. Si la ruta pertenece a `/dashboard`, `/reservas`, `/servicios`, etc., verifica que exista un usuario autenticado y que su rol sea explícitamente `admin`. De lo contrario, redirige al login o al catálogo.

## Seguridad

La seguridad está implementada en múltiples capas:
- **Client-side**: Validación estricta con Zod y React Hook Form en todos los inputs.
- **Server-side (Next.js)**: Verificación de sesión y roles en Server Actions y en el Middleware.
- **Base de Datos (RLS)**: Row Level Security activado en todas las tablas (`services`, `profiles`, `subscriptions`, etc.). Las políticas dictan qué roles pueden leer, insertar o actualizar datos (ej. solo el admin puede insertar `services`, el usuario puede leer sus propias `transactions`).
- **Edge Functions**: Las funciones sensibles (como `dashboard-metrics` o `subscription-renewal`) extraen el JWT del header de la petición, verifican el usuario y comprueban el rol de administrador en su `app_metadata` antes de procesar cualquier lógica.

## Realtime

La aplicación utiliza Supabase Realtime para mantener el dashboard actualizado en vivo:
- **`use-admin-realtime.ts`**: Un custom hook que suscribe al cliente web a cambios de la base de datos (eventos `postgres_changes`) para tablas específicas (`reservations`, `transactions`, `subscriptions`).
- Al detectar una mutación (ej. un `INSERT`), el hook dispara invalidaciones de TanStack Query (`queryClient.invalidateQueries`) para refrescar las listas sin recargar la página e invoca un `toast` de notificación al administrador.
