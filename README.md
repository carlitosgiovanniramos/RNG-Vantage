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
