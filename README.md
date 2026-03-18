# RNG-Vantage

RNG-Vantage es una plataforma moderna para la gestión financiera, dashboard interactivo y manejo de suscripciones construida con una arquitectura *Serverless* e interfaces fluidas basadas en el App Router de Next.js. El proyecto está enfocado en proporcionar un panel administrativo rápido, seguro (tipado de principio a fin) e integrable como una Progressive Web App (PWA).

---

## 🏗 Arquitectura y Stack Tecnológico

El proyecto adopta un enfoque **Backend as a Service (BaaS)** mediante Supabase y un **Frontend Desacoplado** alojado en la Edge Network.

### 🎨 Frontend
*   **Framework Base:** [Next.js 16](https://nextjs.org/) (App Router) configurado con TypeScript.
*   **Estilos y Componentes:** [Tailwind CSS v4](https://tailwindcss.com/) sumado al ecosistema de [ShadCN/UI](https://ui.shadcn.com/) y Lucide React para iconografía.
*   **Manejo de Formularios y Validación:** [React Hook Form](https://react-hook-form.com/) integrado nativamente con [Zod](https://zod.dev/) para validación estricta de esquemas antes de tocar el servidor.
*   **Data Fetching & Cache:** [TanStack Query](https://tanstack.com/query) (React Query) para sincronización con el backend y estado global asíncrono. El `QueryClientProvider` se inyecta globalmente desde `components/providers.tsx`.
*   **Dashboard Visuals:** [Recharts](https://recharts.org/) usado para las métricas e indicadores de los gráficos principales.
*   **PWA:** Configuración mediante [`@serwist/next`](https://serwist.pages.dev/) + `serwist` para ofrecer instalabilidad, precaching y soporte offline progresivo. El service worker se define en `app/sw.ts`.

### ⚡ Backend / BaaS (Supabase)
Todo lo correspondiente a datos persistentes, usuarios y reglas se centraliza a través de **[Supabase](https://supabase.com/)**:
*   **Database:** PostgreSQL con migraciones versionadas en `supabase/migrations/` y **Row Level Security (RLS)** habilitado por defecto.
*   **Auth:** Manejo de sesiones (JWT) con refresh automático vía `middleware.ts` en la raíz del proyecto, usando `@supabase/ssr`. Los helpers de cliente se encuentran en `lib/supabase/` (client, server y middleware).
*   **Realtime / Storage:** Suscripciones a la base de datos por WebSockets en el dashboard.

#### 🧠 Lógica Compleja (Edge Functions)
El proyecto utiliza [Edge Functions](https://supabase.com/docs/guides/functions) (ejecutadas en **Deno**) cuando un CRUD básico no es suficiente. Estas viven bajo el directorio `/supabase/functions/` y se encargan de:
- Cálculos pesados para métricas financieras a final de mes.
- Renovación automática y lógica de integraciones de pago o facturación de suscripciones.
- Envío transaccional y *webhooks* que no pueden vivir en el cliente.

### 🧪 Testing
*   **Unit Tests:** [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) con entorno jsdom.
*   Configuración en `vitest.config.ts`. Ejecutar con `npm test` (watch) o `npm run test:run` (CI).

### 🚀 Despliegue
*   **Frontend:** Desplegado de forma automática y transparente en **Vercel** (build con `--webpack` por compatibilidad con Serwist).
*   **Backend:** Instancia hospedada de Supabase que administra escalabilidad, backups automáticos de Postgres y los servidores Edge de Deno.

---

## 📁 Estructura del Proyecto

```
├── app/
│   ├── (auth)/                # Route group: login, register
│   ├── (dashboard)/           # Route group: dashboard, subscriptions
│   ├── sw.ts                  # Service Worker (Serwist)
│   ├── layout.tsx             # Root layout con Providers
│   ├── page.tsx               # Página principal
│   └── globals.css            # Estilos globales (Tailwind + ShadCN)
├── components/
│   ├── ui/                    # Componentes ShadCN/UI
│   └── providers.tsx          # QueryClientProvider (TanStack Query)
├── hooks/                     # Custom hooks (useSupabase, etc.)
├── lib/
│   ├── supabase/              # Helpers de Supabase (client, server, middleware)
│   ├── validators/            # Schemas de Zod reutilizables
│   └── utils.ts               # Utilidades (cn para clases)
├── types/                     # Tipos compartidos y tipos de DB
├── supabase/
│   ├── migrations/            # Migraciones SQL con RLS
│   ├── functions/             # Edge Functions (Deno)
│   └── config.toml            # Configuración local de Supabase
├── middleware.ts              # Middleware de Next.js (refresh de sesiones)
├── .env.example               # Variables de entorno requeridas
├── vitest.config.ts           # Configuración de Vitest
└── next.config.ts             # Configuración de Next.js + Serwist
```

---

## 🔑 Estrategia de Ramas (Git Flow Simplificado)

Para mantener la base de código estable, utilizamos un estándar basado en prefijos descriptivos dentro de un entorno colaborativo.

*   `main` — Refleja estrictamente el entorno de **Producción**.
*   `develop` — Rama para el entorno de **Staging / Pruebas**. Todo nace a partir de aquí.

#### Ramas de Trabajo Diarias (Feature Branches)
Cada contribución debe usar uno de los siguientes prefijos separados por barra diagonal (`/`) para agruparse en carpetas lógicas:
1.  **Por característica (Recomendado):**
    *   `feature/nombre-de-la-tarea` (Ej. `feature/dashboard-graficos-nuevos`)
    *   `bugfix/nombre-del-error` (Ej. `bugfix/solucion-login-auth`)
    *   `hotfix/urgente` (Parches directos a main/develop)
2.  **Por desarrollador (Teams pequeños/Learning):**
    *   `nombre/feature-tarea` (Ej. `carlos/feature-renovaciones`)

---

## 🛠️ Entorno de Desarrollo Local

### 1. Requisitos Previos
- Node.js versión `20+` (LTS recomendado).
- Cuenta activa en un proyecto remoto de [Supabase](https://supabase.com).
- Variables de entorno `.env.local` configuradas (ver `.env.example` como referencia).

### 2. Instalación
```bash
git clone https://github.com/carlitosgiovanniramos/RNG-Vantage.git
cd RNG-Vantage
npm install
cp .env.example .env.local  # Configurar con tus claves de Supabase
```

### 3. Scripts Disponibles
```bash
npm run dev        # Servidor de desarrollo (http://localhost:3000)
npm run build      # Build de producción
npm start          # Servidor de producción
npm run lint       # Ejecutar ESLint
npm test           # Tests en modo watch (Vitest)
npm run test:run   # Tests en modo CI (una sola ejecución)
```

### 4. Supabase CLI (Base de datos y Funciones locales)
Para levantar el entorno completo de emuladores de Supabase Local (requiere Docker):
```bash
npx supabase start                                        # Levanta contenedores Postgres, GoTrue y Storage
npx supabase db push                                      # Aplica migraciones pendientes
npx supabase functions serve hello-world --no-verify-jwt   # Ejecuta server local Deno
npx supabase gen types typescript --local > types/database.ts  # Genera tipos de la DB
```

---
> Proyecto reestructurado sobre la base inicial. Todo código del antiguo monolito de NestJS ha sido deprecado en favor de las tecnologías indicadas.
