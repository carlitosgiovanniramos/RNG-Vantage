# RGL Estudio — Plataforma de Gestión

Sistema web de gestión de servicios, reservas y suscripciones para RGL Estudio, desarrollado como proyecto integrador del octavo semestre en la carrera de Ingeniería en Seguridad Informática.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.1.6 (App Router, React 19) |
| Lenguaje | TypeScript 5 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
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
└── (dashboard)/     — panel administrativo (solo rol admin)
```

La lógica de acceso está controlada por middleware de Supabase que valida la sesión en cada solicitud, y por RLS (Row-Level Security) en la base de datos que restringe las operaciones según el rol del usuario autenticado.

La comunicación entre cliente y base de datos se realiza principalmente a través de Server Actions de Next.js, evitando exponer endpoints REST innecesarios. Las páginas que requieren actualizaciones en tiempo real utilizan Supabase Realtime mediante canales `postgres_changes`.

---

## Módulos

### Catálogo de servicios (`/catalogo`)
Lista todos los servicios activos registrados en la base de datos, filtrados por tipo (manejo de redes, auditoría, capacitación). Cada tarjeta enlaza directamente al flujo de contratación.

### Módulo de Capacitación (`/capacitacion`)
Página dedicada a los servicios de tipo `capacitacion`. Muestra los programas disponibles, el proceso de inscripción y las condiciones de cada taller. Redirige al formulario de reservas para agendar una sesión.

### Reservas (`/reservar`)
Formulario público (no requiere cuenta) para agendar una sesión de diagnóstico o capacitación. Valida los datos con Zod y los persiste en la tabla `reservations`. Cumple con la LOPDP mediante checkbox de consentimiento explícito.

### Checkout y suscripciones (`/checkout`)
Flujo de contratación de un servicio. Crea un registro en `subscriptions` con estado `pending` y genera automáticamente una transacción pendiente de cobro. La activación la realiza el administrador desde el panel de transacciones.

### Panel administrativo (`/dashboard`)
Exclusivo para usuarios con `role = 'admin'`. Incluye:

- **Dashboard** — MRR, ingresos del mes, suscripciones activas y reservas pendientes con gráficas de los últimos seis meses.
- **Reservas** — gestión de estado (pendiente, confirmada, cancelada).
- **Suscripciones** — vista de ciclo de vida por cliente y servicio.
- **Transacciones** — registro de pagos con método y notas. Permite marcar como completado o fallido, y limpia automáticamente transacciones expiradas (más de 24 horas pendientes).

### Perfil de usuario (`/perfil`)
Vista del cliente con historial de suscripciones y reservas propias. Paginado en el servidor.

---

## Base de datos

El esquema completo se encuentra en `supabase/migrations/20260325120000_init.sql`. Las tablas principales son:

- `profiles` — extiende `auth.users` con nombre, teléfono y rol (`client` / `admin`)
- `services` — catálogo de servicios con tipo, precio y duración
- `reservations` — solicitudes de reserva de clientes
- `subscriptions` — contrataciones activas o pendientes por cliente y servicio
- `transactions` — historial de pagos vinculados a suscripciones

Todas las tablas tienen RLS habilitado. Los clientes solo acceden a sus propios registros; los administradores acceden a todos mediante validación del claim `app_metadata.role` en el JWT, evitando escalada de privilegios desde el cliente.

Los índices de rendimiento están definidos en `supabase/migrations/20260404000000_fix_security_and_business_logic.sql`.

---

## Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

La `SUPABASE_SERVICE_ROLE_KEY` es necesaria para que el servidor pueda registrar transacciones y activar suscripciones saltando RLS (operaciones exclusivas de administración).

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
