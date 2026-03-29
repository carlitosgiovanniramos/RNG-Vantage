<<<<<<< HEAD
# RNG Vantage

Sistema integral de automatizacion de ventas, reservas y control financiero para el emprendimiento de marketing digital.

## Estado actual (fase entorno)

La fase de entorno ya quedo levantada y validada.

- Monorepo creado con `backend` (NestJS) y `frontend` (Next.js).
- Backend conectado a PostgreSQL (Supabase) usando Prisma.
- Migraciones y cliente Prisma funcionando.
- Autenticacion base funcionando (`/auth/register` y `/auth/login`).
- Lint y formato del backend limpios.

## Estructura del proyecto

```text
rng-vantage/
|-- backend/
|-- frontend/
|-- .gitignore
`-- README.md
```

## Requisitos

- Node.js 20+
- npm 10+
- Git
- Cuenta de Supabase (para PostgreSQL)

## 1) Clonar proyecto

```bash
git clone https://github.com/carlitosgiovanniramos/RNG-Vantage.git
cd RNG-Vantage
```

## 2) Instalar dependencias

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd ../frontend
npm install
```

## 3) Configurar variables de entorno

Backend:

1. Copiar `backend/.env.example` a `backend/.env`.
2. Completar valores reales.

Ejemplo rapido en PowerShell:

```powershell
Copy-Item .\\backend\\.env.example .\\backend\\.env
```

Variables requeridas:

- `DATABASE_URL`: cadena de conexion PostgreSQL (Supabase).
- `JWT_SECRET`: clave para firmar tokens JWT.

## 4) Inicializar base de datos

Desde `backend`:

```bash
npx prisma migrate dev --name init_user
npx prisma generate
```

## 5) Ejecutar en local

Backend:

```bash
cd backend
npm run start:dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## 6) Prueba rapida de autenticacion

Con backend encendido, probar:

- `POST http://localhost:3000/auth/register`
- `POST http://localhost:3000/auth/login`

Body JSON de ejemplo:

```json
{
  "email": "admin@rng.com",
  "password": "12345678"
}
```

## Flujo de trabajo Git recomendado

- `main`: estable/despliegue.
- `develop`: integracion semanal.
- `feature/*`: trabajo por modulo.

Ejemplos:

- `feature/auth`
- `feature/reservas-api`
- `feature/dashboard-ui`

## Distribucion inicial de modulos

- Carlos: auth, users, finanzas, deploy backend.
- Edison: reservas, suscripciones, catalogo API.
- Juan: dashboard, reportes y layout admin.
- Christian: reservas UI, catalogo UI, landing y PWA.

## Seguridad

- No subir credenciales reales al repositorio.
- Mantener `backend/.env` fuera de Git.
- Rotar contrasenas si se compartieron por error.
=======
# RNG-Vantage

> Sistema integral de automatización de ventas, reservas y control financiero para un emprendimiento de marketing digital.
> PWA Mobile-First construida con arquitectura Serverless (BaaS) sobre Next.js y Supabase.

| Dato | Valor |
|---|---|
| **Universidad** | Universidad Técnica de Ambato (UTA), Ecuador |
| **Período Académico** | Enero 2026 – Julio 2026 (8vo Semestre) |
| **Equipo** | 4 desarrolladores |
| **Repositorio** | GitHub (privado) |
| **Estado Actual** | `BASE_STRUCTURE_COMPLETE` — infraestructura lista, lógica de negocio por implementar |
| **Versión** | `0.1.0` |

---

## 📌 ¿Qué es RNG-Vantage?

RNG-Vantage es una **aplicación web progresiva (PWA)** diseñada para automatizar las operaciones de un emprendimiento de marketing digital. El sistema resuelve tres problemas concretos del negocio:

1. **Captación de clientes:** Un formulario público permite a cualquier visitante reservar una capacitación gratuita en marketing digital, capturando prospectos sin necesidad de registro.
2. **Venta de servicios:** Un catálogo con paquetes (manejo de redes sociales, auditorías, capacitaciones) que los clientes pueden contratar directamente, generando suscripciones y transacciones.
3. **Control financiero:** Un dashboard administrativo con métricas de ingresos, suscripciones activas, reservas pendientes y gráficos de rentabilidad por tipo de servicio.

### ¿Quién usa el sistema?

| Actor | ¿Qué hace en el sistema? | Rutas principales |
|---|---|---|
| **Visitante** (sin cuenta) | Ve la landing page, explora el catálogo, reserva una capacitación gratuita | `/`, `/catalogo`, `/reservar` |
| **Cliente** (registrado, `role = 'client'`) | Todo lo anterior + contrata paquetes, ve sus suscripciones | `/checkout` |
| **Admin** (registrado, `role = 'admin'`) | Gestiona reservas, servicios, suscripciones, transacciones. Ve métricas financieras | `/dashboard`, `/reservas`, `/servicios`, `/subscriptions`, `/transacciones` |

---

## 🏗 Arquitectura del Sistema

