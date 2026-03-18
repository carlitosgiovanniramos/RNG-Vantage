# RNG-Vantage

RNG-Vantage es una plataforma moderna para la gestión financiera, dashboard interactivo y manejo de suscripciones construida con una arquitectura *Serverless* e interfaces fluidas basadas en el App Router de Next.js. El proyecto está enfocado en proporcionar un panel administrativo rápido, seguro (tipado de principio a fin) e integrable como una Progressive Web App (PWA).

---

## 🏗 Arquitectura y Stack Tecnológico

El proyecto ha abandonado las estructuras monolíticas para adoptar un enfoque **Backend as a Service (BaaS)** mediante Supabase y un **Frontend Desacoplado** alojado en la Edge Network.

### 🎨 Frontend
*   **Framework Base:** [Next.js 16](https://nextjs.org/) (App Router) configurado con TypeScript.
*   **Estilos y Componentes:** [Tailwind CSS v4](https://tailwindcss.com/) sumado al ecosistema de [ShadCN/UI](https://ui.shadcn.com/) y Lucide React para iconografía.
*   **Manejo de Formularios y Validación:** [React Hook Form](https://react-hook-form.com/) integrado nativamente con [Zod](https://zod.dev/) para validación estricta de esquemas antes de tocar el servidor.
*   **Data Fetching & Cache:** [TanStack Query](https://tanstack.com/query) (React Query) para sincronización con el backend y estado global asíncrono.
*   **Dashboard Visuals:** [Recharts](https://recharts.org/) usado para las métricas e indicadores de los gráficos principales.
*   **PWA:** Configuración mediante el wrapper de `next-pwa` para ofrecer instalabilidad y soporte offline progresivo.

### ⚡ Backend / BaaS (Supabase)
Todo lo correspondiente a datos persistentes, usuarios y reglas se centraliza a través de **[Supabase](https://supabase.com/)**:
*   **Database:** PostgreSQL accesible auto-generado vía API REST y GraphQL.
*   **Auth:** Manejo de sesiones (JWT), logins sociales o por email listos para usar en Next.js Middleware (usando el package `@supabase/ssr`).
*   **Realtime / Storage:** Suscripciones a la base de datos por WebSockets en el dashboard.

#### 🧠 Lógica Compleja (Edge Functions)
El proyecto utiliza [Edge Functions](https://supabase.com/docs/guides/functions) (ejecutadas en **Deno**) cuando un CRUD básico no es suficiente. Estas viven bajo el directorio `/supabase/functions/` y se encargan de:
- Cálculos pesados para métricas financieras a final de mes.
- Renovación automática y lógica de integraciones de pago o facturación de suscripciones.
- Envío transaccional y *webhooks* que no pueden vivir en el cliente.

### 🚀 Despliegue
*   **Frontend:** Desplegado de forma automática y transparente en **Vercel**.
*   **Backend:** Instancia hospeada de Supabase que administra escalabilidad, backups automáticos de Postgres y los servidores Edge de Deno.

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
- Cuenta activa en un proyecto de remoto de [Supabase](https://supabase.com).
- Variables de entorno `.env.local` configuradas (solicitar acceso o usar un dummy project).

### 2. Instalación
Para instalar dependencias del Frontend tras clonar:
```bash
npm install
```

### 3. Servidor de Next.js
Levantar la app en modo dev (por defecto `http://localhost:3000`):
```bash
npm run dev
```

### 4. Supabase CLI (Base de datos y Funciones locales)
Para levantar el entorno completo de Emuladores de Supabase Local (requiere Docker arrancado si vas a emular Postgres local, o puedes enlazar un proyecto en la nube solo para las funciones):
```bash
npx supabase init # Solo si no ha sido inicializado
npx supabase start # (Opcional, levanta contenedores Postgres, GoTrue y Storage)
npx supabase functions serve mi-funcion-edge --no-verify-jwt # Ejecuta server local Deno
```

---
> Proyecto reestructurado sobre la base inicial. Todo código del antiguo monolito de NestJS ha sido deprecado en favor de las tecnologías indicadas.
