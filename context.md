# RNG-Vantage — AI Agent Context File

> This file is machine-readable project context optimized for LLM/AI agent consumption.
> It describes the full state of the project so an agent can understand it without reading other files.
> Last updated: 2026-03-20

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
version: 0.1.0
status: BASE_STRUCTURE_COMPLETE — no business logic implemented yet

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
Login → Supabase Auth signInWithPassword() → JWT token stored in cookie
Every Request → middleware.ts → updateSession() → refresh JWT if needed
Admin Routes → middleware.ts → check profiles.role === 'admin' → allow or redirect
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
│   ├── layout.tsx                          [DONE] Root layout: Geist fonts, <Providers>, lang="es"
│   ├── page.tsx                            [DONE] Landing page: hero, CTA buttons, footer links
│   ├── sw.ts                               [DONE] Serwist Service Worker: precache + runtime caching
│   ├── globals.css                         [DONE] Tailwind v4 imports + ShadCN theme tokens (light/dark)
│   ├── favicon.ico                         [DONE] Default favicon
│   ├── (auth)/
│   │   ├── layout.tsx                      [DONE] Centered wrapper (max-w-sm, min-h-screen)
│   │   ├── login/page.tsx                  [PLACEHOLDER] Only renders <h1>Login</h1>
│   │   └── register/page.tsx               [PLACEHOLDER] Only renders <h1>Register</h1>
│   ├── (public)/
│   │   ├── layout.tsx                      [PARTIAL] Wraps children — TODO: navbar, footer
│   │   ├── catalogo/page.tsx               [PLACEHOLDER] Only renders <h1>Catalogo de Servicios</h1>
│   │   ├── reservar/page.tsx               [PLACEHOLDER] Only renders <h1>Reservar Capacitacion</h1>
│   │   ├── checkout/page.tsx               [PLACEHOLDER] Only renders <h1>Checkout</h1>
│   │   └── politica-privacidad/page.tsx    [PARTIAL] Skeleton — TODO: LOPDP legal content
│   └── (dashboard)/
│       ├── layout.tsx                      [PARTIAL] Basic wrapper — TODO: admin sidebar/nav
│       ├── dashboard/page.tsx              [PLACEHOLDER] Only renders <h1>Dashboard</h1>
│       ├── reservas/page.tsx               [PLACEHOLDER] Only renders heading
│       ├── servicios/page.tsx              [PLACEHOLDER] Only renders heading
│       ├── subscriptions/page.tsx          [PLACEHOLDER] Only renders heading
│       └── transacciones/page.tsx          [PLACEHOLDER] Only renders heading
├── components/
│   ├── providers.tsx                       [DONE] QueryClientProvider (staleTime: 60s, refetchOnWindowFocus: false)
│   └── ui/
│       └── button.tsx                      [DONE] ShadCN Button component (CVA variants)
├── hooks/
│   └── use-supabase.ts                     [DONE] useMemo(() => createClient(), [])
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       [DONE] createBrowserClient() factory
│   │   ├── server.ts                       [DONE] createServerClient() factory (cookie-based)
│   │   └── middleware.ts                   [DONE] updateSession() — JWT refresh via getUser()
│   ├── validators/                         [EMPTY] .gitkeep only — needs Zod schemas
│   ├── design-tokens.ts                    [DONE] BRAND, BREAKPOINTS, SPACING, CHART_COLORS constants
│   └── utils.ts                            [DONE] cn() = clsx + twMerge
├── types/
│   ├── database.ts                         [DONE] Manual DB types (Row/Insert/Update per table)
│   └── index.ts                            [DONE] Re-exports all types from database.ts
├── supabase/
│   ├── migrations/
│   │   └── 00000000000000_init.sql         [DONE] Full schema: 5 tables, RLS, triggers
│   ├── functions/
│   │   └── hello-world/
│   │       ├── index.ts                    [DONE] Template Edge Function (Deno.serve)
│   │       └── deno.json                   [DONE] Deno config for function
│   ├── seed.sql                            [DONE] 6 example services
│   ├── config.toml                         [DONE] Supabase CLI config (PostgreSQL 17, ports, auth, etc.)
│   └── .gitignore                          [DONE] Supabase temp files
├── e2e/
│   └── example.spec.ts                     [DONE] 3 basic smoke tests (landing, catalogo, reservar)
├── public/
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
| full_name | text | YES | NULL | — |
| avatar_url | text | YES | NULL | — |
| role | text | NOT NULL | 'client' | CHECK: 'admin' \| 'client' |
| data_consent_at | timestamptz | YES | NULL | LOPDP compliance timestamp |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | auto-trigger |

RLS:
- SELECT own: auth.uid() = id
- SELECT all: role = 'admin'
- UPDATE own: auth.uid() = id
- INSERT own: auth.uid() = id

Triggers:
- on_auth_user_created → handle_new_user() → auto-insert profile with full_name, avatar_url from auth metadata
- on_profiles_updated → handle_updated_at()

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
| full_name | text | NOT NULL | — | — |
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

## Seed Data (6 services)