El proyecto usa una arquitectura **Backend-as-a-Service (BaaS)**. Esto significa que **no hay un servidor backend tradicional** (no hay Express, NestJS, ni API REST propia). Toda la lógica del servidor vive en **Supabase**, y el frontend se comunica directamente con él.

### ¿Por qué BaaS?

- **Menos código backend** → Supabase provee autenticación, base de datos, políticas de seguridad (RLS) y funciones serverless de fábrica
- **Despliegue separado** → Frontend en Vercel, backend en Supabase Cloud. Cada uno escala de forma independiente
- **Tiempo real incluido** → Supabase tiene WebSockets nativos para actualizaciones en vivo en el dashboard

### Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (PWA)                             │
│                                                                     │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐   │
│  │ Server Components     │    │ Client Components                │   │
│  │ (se ejecutan en el    │    │ (se ejecutan en el navegador)    │   │
│  │  servidor de Next.js) │    │                                  │   │
│  │                       │    │  useSupabase() → Supabase Client │   │
│  │  await createClient() │    │  TanStack Query (cache 60s)      │   │
│  └──────────┬────────────┘    └──────────────┬───────────────────┘   │
│             │                                 │                      │
└─────────────┼─────────────────────────────────┼──────────────────────┘
              │                                 │
              ▼                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SUPABASE CLOUD                                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐    │
│  │ PostgreSQL    │  │ Auth (JWT)   │  │ Edge Functions (Deno)  │    │
│  │ + RLS         │  │ + Cookies    │  │ • subscription-renewal │    │
│  │ 5 tablas      │  │ + Roles      │  │ • dashboard-metrics    │    │
│  │ + triggers    │  │              │  │ • payment-webhook      │    │
│  └──────────────┘  └──────────────┘  └────────────────────────┘    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │ Realtime     │  │ Storage      │                                 │
│  │ (WebSocket)  │  │ (archivos)   │                                 │
│  └──────────────┘  └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
REGISTRO:
  Usuario envía email + contraseña + nombre + consentimiento LOPDP
  → Supabase Auth crea usuario en auth.users
  → Trigger automático crea perfil en tabla profiles (role = 'client')
  → JWT se guarda en cookie HTTP-only

LOGIN:
  Usuario envía email + contraseña
  → Supabase Auth valida credenciales
  → JWT se guarda en cookie HTTP-only
  → Redirect: admin → /dashboard, client → /catalogo

CADA PETICIÓN:
  middleware.ts intercepta la request
  → Llama a supabase.auth.getUser() para refrescar el JWT si expiró
  → Si es ruta admin: verifica que profiles.role === 'admin'
  → Si no es admin: redirige a /login

