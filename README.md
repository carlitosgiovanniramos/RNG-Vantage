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

### Paso 4: Configurar variables de entorno (Supabase)

> **CONCEPTO CLAVE:** Todo el equipo usa **el mismo proyecto de Supabase**. No crees tu propio proyecto. Las claves son compartidas y las va a proporcionar Carlos (gestor del proyecto). Todos apuntan a la misma base de datos para que los modulos se integren correctamente entre si.

**4.1** Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

> En Windows (CMD) usa: `copy .env.example .env.local`
> En Windows (PowerShell) usa: `Copy-Item .env.example .env.local`

**4.2** Abre `.env.local` en tu editor de texto y pega las claves que Carlos compartio con el equipo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Reemplaza los valores `xxxxxxxx` y `eyJhb...` con los valores reales que recibiste. **No modifiques** `NEXT_PUBLIC_SITE_URL`, dejalo como `http://localhost:3000`.

**4.3 Reglas importantes sobre las variables de entorno:**

- **NUNCA** subas el archivo `.env.local` a Git (ya esta en `.gitignore`, pero verificalo)
- **NUNCA** compartas las claves por un canal publico (no las pegues en el chat del grupo de WhatsApp ni en issues de GitHub)
- **NUNCA** crees tu propio proyecto de Supabase para trabajar en el proyecto — todos usamos el mismo
- Si necesitas las claves, pideselas directamente a Carlos por mensaje privado
- El archivo `.env.example` que SI esta en el repositorio solo contiene valores de ejemplo, **no son las claves reales**

**4.4 Verificar que `.env.local` se creo correctamente:**

Abre el archivo y confirma que:
- No tiene espacios antes o despues del `=`
- No tiene comillas alrededor de los valores
- La URL empieza con `https://` y termina en `.supabase.co`
- La key es una cadena larga que empieza con `eyJ`

Ejemplo de archivo **CORRECTO**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.xxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Ejemplo de archivo **INCORRECTO** (no hagas esto):
```env
# MAL: tiene comillas
NEXT_PUBLIC_SUPABASE_URL="https://abcdefgh.supabase.co"

# MAL: tiene espacios
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...

# MAL: es el valor de ejemplo, no el real
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

---

### Paso 5: Configurar la base de datos en Supabase

> **IMPORTANTE:** Este paso solo lo hace **Carlos** (una sola vez para todo el equipo). Si eres Alejandro, Juan o Christian, **salta al Paso 6**. La base de datos ya estara configurada cuando clones el proyecto.

El proyecto incluye migraciones SQL que crean todas las tablas necesarias y un archivo de seed con datos de ejemplo.

#### Instrucciones para Carlos (configuracion unica):

**5.1** Ve al **SQL Editor** de tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard) → selecciona el proyecto del equipo → **SQL Editor** (icono de terminal en el menu izquierdo).

**5.2** Abre el archivo `supabase/migrations/00000000000000_init.sql` desde tu copia local del proyecto. Selecciona **todo** el contenido del archivo (Ctrl+A), copialo (Ctrl+C) y pegalo (Ctrl+V) en el SQL Editor de Supabase. Haz clic en el boton verde **Run** (o presiona Ctrl+Enter).

Si todo sale bien, veras el mensaje "Success. No rows returned". Esto es normal — las migraciones crean tablas, no devuelven filas.

Esto crea las tablas: `profiles`, `services`, `reservations`, `subscriptions` y `transactions`, junto con todas las politicas de seguridad RLS y los triggers.

**5.3** Ahora abre el archivo `supabase/seed.sql`, copia todo su contenido y pegalo en el SQL Editor (puedes abrir un nuevo query o borrar el anterior). Haz clic en **Run**.

Deberia mostrar "Success. 6 rows affected" (son los 6 servicios de ejemplo).

**5.4** Verifica que las tablas se crearon: en el menu izquierdo de Supabase Dashboard, haz clic en **Table Editor**. Deberias ver 5 tablas: `profiles`, `services`, `reservations`, `subscriptions`, `transactions`. Haz clic en `services` y confirma que hay 6 filas de datos.

**5.5** Comparte las claves del proyecto con el equipo (por mensaje privado, no por canal publico):
1. Ve a **Settings** → **API**
2. Copia `Project URL` → esta es la `NEXT_PUBLIC_SUPABASE_URL`
3. Copia `anon public` (bajo Project API keys) → esta es la `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Envia ambos valores a cada companero por mensaje directo

#### Opcion alternativa: Supabase local con Docker (para desarrollo aislado)

Si algun integrante quiere experimentar sin afectar la base de datos compartida, puede levantar una instancia local. Esto **no es obligatorio** y requiere tener Docker Desktop instalado y corriendo.

