# RNG-Vantage

Sistema integral de automatizacion de ventas, reservas y control financiero para un emprendimiento de marketing digital. PWA Mobile-First construida con arquitectura Serverless (BaaS) sobre Next.js y Supabase.

---

## 🏗 Arquitectura y Stack Tecnologico

El proyecto adopta un enfoque **Backend as a Service (BaaS)** mediante Supabase y un **Frontend Desacoplado** alojado en la Edge Network.

### 🎨 Frontend
*   **Framework Base:** [Next.js 16](https://nextjs.org/) (App Router) configurado con TypeScript.
*   **Estilos y Componentes:** [Tailwind CSS v4](https://tailwindcss.com/) + [ShadCN/UI](https://ui.shadcn.com/) + Lucide React. Tokens de diseno en `lib/design-tokens.ts`.
*   **Manejo de Formularios y Validacion:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) para validacion estricta de esquemas.
*   **Data Fetching & Cache:** [TanStack Query](https://tanstack.com/query) (React Query). El `QueryClientProvider` se inyecta globalmente desde `components/providers.tsx`.
*   **Dashboard Visuals:** [Recharts](https://recharts.org/) para metricas e indicadores financieros.
*   **PWA:** [`@serwist/next`](https://serwist.pages.dev/) + `serwist` para instalabilidad, precaching y soporte offline. Service worker en `app/sw.ts`.

### ⚡ Backend / BaaS (Supabase)
*   **Database:** PostgreSQL con migraciones versionadas en `supabase/migrations/` y **Row Level Security (RLS)** habilitado en todas las tablas. Seed data en `supabase/seed.sql`.
*   **Auth:** Sesiones JWT con refresh automatico via `middleware.ts`. Proteccion de rutas admin por rol. Helpers en `lib/supabase/` (client, server, middleware).
*   **Roles:** `admin` (dashboard financiero) y `client` (reservas, catalogo, suscripciones).
*   **Realtime / Storage:** Suscripciones a la base de datos por WebSockets en el dashboard.

#### 🧠 Logica Compleja (Edge Functions)
[Edge Functions](https://supabase.com/docs/guides/functions) en **Deno** bajo `/supabase/functions/`:
- Calculos de metricas financieras e inteligencia de datos.
- Renovacion automatica de suscripciones y facturacion.
- Webhooks e integraciones de pago.

### 🧪 Testing
*   **Unit Tests:** [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) con entorno jsdom. Config en `vitest.config.ts`.
*   **E2E Tests:** [Playwright](https://playwright.dev/) con soporte para Desktop Chrome y Mobile Chrome. Config en `playwright.config.ts`, tests en `e2e/`.

### 🔒 Cumplimiento Normativo (LOPDP)
El sistema esta disenado para cumplir con la **Ley Organica de Proteccion de Datos Personales (LOPDP)** de Ecuador:
- Consentimiento explicito de tratamiento de datos (`data_consent` en reservas, `data_consent_at` en perfiles).
- Pagina de politica de privacidad (`/politica-privacidad`).
- RLS en todas las tablas para que cada usuario solo acceda a sus propios datos.

### 🚀 Despliegue
*   **Frontend:** **Vercel** (build con `--webpack` por compatibilidad con Serwist).
*   **Backend:** Instancia hospedada de **Supabase** (escalabilidad, backups automaticos, Edge Deno).

---

## 📦 Modulos del Sistema

Basados en el caso de negocio del emprendimiento de marketing digital:

| Modulo | Descripcion | Rutas |
|---|---|---|
| **Captacion y Reservas** | Formulario publico para agendar capacitaciones y capturar prospectos | `/reservar` (cliente), `/reservas` (admin) |
| **Catalogo de Servicios** | Catalogo dinamico de paquetes (mensual, trimestral, anual) | `/catalogo` (cliente), `/servicios` (admin) |
| **Motor de Suscripciones** | Gestion de ciclos de facturacion y renovacion automatica | `/subscriptions` (admin) |
| **Checkout y Pagos** | Flujo de contratacion directa de paquetes | `/checkout` (cliente) |
| **Dashboard Financiero** | Metricas de rentabilidad por servicio, ingresos y transacciones | `/dashboard` (admin) |
| **Registro de Transacciones** | Control de ventas y pagos | `/transacciones` (admin) |

---

## 📁 Estructura del Proyecto

```
├── app/
│   ├── (auth)/                    # Route group: login, register
│   ├── (public)/                  # Route group: catalogo, reservar, checkout, privacidad
│   ├── (dashboard)/               # Route group: dashboard, reservas, servicios, transacciones
│   ├── sw.ts                      # Service Worker (Serwist)
│   ├── layout.tsx                 # Root layout con Providers
│   ├── page.tsx                   # Landing page del emprendimiento
│   └── globals.css                # Estilos globales (Tailwind + ShadCN)
├── components/
│   ├── ui/                        # Componentes ShadCN/UI
│   └── providers.tsx              # QueryClientProvider (TanStack Query)
├── hooks/                         # Custom hooks (useSupabase, etc.)
├── lib/
│   ├── supabase/                  # Helpers de Supabase (client, server, middleware)
│   ├── validators/                # Schemas de Zod reutilizables
│   ├── design-tokens.ts           # Constantes de diseno (colores, espaciado, charts)
│   └── utils.ts                   # Utilidades (cn para clases)
├── types/                         # Tipos compartidos y tipos de DB
├── e2e/                           # Tests E2E (Playwright)
├── supabase/
│   ├── migrations/                # Migraciones SQL con RLS
│   ├── functions/                 # Edge Functions (Deno)
│   ├── seed.sql                   # Datos de prueba
│   └── config.toml                # Configuracion local de Supabase
├── middleware.ts                  # Middleware: refresh de sesiones + proteccion de rutas por rol
├── .env.example                   # Variables de entorno requeridas
├── vitest.config.ts               # Configuracion de Vitest
├── playwright.config.ts           # Configuracion de Playwright
└── next.config.ts                 # Configuracion de Next.js + Serwist
```

### Esquema de Base de Datos

```
profiles        → Usuarios (extiende auth.users) con campo role (admin/client) y consentimiento LOPDP
services        → Catalogo de servicios/paquetes (manejo_redes, auditoria, capacitacion)
reservations    → Reservas de capacitaciones con datos de contacto
subscriptions   → Suscripciones activas (usuario ↔ servicio, fechas, auto_renew)
transactions    → Registro de ventas/pagos
```

---

## 🔑 Estrategia de Ramas (Git Flow Simplificado)

*   `main` — Entorno de **Produccion**.
*   `develop` — Entorno de **Staging / Pruebas**. Todo nace a partir de aqui.

#### Feature Branches
1.  **Por caracteristica (Recomendado):**
    *   `feature/nombre-de-la-tarea` (Ej. `feature/dashboard-graficos-nuevos`)
    *   `bugfix/nombre-del-error` (Ej. `bugfix/solucion-login-auth`)
    *   `hotfix/urgente` (Parches directos a main/develop)
2.  **Por desarrollador (Teams pequenos/Learning):**
    *   `nombre/feature-tarea` (Ej. `carlos/feature-renovaciones`)

---

## 🛠️ Entorno de Desarrollo Local

### 1. Requisitos Previos
- Node.js version `20+` (LTS recomendado).
- Cuenta activa en un proyecto remoto de [Supabase](https://supabase.com).
- Variables de entorno `.env.local` configuradas (ver `.env.example` como referencia).

### 2. Instalacion
```bash
git clone https://github.com/carlitosgiovanniramos/RNG-Vantage.git
cd RNG-Vantage
npm install
cp .env.example .env.local  # Configurar con tus claves de Supabase
npx playwright install       # Instalar navegadores para E2E
```

### 3. Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo (http://localhost:3000)
npm run build        # Build de produccion
npm start            # Servidor de produccion
npm run lint         # Ejecutar ESLint
npm test             # Unit tests en modo watch (Vitest)
npm run test:run     # Unit tests en modo CI
npm run test:e2e     # Tests E2E (Playwright)
npm run test:e2e:ui  # Tests E2E con UI interactiva
```

### 4. Supabase CLI (Base de datos y Funciones locales)
```bash
npx supabase start                                           # Levanta emuladores locales (requiere Docker)
npx supabase db push                                         # Aplica migraciones pendientes
npx supabase db reset                                        # Resetea BD y ejecuta seed.sql
npx supabase functions serve hello-world --no-verify-jwt     # Server local de Edge Functions
npx supabase gen types typescript --local > types/database.ts # Genera tipos de la DB
```

---

## 📘 Tutorial: Como iniciar el proyecto desde cero

Esta guia detalla paso a paso como configurar el entorno de desarrollo completo para que cualquier integrante del equipo pueda trabajar en el proyecto.

---

### Paso 1: Requisitos previos

Antes de clonar el repositorio, asegurate de tener instalado lo siguiente en tu maquina:

**1.1 Node.js (version 20 o superior)**

Descargalo desde [https://nodejs.org](https://nodejs.org) (elige la version LTS). Para verificar que esta instalado correctamente, abre una terminal y ejecuta:

```bash
node -v    # Debe mostrar v20.x.x o superior
npm -v     # Debe mostrar 10.x.x o superior
```

**1.2 Git**

Descargalo desde [https://git-scm.com](https://git-scm.com). Verifica con:

```bash
git --version
```

**1.3 Visual Studio Code (recomendado)**

Descargalo desde [https://code.visualstudio.com](https://code.visualstudio.com). Extensiones recomendadas que se instalaran automaticamente al abrir el proyecto:
- ESLint
- Tailwind CSS IntelliSense
- Prettier

**1.4 Docker Desktop (opcional, solo si vas a usar Supabase local)**

Solo necesario si quieres levantar la base de datos PostgreSQL en tu maquina. Descargalo desde [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

Si no instalas Docker, puedes trabajar directamente contra el proyecto remoto de Supabase en la nube.

---

### Paso 2: Clonar el repositorio

Abre una terminal y ejecuta:

```bash
git clone https://github.com/carlitosgiovanniramos/RNG-Vantage.git
```

Entra a la carpeta del proyecto:

```bash
cd RNG-Vantage
```

Verifica que estas en la rama `develop` (es la rama de trabajo principal):

```bash
git branch
# Debe mostrar: * develop
```

Si no estas en `develop`, cambiate:

```bash
git checkout develop
```

---

### Paso 3: Instalar dependencias

Ejecuta el siguiente comando para instalar todas las librerias del proyecto:

```bash
npm install
```

Esto creara la carpeta `node_modules/` con todas las dependencias. Este proceso puede tardar entre 1 y 3 minutos dependiendo de tu conexion a internet.

---

### Paso 4: Configurar variables de entorno

El proyecto necesita conectarse a Supabase. Para eso debes crear un archivo `.env.local` con las claves de tu proyecto.

**4.1** Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

**4.2** Abre `.env.local` en tu editor y reemplaza los valores con los datos de tu proyecto de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**4.3 Donde encontrar estas claves:**

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (o crea uno nuevo si no tienes)
3. Ve a **Settings** (icono de engranaje) → **API**
4. Copia:
   - `Project URL` → es tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (bajo Project API keys) → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> **IMPORTANTE:** Nunca subas el archivo `.env.local` a Git. Ya esta en el `.gitignore`.

---

### Paso 5: Configurar la base de datos en Supabase

El proyecto incluye migraciones SQL que crean todas las tablas necesarias y un archivo de seed con datos de ejemplo.

#### Opcion A: Usando Supabase en la nube (recomendado para empezar rapido)

**5.1** Ve al **SQL Editor** de tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard) → selecciona tu proyecto → **SQL Editor**.

**5.2** Abre el archivo `supabase/migrations/00000000000000_init.sql` de tu proyecto local, copia todo su contenido y pegalo en el SQL Editor. Haz clic en **Run**.

Esto creara las tablas: `profiles`, `services`, `reservations`, `subscriptions` y `transactions`, junto con todas las politicas de seguridad RLS.

**5.3** Luego abre el archivo `supabase/seed.sql`, copia su contenido y ejecutalo en el SQL Editor. Esto insertara los servicios de ejemplo (paquetes mensuales, trimestrales, anuales, auditorias y capacitaciones).

#### Opcion B: Usando Supabase CLI local (requiere Docker)

Si tienes Docker Desktop instalado y corriendo:

```bash
npx supabase start
```

Esto levantara una instancia local de PostgreSQL, Auth (GoTrue), Storage y Studio. La primera vez descargara las imagenes de Docker (puede tardar varios minutos).

Al terminar, el comando mostrara las URLs y claves locales. Actualiza tu `.env.local` con esos valores:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<la clave anon que muestra el comando>
```

Aplica las migraciones y el seed:

```bash
npx supabase db reset
```

Este comando ejecuta las migraciones y luego el `seed.sql` automaticamente.

Para acceder al panel visual de administracion de la base de datos:

```
http://127.0.0.1:54323
```

---

### Paso 6: Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000). Deberias ver la landing page de RNG-Vantage con los links a "Ver Servicios" y "Reservar Capacitacion".

Navega por las rutas para verificar que todo funciona:

| Ruta | Que deberias ver |
|---|---|
| [http://localhost:3000](http://localhost:3000) | Landing page con el nombre del proyecto |
| [http://localhost:3000/catalogo](http://localhost:3000/catalogo) | Placeholder "Catalogo de Servicios" |
| [http://localhost:3000/reservar](http://localhost:3000/reservar) | Placeholder "Reservar Capacitacion" |
| [http://localhost:3000/checkout](http://localhost:3000/checkout) | Placeholder "Checkout" |
| [http://localhost:3000/login](http://localhost:3000/login) | Placeholder "Login" |
| [http://localhost:3000/register](http://localhost:3000/register) | Placeholder "Register" |
| [http://localhost:3000/politica-privacidad](http://localhost:3000/politica-privacidad) | Placeholder "Politica de Privacidad" |

> **Nota:** Las rutas de admin (`/dashboard`, `/reservas`, `/servicios`, `/transacciones`) redirigen a `/login` si no estas autenticado como admin. Esto es correcto — la proteccion por rol esta funcionando.

---

### Paso 7: Instalar navegadores para tests E2E (una sola vez)

```bash
npx playwright install
```

Esto descarga Chromium y otros navegadores necesarios para ejecutar los tests End-to-End. Solo se necesita hacer una vez.

---

### Paso 8: Verificar que todo funciona

Ejecuta los siguientes comandos para asegurarte de que el proyecto esta correctamente configurado:

**8.1 Build de produccion:**

```bash
npm run build
```

Deberias ver un listado de las 12 rutas generadas sin errores.

**8.2 Lint:**

```bash
npm run lint
```

No deberia mostrar errores.

**8.3 Tests E2E (con el servidor de desarrollo corriendo):**

```bash
npm run test:e2e
```

Deberia correr 3 tests basicos (landing page, catalogo y reservar) y mostrar que pasan.

---

### Paso 9: Crear tu rama de trabajo

Una vez que todo esta funcionando, crea tu rama para empezar a desarrollar:

```bash
# Asegurate de estar en develop y actualizado
git checkout develop
git pull origin develop

# Crea tu rama de trabajo
git checkout -b feature/nombre-de-tu-tarea
```

Ejemplos de nombres de rama segun el modulo que te toque:

```bash
git checkout -b feature/catalogo-servicios-ui       # Frontend del catalogo
git checkout -b feature/reservas-formulario          # Formulario de reservas
git checkout -b feature/dashboard-metricas           # Dashboard financiero
git checkout -b feature/auth-login-register          # Flujo de autenticacion
git checkout -b feature/checkout-pagos               # Flujo de pagos
git checkout -b feature/suscripciones-motor          # Motor de suscripciones (Edge Functions)
```

---

### Paso 10: Flujo de trabajo diario

**Al iniciar tu jornada de trabajo:**

```bash
git checkout develop
git pull origin develop
git checkout tu-rama
git merge develop          # Trae los cambios mas recientes de tus companeros
```

**Al terminar una funcionalidad:**

```bash
git add .
git commit -m "feat: descripcion breve de lo que hiciste"
git push origin tu-rama
```

Luego ve a GitHub y crea un **Pull Request** desde tu rama hacia `develop`. Pide a un companero que lo revise antes de hacer merge.

**Convenciones de commits:**

| Prefijo | Uso |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Correccion de bug |
| `refactor:` | Cambio de codigo sin cambiar funcionalidad |
| `style:` | Cambios de estilos/CSS |
| `docs:` | Cambios en documentacion |
| `test:` | Agregar o modificar tests |
| `chore:` | Tareas de mantenimiento (dependencias, config) |

---

### Paso 11: Agregar componentes de ShadCN/UI

Cuando necesites un componente de interfaz (botones, formularios, tablas, modals, etc.), no lo crees desde cero. Usa ShadCN:

```bash
npx shadcn@latest add button        # Agrega el componente Button
npx shadcn@latest add input         # Agrega el componente Input
npx shadcn@latest add card          # Agrega el componente Card
npx shadcn@latest add table         # Agrega el componente Table
npx shadcn@latest add dialog        # Agrega el componente Dialog/Modal
npx shadcn@latest add form          # Agrega el componente Form (integrado con RHF)
npx shadcn@latest add toast         # Agrega notificaciones toast
```

Los componentes se instalan en `components/ui/` y son totalmente editables. Consulta el catalogo completo en [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).

---

### Paso 12: Consultar datos de Supabase desde el codigo

**Desde un Server Component (paginas, layouts):**

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

**Desde un Client Component (interactividad, formularios):**

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

---

### Resumen rapido de comandos

| Que quieres hacer | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Levantar servidor de desarrollo | `npm run dev` |
| Build de produccion | `npm run build` |
| Ejecutar lint | `npm run lint` |
| Unit tests (watch) | `npm test` |
| Unit tests (CI) | `npm run test:run` |
| Tests E2E | `npm run test:e2e` |
| Tests E2E con UI | `npm run test:e2e:ui` |
| Levantar Supabase local | `npx supabase start` |
| Resetear BD local + seed | `npx supabase db reset` |
| Generar tipos de la BD | `npx supabase gen types typescript --local > types/database.ts` |
| Agregar componente ShadCN | `npx shadcn@latest add nombre-componente` |
| Crear rama de trabajo | `git checkout -b feature/mi-tarea` |

---

### Problemas comunes

**"No puedo acceder a /dashboard, me redirige a /login"**
Esto es correcto. Las rutas de admin estan protegidas. Necesitas autenticarte con un usuario que tenga `role = 'admin'` en la tabla `profiles`. Puedes cambiarlo manualmente desde el SQL Editor de Supabase:
```sql
update profiles set role = 'admin' where id = 'tu-user-id';
```

**"npm run dev no arranca"**
Verifica que tienes Node.js 20+ (`node -v`). Si el error menciona `.env`, asegurate de que creaste el archivo `.env.local` con las claves correctas.

**"Error de tipos con Supabase"**
Regenera los tipos ejecutando:
```bash
npx supabase gen types typescript --local > types/database.ts
```

**"Los tests E2E fallan"**
Asegurate de haber instalado los navegadores con `npx playwright install` y de que el servidor de desarrollo este corriendo en otra terminal (`npm run dev`).

**"Git dice que no tengo permisos para hacer push"**
Asegurate de que tu cuenta de GitHub tiene acceso al repositorio. Pide al administrador del repo que te agregue como colaborador.

---

> Proyecto reestructurado sobre la base inicial. Todo codigo del antiguo monolito de NestJS ha sido deprecado en favor de las tecnologias indicadas.
