# RNG-Vantage

Sistema web para automatizacion de ventas, reservas y control financiero de un emprendimiento de marketing digital.

Arquitectura principal:
- Frontend: Next.js 16 (App Router) + React 19 + TypeScript
- Backend/BaaS: Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- UI: Tailwind + shadcn

## Estado Actual

Version: 0.1.0

Estado funcional actual:
- Catalogo con precios reales aplicado
- Reglas de renovacion diferenciadas por tipo de servicio aplicadas
- Checkout alineado a negocio aplicado
- Dashboard con MRR corregido aplicado
- Fix de politica RLS admin en profiles aplicado
- Migracion full_name -> first_name/last_name aplicada

## Actualizacion De Negocio Aplicada (Abril 2026)

Se aplicaron todos los cambios solicitados para alinear el sistema con la operacion real.

### 1) Precios y servicios reales en base de datos

Archivo actualizado:
- supabase/seed.sql

Seed actual (10 servicios):
- Redes Sociales Inicial - 299.99 - manejo_redes
- Redes Sociales Work - 319.99 - manejo_redes
- Redes Sociales Premium - 555.00 - manejo_redes
- Auditoria - 70.00 - auditoria
- Sesion Fotografica - 130.00 - otro
- Sesion Audiovisual (2 videos) - 150.00 - otro
- Sesion Audiovisual (6 videos) - 230.00 - otro
- Sesion Audiovisual (15 videos) - 500.00 - otro
- Curso x 3 meses - 500.00 - capacitacion
- Modelo por 1 hora - 25.00 - otro

### 2) Regla clave: suscripcion vs servicio unico

Regla oficial vigente:
- Suscripcion mensual: solo type = manejo_redes
- Servicio unico: type = auditoria | capacitacion | otro

Implicaciones:
- duration_months sigue existiendo para todos
- auto_renew solo puede ser efectivo para manejo_redes
- para servicios unicos se fuerza auto_renew = false

### 3) Checkout actualizado (Carlos)

Archivos nuevos/actualizados:
- app/(public)/checkout/actions.ts
- app/(public)/checkout/page.tsx

Que hace ahora:
- valida service_id
- carga servicio desde services
- si el servicio no existe o esta inactivo, muestra error
- calcula ends_at usando duration_months
- fuerza auto_renew = false para servicios no recurrentes
- solo permite renovacion seleccionable para manejo_redes

### 4) Renovacion automatica actualizada (Carlos)

Archivos nuevos:
- supabase/functions/subscription-renewal/index.ts
- supabase/functions/subscription-renewal/deno.json

Comportamiento:
- toma suscripciones activas vencidas
- renueva solo si:
  - auto_renew = true
  - service.type = manejo_redes
- si no cumple, expira suscripcion y deja auto_renew = false
- retorna resumen: processed, renewed, expired, skipped, failures

### 5) Catalogo y landing actualizados (Juan)

Archivos nuevos/actualizados:
- app/(public)/catalogo/catalogo-grid.tsx
- app/(public)/catalogo/page.tsx
- app/page.tsx

Cambios visibles:
- etiqueta de precio:
  - manejo_redes: USD / mes
  - auditoria/capacitacion/otro: precio unico
- cards principales de landing con precios reales

### 6) Dashboard actualizado (Christian)

Archivo actualizado:
- app/(dashboard)/dashboard/page.tsx

Cambios:
- MRR calcula solo suscripciones con service.type = manejo_redes
- separa conteo de recurrentes vs servicios unicos
- mantiene ingresos del mes y reservas pendientes

### 7) Migraciones y seguridad de datos (Alejandro + Carlos)

Migraciones relevantes:
- supabase/migrations/00000000000000_init.sql
- supabase/migrations/20260402000000_split_full_name.sql
- supabase/migrations/20260403010000_fix_profiles_admin_policy.sql

Fix critico RLS aplicado:
- Se reemplazo la politica admin de profiles para evitar recursion infinita.
- Politica vigente usa auth.jwt() ->> role = admin.

Impacto adicional en tipos:
- types/database.ts ahora usa first_name/last_name en profiles y reservations.

## Cambios De Auth Relacionados

Archivos nuevos/actualizados:
- app/(auth)/actions.ts
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx
- lib/validators/auth.ts
- lib/validators/index.ts

Resumen:
- login y signup con validaciones fuertes de credenciales
- manejo de confirmacion de correo y reenvio
- upsert de profile con data_consent_at
- redireccion por rol (admin -> /dashboard, client -> /catalogo)

## Rutas Principales Actuales

Publico:
- /
- /catalogo
- /reservar
- /politica-privacidad

Auth:
- /login
- /register

Cliente:
- /checkout

Admin:
- /dashboard
- /reservas
- /servicios
- /subscriptions
- /transacciones

## Esquema Actual (Resumen)

Tablas principales:
- profiles
- services
- reservations
- subscriptions
- transactions

Campos clave de negocio:
- services.type: manejo_redes | auditoria | capacitacion | otro
- subscriptions.auto_renew: control de renovacion
- subscriptions.ends_at: fecha de expiracion/renovacion

## Como Ejecutar El Proyecto

Requisitos:
- Node.js
- npm

Comandos:

```bash
npm install
npm run dev
```

Validacion local usada en esta actualizacion:

```bash
npm run lint
npm run build
```

## Como Aplicar En Supabase Cloud

### Opcion A: con Supabase CLI

```bash
supabase db push
supabase db seed
supabase functions deploy subscription-renewal
```

Luego configurar un schedule para subscription-renewal.

### Opcion B: sin Supabase CLI

1. SQL Editor:
- ejecutar migraciones pendientes
- ejecutar contenido de supabase/seed.sql si deseas recargar catalogo

2. Edge Functions:
- crear funcion subscription-renewal
- pegar codigo de supabase/functions/subscription-renewal/index.ts

3. Variables/Secrets:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

4. Scheduling:
- configurar ejecucion periodica (por ejemplo, diaria)

## Checklist Rapido De Verificacion

- Catalogo muestra /mes solo en manejo_redes
- Checkout crea suscripcion y respeta regla de auto_renew
- Servicios unicos quedan no renovables
- Dashboard MRR ignora servicios unicos
- RLS de profiles no bloquea consultas
- Edge function procesa vencimientos sin renovar tipos no recurrentes

## Nota Operativa

Actualmente, si en tu terminal no existe el comando supabase, instala Supabase CLI o aplica los cambios desde el Dashboard web de Supabase (SQL Editor + Edge Functions + Scheduler).
