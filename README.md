# RGL Estudio — Plataforma de Gestión

Sistema web de gestión de servicios, reservas, suscripciones y **pagos en línea** para RGL Estudio, desarrollado como proyecto integrador del octavo semestre en la carrera de Ingeniería en Seguridad Informática.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.1.6 (App Router, React 19) |
| Lenguaje | TypeScript 5 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Pasarela de pagos | Kushki (`@kushki/js-sdk`) |
| Correos transaccionales | Resend |
| Estilos | Tailwind CSS 4 |
| Componentes UI | Base UI + shadcn/ui |
| Estado del servidor | TanStack Query v5 |
| Formularios | React Hook Form + Zod |
| Gráficas | Recharts |
| Notificaciones | Sonner |
| PWA | Serwist (service worker) |
| Fechas | date-fns |
| Testing | Vitest + Playwright |

---

## Arquitectura

El proyecto sigue la estructura de App Router de Next.js con rutas agrupadas por rol:

```
app/
├── (auth)/          — login, registro, recuperación de contraseña
├── (public)/        — catálogo, capacitación, reservas, checkout, perfil
├── (dashboard)/     — panel administrativo (solo rol admin)
└── api/
    └── webhooks/kushki/   — receptor de notificaciones de la pasarela
    └── admin/             — endpoints internos de administración
```

La lógica de acceso está controlada por middleware de Supabase que valida la sesión en cada solicitud, y por RLS (Row-Level Security) en la base de datos que restringe las operaciones según el rol del usuario autenticado.

La comunicación entre cliente y base de datos se realiza principalmente a través de Server Actions de Next.js. Los pocos endpoints REST que existen (webhook de Kushki, export de transacciones) están protegidos por secreto compartido o por verificación de rol admin. Las páginas que requieren actualizaciones en tiempo real utilizan Supabase Realtime mediante canales `postgres_changes`.

---

## Módulos

### Catálogo de servicios (`/catalogo`)
Lista todos los servicios activos registrados en la base de datos, filtrados por tipo (manejo de redes, auditoría, capacitación). Cada tarjeta enlaza directamente al flujo de contratación.

### Módulo de Capacitación (`/capacitacion`)
Página dedicada a los servicios de tipo `capacitacion`. Muestra los programas disponibles, el proceso de inscripción y las condiciones de cada taller. Redirige al formulario de reservas para agendar una sesión.

### Reservas (`/reservar`)
Formulario público (no requiere cuenta) para agendar una sesión de diagnóstico o capacitación. Valida los datos con Zod y los persiste en la tabla `reservations`. Cumple con la LOPDP mediante checkbox de consentimiento explícito.

### Checkout y pagos (`/checkout`)
Flujo de contratación de un servicio con **tres métodos de pago**:

- **Tarjeta** — pago en línea con Kushki. La tarjeta se tokeniza en el navegador (campos en iframes, requisito PCI). Para servicios de pago único es un cargo inmediato; para servicios recurrentes (`manejo_redes`) con auto-renovación, crea una **suscripción recurrente** que Kushki cobra automáticamente cada mes.
- **Transferencia bancaria** — vía Kushki; el cliente completa la transferencia en su banco y la confirmación llega de forma asíncrona por webhook.
- **Efectivo / manual** — registra la suscripción como pendiente; el administrador confirma el pago a mano.

### Panel administrativo (`/dashboard`)
Exclusivo para usuarios con `role = 'admin'`. Incluye:

- **Dashboard** — MRR, ingresos del mes, suscripciones activas y reservas pendientes con gráficas de los últimos seis meses.
- **Reservas** — gestión de estado (pendiente, confirmada, cancelada).
- **Servicios** — alta, edición y baja del catálogo.
- **Suscripciones** — ciclo de vida por cliente y servicio; permite cancelar suscripciones (cancela también el cobro recurrente en Kushki).
- **Transacciones** — registro de pagos con método y notas. Permite marcar como completado o fallido, limpiar transacciones expiradas y **exportar todo a CSV** para contabilidad.
- **Pagos con incidencias** (`/pagos-fallidos`) — vista de monitoreo de transacciones fallidas y contracargos para seguimiento.

### Portal del cliente (`/perfil`)
Vista del cliente con sus suscripciones, **historial de pagos** y autogestión: puede **cancelar** sus suscripciones y **actualizar la tarjeta** de las recurrentes.

---

## Pasarela de pagos (Kushki)

La integración con Kushki cubre cargo con tarjeta, suscripciones recurrentes y transferencias bancarias, con conciliación automática vía webhook y correos transaccionales en cada evento. El detalle completo (flujos, variables, webhook, dunning, checklist de producción) está en **[`docs/kushki-integration.md`](docs/kushki-integration.md)**.