```bash
npx supabase start
```

Esto levantara una instancia local de PostgreSQL, Auth (GoTrue), Storage y Studio. La primera vez descargara las imagenes de Docker (puede tardar varios minutos).

Al terminar, el comando mostrara las URLs y claves locales en la terminal. Si eliges esta opcion, actualiza tu `.env.local` con esos valores locales en vez de los del proyecto en la nube:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<la clave anon que muestra el comando>
```

Aplica las migraciones y el seed:

```bash
npx supabase db reset
```

Este comando ejecuta las migraciones y luego el `seed.sql` automaticamente.

Para acceder al panel visual de administracion de la base de datos local:

```
http://127.0.0.1:54323
```

> **Recuerda:** si usas Supabase local, tus datos son independientes y tus companeros no veran lo que hagas ahi. Cuando termines de experimentar, vuelve a poner las claves del proyecto en la nube en tu `.env.local`.

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

**"La pagina carga pero no muestra datos / sale un error de Supabase"**
Tu archivo `.env.local` tiene claves incorrectas o no existe. Verifica lo siguiente:
1. Que el archivo `.env.local` existe en la raiz del proyecto (al mismo nivel que `package.json`)
2. Que las claves son las reales del proyecto compartidas por Carlos (no los valores de ejemplo)
3. Que no hay comillas, espacios extra ni saltos de linea dentro de los valores
4. Despues de modificar `.env.local`, **debes reiniciar el servidor** (`Ctrl+C` y luego `npm run dev` de nuevo). Next.js no detecta cambios en `.env.local` en caliente.

**"No puedo acceder a /dashboard, me redirige a /login"**
Esto es correcto. Las rutas de admin estan protegidas. Necesitas autenticarte con un usuario que tenga `role = 'admin'` en la tabla `profiles`. Pide a Carlos que ejecute lo siguiente en el SQL Editor de Supabase para darte acceso admin:
```sql
-- Reemplaza 'tu-email@ejemplo.com' con el email con el que te registraste
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'tu-email@ejemplo.com');
```

**"npm run dev no arranca"**
Verifica lo siguiente en orden:
1. `node -v` debe mostrar v20 o superior. Si no, descarga Node.js LTS desde https://nodejs.org
2. Ejecutaste `npm install` despues de clonar? Si no, ejecutalo.
3. Existe el archivo `.env.local`? Si no, crealo (ver Paso 4 del tutorial).
4. Si el error dice "Module not found", borra `node_modules` y ejecuta `npm install` de nuevo:
   ```bash
   rm -rf node_modules
   npm install
   ```

**"npm install falla o tarda demasiado"**
- Verifica tu conexion a internet
- Si estas en la red de la universidad, prueba con datos moviles (algunas redes bloquean registros de npm)
- Intenta limpiar la cache: `npm cache clean --force` y luego `npm install`

**"Error de tipos con Supabase"**
Si ves errores de TypeScript relacionados con tablas o columnas, es posible que los tipos esten desactualizados. Solo aplica si tienes Supabase local con Docker:
```bash
npx supabase gen types typescript --local > types/database.ts
```

**"Los tests E2E fallan"**
1. Asegurate de haber instalado los navegadores: `npx playwright install`
2. Los tests E2E necesitan que el servidor este corriendo. Abre **otra terminal** y ejecuta `npm run dev`, luego en la terminal original ejecuta `npm run test:e2e`

**"Git dice que no tengo permisos para hacer push"**
Tu cuenta de GitHub no tiene acceso al repositorio. Pide a Carlos que te agregue como colaborador:
1. Carlos va a GitHub → repositorio → Settings → Collaborators
2. Hace clic en "Add people" y agrega tu usuario de GitHub
3. Te llegara una invitacion por email o en GitHub, debes aceptarla

**"Git dice que hay conflictos al hacer merge"**
Esto pasa cuando dos personas modificaron el mismo archivo. No entres en panico:
1. Abre los archivos marcados con conflicto en VS Code (aparecen con marcas `<<<<<<< HEAD`)
2. VS Code te mostrara opciones: "Accept Current Change", "Accept Incoming Change", "Accept Both"
3. Elige la opcion correcta segun el caso, o edita manualmente
4. Despues de resolver: `git add .` y `git commit -m "fix: resolver conflictos con develop"`
5. Si no sabes como resolverlo, pregunta en el grupo antes de hacer nada

**"Me aparece el template de Next.js en vez de la landing de RNG-Vantage"**
Estas en una rama desactualizada. Ejecuta:
```bash
git checkout develop
git pull origin develop
```

---

> Proyecto reestructurado sobre la base inicial. Todo codigo del antiguo monolito de NestJS ha sido deprecado en favor de las tecnologias indicadas.
