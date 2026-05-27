# Arquitectura y Diseño Técnico

Este documento detalla la arquitectura de alto nivel del proyecto RGL Estudio, incluyendo el stack tecnológico, la estructura de directorios, la base de datos y los flujos principales.

## Stack Tecnológico

El proyecto está construido sobre un stack moderno y escalable:
- **Framework Frontend**: Next.js 16 (App Router, React 19)
- **Estilos y UI**: Tailwind CSS v4, componentes basados en Shadcn UI
- **Backend / Base de Datos**: Supabase (PostgreSQL, Auth, Edge Functions, Realtime)
- **Pasarela de pagos**: Kushki (`@kushki/js-sdk` para tokenización en cliente + API REST en servidor)
- **Correos transaccionales**: Resend
- **Manejo de Estado y Datos**: TanStack Query (React Query)
- **Formularios y Validación**: React Hook Form + Zod
- **Gráficos y Visualización**: Recharts

## Estructura del Proyecto

El código fuente está organizado siguiendo las convenciones de Next.js App Router:

```text
app/
  (auth)/        → login, register (flujos de autenticación)
  (public)/      → landing, catalogo, capacitacion, reservar, checkout, perfil, politica-privacidad
  (dashboard)/   → dashboard, servicios, reservas, subscriptions, transacciones, pagos-fallidos
  api/
    webhooks/kushki/        → receptor de notificaciones de la pasarela
    admin/export-transactions/  → export CSV de transacciones (admin)
components/      → navbar, footer, data-table, data-card, status-badge, dashboard-charts, realtime-refresher
lib/
  supabase/      → client.ts, server.ts, admin.ts, middleware.ts
  kushki/        → config.ts, client.ts, types.ts, webhook.ts, card-fields.ts
  email/         → client.ts (Resend), templates.ts
  validators/    → auth, service, reservation, subscription, transaction, payment
hooks/           → use-admin-realtime.ts, use-supabase.ts
types/           → database.ts, index.ts
supabase/
  functions/     → dashboard-metrics, subscription-renewal
  migrations/    → migraciones secuenciales en SQL
```

## Diagrama de Base de Datos (ER)

El proyecto utiliza PostgreSQL (Supabase) con 5 tablas principales y varias vistas SQL optimizadas:

### Tablas
1. **`profiles`**: Perfiles de usuario extendidos. FK hacia `auth.users(id)`. Define el `role` (`admin` o `client`) y `is_active`.
2. **`services`**: Catálogo de servicios ofrecidos (tipo, precio, duración, estado activo/inactivo).
3. **`subscriptions`**: Suscripciones adquiridas por los usuarios. FK a `profiles(id)` y `services(id)`. Maneja fechas de inicio/fin, el flag `auto_renew` y `gateway_subscription_id` (ID de la suscripción recurrente en Kushki).
4. **`transactions`**: Historial de pagos y recibos. FK a `profiles(id)` y opcionalmente a `subscriptions(id)`. Estados: pending, completed, failed, refunded. Incluye columnas de conciliación de pasarela: `gateway`, `gateway_transaction_id`, `gateway_reference`, `gateway_status`.
5. **`reservations`**: Citas y reservas de los clientes. FK a `profiles(id)` (opcional).

### Vistas Optimizadas (Lectura para el Dashboard)
Vistas SQL que consolidan datos para el panel: `v_dashboard_summary` (MRR, ingresos del mes, suscripciones activas, reservas pendientes), `v_monthly_income` (ingresos de los últimos 6 meses), `v_service_mix` (suscripciones por tipo de servicio), entre otras.

## Flujo de Autenticación