```

---

## ⚙️ Stack Tecnológico Completo

### Frontend

| Tecnología | Versión | Para qué se usa | Dónde se configura |
|---|---|---|---|
| **Next.js** | 16.1.6 | Framework base. App Router con Server Components y SSR | `next.config.ts` |
| **React** | 19.2.3 | Renderizado de componentes | — (incluido en Next.js) |
| **TypeScript** | ^5 | Tipado estricto en todo el proyecto | `tsconfig.json` |
| **Tailwind CSS** | ^4 | Estilos con clases utilitarias (no CSS custom por componente) | `postcss.config.mjs`, `app/globals.css` |
| **ShadCN/UI** (base-nova) | ^4.0.8 | Componentes pre-construidos y accesibles (Button, Input, Card, Table, Dialog...) | `components.json`, `components/ui/` |
| **Lucide React** | ^0.577.0 | Iconos SVG | — |
| **React Hook Form** | ^7.71.2 | Manejo de estado de formularios (sin rerenders innecesarios) | — |
| **Zod** | ^4.3.6 | Esquemas de validación reutilizables (frontend y backend) | `lib/validators/` |
| **TanStack Query** | ^5.90.21 | Cache de datos client-side, mutations con optimistic updates | `components/providers.tsx` |
| **Recharts** | ^3.8.0 | Gráficos (barras, pie, área) para el dashboard financiero | — |
| **Serwist** | ^9.5.7 | PWA: Service Worker, precaching, soporte offline | `app/sw.ts`, `next.config.ts` |

### Backend (Supabase)

| Tecnología | Para qué se usa | Dónde se configura |
|---|---|---|
| **PostgreSQL** | Base de datos relacional con 5 tablas, RLS habilitado en todas | `supabase/migrations/` |
| **Supabase Auth** | Autenticación email+password, JWT en cookies, roles | `lib/supabase/`, `middleware.ts` |
| **Edge Functions** (Deno) | Lógica de negocio compleja: renovación de suscripciones, métricas | `supabase/functions/` |
| **Supabase Realtime** | WebSockets para actualizaciones en vivo del dashboard | — (por implementar) |
| **Supabase Storage** | Almacenamiento de archivos (si se necesita en el futuro) | — (por implementar) |

### Testing

| Herramienta | Versión | Para qué se usa | Configuración |
|---|---|---|---|
| **Vitest** | ^4.1.0 | Tests unitarios (schemas Zod, utilidades, lógica) | `vitest.config.ts` |
| **Testing Library** | ^16.3.2 | Tests de componentes React (renderizado, interacciones) | `vitest.setup.ts` |
| **Playwright** | ^1.58.2 | Tests E2E (flujos completos en navegador real) | `playwright.config.ts` |

### Despliegue

| Servicio | Para qué |
|---|---|
| **Vercel** | Frontend (auto-deploy desde GitHub al hacer push a `main`) |
| **Supabase Cloud** | Backend (instancia compartida para todo el equipo) |

---

## 📦 Módulos del Sistema

El sistema se organiza en 6 módulos funcionales basados en el caso de negocio:

### Módulo 1: Captación y Reservas
- **Propósito:** Capturar prospectos a través de un formulario de reserva de capacitaciones gratuitas
- **Ruta cliente:** `/reservar` — formulario público (no requiere login)
- **Ruta admin:** `/reservas` — tabla de gestión con filtros por estado y acciones de cambio de estado
- **Flujo:** Visitante llena formulario → se crea reserva con status `pending` → admin la confirma o cancela
- **Tablas involucradas:** `reservations`

### Módulo 2: Catálogo de Servicios
- **Propósito:** Mostrar los paquetes disponibles que el emprendimiento ofrece
- **Ruta cliente:** `/catalogo` — grid de cards con filtro por tipo de servicio
- **Ruta admin:** `/servicios` — CRUD completo (crear, editar, activar/desactivar servicios)
- **Tipos de servicio:** `manejo_redes`, `auditoria`, `capacitacion`, `otro`
- **Tablas involucradas:** `services`

### Módulo 3: Motor de Suscripciones
- **Propósito:** Gestionar los ciclos de vida de las contrataciones de servicios
- **Ruta admin:** `/subscriptions` — tabla de suscripciones con estados y gestión
- **Flujo:** Cliente contrata servicio → se crea suscripción `active` con `ends_at` calculado → al vencer, una Edge Function la renueva o expira automáticamente
- **Tablas involucradas:** `subscriptions`, `services`

### Módulo 4: Checkout y Pagos
- **Propósito:** Permitir la contratación directa de paquetes desde el catálogo
- **Ruta cliente:** `/checkout?service_id=xxx` — resumen del servicio + confirmación
- **Flujo:** Cliente elige servicio en catálogo → va a checkout → confirma → se crea suscripción + transacción pendiente
- **Nota MVP:** No hay pasarela de pago real. Los pagos se registran manualmente por el admin (cash, transferencia, tarjeta)
- **Tablas involucradas:** `subscriptions`, `transactions`

### Módulo 5: Dashboard Financiero
- **Propósito:** Dar al admin visibilidad sobre la salud financiera del negocio
- **Ruta admin:** `/dashboard` — KPI cards + gráficos de Recharts + tabla de transacciones recientes
- **Métricas:** Ingresos del mes, suscripciones activas, reservas pendientes, ingresos por tipo de servicio, tasa de conversión
- **Datos:** Se obtienen de una Edge Function que ejecuta queries SQL optimizados
- **Tablas involucradas:** Todas (via Edge Function `dashboard-metrics`)

### Módulo 6: Registro de Transacciones
- **Propósito:** Control de ventas y pagos del emprendimiento
- **Ruta admin:** `/transacciones` — tabla con filtros por estado y fecha, registro manual de pagos
- **Estados:** `pending` → `completed` | `failed`, `completed` → `refunded`
- **Tablas involucradas:** `transactions`

---

## 🗄 Esquema de Base de Datos

5 tablas con **Row Level Security (RLS)** habilitado en todas. Auto-trigger `handle_updated_at` en todas las tablas.

### Relaciones entre tablas

```
auth.users (1) ←──── (1) profiles         Un usuario tiene un perfil
auth.users (1) ←──── (N) reservations     Un usuario puede tener muchas reservas
auth.users (1) ←──── (N) subscriptions    Un usuario puede tener muchas suscripciones
auth.users (1) ←──── (N) transactions     Un usuario puede tener muchas transacciones
services   (1) ←──── (N) subscriptions    Un servicio puede tener muchas suscripciones
subscriptions (1) ←── (N) transactions    Una suscripción puede tener muchos pagos
```

### Tabla `profiles`
Extiende `auth.users`. Se crea automáticamente cuando un usuario se registra (trigger `handle_new_user`).

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK, FK → auth.users) | Mismo ID que auth.users |
| `full_name` | text | Nombre completo del usuario |
| `avatar_url` | text | URL del avatar (opcional) |
| `role` | text (`'admin'` \| `'client'`) | Rol del usuario. Default: `'client'` |
| `data_consent_at` | timestamptz | Fecha/hora del consentimiento LOPDP |
| `created_at` / `updated_at` | timestamptz | Timestamps automáticos |

**RLS:** Cada usuario puede ver y editar solo su propio perfil. Admin puede ver todos.

### Tabla `services`
Catálogo de servicios/paquetes del emprendimiento.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | ID auto-generado |
| `name` | text | Nombre del servicio |
| `description` | text | Descripción (opcional) |
| `type` | text (enum) | `'manejo_redes'` \| `'auditoria'` \| `'capacitacion'` \| `'otro'` |
| `price` | numeric(10,2) | Precio (≥ 0) |
| `duration_months` | int | Duración en meses (> 0) |
| `is_active` | boolean | `true` = visible en catálogo. `false` = soft delete |
| `created_at` / `updated_at` | timestamptz | Timestamps automáticos |

**RLS:** Cualquier usuario autenticado ve servicios activos. Admin ve todos (incluidos inactivos) y puede crear/editar/eliminar.

### Tabla `reservations`
Reservas de capacitaciones hechas por visitantes/clientes.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | ID auto-generado |
| `user_id` | uuid (FK, opcional) | Si el visitante está logueado, se asocia |
| `full_name` | text | Nombre del solicitante |
| `email` | text | Email de contacto |
| `phone` | text | Teléfono (opcional, formato 09XXXXXXXX) |
| `preferred_date` | timestamptz | Fecha preferida para la capacitación |
| `status` | text (enum) | `'pending'` → `'confirmed'` → `'completed'` / `'cancelled'` |
| `notes` | text | Notas adicionales (opcional) |
| `data_consent` | boolean | Consentimiento LOPDP (obligatorio = `true`) |
| `created_at` / `updated_at` | timestamptz | Timestamps automáticos |

**RLS:** Cada usuario ve solo sus reservas. Admin ve todas. Cualquier autenticado puede crear.

### Tabla `subscriptions`
Suscripciones activas que relacionan un usuario con un servicio.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | ID auto-generado |
| `user_id` | uuid (FK) | Usuario dueño de la suscripción |
| `service_id` | uuid (FK) | Servicio contratado |
| `starts_at` | timestamptz | Fecha de inicio |
| `ends_at` | timestamptz | Fecha de vencimiento (calculada: starts_at + duration_months) |
| `status` | text (enum) | `'active'` \| `'expired'` \| `'cancelled'` \| `'pending'` |
| `auto_renew` | boolean | Si `true`, la Edge Function renueva automáticamente |
| `created_at` / `updated_at` | timestamptz | Timestamps automáticos |

**RLS:** Cada usuario ve solo sus suscripciones. Admin ve todas y puede actualizar.

### Tabla `transactions`
Registro de pagos/ventas del emprendimiento.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid (PK) | ID auto-generado |
| `user_id` | uuid (FK, opcional) | Usuario asociado al pago |
| `subscription_id` | uuid (FK, opcional) | Suscripción asociada (si aplica) |
| `amount` | numeric(10,2) | Monto del pago (≥ 0) |
| `payment_method` | text (enum) | `'cash'` \| `'transfer'` \| `'card'` \| `'pending'` |
| `status` | text (enum) | `'pending'` \| `'completed'` \| `'failed'` \| `'refunded'` |
| `notes` | text | Notas (opcional) |
| `created_at` / `updated_at` | timestamptz | Timestamps automáticos |

**RLS:** Cada usuario ve solo sus transacciones. Solo admin puede crear y actualizar.

### Datos de prueba (Seed)

El archivo `supabase/seed.sql` incluye 6 servicios de ejemplo:

| Servicio | Tipo | Precio | Duración |
|---|---|---|---|
| Manejo de Redes - Mensual | manejo_redes | $150.00 | 1 mes |
| Manejo de Redes - Trimestral | manejo_redes | $400.00 | 3 meses |
| Manejo de Redes - Anual | manejo_redes | $1,400.00 | 12 meses |
| Auditoría de Redes Sociales | auditoria | $80.00 | 1 mes |
| Auditoría + Estrategia Digital | auditoria | $200.00 | 3 meses |
| Capacitación en Marketing Digital | capacitacion | $0.00 | 1 mes |

---

## 📁 Estructura del Proyecto

```
RNG-Vantage/
├── app/                                  # ← Rutas de la aplicación (App Router de Next.js)
│   ├── layout.tsx                        # Layout raíz: fuentes Geist, <Providers>, lang="es"
│   ├── page.tsx                          # Landing page (hero + CTA buttons)
│   ├── sw.ts                             # Service Worker de Serwist (PWA)
│   ├── globals.css                       # Imports de Tailwind v4 + tokens del tema (light/dark)
│   │
│   ├── (auth)/                           # Grupo de rutas de autenticación
│   │   ├── layout.tsx                    # Layout centrado (max-w-sm)
│   │   ├── login/page.tsx                # [PLACEHOLDER] Página de login
│   │   └── register/page.tsx             # [PLACEHOLDER] Página de registro
│   │
│   ├── (public)/                         # Grupo de rutas públicas
│   │   ├── layout.tsx                    # [PARCIAL] Wrapper — falta navbar y footer
│   │   ├── catalogo/page.tsx             # [PLACEHOLDER] Catálogo de servicios
│   │   ├── reservar/page.tsx             # [PLACEHOLDER] Formulario de reserva
│   │   ├── checkout/page.tsx             # [PLACEHOLDER] Flujo de contratación
│   │   └── politica-privacidad/page.tsx  # [PARCIAL] Esqueleto — falta contenido LOPDP
│   │
│   └── (dashboard)/                      # Grupo de rutas de admin (protegidas por middleware)
│       ├── layout.tsx                    # [PARCIAL] Wrapper — falta sidebar de admin
│       ├── dashboard/page.tsx            # [PLACEHOLDER] Dashboard financiero
│       ├── reservas/page.tsx             # [PLACEHOLDER] Gestión de reservas
│       ├── servicios/page.tsx            # [PLACEHOLDER] Gestión de servicios
│       ├── subscriptions/page.tsx        # [PLACEHOLDER] Gestión de suscripciones
│       └── transacciones/page.tsx        # [PLACEHOLDER] Registro de transacciones
│
├── components/
│   ├── ui/
│   │   └── button.tsx                    # Componente ShadCN Button (CVA variants)
│   └── providers.tsx                     # QueryClientProvider (TanStack Query, staleTime: 60s)
│
├── hooks/
│   └── use-supabase.ts                   # Hook: useSupabase() → cliente de Supabase memoizado
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # createBrowserClient() — para Client Components
│   │   ├── server.ts                     # createServerClient() — para Server Components
│   │   └── middleware.ts                 # updateSession() — refresco de JWT en cada request
│   ├── validators/                       # [VACÍO] Aquí van los schemas Zod (Alejandro)
│   ├── design-tokens.ts                  # Constantes: BRAND, BREAKPOINTS, SPACING, CHART_COLORS
│   └── utils.ts                          # cn() = clsx + twMerge (merge de clases CSS)
│
├── types/
│   ├── database.ts                       # Tipos TypeScript para todas las tablas de la DB
│   └── index.ts                          # Re-exports
│
├── supabase/
│   ├── migrations/
│   │   └── 00000000000000_init.sql       # Schema completo: 5 tablas, RLS, triggers
│   ├── functions/
│   │   └── hello-world/                  # Edge Function de ejemplo (Deno)
│   ├── seed.sql                          # 6 servicios de ejemplo
│   └── config.toml                       # Config de Supabase CLI
│
├── e2e/
│   └── example.spec.ts                   # 3 smoke tests básicos (Playwright)
│
├── middleware.ts                          # Refresco de sesión + protección de rutas admin
├── .env.example                          # Template de variables de entorno
├── vitest.config.ts                      # Config de Vitest (jsdom, @/ alias)
├── playwright.config.ts                  # Config de Playwright (Chrome desktop + mobile)
├── next.config.ts                        # Config de Next.js + Serwist PWA
├── components.json                       # Config de ShadCN/UI (estilo base-nova)
├── tsconfig.json                         # TypeScript strict, @/ alias, webworker lib
├── eslint.config.mjs                     # ESLint con core-web-vitals + TypeScript
├── PLAN_DE_DESARROLLO.md                 # Plan de desarrollo con roles, sprints y tareas
└── README.md                             # Este archivo
```

**Leyenda de estados:**
- `[PLACEHOLDER]` = El archivo existe pero solo renderiza un `<h1>` con el título. Necesita implementación completa.
- `[PARCIAL]` = La estructura existe pero le faltan partes (ej: falta navbar, falta contenido legal).
- `[VACÍO]` = La carpeta existe con `.gitkeep` pero no tiene archivos de código.

---

## 🔑 Estrategia de Ramas (Git Flow Simplificado)

```
main ─────────────────────────────── Producción (solo merges desde develop)
  │
  └── develop ────────────────────── Staging / Rama de integración
        │
        ├── feature/auth-registro-login ──── Carlos: autenticación
        ├── feature/validators-zod-schemas ── Alejandro: schemas Zod
        ├── feature/navbar-footer-publico ─── Juan: navegación pública
        ├── feature/sistema-diseno-shadcn ─── Christian: design system
        └── ...