Funcionalidades asociadas:

- **Webhook de conciliación** (`/api/webhooks/kushki`) — confirma transferencias, registra los cobros recurrentes y procesa contracargos.
- **Correos transaccionales** (vía Resend) — confirmación de pago, recibo de cobro mensual, aviso de cobro rechazado, etc.
- **Manejo de cobros fallidos (dunning)** — un cobro recurrente rechazado avisa al cliente y, tras un período de gracia, expira la suscripción.

---

## Base de datos

El esquema se define en 10 migraciones secuenciales en `supabase/migrations/`. Las tablas principales son:

- `profiles` — extiende `auth.users` con nombre, apellido, rol (`client` / `admin`) y `is_active`
- `services` — catálogo de servicios con tipo, precio y duración
- `reservations` — solicitudes de reserva de clientes
- `subscriptions` — contrataciones por cliente y servicio; incluye `gateway_subscription_id` para las suscripciones recurrentes de Kushki
- `transactions` — historial de pagos vinculados a suscripciones; incluye columnas de conciliación de pasarela (`gateway`, `gateway_transaction_id`, `gateway_reference`, `gateway_status`)

Adicionalmente, existen vistas SQL optimizadas para el dashboard (`v_dashboard_summary`, `v_monthly_income`, `v_service_mix`, etc.).

Todas las tablas tienen RLS habilitado. Los clientes solo acceden a sus propios registros; los administradores acceden a todos mediante validación del claim `app_metadata.role` en el JWT, evitando escalada de privilegios desde el cliente.

### Edge Functions (Supabase)

| Función | Estado | Propósito |
|---------|--------|-----------|
| `dashboard-metrics` | Activa | Centraliza las métricas financieras del dashboard en una sola llamada |
| `subscription-renewal` | Activa | Renueva/expira suscripciones; un CRON diario (`pg_cron`) la invoca a las 01:00 hora Ecuador |
| `payment-webhook` | Deprecada | Reemplazada por API Route `/api/webhooks/kushki` — era un placeholder que respondía `501` |

El webhook de pagos **no** es una Edge Function: está implementado como Route Handler de Next.js en `app/api/webhooks/kushki/route.ts` que maneja los webhooks de Kushki directamente.

---

## Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [`docs/kushki-integration.md`](docs/kushki-integration.md) | Integración de pagos: flujos, webhook, suscripciones, dunning, portal, checklist de producción |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Stack, estructura, ER, auth, seguridad, realtime, CRON, PWA |
| [`docs/EDGE_FUNCTIONS.md`](docs/EDGE_FUNCTIONS.md) | Detalle de las Edge Functions con endpoints, auth y respuestas |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Guía de despliegue: migraciones, Edge Functions, Vercel, checklist |
| [`docs/RESPONSIVE_TESTING.md`](docs/RESPONSIVE_TESTING.md) | Reporte de pruebas responsivas en breakpoints 320-1280px |

---

## Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto (ver `.env.example`):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# URL pública (callbacks de pago)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Kushki — pasarela de pagos
NEXT_PUBLIC_KUSHKI_ENV=sandbox
NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID=<id-público>
KUSHKI_PRIVATE_MERCHANT_ID=<id-privado>
KUSHKI_WEBHOOK_SECRET=<secreto-del-webhook>

# Resend — correos transaccionales
RESEND_API_KEY=<api-key>
EMAIL_FROM=RGL Estudio <noreply@tu-dominio.com>
```

La `SUPABASE_SERVICE_ROLE_KEY` permite al servidor registrar transacciones y activar suscripciones saltando RLS (operaciones exclusivas de administración). Las variables de Kushki y Resend son opcionales en desarrollo: si faltan, los pagos fallan de forma controlada y los correos simplemente se omiten, sin romper la app.

---

## Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación levanta en `http://localhost:3000`. El service worker de la PWA solo se activa en producción (`npm run build && npm start`).

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con Webpack |
| `npm run build` | Build de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run test` | Tests unitarios en modo watch (Vitest) |
| `npm run test:run` | Tests unitarios en una pasada |
| `npm run test:e2e` | Tests end-to-end (Playwright) |

---

## Equipo

| Integrante | Rol principal |
|---|---|
| Juan López | Frontend Lead, UX, PWA, catálogo, capacitación |
| Carlos Ramos | Motor de suscripción, API de dashboard |
| Christian Hurtado | Layouts mobile-first, flujo de checkout |
| Alejandro Andrade | Gestión de transacciones, endpoints, optimización de consultas |