El sistema utiliza Supabase Auth apoyado en Next.js Middleware:
1. **Roles y Sincronización**: Cuando se crea un usuario, un trigger en PostgreSQL (`handle_new_user`) crea el perfil en `public.profiles`. Otro trigger (`sync_profile_role_to_auth`) sincroniza el campo `role` hacia el JWT interno de Supabase (`auth.users.raw_app_meta_data`), que aparece como `app_metadata` en el token.
2. **Protección de Rutas**: El archivo `middleware.ts` intercepta las peticiones. Si la ruta pertenece a `/dashboard`, `/reservas`, `/servicios`, `/clientes`, `/transacciones`, `/subscriptions` o `/pagos-fallidos`, verifica que exista un usuario autenticado, que su rol sea `admin` y que esté activo. De lo contrario, redirige al login o al catálogo.
3. **Open redirect**: el parámetro `?redirect=` del login se sanea (solo se aceptan rutas internas) para evitar redirecciones a dominios externos.

## Pasarela de Pagos (Kushki)

La capa de pagos vive en `lib/kushki/` y `app/(public)/checkout/`:
- **Tokenización** (`lib/kushki/card-fields.ts`): la tarjeta se tokeniza en el navegador con `@kushki/js-sdk` mediante campos alojados en iframes (PCI). El servidor nunca ve los datos de la tarjeta.
- **Server Actions** (`checkout/payment-actions.ts`): `chargeWithCard` (cargo único), `subscribeWithCard` (suscripción recurrente) e `initTransfer` (transferencia bancaria). El monto siempre se toma del servidor, nunca del cliente.
- **Webhook** (`app/api/webhooks/kushki/route.ts`): receptor de notificaciones de Kushki. Confirma transferencias, registra los cobros recurrentes, maneja contracargos. Se autentica con un secreto compartido en el header `x-webhook-secret` (comparación en tiempo constante) y es idempotente.
- **Correos** (`lib/email/`): notificaciones transaccionales vía Resend; nunca interrumpen un flujo de pago si fallan.

El detalle completo está en [`kushki-integration.md`](kushki-integration.md).

## Seguridad

La seguridad está implementada en múltiples capas:
- **Client-side**: Validación estricta con Zod y React Hook Form en todos los inputs.
- **Server-side (Next.js)**: Verificación de sesión y roles en Server Actions y en el Middleware. Los módulos sensibles (`lib/kushki/config.ts`, `lib/kushki/client.ts`, `lib/email/client.ts`) están marcados `server-only` para que sus secretos nunca lleguen al bundle del cliente.
- **Base de Datos (RLS)**: Row Level Security activado en todas las tablas. Las políticas validan el rol vía `app_metadata.role` del JWT (evita escalada de privilegios) y restringen `profiles` para impedir que un usuario se auto-asigne `admin`.
- **Edge Functions**: Las funciones extraen el JWT del header, verifican el usuario y el rol admin antes de procesar.
- **Webhook de pagos**: autenticado con secreto compartido; responde siempre 200 ante eventos válidos para la lógica de reintentos de Kushki.

## Realtime

La aplicación utiliza Supabase Realtime para mantener el dashboard actualizado en vivo:
- **`RealtimeRefresher`** (`components/realtime-refresher.tsx`): suscribe al cliente web a cambios de la base de datos (eventos `postgres_changes`) para tablas específicas (`reservations`, `transactions`, `subscriptions`).
- Al detectar una mutación, invoca `router.refresh()` y muestra un `toast` al administrador.

## CRON Jobs

El sistema utiliza `pg_cron` + `pg_net` para automatizar tareas recurrentes:
- **`daily-subscription-renewal`**: se ejecuta diariamente a las 06:00 UTC (01:00 Ecuador). Invoca la Edge Function `subscription-renewal` mediante una función wrapper (`trigger_subscription_renewal`) que lee el `service_role_key` desde Supabase Vault.
- La función renueva/expira las suscripciones manuales y **expira** (tras un período de gracia) las suscripciones recurrentes de Kushki cuyo cobro dejó de llegar; no toca las que Kushki sigue cobrando.

## PWA

La aplicación está configurada como Progressive Web App mediante Serwist:
- **Service Worker** (`app/sw.ts`): precaching de assets estáticos y caching en runtime.
- **Manifest** (`app/manifest.ts`): nombre "RGL Estudio", colores de marca y 3 iconos SVG (192px, 512px, maskable).
- El service worker solo se activa en producción (`npm run build && npm start`).