```

### Convenciones de Ramas

| Tipo | Formato | Ejemplo |
|---|---|---|
| Feature nueva | `feature/nombre-de-la-tarea` | `feature/dashboard-graficos` |
| Corrección de bug | `bugfix/nombre-del-error` | `bugfix/rls-permisos-admin` |
| Parche urgente | `hotfix/descripcion` | `hotfix/fix-login-redirect` |

### Reglas de Ramas

1. **Nunca** hacer push directo a `main` ni a `develop`
2. Todas las ramas nacen desde `develop` (`git checkout -b feature/mi-tarea` desde develop)
3. Cuando termines una funcionalidad: push + crear Pull Request en GitHub hacia `develop`
4. Un compañero debe revisar el PR antes de hacer merge
5. `main` solo se actualiza cuando `develop` está estable y listo para producción

---

## 🔒 Cumplimiento Normativo (LOPDP)

El sistema cumple con la **Ley Orgánica de Protección de Datos Personales (LOPDP)** de Ecuador:

- **Consentimiento explícito:** Campo `data_consent` (boolean) en reservas y `data_consent_at` (timestamp) en perfiles. El checkbox es **obligatorio** en el formulario de registro y de reserva.
- **Página de privacidad:** `/politica-privacidad` con información sobre datos recopilados, finalidad, derechos del titular y medidas de seguridad.
- **Aislamiento de datos:** RLS en todas las tablas. Cada usuario solo puede acceder a SUS propios datos. El admin es la excepción controlada.

---

## 🛠️ Entorno de Desarrollo Local

### 1. Requisitos Previos

| Herramienta | Versión Mínima | Para qué | Enlace |
|---|---|---|---|
| **Node.js** | v20+ (LTS) | Ejecutar Next.js, instalar dependencias | [nodejs.org](https://nodejs.org) |
| **Git** | Cualquier versión reciente | Control de versiones | [git-scm.com](https://git-scm.com) |
| **VS Code** | Última versión | Editor recomendado (extensiones auto-instalables) | [code.visualstudio.com](https://code.visualstudio.com) |
| **Docker Desktop** | Última versión | **Opcional** — solo si quieres Supabase local | [docker.com](https://www.docker.com/products/docker-desktop) |

Verifica tu instalación:
```bash
node -v    # Debe mostrar v20.x.x o superior
npm -v     # Debe mostrar 10.x.x o superior
git --version
```

### 2. Instalación Paso a Paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/carlitosgiovanniramos/RNG-Vantage.git
cd RNG-Vantage

# 2. Verificar que estás en la rama develop
git branch
# Debe mostrar: * develop
# Si no estás en develop:
git checkout develop

# 3. Instalar dependencias (puede tardar 1-3 minutos)
npm install

# 4. Configurar variables de entorno
# En Windows (PowerShell):
Copy-Item .env.example .env.local
# En Windows (CMD):
copy .env.example .env.local
# En Linux/Mac:
cp .env.example .env.local

# 5. Editar .env.local con las claves reales (las da Carlos)
# Abre .env.local en tu editor y reemplaza los valores de ejemplo

# 6. Instalar navegadores para tests E2E (solo la primera vez)
npx playwright install
```

