# RNG-Vantage — AI Agent Context File

> This file is machine-readable project context optimized for LLM/AI agent consumption.
> It describes the full state of the project so an agent can understand it without reading other files.
> Last updated: 2026-04-04

---

<PROJECT_IDENTITY>

name: RNG-Vantage
type: academic-project
domain: sales-automation, reservations, financial-control for digital-marketing-agency
language_code: es (Spanish — all UI text, variable names in English, comments in Spanish)
university: Universidad Tecnica de Ambato (UTA), Ecuador
academic_period: January 2026 - July 2026 (8th semester)
team_size: 4
repository: GitHub (private)
branching_model: Git Flow Simplified (main → develop → feature/*)
current_branch: develop
version: 0.2.0
status: SPRINT_2_IN_PROGRESS — Sprint 1 complete (Navbar, Footer, Landing, Reservar form). Sprint 2: Catálogo done. Checkout UI pending Carlos's Server Action.

real_client: Ruth Noemi Gómez Lescano
client_business: RGL ESTUDIO (también operando como GMZ ESTUDIO)
client_business_type: Agencia de manejo estratégico de redes sociales y producción audiovisual B2B
client_target_market: Empresarios 35-55 años, sector servicios (hotelería, turismo, gastronomía), Baños de Agua Santa y Ambato, Ecuador
client_note: RNG-Vantage ES la "Intranet de gestión financiera y de clientes" mencionada en el plan de negocios de Ruth. Los estudiantes de UTA (este equipo) son los aliados estratégicos de desarrollo citados en dicho plan.

</PROJECT_IDENTITY>

---

<ARCHITECTURE>

pattern: BaaS (Backend-as-a-Service)
description: Serverless architecture. No custom backend server. All backend logic lives in Supabase (PostgreSQL + Auth + Edge Functions + Realtime + Storage). Frontend is a Next.js PWA that communicates directly with Supabase via client libraries.

## Stack (exact versions from package.json)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.1.6 | App Router, SSR, Server Components |
| UI Library | React | 19.2.3 | Component rendering |
| Language | TypeScript | ^5 | Type safety, strict mode |
| Styling | Tailwind CSS | ^4 | Utility-first CSS |
| Component Library | ShadCN/UI (base-nova) | shadcn ^4.0.8 | Pre-built accessible components |
| Headless UI | @base-ui/react | ^1.3.0 | Unstyled primitives for ShadCN |
| Icons | lucide-react | ^0.577.0 | SVG icon library |
| Forms | react-hook-form | ^7.71.2 | Form state management |
| Validation | zod | ^4.3.6 | Schema validation |
| Data Fetching | @tanstack/react-query | ^5.90.21 | Client-side caching, mutations |
| Charts | recharts | ^3.8.0 | Dashboard visualizations |
| BaaS | @supabase/supabase-js | ^2.99.2 | Database, Auth, Realtime, Storage |
| SSR Auth | @supabase/ssr | ^0.9.0 | Cookie-based auth for Next.js |
| PWA | @serwist/next + serwist | ^9.5.7 | Service Worker, offline support |
| Class Utils | clsx + tailwind-merge + cva | ^2.1.1 / ^3.5.0 / ^0.7.1 | className composition |
| Animations | tw-animate-css | ^1.4.0 | Tailwind animation utilities |
| Unit Testing | vitest | ^4.1.0 | Fast unit test runner |
| Component Testing | @testing-library/react | ^16.3.2 | React component testing |
| E2E Testing | @playwright/test | ^1.58.2 | Browser automation tests |
| Linting | eslint + eslint-config-next | ^9 / 16.1.6 | Code quality |

## Data Flow

```
[Browser] → Next.js App Router (Server Components) → Supabase PostgreSQL
                                                    → Supabase Auth (JWT)
                                                    → Supabase Edge Functions (Deno)
                                                    → Supabase Realtime (WebSocket)

[Browser] → Next.js Client Components → useSupabase() hook → Supabase JS Client
                                       → TanStack Query (cache layer)
```

## Auth Flow

```
Register → Supabase Auth signUp() → trigger: handle_new_user() → auto-create profile (role='client')
                                                                → sets raw_app_meta_data.role='client' en auth.users
Login → Supabase Auth signInWithPassword() → JWT token stored in cookie
                                           → JWT incluye app_metadata.role desde raw_app_meta_data
Every Request → middleware.ts → updateSession() → refresh JWT if needed
Admin Routes → middleware.ts → check profiles.role === 'admin' → allow or redirect

IMPORTANTE: El JWT role para RLS se lee de app_metadata, NO de auth.jwt() ->> 'role'.
- CORRECTO: (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
- INCORRECTO: (auth.jwt() ->> 'role') = 'admin'  ← siempre retorna 'authenticated'
Cuando un admin actualiza profiles.role → trigger trg_sync_profile_role → propaga a raw_app_meta_data → JWT actualizado en el siguiente login.
```

## Deployment Target

- Frontend: Vercel (auto-deploy from GitHub)
- Backend: Supabase Cloud (shared project — one instance for all team members)
- Edge Functions: Supabase Edge Functions (Deno runtime)

</ARCHITECTURE>

---

<DIRECTORY_MAP>

Status legend: DONE = fully implemented, PLACEHOLDER = only has heading/stub, PARTIAL = structure exists but incomplete, EMPTY = folder exists with .gitkeep only, TODO = planned but not created

```
/
├── app/
│   ├── layout.tsx                          [DONE] Root layout: Space Grotesk + Work Sans + Inter fonts, <Providers>, <Toaster>, lang="es"
│   ├── page.tsx                            [DELETED] Moved to (public)/page.tsx
│   ├── sw.ts                               [DONE] Serwist Service Worker: precache + runtime caching
│   ├── globals.css                         [DONE] Tailwind v4 + full design system tokens (--background:#f5f7f5, --foreground:#2c2f2e, --primary:#ae2900, --radius:0px) + marquee animation
│   ├── favicon.ico                         [DONE] Default favicon
│   ├── (auth)/
│   │   ├── layout.tsx                      [DONE] Centered wrapper (max-w-sm, min-h-screen)
│   │   ├── login/page.tsx                  [PLACEHOLDER] Only renders <h1>Login</h1>
│   │   └── register/page.tsx               [PLACEHOLDER] Only renders <h1>Register</h1>
│   ├── (public)/
│   │   ├── layout.tsx                      [DONE] Navbar + Footer wrapper, CSS tokens, responsive
│   │   ├── page.tsx                        [DONE] Landing page: hero, services grid (mock data), how-it-works, CTA. Uses next/image, Work Sans body, Space Grotesk headlines
│   │   ├── catalogo/
│   │   │   ├── page.tsx                    [DONE] Async Server Component — fetches active services from Supabase, passes to CatalogoGrid
│   │   │   └── catalogo-grid.tsx           [DONE] Client Component — filter tabs by type, brutalist card grid (hover→primary), price display, "Contratar" → /checkout?service_id=xxx
│   │   ├── reservar/
│   │   │   ├── page.tsx                    [DONE] Reservation form: React Hook Form + zodResolver(createReservationSchema), 6 fields, Calendar popover, LOPDP checkbox, sonner toast
│   │   │   └── actions.ts                  [DONE] Server Action createReservation() — validates with Zod, inserts into reservations table via Supabase server client
│   │   ├── checkout/page.tsx               [PLACEHOLDER] Only renders <h1>Checkout</h1> — pending Carlos's checkout/actions.ts
│   │   └── politica-privacidad/page.tsx    [PLACEHOLDER] Skeleton — TODO: LOPDP legal content (Tarea 6 Juan)
│   └── (dashboard)/
│       ├── layout.tsx                      [PARTIAL] Basic wrapper — TODO: admin sidebar/nav
│       ├── dashboard/page.tsx              [PLACEHOLDER] Only renders <h1>Dashboard</h1>
│       ├── reservas/page.tsx               [PLACEHOLDER] Only renders heading
│       ├── servicios/page.tsx              [PLACEHOLDER] Only renders heading
│       ├── subscriptions/page.tsx          [PLACEHOLDER] Only renders heading
│       └── transacciones/page.tsx          [PLACEHOLDER] Only renders heading
├── components/
│   ├── navbar.tsx                          [DONE] Sticky navbar: logo, dynamic active state (usePathname), CTA button, mobile Sheet menu. Design system aligned.
│   ├── footer.tsx                          [DONE] 3-column footer: logo, legal links, copyright. Inverted colors.
│   ├── providers.tsx                       [DONE] QueryClientProvider (staleTime: 60s, refetchOnWindowFocus: false)
│   └── ui/
│       ├── button.tsx                      [DONE] ShadCN Button (CVA variants: default, outline, secondary, ghost, destructive, link)
│       ├── input.tsx                       [DONE] Base UI InputPrimitive wrapper
│       ├── textarea.tsx                    [DONE] Native textarea wrapper
│       ├── label.tsx                       [DONE] ShadCN Label
│       ├── checkbox.tsx                    [DONE] Base UI Checkbox wrapper
│       ├── calendar.tsx                    [DONE] react-day-picker Calendar (date-fns, es locale)
│       ├── popover.tsx                     [DONE] Base UI Popover (Positioner + Popup pattern)
│       └── sonner.tsx                      [DONE] Sonner toast wrapper (used in layout.tsx via <Toaster />)
├── hooks/
│   └── use-supabase.ts                     [DONE] useMemo(() => createClient(), [])
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       [DONE] createBrowserClient() factory
│   │   ├── server.ts                       [DONE] createServerClient() factory (cookie-based)
│   │   └── middleware.ts                   [DONE] updateSession() — JWT refresh via getUser()
│   ├── validators/
│   │   ├── auth.ts                         [DONE] Alejandro — loginSchema (email, password), registerSchema (first_name, last_name, email, password, confirm_password, data_consent)
│   │   ├── reservation.ts                  [DONE] Alejandro — createReservationSchema (full_name, email, phone?, preferred_date ISO string, notes?, data_consent)
│   │   ├── service.ts                      [DONE] Alejandro — createServiceSchema, updateServiceSchema
│   │   ├── subscription.ts                 [DONE] Alejandro — subscription schema
│   │   └── transaction.ts                  [DONE] Alejandro — transaction schema
│   ├── design-tokens.ts                    [DONE] BRAND, BREAKPOINTS, SPACING, CHART_COLORS constants
│   └── utils.ts                            [DONE] cn() = clsx + twMerge
├── types/
│   ├── database.ts                         [DONE] Manual DB types (Row/Insert/Update per table)
│   └── index.ts                            [DONE] Re-exports all types from database.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260325120000_init.sql         [DONE] Alejandro — Full schema: 5 tables, RLS, triggers (schema base)
│   │   ├── 20260402000000_split_full_name.sql [DONE] Alejandro — full_name → first_name + last_name en profiles y reservations
│   │   ├── 20260403010000_fix_profiles_admin_policy.sql [DONE] Alejandro — fix recursión infinita en profiles (path parcial)
│   │   └── 20260404000000_fix_security_and_business_logic.sql [DONE] Juan — Auditoría completa: RLS app_metadata, auto_renew trigger, subscriptions DEFAULT, índices, sync JWT, escalada de privilegios, reservas anónimas
│   ├── functions/
│   │   └── hello-world/
│   │       ├── index.ts                    [DONE] Template Edge Function (Deno.serve)
│   │       └── deno.json                   [DONE] Deno config for function
│   ├── seed.sql                            [DONE] 10 servicios reales de RGL ESTUDIO con precios correctos (actualizado por Alejandro + aplicado a DB el 2026-04-04)
│   ├── config.toml                         [DONE] Supabase CLI config (PostgreSQL 17, ports, auth, etc.)
│   └── .gitignore                          [DONE] Supabase temp files
├── e2e/
│   └── example.spec.ts                     [DONE] 3 basic smoke tests (landing, catalogo, reservar)
├── public/
│   ├── images/
│   │   └── hero-dashboard.webp             [DONE] Hero section image (local, optimized via next/image)
│   ├── sw.js                               [GENERATED] Built by Serwist (gitignored)
│   └── *.svg                               [DONE] Default Next.js assets
├── .vscode/
│   ├── settings.json                       [DONE] Recommended VS Code settings
│   └── extensions.json                     [DONE] Recommended extensions
├── middleware.ts                            [DONE] Auth session refresh + admin route protection
├── package.json                            [DONE] All deps installed
├── next.config.ts                          [DONE] Serwist PWA wrapper
├── tsconfig.json                           [DONE] Strict, ES2017, webworker lib, @/ alias
├── vitest.config.ts                        [DONE] jsdom, react plugin, @/ alias
├── vitest.setup.ts                         [DONE] @testing-library/jest-dom/vitest
├── playwright.config.ts                    [DONE] Desktop Chrome + Pixel 5, auto-start dev server
├── components.json                         [DONE] ShadCN config (base-nova style)
├── eslint.config.mjs                       [DONE] Next.js core-web-vitals + TypeScript
├── postcss.config.mjs                      [DONE] @tailwindcss/postcss
├── .env.example                            [DONE] Template: SUPABASE_URL, ANON_KEY, SITE_URL
├── .gitignore                              [DONE] Standard + *.pdf, public/sw.js*, .vscode/*, Thumbs.db
├── README.md                               [DONE] 650+ lines — full docs + tutorial
└── PLAN_DE_DESARROLLO.md                   [DONE] Full dev plan with roles, sprints, branches
```

</DIRECTORY_MAP>

---

<DATABASE_SCHEMA>

database: PostgreSQL (via Supabase)
extension: uuid-ossp
rls: ENABLED on all tables
auto_updated_at: trigger on all tables (handle_updated_at function)

## Table: profiles
Extends auth.users. Auto-created on user signup via trigger.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| id | uuid (PK) | NOT NULL | — | FK → auth.users ON DELETE CASCADE |
| first_name | text | YES | NULL | — (migrado desde full_name — ver nota) |
| last_name | text | YES | NULL | — |
| avatar_url | text | YES | NULL | — |
| role | text | NOT NULL | 'client' | CHECK: 'admin' \| 'client' |
| data_consent_at | timestamptz | YES | NULL | LOPDP compliance timestamp |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | auto-trigger |

RLS:
- SELECT own: auth.uid() = id
- SELECT all (admin): (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
- UPDATE own: auth.uid() = id WITH CHECK (role = 'client') — previene escalada de privilegios
- UPDATE all (admin): (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
- INSERT own: auth.uid() = id WITH CHECK (role = 'client') — previene registro con role='admin'

Triggers:
- on_auth_user_created → handle_new_user() → auto-insert profile con first_name, last_name, avatar_url + inicializa raw_app_meta_data.role='client' en auth.users
- on_profiles_updated → handle_updated_at()
- trg_sync_profile_role (AFTER UPDATE OF role) → sync_profile_role_to_auth() → propaga role a raw_app_meta_data en auth.users para que el JWT lo refleje

NOTE: profiles originally had full_name. Migration applied to split into first_name + last_name. Carlos must update signUp() to pass first_name and last_name in options.data instead of full_name.

## Table: services
Catalog of service packages offered by the agency.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| id | uuid (PK) | NOT NULL | uuid_generate_v4() | — |
| name | text | NOT NULL | — | — |
| description | text | YES | NULL | — |
| type | text | NOT NULL | — | CHECK: 'manejo_redes' \| 'auditoria' \| 'capacitacion' \| 'otro' |
| price | numeric(10,2) | NOT NULL | — | CHECK: >= 0 |
| duration_months | int | NOT NULL | 1 | CHECK: > 0 |
| is_active | boolean | NOT NULL | true | soft delete flag |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | auto-trigger |

RLS:
- SELECT active: is_active = true (any authenticated user)
- SELECT all: role = 'admin' (includes inactive)
- INSERT/UPDATE/DELETE: role = 'admin' only

## Table: reservations
Training session reservation requests from prospects/clients.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| id | uuid (PK) | NOT NULL | uuid_generate_v4() | — |
| user_id | uuid | YES | NULL | FK → auth.users ON DELETE SET NULL |
| first_name | text | NOT NULL | — | — (migrado desde full_name) |
| last_name | text | NOT NULL | — | — |
| email | text | NOT NULL | — | — |
| phone | text | YES | NULL | — |
| preferred_date | timestamptz | NOT NULL | — | — |
| status | text | NOT NULL | 'pending' | CHECK: 'pending' \| 'confirmed' \| 'cancelled' \| 'completed' |
| notes | text | YES | NULL | — |
| data_consent | boolean | NOT NULL | false | LOPDP compliance flag |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | auto-trigger |

RLS:
- SELECT own: auth.uid() = user_id
- SELECT all: role = 'admin'
- INSERT: any authenticated user (auth.uid() IS NOT NULL)
- UPDATE: role = 'admin' only

## Table: subscriptions
Active service subscriptions linked to a user and a service.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| id | uuid (PK) | NOT NULL | uuid_generate_v4() | — |
| user_id | uuid | NOT NULL | — | FK → auth.users ON DELETE CASCADE |
| service_id | uuid | NOT NULL | — | FK → services ON DELETE RESTRICT |
| starts_at | timestamptz | NOT NULL | now() | — |
| ends_at | timestamptz | NOT NULL | — | calculated: starts_at + duration_months |
| status | text | NOT NULL | 'active' | CHECK: 'active' \| 'expired' \| 'cancelled' \| 'pending' |
| auto_renew | boolean | NOT NULL | false | if true, Edge Function auto-renews |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | auto-trigger |

RLS:
- SELECT own: auth.uid() = user_id
- SELECT all: role = 'admin'
- INSERT: auth.uid() = user_id (users can only create their own)
- UPDATE: role = 'admin' only

## Table: transactions
Payment/sales records. Linked to user and optionally to a subscription.

| Column | Type | Nullable | Default | Constraint |
|---|---|---|---|---|
| id | uuid (PK) | NOT NULL | uuid_generate_v4() | — |
| user_id | uuid | YES | NULL | FK → auth.users ON DELETE SET NULL |
| subscription_id | uuid | YES | NULL | FK → subscriptions ON DELETE SET NULL |
| amount | numeric(10,2) | NOT NULL | — | CHECK: >= 0 |
| payment_method | text | NOT NULL | 'pending' | CHECK: 'cash' \| 'transfer' \| 'card' \| 'pending' |
| status | text | NOT NULL | 'pending' | CHECK: 'pending' \| 'completed' \| 'failed' \| 'refunded' |
| notes | text | YES | NULL | — |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | auto-trigger |

RLS:
- SELECT own: auth.uid() = user_id
- SELECT all: role = 'admin'
- INSERT: role = 'admin' only
- UPDATE: role = 'admin' only

## Entity Relationships

```
auth.users (1) ←──── (1) profiles
auth.users (1) ←──── (N) reservations
auth.users (1) ←──── (N) subscriptions
auth.users (1) ←──── (N) transactions
services   (1) ←──── (N) subscriptions
subscriptions (1) ←── (N) transactions
```

## Seed Data — Servicios reales de RGL ESTUDIO (Ruth Gómez Lescano)

IMPORTANTE: El seed original tenía precios incorrectos. Los precios reales provienen del plan de negocios oficial de la cliente (T9_F3 + T15_RUTH_GOMEZ_LESCANO).

Distinción crítica de negocio:
- SUSCRIPCIÓN MENSUAL (manejo_redes): se cobra mensualmente, auto_renew posible, genera MRR (Monthly Recurring Revenue)
- SERVICIO ÚNICO (auditoria, capacitacion, otro): pago único, auto_renew = false siempre, no cuenta para MRR

| name | type | price | duration_months | es_suscripcion |
|---|---|---|---|---|
| Redes Sociales Inicial | manejo_redes | 299.99 | 1 | SÍ |
| Redes Sociales Work | manejo_redes | 319.99 | 1 | SÍ |
| Redes Sociales Premium | manejo_redes | 555.00 | 1 | SÍ |
| Auditoría de Marca | auditoria | 70.00 | 1 | NO |
| Curso x 3 Meses | capacitacion | 500.00 | 3 | NO |
| Sesión Fotográfica | otro | 130.00 | 1 | NO |
| Sesión Audiovisual (2 videos) | otro | 150.00 | 1 | NO |
| Sesión Audiovisual (6 videos) | otro | 230.00 | 1 | NO |
| Sesión Audiovisual (15 videos) | otro | 500.00 | 1 | NO |
| Modelo por 1 hora | otro | 25.00 | 1 | NO |

Responsable de actualizar seed.sql: Alejandro

</DATABASE_SCHEMA>

---

<TYPESCRIPT_TYPES>

file: types/database.ts
generation: manual (auto-generation command: `npx supabase gen types typescript --local > types/database.ts`)

## Enums

```typescript
type UserRole = "admin" | "client"
type ServiceType = "manejo_redes" | "auditoria" | "capacitacion" | "otro"
type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed"
type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending"
type TransactionStatus = "pending" | "completed" | "failed" | "refunded"
type PaymentMethod = "cash" | "transfer" | "card" | "pending"
```

## Database Type Structure

```typescript
Database.public.Tables.[table_name].Row     // SELECT result type
Database.public.Tables.[table_name].Insert   // INSERT parameter type
Database.public.Tables.[table_name].Update   // UPDATE parameter type
```

Tables: profiles, services, reservations, subscriptions, transactions

</TYPESCRIPT_TYPES>

---

<AUTH_FLOW>

provider: Supabase Auth (email + password)
token: JWT stored in HTTP-only cookies (managed by @supabase/ssr)
session_refresh: automatic via middleware on every request
jwt_expiry: 1 hour (configured in supabase/config.toml)

## Registration Flow
1. User submits email + password + full_name + LOPDP consent
2. `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
3. Supabase creates auth.users row
4. Trigger `on_auth_user_created` fires → inserts into profiles (role='client', full_name from metadata)
5. JWT token set in cookie

## Login Flow
1. User submits email + password
2. `supabase.auth.signInWithPassword({ email, password })`
3. JWT token set in cookie
4. Frontend redirects based on role: admin → /dashboard, client → /catalogo

## Session Refresh Flow (every request)
1. `middleware.ts` runs on every non-static request
2. Calls `updateSession(request)` from `lib/supabase/middleware.ts`
3. Creates Supabase server client with cookie bridge
4. Calls `supabase.auth.getUser()` which auto-refreshes expired JWT
5. Updated cookie is set on response

## Route Protection Flow (admin routes only)
1. `middleware.ts` checks if pathname starts with any of: /dashboard, /reservas, /servicios, /transacciones, /suscripciones, /subscriptions
2. If admin route:
   a. Gets user via `supabase.auth.getUser()`
   b. If no user → redirect to `/login?redirect={pathname}`
   c. Queries `profiles` table for user's role
   d. If role !== 'admin' → redirect to `/`
   e. If admin → allow through

## Supabase Client Usage Pattern

- **Server Components**: `const supabase = await createClient()` from `lib/supabase/server.ts`
- **Client Components**: `const supabase = useSupabase()` hook from `hooks/use-supabase.ts`
- **Middleware**: Direct `createServerClient()` with request cookie bridge
- **Edge Functions**: Direct `createClient()` from `@supabase/supabase-js` (Deno)

</AUTH_FLOW>

---

<ROUTE_MAP>

## Public Routes (no auth required)
| Path | Route Group | Page File | Status |
|---|---|---|---|
| / | (public) | app/(public)/page.tsx | DONE |
| /catalogo | (public) | app/(public)/catalogo/page.tsx | PLACEHOLDER |
| /reservar | (public) | app/(public)/reservar/page.tsx | PLACEHOLDER |
| /checkout | (public) | app/(public)/checkout/page.tsx | PLACEHOLDER |
| /politica-privacidad | (public) | app/(public)/politica-privacidad/page.tsx | PARTIAL |

## Auth Routes (no auth required, redirect if logged in)
| Path | Route Group | Page File | Status |
|---|---|---|---|
| /login | (auth) | app/(auth)/login/page.tsx | PLACEHOLDER |
| /register | (auth) | app/(auth)/register/page.tsx | PLACEHOLDER |

## Admin Routes (requires auth + role='admin', protected by middleware.ts)
| Path | Route Group | Page File | Status |
|---|---|---|---|
| /dashboard | (dashboard) | app/(dashboard)/dashboard/page.tsx | PLACEHOLDER |
| /reservas | (dashboard) | app/(dashboard)/reservas/page.tsx | PLACEHOLDER |
| /servicios | (dashboard) | app/(dashboard)/servicios/page.tsx | PLACEHOLDER |
| /subscriptions | (dashboard) | app/(dashboard)/subscriptions/page.tsx | PLACEHOLDER |
| /transacciones | (dashboard) | app/(dashboard)/transacciones/page.tsx | PLACEHOLDER |

## Middleware Matcher
Matches all paths EXCEPT: _next/static, _next/image, favicon.ico, *.svg/png/jpg/jpeg/gif/webp

</ROUTE_MAP>

---

<STATE_MANAGEMENT>

## Server-Side Data (Server Components)
- Direct Supabase queries in Server Components using `await createClient()` from `lib/supabase/server.ts`
- No client-side state needed — data fetched at render time
- Used for: catalog pages, dashboard initial load, any read-heavy page

## Client-Side Cache (TanStack Query)
- Provider: `components/providers.tsx` wraps app in `QueryClientProvider`
- Config: staleTime=60s, refetchOnWindowFocus=false
- Pattern: `useQuery({ queryKey: [...], queryFn: async () => supabase.from('table').select('*') })`
- Used for: interactive pages where data may change (dashboard, admin tables)

## Real-Time Updates (Supabase Realtime)
- Not yet implemented (TODO)
- Planned: subscribe to INSERT/UPDATE on reservations, transactions, subscriptions
- Pattern: `supabase.channel('table').on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, callback).subscribe()`
- Used for: admin dashboard live updates

## Form State (React Hook Form + Zod)
- Not yet implemented (TODO)
- Pattern: `useForm({ resolver: zodResolver(schema) })`
- Zod schemas will live in `lib/validators/*.ts`

</STATE_MANAGEMENT>

---

<IMPLEMENTATION_STATUS>

## DONE (fully functional)
- [x] Project scaffolding (Next.js 16, TypeScript strict, all deps installed)
- [x] Supabase client factories (browser, server, middleware)
- [x] Auth session refresh middleware
- [x] Admin route protection middleware (role-based)
- [x] Database schema (5 tables, RLS, triggers, seed)
- [x] TypeScript types for all DB tables
- [x] PWA setup (Serwist service worker)
- [x] TanStack Query provider
- [x] Navbar + Footer (responsive, design-system aligned, mobile Sheet menu)
- [x] Landing page (hero with next/image, services bento grid, how-it-works, CTA — prices aligned with seed.sql, ShadCN Button, CSS tokens, marquee in globals.css)
- [x] Design tokens (brand, breakpoints, spacing, chart colors)
- [x] ShadCN/UI config + Button component (+ Sheet for mobile nav)
- [x] Utility function cn()
- [x] useSupabase() hook
- [x] Vitest + Playwright configs
- [x] 3 E2E smoke tests
- [x] ESLint + PostCSS configs
- [x] .env.example template
- [x] README.md (650+ lines with tutorial)
- [x] PLAN_DE_DESARROLLO.md (full dev plan)

## PLACEHOLDER (file exists, only renders heading — needs full implementation)
- [ ] /login page → needs: React Hook Form + Zod + Supabase Auth signIn
- [ ] /register page → needs: React Hook Form + Zod + Supabase Auth signUp + LOPDP consent
- [ ] /catalogo page → needs: service cards grid, filters by type, "Contratar" button
- [ ] /reservar page → needs: reservation form with validation
- [ ] /checkout page → needs: order summary, payment form, subscription creation
- [ ] /dashboard page → needs: KPI cards, Recharts charts, recent transactions table
- [ ] /reservas admin → needs: data table, status filters, status change actions
- [ ] /servicios admin → needs: CRUD table, create/edit dialog
- [ ] /subscriptions admin → needs: subscription table, status management
- [ ] /transacciones admin → needs: transaction table, manual payment registration

## PARTIAL (structure exists, needs completion)
- [ ] Dashboard layout → needs: admin sidebar with navigation
- [ ] Privacy policy page → needs: full LOPDP legal content

## EMPTY (folder/file exists but no content)
- [ ] lib/validators/ → needs: auth.ts, reservation.ts, service.ts, subscription.ts, transaction.ts (Zod schemas)

## TODO (not yet created)
- [ ] Server Actions for all CRUD operations
- [ ] Edge Function: subscription-renewal (auto-renew expired subscriptions)
- [ ] Edge Function: dashboard-metrics (calculate financial KPIs)
- [ ] Edge Function: payment-webhook (placeholder for payment gateway)
- [ ] Supabase Realtime integration (live updates on dashboard)
- [ ] Custom components: StatusBadge, DataCard, DataTable
- [ ] Additional ShadCN components: input, textarea, form, card, table, dialog, toast, badge, tabs, separator, popover, calendar, checkbox, select, dropdown-menu, avatar (sheet already installed)
- [ ] Unit tests (none written yet)
- [ ] Comprehensive E2E tests (only 3 smoke tests exist)
- [ ] Dark mode toggle (theme tokens exist but no toggle UI)

</IMPLEMENTATION_STATUS>

---

<DEPENDENCIES_MAP>

Critical dependency chains — modifying upstream files affects all downstream consumers.

```
lib/supabase/client.ts
  └── hooks/use-supabase.ts
       └── ALL client components that fetch data

lib/supabase/server.ts
  └── ALL Server Components that fetch data
  └── ALL Server Actions

lib/supabase/middleware.ts
  └── middleware.ts (root)

middleware.ts
  └── ALL routes (session refresh)
  └── ADMIN routes (role protection)

types/database.ts
  └── ALL components, actions, hooks that use DB types

supabase/migrations/00000000000000_init.sql
  └── types/database.ts (must be regenerated if schema changes)
  └── supabase/seed.sql (must match schema)

components/providers.tsx
  └── app/layout.tsx
       └── ALL pages (QueryClient available everywhere)

lib/validators/*.ts (TODO)
  └── ALL forms (client-side validation)
  └── ALL Server Actions (server-side validation)

app/globals.css
  └── ALL components (theme tokens, colors)

lib/design-tokens.ts
  └── ALL frontend components that reference brand/spacing/chart constants
```

## Cross-Team Dependencies

```
Carlos (Auth) ──blocks──→ Christian (Login/Register UI)
Carlos (Auth) ──blocks──→ Alejandro (Server Actions need auth context)
Alejandro (Zod schemas) ──blocks──→ Juan (Forms need validation schemas)
Alejandro (Zod schemas) ──blocks──→ Christian (Admin forms need validation)
Alejandro (CRUD backend) ──blocks──→ Juan (Catalog, Checkout need Server Actions)
Alejandro (CRUD backend) ──blocks──→ Christian (Admin tables need Server Actions)
Carlos (Edge Function: metrics) ──blocks──→ Christian (Dashboard charts need data API)
```

</DEPENDENCIES_MAP>

---

<TEAM_STRUCTURE>

## Carlos Giovanni Ramos Jacome
role: Backend Lead + Project Manager
area: Auth, Security, Edge Functions, Transactions, Project Management
pair: Carlos + Alejandro (backend pair)
files_owned:
  - middleware.ts
  - lib/supabase/middleware.ts
  - supabase/functions/subscription-renewal/ (TODO)
  - supabase/functions/dashboard-metrics/ (TODO)
  - Transaction Server Actions (TODO)
branches:
  - feature/auth-registro-login
  - feature/rls-politicas-seguridad
  - feature/edge-function-suscripciones
  - feature/edge-function-dashboard-metrics
  - feature/transacciones-logica-pagos

## Edison Alejandro Andrade Ocana
role: Backend + Database
area: Zod Schemas, CRUD for all modules, DB migrations, Seed data
pair: Carlos + Alejandro (backend pair)
files_owned:
  - lib/validators/*.ts (all Zod schemas)
  - app/(public)/reservar/actions.ts (TODO)
  - app/(dashboard)/reservas/actions.ts (TODO)
  - app/(public)/checkout/actions.ts (TODO)
  - supabase/migrations/ (new migrations)
  - supabase/seed.sql
  - types/database.ts (regeneration)
branches:
  - feature/validators-zod-schemas
  - feature/reservas-backend-crud
  - feature/servicios-backend-crud
  - feature/suscripciones-contratacion
  - feature/migraciones-refinamiento

## Juan Pablo Lopez Ramos
role: Frontend Lead + UX
area: Public-facing pages, Forms, Mobile-first, Responsive design
pair: Juan + Christian (frontend pair)
files_owned:
  - app/(public)/layout.tsx (navbar, footer)
  - app/page.tsx (landing page redesign)
  - app/(public)/catalogo/page.tsx
  - app/(public)/reservar/page.tsx
  - app/(public)/checkout/page.tsx
  - app/(public)/politica-privacidad/page.tsx
branches:
  - feature/navbar-footer-publico
  - feature/landing-page
  - feature/reservar-formulario
  - feature/catalogo-servicios-ui
  - feature/checkout-ui
  - feature/politica-privacidad

## Christian Alexis Hurtado Torres
role: Frontend + Dashboard UI
area: Admin interfaces, Charts, Design System, Auth pages UI
pair: Juan + Christian (frontend pair)
files_owned:
  - app/globals.css (theme updates)
  - lib/design-tokens.ts (final tokens)
  - app/(auth)/login/page.tsx
  - app/(auth)/register/page.tsx
  - app/(dashboard)/layout.tsx (admin sidebar)
  - app/(dashboard)/dashboard/page.tsx
  - app/(dashboard)/reservas/page.tsx
  - app/(dashboard)/servicios/page.tsx
  - app/(dashboard)/subscriptions/page.tsx
  - app/(dashboard)/transacciones/page.tsx
  - hooks/use-realtime-metrics.ts (TODO)
branches:
  - feature/sistema-diseno-shadcn
  - feature/auth-login-register-ui
  - feature/dashboard-graficos
  - feature/reservas-admin-ui
  - feature/servicios-admin-ui
  - feature/transacciones-admin-ui

</TEAM_STRUCTURE>

---

<DEVELOPMENT_TIMELINE>

total_duration: 16 weeks (January 2026 - July 2026)
methodology: pair programming (backend pair + frontend pair)
workload_distribution: backend 55% | frontend 45%

## Sprint 1 — Weeks 5-6 (Feb-Mar 2026): Base Funcional
| Developer | Deliverables |
|---|---|
| Carlos | Auth complete (register, login, role assignment, LOPDP consent), RLS validation |
| Alejandro | All Zod schemas, Reservations CRUD, Services CRUD |
| Juan | Navbar/Footer, Landing page redesign, Reservation form UI |
| Christian | Design system (ShadCN components, tokens), Login/Register UI |

DEMO: Visitor sees landing, navigates, reserves. User registers/logs in. Admin reaches (empty) dashboard.

## Sprint 2 — Weeks 7-8 (Mar 2026): Core Modules
| Developer | Deliverables |
|---|---|
| Carlos | Edge Function: subscription-renewal, RLS refinement |
| Alejandro | Subscription checkout logic (create subscription + transaction) |
| Juan | Catalog UI (service cards, filters), Checkout UI |
| Christian | Dashboard (KPI cards + Recharts), Reservations admin UI |

DEMO: Client browses services, checkouts → subscription created. Admin sees reservations + basic metrics.

## Sprint 3 — Weeks 9-10 (Apr 2026): Integration
| Developer | Deliverables |
|---|---|
| Carlos | Edge Function: dashboard-metrics, SQL optimization |
| Alejandro | SQL views, Realtime setup, refined seed data |
| Juan | Privacy policy (LOPDP), responsive polish |
| Christian | Services admin UI, Transactions admin UI |

DEMO: Dashboard with real metrics and charts. Admin manages all modules. LOPDP page live. Mobile polished.

## Sprint 4 — Weeks 11-12 (Apr-May 2026): Closure
| Developer | Deliverables |
|---|---|
| Carlos | Technical documentation, code review |
| Alejandro | Final seed data, production migrations |
| Juan | Final responsive tests, Playwright E2E mobile |
| Christian | Realtime dashboard, admin UI polish |

DEMO: Complete system end-to-end, ready for QA.

## QA Phase — Weeks 13-14 (May-Jun 2026)
- Functional integration testing (Alejandro — Vitest)
- E2E flow testing (Juan — Playwright)
- Financial calculation verification (Carlos — SQL)
- Security testing: RLS, auth, injection (Carlos)
- Mobile/UX testing (Juan — real browsers + Playwright mobile)
- Role validation testing (Christian — Playwright)

## Deployment Phase — Weeks 15-16 (Jun-Jul 2026)
- Vercel deployment (Carlos)
- Supabase production setup (Alejandro)
- PWA configuration: manifest, icons (Juan)
- User manuals (Juan + Christian)
- Client training session (All)
- Project closure + final presentation (Carlos)

</DEVELOPMENT_TIMELINE>

---

<CONVENTIONS>

## Code Patterns

- **Path alias**: `@/` maps to project root (e.g., `import { cn } from "@/lib/utils"`)
- **Server Components** are the default in Next.js App Router — no "use client" unless needed
- **Client Components** must have `"use client"` directive at top of file
- **Supabase in Server Components**: `const supabase = await createClient()` (from `@/lib/supabase/server`)
- **Supabase in Client Components**: `const supabase = useSupabase()` (from `@/hooks/use-supabase`)
- **CSS**: Tailwind utility classes only — no custom CSS files per component
- **Component style**: ShadCN/UI base-nova variant with CVA for variants
- **Class merging**: Always use `cn()` from `@/lib/utils` for conditional classes
- **Forms**: React Hook Form + Zod resolver (pattern not yet implemented but planned)
- **Data fetching client-side**: TanStack Query `useQuery` / `useMutation`
- **Icons**: `lucide-react` (e.g., `import { Search } from "lucide-react"`)

## Naming Conventions

- Files: kebab-case (e.g., `use-supabase.ts`, `design-tokens.ts`)
- Components: PascalCase (e.g., `Providers`, `Button`)
- Types: PascalCase (e.g., `UserRole`, `Database`)
- Variables/functions: camelCase
- Database columns: snake_case
- Route folders: kebab-case or lowercase
- Route groups: parentheses for logical grouping: `(auth)`, `(public)`, `(dashboard)`

## Git Conventions

- Branch naming: `feature/{feature-name}` from `develop`
- Commit messages: Spanish, descriptive (e.g., "se completo la estructura base del proyecto")
- Never push directly to `main` — merge via PR from `develop`
- PR reviews required before merge

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

All are NEXT_PUBLIC_ prefixed (exposed to browser) because security is enforced by RLS, not by hiding keys.
Shared Supabase project — all team members use the SAME credentials.

</CONVENTIONS>

---

<BUSINESS_CONTEXT>

## Cliente real: RGL ESTUDIO — Ruth Noemi Gómez Lescano

RNG-Vantage es la "Intranet de gestión financiera y de clientes" citada en el plan de negocios oficial de Ruth. El equipo de UTA es el aliado estratégico de desarrollo mencionado en dicho plan.

## Modelo de negocio de la cliente

**Tipo:** B2B — Agencia de redes sociales y producción audiovisual de alta gama
**Mercado objetivo:** Empresarios 35-55 años, hotelería/turismo/gastronomía, Baños de Agua Santa y Ambato
**Ingresos recurrentes:** Retainers mensuales (paquetes de redes sociales)
**Servicios únicos:** Auditorías, sesiones fotográficas/audiovisuales, cursos, modelos

## Catálogo real de servicios

### Suscripciones mensuales (generan MRR)
| Paquete | Precio | Descripción |
|---|---|---|
| Redes Sociales Inicial | $299.99/mes | Propuestas, creación de contenido, informe mensual |
| Redes Sociales Work | $319.99/mes | Planificación, automatizaciones ManyChat, informes detallados |
| Redes Sociales Premium | $555.00/mes | Auditoría, automatización completa, capacitación gerencial |

### Servicios únicos (pago único, no se renuevan)
| Servicio | Precio | Notas |
|---|---|---|
| Auditoría de Marca | $70 | Análisis profundo, un solo pago |
| Sesión Fotográfica | $130 | Servicio de campo |
| Sesión Audiovisual (2 videos) | $150 | Producción audiovisual |
| Sesión Audiovisual (6 videos) | $230 | Producción audiovisual |
| Sesión Audiovisual (15 videos) | $500 | Producción audiovisual |
| Curso x 3 Meses | $500 | Capacitación grupal |
| Modelo por 1 hora | $25 | Costo variable: $12.50 |

## Implicaciones técnicas por rol

### Para Alejandro
- seed.sql DEBE usar los precios reales arriba listados (el seed original tenía precios incorrectos)
- Los servicios `auditoria` y `otro` son de pago único — el Server Action de checkout debe forzar `auto_renew = false`

### Para Carlos
- checkout/actions.ts: si `service.type === 'auditoria' || service.type === 'otro'` → `auto_renew = false` hardcodeado, ignorar lo que venga del form
- Edge Function de renovación: NO debe renovar suscripciones de tipo `auditoria` u `otro`
- La lógica de MRR del dashboard solo debe sumar servicios `manejo_redes`

### Para Juan
- Landing page: las 3 cards mock deben mostrar Redes Inicial ($299.99), Auditoría ($70), y Sesión Fotográfica ($130) — NO los precios inventados actuales
- Catálogo: la unidad de precio ya está bien implementada (`/mes` para manejo_redes, precio único para el resto)
- Checkout: mostrar claramente si es "pago mensual" o "pago único" según el tipo de servicio

### Para Christian
- Dashboard: separar métricas de MRR (solo manejo_redes activos) de ingresos totales
- Tabla de suscripciones admin: indicar visualmente si es recurrente o servicio único

## Indicadores financieros clave (año 1, proyección real de Ruth)
| KPI | Valor proyectado |
|---|---|
| Capital inicial | $5,000 |
| Clientes inicio | 2 |
| Tasa crecimiento mensual | 8% |
| Clientes mes 12 | 5 |
| Ingresos año 1 | $14,764 |
| Margen operativo | 44.36% |
| CAC | $366.67 |
| Saldo caja año 1 | $11,549 |

</BUSINESS_CONTEXT>

---

<CRITICAL_CONSTRAINTS>

1. **WEBPACK MODE REQUIRED**: Next.js 16 defaults to Turbopack, but @serwist/next uses webpack plugins. The `--webpack` flag is mandatory in dev/build scripts. Removing it breaks the PWA build.

2. **SHARED SUPABASE PROJECT**: All 4 team members connect to the SAME Supabase cloud instance. URL: https://uzsasdbcewymviuelcsi.supabase.co. Everyone uses identical .env.local values.

3. **LOPDP COMPLIANCE (Ecuador)**: Ecuador's data protection law requires explicit consent for data processing. The `data_consent_at` field in profiles and `data_consent` boolean in reservations exist for this purpose. Registration and reservation forms MUST include a consent checkbox. La página /politica-privacidad es OBLIGATORIA antes de producción.

4. **DENO FOR EDGE FUNCTIONS**: Supabase Edge Functions run on Deno, not Node.js. The `supabase/functions/` directory is excluded from tsconfig.json. Edge Functions have their own deno.json config.

5. **WEBWORKER LIB**: The `"webworker"` lib is added to tsconfig.json because `app/sw.ts` uses `ServiceWorkerGlobalScope`. Removing it causes type errors.

6. **RLS EVERYWHERE**: Row Level Security is enabled on ALL tables. Every query goes through RLS policies. If a new table is added, RLS MUST be enabled and policies MUST be created.

7. **RLS — PATH CORRECTO EN SUPABASE**: Todas las políticas admin usan `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`. NUNCA usar `auth.jwt() ->> 'role'` para roles personalizados — siempre retorna 'authenticated'. El role personalizado vive en `raw_app_meta_data` y se sincroniza automáticamente vía trigger `trg_sync_profile_role` cuando se actualiza `profiles.role`. Para crear un admin: `UPDATE profiles SET role = 'admin' WHERE id = 'uuid'` — el trigger hace el resto. ✅ RESUELTO en migración 20260404000000.

8. **SPRINT 2 IN PROGRESS**: Sprint 1 complete. Juan: Navbar ✅, Footer ✅, Landing ✅, Reservar ✅, Catálogo ✅. Pending: Checkout (esperando Carlos), Política Privacidad. Alejandro: validators ✅, migración ✅. Carlos: Auth UI PENDIENTE. Christian: Login/Register/Dashboard PENDIENTE.

9. **MANUAL TYPES**: `types/database.ts` is manually maintained. When the schema changes, it must be regenerated: `npx supabase gen types typescript --local > types/database.ts`

10. **PWA GENERATED FILES**: `public/sw.js` and `public/sw.js.map` are generated by Serwist at build time. They are gitignored and should never be manually edited.

11. **MVP — NO REAL PAYMENT GATEWAY**: El sistema registra pagos manualmente. El admin marca transacciones como completed/failed desde el dashboard. Un webhook placeholder se creará para futura integración con pasarela real. Los clientes de Ruth pagan por transferencia bancaria o efectivo.

12. **LANDING PAGE CON MOCK DATA**: `app/(public)/page.tsx` tiene 3 cards de servicios hardcodeadas con precios inventados ($150, $80, gratis). Deben ser reemplazadas con fetch real a Supabase o actualizadas con precios reales ($299.99, $70, $130). INCONSISTENCIA ACTIVA entre landing y catálogo.

13. **SEED.SQL ACTUALIZADO** ✅: `supabase/seed.sql` ya tiene los 10 servicios reales de RGL ESTUDIO con precios correctos. La DB de producción también fue actualizada el 2026-04-04.

14. **AUTH.TS ACTUALIZADO** ✅: `lib/validators/auth.ts` ya usa `first_name` + `last_name` (Alejandro lo corrigió).

16. **CHECKOUT USA SERVICE ROLE PARA TRANSACTIONS**: El Server Action `createSubscription` en `checkout/actions.ts` DEBE usar el cliente de servicio (service role) para insertar en `transactions`, NO la sesión del usuario. La política RLS de transactions solo permite INSERT a admins. Las suscripciones sí pueden insertarse con sesión de usuario normal.

17. **ADMIN USER CREATION**: No existe ningún usuario admin en producción aún. Para crear un admin: registrar cuenta normalmente → ejecutar `UPDATE profiles SET role = 'admin' WHERE id = 'uuid-del-usuario'` en SQL Editor → el trigger sincroniza automáticamente al JWT.

15. **NAVBAR SIN DETECCIÓN DE AUTH**: El navbar siempre muestra "Iniciar Sesión". Cuando el usuario esté autenticado debe mostrar "Dashboard" (admin) o "Mi cuenta" (client). Pendiente hasta que Carlos entregue el auth.

</CRITICAL_CONSTRAINTS>

---

<PENDING_WORK>

Priority order based on dependency chain. Estado al 2026-04-03.

## DB — AUDITADA Y CORREGIDA ✅ (2026-04-04)

- [x] **Fix RLS recursión infinita** — Resuelto. Todas las políticas admin usan `app_metadata` path correcto
- [x] **Fix escalada de privilegios en profiles** — WITH CHECK previene auto-promoción a admin
- [x] **Fix reservas anónimas bloqueadas** — Política abierta a público con data_consent=true
- [x] **Fix subscriptions.status DEFAULT** — Cambiado de 'active' a 'pending'
- [x] **Trigger auto_renew** — trg_enforce_auto_renew garantiza regla de negocio a nivel DB
- [x] **Trigger sync JWT** — trg_sync_profile_role propaga role a raw_app_meta_data
- [x] **handle_new_user actualizado** — inicializa role='client' en JWT desde el registro
- [x] **9 índices de rendimiento** — FKs y columnas de filtro frecuente cubiertos
- [x] **seed.sql aplicado** — 10 servicios reales en DB de producción
- [x] **Tablas Prisma eliminadas** — public.User y _prisma_migrations removidas
- [x] **Migración creada** — 20260404000000_fix_security_and_business_logic.sql captura todos los cambios

## URGENTE — Pendiente del equipo

- [ ] **Crear usuario admin de Ruth** — registrar cuenta → `UPDATE profiles SET role = 'admin' WHERE id = '...'`
- [ ] **Checkout service role** (Alejandro) — usar admin client para INSERT en transactions en createSubscription

## Sprint 1 — COMPLETADO ✅ (excepto auth)

| Tarea | Responsable | Estado |
|---|---|---|
| Zod validators (auth, reservation, service, subscription, transaction) | Alejandro | ✅ DONE |
| Migración SQL inicial (5 tablas, RLS, triggers) | Alejandro | ✅ DONE |
| Design system (globals.css, tokens, fuentes) | Juan | ✅ DONE |
| Navbar (sticky, active state, mobile Sheet) | Juan | ✅ DONE |
| Footer | Juan | ✅ DONE |
| Landing page | Juan | ✅ DONE (mock data pendiente actualizar) |
| Formulario de reserva + Server Action | Juan | ✅ DONE |
| Sistema de autenticación (signUp/signIn) | Carlos | ❌ PENDIENTE |

## Sprint 2 — EN PROGRESO

| Tarea | Responsable | Estado | Bloqueado por |
|---|---|---|---|
| Catálogo de servicios UI | Juan | ✅ DONE | — |
| checkout/actions.ts Server Action | Carlos | ❌ PENDIENTE | Auth |
| Checkout UI | Juan | ❌ PENDIENTE | checkout/actions.ts |
| Política de Privacidad LOPDP | Juan | ❌ PENDIENTE | Nada |
| Login UI | Christian | ❌ PENDIENTE | Carlos Auth |
| Register UI | Christian | ❌ PENDIENTE | Carlos Auth |
| Dashboard KPI cards | Christian | ❌ PENDIENTE | Carlos Auth |
| Admin Reservas UI | Christian | ❌ PENDIENTE | Carlos Auth |
| Admin Servicios CRUD UI | Christian | ❌ PENDIENTE | Carlos Auth |
| Admin Transacciones UI | Christian | ❌ PENDIENTE | Carlos Auth |
| Dashboard layout con sidebar | Christian | ❌ PENDIENTE | Carlos Auth |

## Sprint 3 — PENDIENTE

| Tarea | Responsable | Estado |
|---|---|---|
| Edge Function subscription-renewal | Carlos | ❌ PENDIENTE |
| Edge Function dashboard-metrics | Carlos | ❌ PENDIENTE |
| Supabase Realtime en dashboard | Christian | ❌ PENDIENTE |
| Responsive polish todas las páginas | Juan | ❌ PENDIENTE |
| Navbar con detección de auth | Juan | ❌ PENDIENTE |

## Sprint 4 — PENDIENTE

| Tarea | Responsable | Estado |
|---|---|---|
| Seed data final completo | Alejandro | ❌ PENDIENTE |
| Tests unitarios | Todos | ❌ PENDIENTE |
| E2E tests Playwright | Juan | ❌ PENDIENTE |
| Documentación técnica | Carlos | ❌ PENDIENTE |
| Landing page: reemplazar mock data con Supabase | Juan | ❌ PENDIENTE |

## Inconsistencias activas a resolver

1. **Landing mock data** — 3 cards con precios inventados ($150, $80, gratis) vs precios reales ($299.99, $70, $130)
2. **Navbar sin auth detection** — siempre muestra "Iniciar Sesión" independiente del estado de sesión
3. **Política de privacidad vacía** — riesgo legal LOPDP Ecuador, bloqueador para producción
4. **Sin usuario admin en producción** — Ruth no tiene cuenta con role='admin' todavía
17. **Transactions admin UI** (Christian) — depends on #1
18. **Privacy policy LOPDP page** (Juan)
19. **Supabase Realtime integration** (Alejandro + Christian)

## Priority 5 — Sprint 4 Polish

20. **Responsive polish all pages** (Juan)
21. **Realtime dashboard hook** (Christian)
22. **Final seed data** (Alejandro)
23. **Technical documentation** (Carlos)
24. **Unit tests** (All)
25. **Comprehensive E2E tests** (Juan)

</PENDING_WORK>

---

<SCRIPTS>

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (webpack mode, port 3000) |
| `npm run build` | Production build (webpack mode) |
| `npm start` | Start production server |
| `npm run lint` | ESLint check |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest single run (CI) |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright with interactive UI |
| `npx supabase start` | Start local Supabase (Docker required) |
| `npx supabase db reset` | Reset local DB + run migrations + seed |
| `npx supabase gen types typescript --local > types/database.ts` | Regenerate TS types from schema |
| `npx shadcn@latest add [component]` | Add ShadCN component |
| `npx supabase functions serve` | Run Edge Functions locally |
| `npx playwright install` | Install Playwright browsers |

</SCRIPTS>