| name | type | price | duration_months |
|---|---|---|---|
| Manejo de Redes - Mensual | manejo_redes | 150.00 | 1 |
| Manejo de Redes - Trimestral | manejo_redes | 400.00 | 3 |
| Manejo de Redes - Anual | manejo_redes | 1400.00 | 12 |
| Auditoria de Redes Sociales | auditoria | 80.00 | 1 |
| Auditoria + Estrategia Digital | auditoria | 200.00 | 3 |
| Capacitacion en Marketing Digital | capacitacion | 0.00 | 1 |

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
| / | root | app/page.tsx | DONE |
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
- [x] Landing page (basic hero + CTA)
- [x] Design tokens (brand, breakpoints, spacing, chart colors)
- [x] ShadCN/UI config + Button component
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
- [ ] Public layout → needs: responsive navbar + footer
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
- [ ] Additional ShadCN components: input, textarea, form, card, table, dialog, sheet, toast, badge, tabs, separator, popover, calendar, checkbox, select, dropdown-menu, avatar
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

<CRITICAL_CONSTRAINTS>

1. **WEBPACK MODE REQUIRED**: Next.js 16 defaults to Turbopack, but @serwist/next uses webpack plugins. The `--webpack` flag is mandatory in dev/build scripts. Removing it breaks the PWA build.

2. **SHARED SUPABASE PROJECT**: All 4 team members connect to the SAME Supabase cloud instance. Carlos manages the Supabase project and shares credentials. Everyone uses identical .env.local values.

3. **LOPDP COMPLIANCE (Ecuador)**: Ecuador's data protection law requires explicit consent for data processing. The `data_consent_at` field in profiles and `data_consent` boolean in reservations exist for this purpose. Registration and reservation forms MUST include a consent checkbox.

4. **DENO FOR EDGE FUNCTIONS**: Supabase Edge Functions run on Deno, not Node.js. The `supabase/functions/` directory is excluded from tsconfig.json. Edge Functions have their own deno.json config.

5. **WEBWORKER LIB**: The `"webworker"` lib is added to tsconfig.json because `app/sw.ts` uses `ServiceWorkerGlobalScope`. Removing it causes type errors.

6. **RLS EVERYWHERE**: Row Level Security is enabled on ALL tables. Every query goes through RLS policies. If a new table is added, RLS MUST be enabled and policies MUST be created.

7. **NO BUSINESS LOGIC YET**: All pages beyond the landing page are placeholders. The project is in "base structure complete" phase. Development of actual features starts in Sprint 1 (weeks 5-6).

8. **MANUAL TYPES**: `types/database.ts` is manually maintained. When the schema changes, it must be regenerated: `npx supabase gen types typescript --local > types/database.ts`

9. **PWA GENERATED FILES**: `public/sw.js` and `public/sw.js.map` are generated by Serwist at build time. They are gitignored and should never be manually edited.

10. **MVP — NO REAL PAYMENT GATEWAY**: The transaction system records payments but does not integrate with a real payment processor. Payment method options (cash, transfer, card) are for manual admin entry. A webhook placeholder will be created for future integration.

</CRITICAL_CONSTRAINTS>

---

<PENDING_WORK>

Priority order based on dependency chain. Items marked [BLOCKS: X] must be completed before X can start.

## Priority 1 — Sprint 1 Blockers

1. **Auth system implementation** (Carlos)
   - Implement signUp with full_name + LOPDP consent
   - Implement signInWithPassword
   - Post-login redirect by role
   - [BLOCKS: Login/Register UI, all Server Actions]

2. **Zod validation schemas** (Alejandro)
   - lib/validators/auth.ts — login, register schemas
   - lib/validators/reservation.ts — createReservation schema
   - lib/validators/service.ts — service CRUD schema
   - lib/validators/subscription.ts — subscription schema
   - lib/validators/transaction.ts — transaction schema
   - [BLOCKS: all forms, all Server Actions]

3. **Design system setup** (Christian)
   - Install remaining ShadCN components (input, form, card, table, dialog, sheet, toast, badge, tabs, etc.)
   - Finalize color palette in globals.css
   - Create StatusBadge, DataCard components
   - [BLOCKS: all UI implementation]

4. **Public layout navigation** (Juan)
   - Responsive navbar (logo, Servicios, Reservar, Login/Avatar)
   - Footer (privacy policy link, copyright)
   - Mobile hamburger menu

## Priority 2 — Sprint 1 Features

5. **Login/Register pages UI** (Christian) — depends on #1, #2, #3
6. **Reservation form UI** (Juan) — depends on #2, #4
7. **Reservations CRUD Server Actions** (Alejandro) — depends on #1, #2
8. **Services CRUD Server Actions** (Alejandro) — depends on #1, #2
9. **Landing page redesign** (Juan) — depends on #4

## Priority 3 — Sprint 2 Features

10. **Catalog UI** (Juan) — depends on #8
11. **Checkout UI + subscription creation** (Juan + Alejandro) — depends on #1, #8
12. **Dashboard with KPI cards + charts** (Christian) — depends on #3
13. **Reservations admin UI** (Christian) — depends on #7
14. **Edge Function: subscription-renewal** (Carlos) — depends on #1

## Priority 4 — Sprint 3 Features

15. **Edge Function: dashboard-metrics** (Carlos) — depends on #14
16. **Services admin UI** (Christian) — depends on #8
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