### 3. Configurar Variables de Entorno

> ⚠️ **TODO EL EQUIPO usa el MISMO proyecto de Supabase.** No crees tu propio proyecto. Las claves las proporciona Carlos por mensaje directo (no por chat grupal ni GitHub).

Abre `.env.local` y pega las claves reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Reglas importantes:**
- ❌ **NUNCA** subas `.env.local` a Git (ya está en `.gitignore`)
- ❌ **NUNCA** compartas claves por WhatsApp grupal ni GitHub Issues
- ❌ **NUNCA** pongas comillas ni espacios alrededor del `=`
- ✅ Después de modificar `.env.local`, **reinicia el servidor** (`Ctrl+C` → `npm run dev`)

**Ejemplo CORRECTO:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...larga...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Ejemplo INCORRECTO:**
```env
# MAL: tiene comillas
NEXT_PUBLIC_SUPABASE_URL="https://abcdefgh.supabase.co"

# MAL: tiene espacios
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...

# MAL: es el valor de ejemplo, no el real
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### 4. Configurar la Base de Datos (Solo Carlos — Una Sola Vez)

> Si eres Alejandro, Juan o Christian, **salta al paso 5**. La base de datos ya estará configurada.

1. Ve al **SQL Editor** de Supabase Dashboard → selecciona el proyecto
2. Copia TODO el contenido de `supabase/migrations/00000000000000_init.sql` → pégalo y haz clic en **Run**
   - Deberías ver "Success. No rows returned" (es normal — las migraciones crean tablas, no filas)
3. Copia TODO el contenido de `supabase/seed.sql` → pégalo y haz clic en **Run**
   - Deberías ver "Success. 6 rows affected"
4. En **Table Editor**, verifica que existen 5 tablas: `profiles`, `services`, `reservations`, `subscriptions`, `transactions`
5. Comparte las claves del proyecto con el equipo por mensaje **privado**:
   - **Settings → API → Project URL** → es la `NEXT_PUBLIC_SUPABASE_URL`
   - **Settings → API → anon public** → es la `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Opción alternativa: Supabase Local con Docker

Si quieres experimentar sin afectar la BD compartida:

```bash
npx supabase start                    # Levanta PostgreSQL + Auth + Studio local
npx supabase db reset                 # Aplica migraciones + seed
# Studio local en: http://127.0.0.1:54323
```

Actualiza `.env.local` con los valores locales que muestra el comando `supabase start`. Cuando termines, regresa a las claves del proyecto en la nube.

### 5. Levantar el Servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Deberías ver la landing page.

| Ruta | Qué deberías ver |
|---|---|
| `/` | Landing page con hero y CTA |
| `/catalogo` | Placeholder "Catálogo de Servicios" |
| `/reservar` | Placeholder "Reservar Capacitación" |
| `/login` | Placeholder "Login" |
| `/register` | Placeholder "Register" |
| `/dashboard` | **Redirige a /login** (protección por rol ← esto es correcto) |

### 6. Verificar que Todo Funciona

```bash
npm run build      # Debe compilar sin errores (12 rutas generadas)
npm run lint       # Debe pasar sin errores
npm run test:e2e   # Debe pasar 3 smoke tests
```

---

## 📋 Scripts Disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Build de producción (usa flag `--webpack` por Serwist) |
| `npm start` | Sirve el build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Tests unitarios en modo watch (Vitest) |
| `npm run test:run` | Tests unitarios una sola vez (para CI) |
| `npm run test:e2e` | Tests E2E completos (Playwright) |
| `npm run test:e2e:ui` | Tests E2E con interfaz visual interactiva |

| Comando Supabase | Qué hace |
|---|---|
| `npx supabase start` | Levanta emuladores locales (requiere Docker) |
| `npx supabase db push` | Aplica migraciones pendientes |
| `npx supabase db reset` | Resetea BD + ejecuta migraciones + seed |
| `npx supabase functions serve hello-world --no-verify-jwt` | Ejecuta una Edge Function localmente |
| `npx supabase gen types typescript --local > types/database.ts` | Regenera tipos TS desde el esquema |

| Comando ShadCN | Qué hace |
|---|---|
| `npx shadcn@latest add button` | Instala componente Button en `components/ui/` |
| `npx shadcn@latest add input card table dialog form toast` | Instala múltiples componentes a la vez |

---

## 🔄 Flujo de Trabajo Diario

### Al iniciar tu jornada

```bash
git checkout develop
git pull origin develop                  # Trae los últimos cambios
git checkout feature/mi-tarea            # Regresa a tu rama
git merge develop                        # Integra los cambios de tus compañeros
```

### Al terminar una funcionalidad

```bash
git add .
git commit -m "feat: descripción breve de lo que hiciste"
git push origin feature/mi-tarea
```

Luego en GitHub: crea un **Pull Request** desde tu rama hacia `develop`. Pide a un compañero que lo revise.

### Convenciones de Commits

| Prefijo | Cuándo usarlo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Cambio de código sin cambiar funcionalidad |
| `style:` | Cambios de estilos/CSS |
| `docs:` | Cambios en documentación |
| `test:` | Agregar o modificar tests |
| `chore:` | Tareas de mantenimiento (dependencias, config) |

---

## 📖 Patrones de Código del Proyecto

### Cómo usar Supabase

**Desde un Server Component** (páginas, layouts):
```tsx
import { createClient } from "@/lib/supabase/server";

export default async function MiPagina() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true);

  return (
    <div>
      {services?.map((s) => <p key={s.id}>{s.name} - ${s.price}</p>)}
    </div>
  );
}
```

**Desde un Client Component** (interactividad, formularios):
```tsx
"use client";

import { useSupabase } from "@/hooks/use-supabase";
import { useQuery } from "@tanstack/react-query";

export function MiComponente() {
  const supabase = useSupabase();

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true);
      return data;
    },
  });

  return (
    <div>
      {services?.map((s) => <p key={s.id}>{s.name} - ${s.price}</p>)}
    </div>
  );
}
```

### Convenciones de Nombrado

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | kebab-case | `use-supabase.ts`, `design-tokens.ts` |
| Componentes | PascalCase | `Providers`, `StatusBadge` |
| Tipos/Interfaces | PascalCase | `UserRole`, `Database` |
| Variables/Funciones | camelCase | `createClient`, `handleSubmit` |
| Columnas de BD | snake_case | `full_name`, `created_at` |
| Rutas | kebab-case o lowercase | `/politica-privacidad`, `/catalogo` |
| Route Groups | paréntesis | `(auth)`, `(public)`, `(dashboard)` |
| Imports con alias | `@/` | `import { cn } from "@/lib/utils"` |

### Reglas Importantes

- **Server Components** son el default — no pongas `"use client"` a menos que necesites interactividad
- **CSS**: Solo clases utilitarias de Tailwind. No crear archivos CSS por componente
- **Class merging**: Siempre usar `cn()` de `@/lib/utils` para combinar clases condicionalmente
- **Iconos**: Importar desde `lucide-react` (ej: `import { Search } from "lucide-react"`)
- **Formularios**: React Hook Form + Zod resolver. Schemas en `lib/validators/`

---

## ⚠️ Restricciones Críticas

Estos son puntos que **todos deben conocer** porque ignorarlos causa errores difíciles de diagnosticar:

| # | Restricción | Por qué |
|---|---|---|
| 1 | **WEBPACK obligatorio** | Next.js 16 usa Turbopack por defecto, pero `@serwist/next` usa plugins de webpack. El flag `--webpack` ya está en los scripts de `package.json`. **No lo quites.** |
| 2 | **Supabase compartido** | Los 4 miembros usan las MISMAS claves. No crear proyectos propios de Supabase. |
| 3 | **RLS en TODAS las tablas** | Si agregas una tabla nueva, debes habilitarle RLS y crear sus policies. Sin esto, la tabla queda 100% abierta. |
| 4 | **Edge Functions = Deno** | Las funciones en `supabase/functions/` corren en Deno, NO en Node.js. La carpeta está excluida de `tsconfig.json`. Cada función tiene su propio `deno.json`. |
| 5 | **Tipos manuales** | `types/database.ts` se mantiene manualmente. Si cambias el esquema SQL, regenera: `npx supabase gen types typescript --local > types/database.ts` |
| 6 | **PWA — archivos generados** | `public/sw.js` y `public/sw.js.map` son generados por Serwist al hacer build. Están en `.gitignore`. No editarlos manualmente. |
| 7 | **lib webworker** | `tsconfig.json` incluye `"webworker"` en `lib` porque `app/sw.ts` usa `ServiceWorkerGlobalScope`. No quitarlo. |
| 8 | **MVP sin pasarela real** | No hay integración con PayPal/Stripe. Los pagos se registran manualmente (cash, transferencia, tarjeta). El webhook es un placeholder para el futuro. |
| 9 | **LOPDP obligatorio** | Los formularios de registro y reserva DEBEN incluir checkbox de consentimiento. Sin él, no se cumple la ley ecuatoriana. |

---

## 🐛 Problemas Comunes y Soluciones

### "La página carga pero no muestra datos / error de Supabase"
- Verifica que `.env.local` existe y tiene las claves **reales** (no los valores de ejemplo)
- Verifica que no hay comillas, espacios ni saltos de línea dentro de los valores
- **Reinicia el servidor** después de modificar `.env.local` (`Ctrl+C` → `npm run dev`)

### "No puedo acceder a /dashboard, me redirige a /login"
- Esto es correcto: las rutas admin están protegidas
- Necesitas un usuario con `role = 'admin'` en la tabla `profiles`
- Pide a Carlos que ejecute en el SQL Editor:
  ```sql
  UPDATE profiles SET role = 'admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com');
  ```

### "npm run dev no arranca"
1. `node -v` → ¿es v20+? Si no, actualiza Node.js
2. ¿Ejecutaste `npm install`? Si no, hazlo
3. ¿Existe `.env.local`? Si no, créalo (ver sección de variables de entorno)
4. Si el error dice "Module not found": `rm -rf node_modules && npm install`

### "npm install falla"
- Verifica tu conexión a internet
- Si estás en la red de la universidad, prueba con datos móviles
- Limpia la caché: `npm cache clean --force && npm install`

### "Error de tipos con Supabase"
- Los tipos pueden estar desactualizados. Regenera:
  ```bash
  npx supabase gen types typescript --local > types/database.ts
  ```

### "Tests E2E fallan"
1. Instala navegadores: `npx playwright install`
2. Los tests E2E necesitan el servidor corriendo. Abre **otra terminal** con `npm run dev`

### "Git: no tengo permisos para push"
- Pide a Carlos que te agregue como colaborador: GitHub → Settings → Collaborators → Add people

### "Git: conflictos al hacer merge"
1. VS Code marca los archivos con conflicto (`<<<<<<< HEAD`)
2. Elige: "Accept Current Change", "Accept Incoming Change" o edita manualmente
3. Después: `git add .` → `git commit -m "fix: resolver conflictos con develop"`
4. Si no sabes cómo resolverlo, **pregunta antes de hacer nada**

### "Aparece el template de Next.js en vez de la landing"
- Estás en una rama desactualizada: `git checkout develop && git pull origin develop`

---

## 👥 Equipo de Desarrollo

| Integrante | Rol | Área | Par de Trabajo |
|---|---|---|---|
| **Carlos Giovanni Ramos Jacome** | Backend Lead + PM | Auth, Seguridad, Edge Functions, Transacciones | Carlos + Alejandro |
| **Edison Alejandro Andrade Ocana** | Backend + DB | Schemas Zod, CRUD, Migraciones, Seed | Carlos + Alejandro |
| **Juan Pablo López Ramos** | Frontend Lead + UX | Páginas públicas, Formularios, Responsive | Juan + Christian |
| **Christian Alexis Hurtado Torres** | Frontend + Dashboard | Admin UI, Gráficos, Design System, Auth UI | Juan + Christian |

Para tareas detalladas, dependencias y cronograma completo, consulta el archivo `PLAN_DE_DESARROLLO.md`.

---

> Proyecto reestructurado sobre la base inicial. Todo código del antiguo monolito de NestJS ha sido deprecado en favor de las tecnologías indicadas.
>>>>>>> develop
