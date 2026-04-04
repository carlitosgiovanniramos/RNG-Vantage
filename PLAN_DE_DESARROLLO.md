# Plan de Desarrollo — RNG-Vantage

> Sistema integral de automatización de ventas, reservas y control financiero para RGL ESTUDIO — agencia de manejo estratégico de redes sociales y producción audiovisual B2B de Ruth Noemi Gómez Lescano (Baños de Agua Santa / Ambato, Ecuador).
>
> **Contexto:** RNG-Vantage es la "Intranet de gestión financiera y de clientes" citada en el plan de negocios oficial de la cliente. El equipo de UTA (estos 4 integrantes) son los aliados estratégicos de desarrollo mencionados en dicho plan.

---

## 1. Información del Equipo

| Integrante | Rol Principal | Área de Responsabilidad | Par de Trabajo |
|---|---|---|---|
| **Carlos Giovanni Ramos Jacome** | Backend Lead + Gestión de Proyecto | Autenticación, seguridad (RLS), Edge Functions, transacciones, coordinación del equipo | Carlos + Alejandro (par backend) |
| **Edison Alejandro Andrade Ocaña** | Backend + Base de Datos | Schemas Zod, Server Actions CRUD de todos los módulos, migraciones SQL, seed data, tipos TypeScript | Carlos + Alejandro (par backend) |
| **Juan Pablo López Ramos** | Frontend Lead + UX | Páginas públicas (landing, catálogo, reservar, checkout, privacidad), navbar/footer, formularios, responsive mobile-first | Juan + Christian (par frontend) |
| **Christian Alexis Hurtado Torres** | Frontend + Dashboard UI | Páginas admin (dashboard, reservas, servicios, transacciones), gráficos Recharts, design system ShadCN, páginas de login/register | Juan + Christian (par frontend) |

**Distribución de carga:** Backend (Carlos + Alejandro) = 55% | Frontend (Juan + Christian) = 45%

**Metodología:** Programación en pares. Cada par trabaja en la misma área para garantizar transferencia de conocimiento y evitar cuellos de botella si un integrante no está disponible.

---

## 2. Cronograma General

Basado en el cronograma académico de 16 semanas (Enero 2026 – Julio 2026):

| Fase | Semanas | Descripción |
|---|---|---|
| Inicio y Planificación | 1–2 | Requisitos, historias de usuario, alcance, project charter |
| Análisis y Diseño | 3–4 | Arquitectura de datos, prototipos Mobile-First, diseño LOPDP |
| **Desarrollo Sprint 1** | **5–6** | **Base funcional: auth, reservas, landing, sistema de diseño** |
| **Desarrollo Sprint 2** | **7–8** | **Módulos core: suscripciones, catálogo, dashboard, checkout** |
| **Desarrollo Sprint 3** | **9–10** | **Integración: métricas, realtime, LOPDP, responsive** |
| **Desarrollo Sprint 4** | **11–12** | **Cierre: documentación, migraciones finales, pulido UX** |
| Pruebas y QA | 13–14 | Tests funcionales, E2E, seguridad, carga, validación de roles |
| Implantación y Cierre | 15–16 | Deploy producción, migración datos reales, capacitación, manuales |

---

## 3. Roles y Tareas Detalladas

A continuación se detallan TODAS las tareas de cada integrante con especificaciones técnicas completas: archivos a crear/modificar, lógica esperada, criterios de aceptación, dependencias entre tareas y rama de Git correspondiente.

### Mapa de Dependencias entre Tareas

Antes de leer las tareas individuales, es importante entender qué tareas bloquean a otras. Si tu tarea depende de otra que no está lista, coordina con tu compañero para acordar prioridades.

```
Carlos: Auth (T1) ────────┬──→ Christian: Login/Register UI (T2)
                           ├──→ Alejandro: Server Actions (necesitan auth context)
                           └──→ Juan: Checkout UI (necesita auth para comprar)

Alejandro: Schemas Zod (T1) ──┬──→ Juan: Formulario Reserva (T3)
                               ├──→ Christian: Formularios Admin (T4-T6)
                               └──→ Carlos: Server Actions de transacciones

Alejandro: CRUD Backend ──────┬──→ Juan: Catálogo UI, Checkout UI
                               └──→ Christian: Tablas Admin (reservas, servicios, transacciones)

Carlos: Edge Function Métricas ──→ Christian: Dashboard con datos reales
```

> **Regla:** Si estás bloqueado por una tarea de otro compañero, trabaja en tareas que NO tengan dependencias pendientes. No esperes sin hacer nada.

---

### 3.1 Carlos Giovanni Ramos Jacome — Backend Lead + Gestión de Proyecto

**Responsabilidad general:** Toda la lógica de negocio del servidor, seguridad del sistema, Edge Functions de Supabase y coordinación general del equipo.

---

#### Tarea 1: Sistema de Autenticación y Seguridad

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/auth-registro-login`
**Dependencias:** Ninguna (es la primera tarea del proyecto)
**Bloquea a:** Christian (login/register UI), Alejandro (Server Actions necesitan auth), Juan (checkout necesita auth)

**¿Qué hay que hacer?**
Implementar el flujo completo de autenticación usando Supabase Auth: registro con consentimiento LOPDP, login con redirección por rol, y protección de rutas admin.

**Archivos a crear/modificar:**

| Archivo | Acción | Qué hacer |
|---|---|---|
| `app/(auth)/login/page.tsx` | Modificar | Conectar la lógica de `supabase.auth.signInWithPassword()`. La UI la hace Christian, pero la conexión con Supabase la coordinas tú. Implementar redirect post-login: si `role === 'admin'` → `/dashboard`, si `role === 'client'` → `/catalogo` |
| `app/(auth)/register/page.tsx` | Modificar | Conectar la lógica de `supabase.auth.signUp()` con `options.data.full_name`. Asegurar que el checkbox LOPDP sea obligatorio y que se guarde `data_consent_at` en el perfil |
| `lib/supabase/server.ts` | Modificar (si necesario) | Agregar funciones helper si se necesitan (ej: `getCurrentUser()`, `requireAdmin()`) |
| `middleware.ts` | Modificar | Refinar la protección de rutas. Ya tiene estructura base. Verificar que funcione correctamente el flujo: no autenticado → redirect a `/login?redirect={pathname}`, autenticado pero no admin → redirect a `/` |

**Lógica detallada del registro:**
```
1. Recibir: email, password, first_name, last_name, data_consent (boolean)
2. Verificar que data_consent === true (si no, rechazar con error)
3. Llamar: supabase.auth.signUp({ email, password, options: { data: { first_name, last_name } } })
4. El trigger handle_new_user() en la BD:
   - Crea automáticamente el perfil con role='client'
   - Inicializa raw_app_meta_data.role='client' en auth.users para el JWT
5. Guardar data_consent_at = now() en el perfil recién creado
6. JWT se almacena en cookie vía @supabase/ssr
7. Redirigir a /catalogo

NOTA: Es OBLIGATORIO pasar first_name y last_name separados en options.data (no full_name).
El trigger los lee de raw_user_meta_data->>'first_name' y raw_user_meta_data->>'last_name'.
```

**Lógica detallada del login:**
```
1. Recibir: email, password
2. Llamar: supabase.auth.signInWithPassword({ email, password })
3. Si error → mostrar mensaje (credenciales incorrectas, usuario no existe, etc)
4. Si éxito → consultar profiles.role del usuario
5. Si role === 'admin' → redirect a /dashboard
6. Si role === 'client' → redirect a /catalogo (o al redirect de la URL si viene de una ruta protegida)
```

**Criterios de aceptación (cómo saber que está terminado):**
- [ ] Un usuario nuevo puede registrarse con email, contraseña y nombre completo
- [ ] Al registrarse se crea automáticamente su perfil con `role = 'client'` y `data_consent_at` lleno
- [ ] Si el usuario no marca el checkbox LOPDP, el formulario NO permite enviar
- [ ] Un usuario registrado puede iniciar sesión y es redirigido según su rol
- [ ] Las rutas `/dashboard`, `/reservas`, `/servicios`, `/transacciones`, `/subscriptions` redirigen a `/login` si el usuario no está autenticado
- [ ] Las mismas rutas redirigen a `/` si el usuario está autenticado pero NO es admin
- [ ] El primer usuario admin se configura manualmente ejecutando SQL en Supabase Dashboard
- [ ] Si el JWT expira, el middleware lo refresca automáticamente sin que el usuario note nada

**Cómo probar manualmente:**
1. Ejecuta `npm run dev` y ve a `/register`
2. Crea una cuenta con email, contraseña y nombre
3. Verifica en Supabase Dashboard → Table Editor → `profiles` que se creó el perfil con `role = 'client'`
4. Cierra sesión e inicia sesión de nuevo → deberías llegar a `/catalogo`
5. En SQL Editor de Supabase: `UPDATE profiles SET role = 'admin' WHERE ...`
6. Cierra sesión e inicia sesión → deberías llegar a `/dashboard`
7. En modo incógnito, intenta acceder a `/dashboard` → debe redirigir a `/login`

---

#### Tarea 2: Validación y Refinamiento de Políticas RLS

**Sprint:** 1–2 (Semanas 5–8, en paralelo) · **Rama:** `feature/rls-politicas-seguridad`
**Estado:** ✅ COMPLETADO — Auditoría completa aplicada el 2026-04-04
**Dependencias:** Tarea 1 (auth debe funcionar para probar con diferentes roles)

**Resumen de correcciones aplicadas (migración 20260404000000):**
- 12 políticas admin reescritas con path correcto: `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`
- Escalada de privilegios en profiles corregida (WITH CHECK role='client')
- Política INSERT de reservations abierta a anónimos con data_consent=true
- Política admin UPDATE en profiles agregada (faltaba)
- Trigger trg_sync_profile_role: sincroniza profiles.role → raw_app_meta_data → JWT
- handle_new_user: inicializa role='client' en JWT desde el registro
- 9 índices de rendimiento creados
- subscriptions.status DEFAULT corregido: 'active' → 'pending'
- Trigger trg_enforce_auto_renew: fuerza auto_renew=false para servicios únicos a nivel DB

**Archivos de referencia:**
- `supabase/migrations/20260404000000_fix_security_and_business_logic.sql` — todos los cambios documentados

**Matriz de pruebas RLS (probar cada combinación):**

| Tabla | Usuario no autenticado | Cliente (su propia data) | Cliente (data de otro) | Admin |
|---|---|---|---|---|
| `profiles` | ❌ No puede leer | ✅ Lee/edita su perfil | ❌ No puede ver | ✅ Lee todos |
| `services` | ❌ No puede leer | ✅ Lee activos | ❌ No puede crear | ✅ CRUD completo |
| `reservations` | ❌ No puede leer | ✅ Lee/crea las suyas | ❌ No ve de otros | ✅ Lee/edita todas |
| `subscriptions` | ❌ No puede leer | ✅ Lee las suyas | ❌ No ve de otros | ✅ Lee/edita todas |
| `transactions` | ❌ No puede leer | ✅ Lee las suyas | ❌ No ve de otros | ✅ CRUD completo |

**Criterios de aceptación:**
- [ ] Cada celda de la matriz de arriba se cumple exactamente
- [ ] Tests documentados con capturas de pantalla o queries SQL que demuestren cada caso
- [ ] Un usuario no autenticado NO puede leer ni escribir en NINGUNA tabla

---

#### Tarea 3: Motor de Suscripciones — Edge Function

**Sprint:** 2 (Semanas 7–8) · **Rama:** `feature/edge-function-suscripciones`
**Dependencias:** Tarea 1 (auth) + Alejandro debe tener la lógica de contratación lista (Alejandro T4)

**¿Qué hay que hacer?**
Desarrollar una Edge Function en Deno que gestione el ciclo de vida de las suscripciones: detectar vencimientos, renovar automáticamente las que tengan `auto_renew = true`, y expirar las demás.

**Archivos a crear:**
- `supabase/functions/subscription-renewal/index.ts` — lógica principal
- `supabase/functions/subscription-renewal/deno.json` — config de Deno

**Pseudocódigo:**
```
1. Consultar: SELECT * FROM subscriptions WHERE ends_at <= now() AND status = 'active'
2. Para cada suscripción encontrada:
   a. Si auto_renew = true:
      - Obtener el servicio: SELECT duration_months, price FROM services WHERE id = subscription.service_id
      - Actualizar suscripción: starts_at = ends_at anterior, ends_at = nueva fecha (+ duration_months)
      - Crear transacción: { user_id, subscription_id, amount: service.price, status: 'pending', payment_method: 'pending' }
   b. Si auto_renew = false:
      - Actualizar suscripción: status = 'expired'
3. Retornar JSON: { renewed: X, expired: Y, errors: [...] }
```

**Criterios de aceptación:**
- [ ] La función procesa correctamente suscripciones vencidas
- [ ] Las renovaciones crean una transacción pendiente asociada con el monto correcto
- [ ] Las suscripciones no renovables cambian a `expired`
- [ ] La función es **idempotente**: ejecutarla dos veces seguidas NO duplica datos
- [ ] Se puede invocar manualmente vía `curl` para testing
- [ ] Solo usuarios admin pueden invocarla (JWT verificado en el header)

**Cómo probar:**
```bash
npx supabase functions serve subscription-renewal --no-verify-jwt
curl -X POST http://localhost:54321/functions/v1/subscription-renewal \
  -H "Authorization: Bearer TU_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

#### Tarea 4: API de Métricas del Dashboard — Edge Function

**Sprint:** 3 (Semanas 9–10) · **Rama:** `feature/edge-function-dashboard-metrics`
**Dependencias:** Datos en todas las tablas (Alejandro debe tener transacciones, suscripciones, reservas con datos)
**Bloquea a:** Christian (necesita esta API para alimentar los gráficos del dashboard)

**¿Qué hay que hacer?**
Edge Function que calcula y retorna TODAS las métricas financieras que el dashboard necesita en una sola llamada.

**Archivos a crear:**
- `supabase/functions/dashboard-metrics/index.ts`
- `supabase/functions/dashboard-metrics/deno.json`
- Opcionalmente: nueva migración con vistas SQL para optimizar queries

**Métricas a calcular (cada una es un campo del JSON de respuesta):**

| Campo JSON | Descripción | Query SQL aproximado |
|---|---|---|
| `monthly_revenue` | Ingresos del mes actual | `SUM(amount) FROM transactions WHERE status='completed' AND created_at >= inicio_del_mes` |
| `revenue_by_service_type` | Ingresos agrupados por tipo | `JOIN transactions → subscriptions → services, GROUP BY services.type` |
| `active_subscriptions` | Suscripciones activas | `COUNT(*) FROM subscriptions WHERE status='active'` |
| `expiring_soon` | Suscripciones por vencer (7 días) | `COUNT(*) FROM subscriptions WHERE ends_at BETWEEN now() AND now()+7days` |
| `pending_reservations` | Reservas pendientes | `COUNT(*) FROM reservations WHERE status='pending'` |
| `recent_transactions` | Últimas 10 transacciones | `SELECT ... FROM transactions JOIN profiles ORDER BY created_at DESC LIMIT 10` |
| `conversion_rate` | Tasa de conversión | `(COUNT subscriptions / COUNT reservations) * 100` |

**Criterios de aceptación:**
- [ ] Retorna JSON con todas las métricas en una sola llamada
- [ ] Los cálculos son correctos contra datos de prueba conocidos
- [ ] Tiempo de respuesta < 500ms con datos de prueba
- [ ] Solo usuarios admin pueden invocarla (JWT verificado)

---

#### Tarea 5: Lógica de Transacciones y Preparación para Pasarela de Pago

**Sprint:** 2 (Semanas 7–8) · **Rama:** `feature/transacciones-logica-pagos`
**Dependencias:** Tarea 1 (auth)

**¿Qué hay que hacer?**
Implementar la lógica server-side para el registro de pagos, diseñar el flujo de estados y preparar un webhook placeholder para integrar una pasarela de pago real en el futuro.

**Archivos a crear/modificar:**
- `app/api/transactions/route.ts` — Route Handler para registrar transacciones
- `lib/validators/transaction.ts` — schema Zod (coordinar con Alejandro)
- `supabase/functions/payment-webhook/index.ts` — placeholder documentado

**Flujo de estados de una transacción:**
```
pending ───→ completed    (admin registra pago exitoso)
pending ───→ failed       (admin registra pago rechazado)
completed ──→ refunded    (admin registra devolución)
```

**Criterios de aceptación:**
- [ ] Un admin puede registrar un pago manual desde la interfaz
- [ ] Al completar un pago (`status = 'completed'`), la suscripción asociada se activa automáticamente
- [ ] El webhook placeholder tiene documentación clara de cómo integrarlo con una pasarela futura
- [ ] Las transacciones se validan con Zod antes de insertarse

---

#### Tarea 6: Gestión del Proyecto y Documentación

**Sprint:** Continuo (todas las semanas) · **Sin rama específica**

**Actividades semanales:**
- [ ] Configurar y mantener tablero de tareas en GitHub Projects
- [ ] Facilitar reunión semanal de seguimiento (15–30 min)
- [ ] Revisar y aprobar Pull Requests de todos los integrantes
- [ ] Resolver conflictos de merge en `develop`
- [ ] Verificar que el build pase antes de cada merge

**Documentación técnica (Sprint 4, semanas 11–12):**
- [ ] Documento de arquitectura del sistema
- [ ] Documentación de Edge Functions (parámetros, respuestas, cómo probarlas)
- [ ] Esquema de base de datos final con diagrama ER
- [ ] Guía de deploy a producción (Vercel + Supabase)

---

### 3.2 Edison Alejandro Andrade Ocaña — Backend + Base de Datos

**Responsabilidad general:** Todo lo relacionado con el esquema de datos, operaciones CRUD (Server Actions), validaciones Zod reutilizables, migraciones SQL y seed data para testing.

---

#### Tarea 1: Schemas de Validación Zod

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/validators-zod-schemas`
**Dependencias:** Ninguna (es lo primero que debe estar listo)
**Bloquea a:** Juan (formularios), Christian (formularios admin), Carlos (Server Actions de transacciones)

**¿Qué hay que hacer?**
Crear TODOS los schemas de validación reutilizables que serán usados tanto en el backend (Server Actions) como en el frontend (React Hook Form resolver).

**Archivos a crear:**

| Archivo | Schemas que contiene |
|---|---|
| `lib/validators/auth.ts` | `loginSchema`: email (formato válido), password (min 6 chars). `registerSchema`: email, password, full_name (min 2 chars), data_consent (debe ser `true`) |
| `lib/validators/reservation.ts` | `createReservationSchema`: full_name (min 2, max 100), email (válido), phone (opcional, formato ecuatoriano `09XXXXXXXX`), preferred_date (fecha futura obligatoria), notes (opcional, max 500), data_consent (debe ser `true`) |
| `lib/validators/service.ts` | `createServiceSchema`: name (min 3, max 100), description (opcional, max 500), type (enum: `manejo_redes` \| `auditoria` \| `capacitacion` \| `otro`), price (número >= 0), duration_months (entero > 0), is_active (boolean, default `true`) |
| `lib/validators/subscription.ts` | `createSubscriptionSchema`: service_id (uuid), auto_renew (boolean, default `false`) |
| `lib/validators/transaction.ts` | `createTransactionSchema`: subscription_id (uuid, opcional), amount (número > 0), payment_method (enum: `cash` \| `transfer` \| `card`), notes (opcional, max 500) |
| `lib/validators/index.ts` | Re-exportar todos los schemas para import fácil: `import { loginSchema } from "@/lib/validators"` |

**Requisitos importantes:**
- Los mensajes de error deben estar en **español** (ej: "El nombre debe tener al menos 2 caracteres")
- Cada schema debe exportar tanto el schema como su tipo inferido (ej: `type LoginInput = z.infer<typeof loginSchema>`)

**Criterios de aceptación:**
- [ ] Cada schema valida correctamente datos válidos e inválidos
- [ ] Los mensajes de error están en español
- [ ] Unit tests para cada schema: al menos 3 tests por schema (dato válido, dato inválido, edge case)
- [ ] Los schemas son importables globalmente desde `@/lib/validators`

**Ejemplo de implementación esperada:**
```typescript
// lib/validators/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

---

#### Tarea 2: Módulo de Captación y Reservas — Backend

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/reservas-backend-crud`
**Dependencias:** Tarea 1 (schemas Zod)
**Bloquea a:** Juan (necesita el Server Action para conectar el formulario de reserva)

**¿Qué hay que hacer?**
Implementar toda la lógica del servidor para el sistema de reservas: creación desde el formulario público y cambio de estados por el admin.

**Archivos a crear:**
- `app/(public)/reservar/actions.ts` — Server Action: crear reserva
- `app/(dashboard)/reservas/actions.ts` — Server Actions: actualizar estado de reserva

**Server Action `createReservation(formData)`:**
```
1. Validar datos con createReservationSchema
2. Obtener user_id si el usuario está autenticado (OPCIONAL — las reservas pueden ser anónimas)
3. Insertar en tabla reservations con status = 'pending'
4. Retornar { success: true, id: reservation.id } o { error: 'mensaje descriptivo' }
```

**Server Action `updateReservationStatus(id, newStatus)`:**
```
1. Verificar que el usuario actual es admin
2. Validar transición de estado:
   - pending → confirmed ✅
   - pending → cancelled ✅
   - confirmed → completed ✅
   - confirmed → cancelled ✅
   - completed → (ninguna) ❌
   - cancelled → (ninguna) ❌
3. Si transición inválida → retornar { error: "Transición no permitida" }
4. Actualizar el registro en la BD
5. Retornar { success: true }
```

**Criterios de aceptación:**
- [ ] Un visitante puede crear una reserva desde `/reservar` **sin estar autenticado**
- [ ] Un visitante autenticado tiene su `user_id` asociado automáticamente
- [ ] El admin puede cambiar el estado de cualquier reserva
- [ ] No se puede saltar estados (ej: pending → completed directamente está prohibido)
- [ ] Los datos se validan con Zod antes de tocar la base de datos

---

#### Tarea 3: Módulo de Servicios/Catálogo — Backend

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/servicios-backend-crud`
**Dependencias:** Tarea 1 (schemas Zod)
**Bloquea a:** Juan (catálogo UI), Christian (servicios admin UI)

**Archivo a crear:** `app/(dashboard)/servicios/actions.ts`

**Server Actions a implementar:**

| Acción | Parámetros | Lógica |
|---|---|---|
| `createService(formData)` | Datos del formulario | Validar con `createServiceSchema`, insertar en tabla `services`, retornar `{ success, id }` |
| `updateService(id, formData)` | ID + datos actualizados | Verificar que el servicio existe, validar datos, actualizar registro |
| `toggleServiceActive(id)` | ID del servicio | Cambiar `is_active` al valor contrario (true↔false). Esto es un soft delete |

**Criterios de aceptación:**
- [ ] El admin puede crear servicios nuevos con todos los campos requeridos
- [ ] El admin puede editar nombre, descripción, precio, duración, tipo de un servicio existente
- [ ] El admin puede desactivar un servicio (no se elimina de la BD, solo `is_active = false`)
- [ ] Los servicios desactivados NO aparecen en el catálogo público pero SÍ en la vista admin
- [ ] Validación Zod en todos los inputs

---

#### Tarea 4: Módulo de Suscripciones — Lógica de Contratación

**Sprint:** 2 (Semanas 7–8) · **Rama:** `feature/suscripciones-contratacion`
**Dependencias:** T1 (schemas), T3 (servicios deben existir), Carlos T1 (auth)
**Bloquea a:** Juan (checkout UI), Carlos (Edge Function de renovación)

**Archivo a crear:** `app/(public)/checkout/actions.ts`

**Server Action `createSubscription(formData)`:**
```
1. Recibir: service_id, auto_renew (del formulario de checkout)
2. Validar con createSubscriptionSchema
3. Obtener usuario actual con supabase.auth.getUser()
   - Si no está autenticado → retornar { error: "Debes iniciar sesión", redirect: "/login" }
4. Obtener el servicio: SELECT * FROM services WHERE id = service_id
   - Si no existe o is_active = false → retornar { error: "Servicio no disponible" }
5. REGLA DE NEGOCIO: si service.type === 'auditoria' || 'capacitacion' || 'otro'
   → forzar auto_renew = false (son servicios únicos, nunca se renuevan)
   → solo los servicios type === 'manejo_redes' pueden tener auto_renew = true
6. Calcular ends_at = now() + servicio.duration_months
7. INSERTAR en subscriptions: { user_id, service_id, starts_at: now(), ends_at, status: 'pending', auto_renew }
   NOTA: status inicial es 'pending' — el trigger trg_enforce_auto_renew en DB fuerza auto_renew=false si el servicio no es manejo_redes
   NOTA: La DB ya garantiza status='pending' por DEFAULT — no es necesario enviarlo explícitamente
8. INSERTAR en transactions: { user_id, subscription_id, amount: servicio.price, payment_method: 'pending', status: 'pending' }
   ⚠️ CRÍTICO: Este INSERT debe hacerse con el cliente de servicio (service role / admin client), NO con la sesión del usuario.
   La política RLS de transactions solo permite INSERT a admins. Usar createClient() normal fallará.
   Ejemplo: const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY)
9. Retornar { success: true, subscription_id }
```

**Criterios de aceptación:**
- [ ] Un cliente autenticado puede contratar cualquier servicio activo
- [ ] Se crea la suscripción con fechas correctas según la duración del servicio
- [ ] Se crea automáticamente una transacción pendiente con el monto del servicio
- [ ] Un cliente NO puede contratar un servicio desactivado
- [ ] Un usuario no autenticado recibe un error con redirect a login
- [ ] Servicios de tipo auditoria/capacitacion/otro SIEMPRE se crean con auto_renew = false
- [ ] Solo servicios de tipo manejo_redes pueden tener auto_renew = true

---

#### Tarea 5: Mantenimiento de Base de Datos (Continua)

**Sprint:** Continuo (5–12) · **Rama:** `feature/migraciones-refinamiento`

**Actividades:**
- Si algún integrante necesita un campo nuevo → crear migración SQL correspondiente
- Después de cada cambio en el esquema → regenerar tipos: `npx supabase gen types typescript --local > types/database.ts`
- Mantener `supabase/seed.sql` actualizado con datos que permitan probar todos los flujos
- Crear vistas SQL si Carlos las necesita para las métricas del dashboard

**Seed data final (Sprint 4):** Al menos 2 usuarios (1 admin, 1 client), los 10 servicios reales de RGL ESTUDIO (ver tabla abajo), 10+ reservas con diferentes estados, 5+ suscripciones (activas, expiradas, canceladas), 10+ transacciones con diferentes estados y métodos de pago.

**SERVICIOS REALES DE LA CLIENTE (usar estos precios exactos en seed.sql):**

| name | type | price | duration_months | Notas |
|---|---|---|---|---|
| Redes Sociales Inicial | manejo_redes | 299.99 | 1 | Suscripción mensual |
| Redes Sociales Work | manejo_redes | 319.99 | 1 | Suscripción mensual |
| Redes Sociales Premium | manejo_redes | 555.00 | 1 | Suscripción mensual |
| Auditoría de Marca | auditoria | 70.00 | 1 | Pago único |
| Curso x 3 Meses | capacitacion | 500.00 | 3 | Pago único |
| Sesión Fotográfica | otro | 130.00 | 1 | Pago único |
| Sesión Audiovisual (2 videos) | otro | 150.00 | 1 | Pago único |
| Sesión Audiovisual (6 videos) | otro | 230.00 | 1 | Pago único |
| Sesión Audiovisual (15 videos) | otro | 500.00 | 1 | Pago único |
| Modelo por 1 hora | otro | 25.00 | 1 | Pago único, costo variable $12.50 |

**REGLA DE NEGOCIO CRÍTICA:** Los servicios `manejo_redes` son suscripciones mensuales renovables. Los servicios `auditoria`, `capacitacion` y `otro` son pagos únicos — `auto_renew` debe ser `false` siempre para estos tipos.

---

### 3.3 Juan Pablo López Ramos — Frontend Lead + UX

**Responsabilidad general:** Todas las interfaces que ve el cliente final (parte pública del sistema), experiencia mobile-first, formularios y flujos de usuario.

---

#### Tarea 1: Navbar, Footer y Layout Público

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/navbar-footer-publico`
**Dependencias:** Ninguna
**Componentes ShadCN:** `npx shadcn@latest add sheet button`

**Archivos a crear/modificar:**
- `app/(public)/layout.tsx` — implementar layout completo
- `components/navbar.tsx` — componente de navegación
- `components/footer.tsx` — componente de pie de página

**Especificación de la Navbar:**
- Logo/nombre "RNG-Vantage" (link a `/`)
- Links: Servicios (`/catalogo`), Reservar (`/reservar`)
- Botón: "Iniciar Sesión" (`/login`) — o nombre del usuario + avatar si está autenticado
- **Mobile (< 768px):** Los links se colapsan en hamburger menu → panel lateral (usar ShadCN `Sheet`)
- La navbar es **sticky** (se queda fija arriba al hacer scroll)

**Especificación del Footer:**
- Links: Política de Privacidad (`/politica-privacidad`), Contacto
- Copyright del emprendimiento
- Diseño simple, una sola fila

**Criterios de aceptación:**
- [ ] La navbar es sticky y tiene transición suave al hacer scroll
- [ ] En mobile (< 768px) los links se colapsan en hamburger menu con panel lateral
- [ ] El botón de login cambia a mostrar el nombre del usuario cuando está autenticado
- [ ] El footer se ve bien en todas las resoluciones (320px hasta 1280px+)
- [ ] El layout envuelve correctamente todas las páginas del grupo `(public)`

---

#### Tarea 2: Landing Page

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/landing-page`
**Dependencias:** Tarea 1 (navbar/footer)
**Archivo a modificar:** `app/page.tsx`

**Secciones a implementar:**

| Sección | Contenido | Notas técnicas |
|---|---|---|
| **Hero** | Título principal con propuesta de valor, subtítulo, 2 botones CTA ("Ver Servicios" → `/catalogo` y "Reservar Capacitación" → `/reservar`), imagen/ilustración de fondo | Usar gradientes o imagen optimizada con `next/image` |
| **Servicios Destacados** | 3 cards con preview de servicios principales + botón "Ver todos" → `/catalogo` | **Server Component**: cargar los 3 primeros servicios activos desde Supabase |
| **Cómo Funciona** | 3 pasos ilustrados con iconos de Lucide: 1) Reserva → 2) Elige tu paquete → 3) Gestiona tus redes | Iconos: `Calendar`, `Package`, `TrendingUp` |
| **CTA Final** | Frase motivacional + botón grande "Empieza Ahora" → `/reservar` | Sección con fondo de color prominente |

**Criterios de aceptación:**
- [ ] Se ve profesional y alineada con marketing digital
- [ ] 100% responsive: 320px, 375px, 768px, 1280px+
- [ ] Los servicios destacados se cargan desde Supabase (Server Component)
- [ ] Las imágenes están optimizadas con `next/image`

---

#### Tarea 3: Formulario de Reserva

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/reservar-formulario`
**Dependencias:** Alejandro T1 (schema Zod) y Alejandro T2 (Server Action)
**Componentes ShadCN:** `npx shadcn@latest add form input textarea calendar popover checkbox toast`
**Archivo a modificar:** `app/(public)/reservar/page.tsx`

**Campos del formulario:**

| Campo | Componente ShadCN | Validación | Requerido |
|---|---|---|---|
| Nombre completo | `Input` | Min 2, max 100 caracteres | Sí |
| Email | `Input` (type="email") | Formato email válido | Sí |
| Teléfono | `Input` (type="tel") | Formato `09XXXXXXXX` | No |
| Fecha preferida | `Calendar` + `Popover` | Debe ser fecha futura | Sí |
| Notas | `Textarea` | Max 500 caracteres | No |
| Consentimiento LOPDP | `Checkbox` | Debe ser `true` | Sí |

**Criterios de aceptación:**
- [ ] El formulario funciona **sin estar autenticado**
- [ ] Validación client-side en tiempo real con React Hook Form + Zod
- [ ] El checkbox LOPDP muestra link a `/politica-privacidad`
- [ ] El date picker bloquea fechas pasadas
- [ ] Feedback visual claro (toast) de éxito y error
- [ ] Funciona correctamente en mobile

---

#### Tarea 4: Catálogo de Servicios — UI

**Sprint:** 2 (Semanas 7–8) · **Rama:** `feature/catalogo-servicios-ui`
**Dependencias:** Alejandro T3 (servicios CRUD)
**Componentes ShadCN:** `npx shadcn@latest add card badge tabs`
**Archivo a modificar:** `app/(public)/catalogo/page.tsx`

**Diseño:** Grid de cards (1 col mobile, 2 tablet, 3 desktop). Cada card: nombre, descripción, precio, duración, botón "Contratar" → `/checkout?service_id=xxx`. Filtro por tipo (Tabs). Server Component. Mensaje si no hay servicios.

---

#### Tarea 5: Flujo de Checkout — UI

**Sprint:** 2 (Semanas 7–8) · **Rama:** `feature/checkout-ui`
**Dependencias:** Alejandro T4 (Server Action de contratación), Carlos T1 (auth)
**Componentes ShadCN:** `npx shadcn@latest add card checkbox separator`
**Archivo a modificar:** `app/(public)/checkout/page.tsx`

**Flujo:** URL con `?service_id=xxx` → cargar servicio → mostrar resumen → checkbox auto_renew → confirmar → si no autenticado redirect a login → ejecutar Server Action → confirmación o error.

---

#### Tarea 6: Política de Privacidad (LOPDP)

**Sprint:** 3 (Semanas 9–10) · **Rama:** `feature/politica-privacidad`
**Archivo a modificar:** `app/(public)/politica-privacidad/page.tsx`

**Secciones:** Responsable del tratamiento, datos recopilados, finalidad, base legal, derechos del titular, tiempo de conservación, medidas de seguridad, contacto.

---

#### Tarea 7: Pulido Responsive y Pruebas de Interfaz

**Sprint:** 4 (Semanas 11–12) · **Rama:** `feature/pulido-responsive`

**Resoluciones a probar:** 320px, 375px, 768px, 1024px, 1280px+

**Checklist:**
- [ ] Ningún texto se corta o desborda
- [ ] Botones accesibles (mínimo 44x44px en mobile)
- [ ] Formularios usables en mobile
- [ ] Tablas admin se adaptan o transforman en cards
- [ ] Gráficos Recharts responsivos
- [ ] Tests E2E con perfil mobile-chrome de Playwright

---

### 3.4 Christian Alexis Hurtado Torres — Frontend + Dashboard UI

**Responsabilidad general:** Todas las interfaces del panel administrativo, gráficos con Recharts, tablas de datos, el sistema de diseño visual y las páginas de autenticación.

---

#### Tarea 1: Sistema de Diseño y Componentes Base

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/sistema-diseno-shadcn`
**Dependencias:** Ninguna (es lo primero del frontend)
**Bloquea a:** Todas las demás tareas de UI del equipo

**Archivos a modificar/crear:**

| Archivo | Qué hacer |
|---|---|
| `app/globals.css` | Ajustar variables CSS del tema (colores primarios, secundarios, destructive). Verificar dark mode |
| `lib/design-tokens.ts` | Actualizar `BRAND`, `CHART_COLORS` con los colores definitivos |
| `components/ui/` | Instalar componentes ShadCN (ver comando abajo) |
| `components/status-badge.tsx` | Badge con color semántico: pending=amarillo, active=verde, expired=rojo, completed=azul |
| `components/data-card.tsx` | Card de métrica para dashboard: props título, valor, ícono, tendencia |
| `components/data-table.tsx` | Wrapper de tabla con paginación básica y soporte para filtros |

**Componentes ShadCN a instalar:**
```bash
npx shadcn@latest add button input textarea form card table dialog sheet toast badge tabs separator popover calendar checkbox select dropdown-menu avatar
```

**Criterios de aceptación:**
- [ ] Paleta de colores profesional y coherente con marketing digital
- [ ] Dark mode funciona correctamente
- [ ] `StatusBadge` acepta prop `status` y renderiza con el color correcto
- [ ] `DataCard` acepta `title`, `value`, `icon`, `trend` como props tipados
- [ ] `DataTable` acepta data genérica y renderiza con paginación

---

#### Tarea 2: Páginas de Login y Register — UI

**Sprint:** 1 (Semanas 5–6) · **Rama:** `feature/auth-login-register-ui`
**Dependencias:** Carlos T1 (auth backend), Alejandro T1 (schema Zod auth)

**Archivos a modificar:** `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/(auth)/layout.tsx`

**Login:** Formulario email + contraseña. Botón con loading state. Link a `/register`. Validación con `loginSchema`. Redirect por rol.
**Register:** Formulario nombre + email + contraseña + confirmar contraseña. Checkbox LOPDP obligatorio. Link a `/login`. Validación con `registerSchema`.

**Criterios de aceptación:**
- [ ] Ambas páginas usan React Hook Form + Zod
- [ ] Errores de autenticación claros (toast o inline)
- [ ] Redirect post-login funciona según rol
- [ ] Diseño centrado, limpio, mobile-first

---

#### Tarea 3: Dashboard Financiero — UI

**Sprint:** 2 (estructura) + Sprint 3 (datos reales) · **Rama:** `feature/dashboard-graficos`
**Dependencias:** Carlos T4 (Edge Function de métricas)
**Archivo a modificar:** `app/(dashboard)/dashboard/page.tsx`

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ [DataCard]     [DataCard]      [DataCard]  [DataCard]│
│ Ingresos Mes   Suscripciones   Reservas    Trans.    │
├──────────────────────────┬───────────────────────────┤
│ [BarChart] Ingresos      │ [PieChart] Rentabilidad   │
│ últimos 6 meses          │ por tipo de servicio      │
├──────────────────────────┴───────────────────────────┤
│ [DataTable] Transacciones recientes (10 filas + pag) │
└──────────────────────────────────────────────────────┘
```

**Gráficos:** BarChart/AreaChart (ingresos mensuales) + PieChart (distribución por tipo). Colores de `CHART_COLORS`.

**Criterios de aceptación:**
- [ ] Las 4 DataCards muestran métricas reales
- [ ] Gráficos se renderizan con Recharts
- [ ] Tabla con últimas 10 transacciones y paginación
- [ ] Responsive: cards y gráficos se apilan en mobile

---

#### Tarea 4: Gestión de Reservas — UI Admin

**Sprint:** 2 (Semanas 7–8) · **Rama:** `feature/reservas-admin-ui`
**Dependencias:** Alejandro T2 (CRUD reservas backend)
**Archivo a modificar:** `app/(dashboard)/reservas/page.tsx`

**Funcionalidades:** DataTable con columnas (nombre, email, teléfono, fecha, estado, acciones). Filtro por estado (Tabs). Dropdown para cambiar estado. Dialog de detalle. StatusBadge. Toast de confirmación/error.

---

#### Tarea 5: Gestión de Servicios — UI Admin

**Sprint:** 3 (Semanas 9–10) · **Rama:** `feature/servicios-admin-ui`
**Dependencias:** Alejandro T3 (CRUD servicios backend)
**Archivo a modificar:** `app/(dashboard)/servicios/page.tsx`

**Funcionalidades:** DataTable (nombre, tipo, precio, duración, estado, acciones). Botón "Nuevo Servicio" → Dialog con formulario. Editar (dialog precargado). Toggle activo/inactivo. StatusBadge. Servicios inactivos con opacidad reducida.

---

#### Tarea 6: Registro de Transacciones — UI Admin

**Sprint:** 3 (Semanas 9–10) · **Rama:** `feature/transacciones-admin-ui`
**Dependencias:** Carlos T5 (lógica de transacciones)
**Archivo a modificar:** `app/(dashboard)/transacciones/page.tsx`

**Funcionalidades:** DataTable (fecha, cliente, monto, método, estado, acciones). Filtros combinables (estado + rango de fechas). Botón "Registrar Pago" → dialog con formulario. StatusBadge. Total filtrado visible.

---

#### Tarea 7: Supabase Realtime en Dashboard

**Sprint:** 4 (Semanas 11–12) · **Rama:** `feature/dashboard-realtime`
**Dependencias:** Tarea 3 (dashboard base)

**Archivos a crear/modificar:**
- `hooks/use-realtime-metrics.ts` — custom hook que escucha cambios
- `app/(dashboard)/dashboard/page.tsx` — integrar el hook

**Tablas a escuchar:** `reservations`, `transactions`, `subscriptions`

**Criterios de aceptación:**
- [ ] Reserva nueva → contador se actualiza sin recargar
- [ ] Pago registrado → ingresos se actualizan en tiempo real
- [ ] No hay memory leaks (listener se desuscribe al desmontar)

---

## 4. Sprints Detallados

### Sprint 1 — Semanas 5–6: Base Funcional

**Objetivo:** Sistema con autenticación funcional, formulario de reservas operativo e identidad visual definida.

| Desarrollador | Tareas | Ramas | Entregable |
|---|---|---|---|
| Carlos | Auth completo + roles + LOPDP | `feature/auth-registro-login` | Login/register funcional con redirect por rol |
| Alejandro | Schemas Zod + CRUD reservas + CRUD servicios | `feature/validators-zod-schemas`, `feature/reservas-backend-crud`, `feature/servicios-backend-crud` | Schemas validando + Server Actions operativos |
| Juan | Navbar/Footer + Landing + Formulario reserva | `feature/navbar-footer-publico`, `feature/landing-page`, `feature/reservar-formulario` | Navegación pública + landing profesional + formulario funcional |
| Christian | Design system + Auth UI | `feature/sistema-diseno-shadcn`, `feature/auth-login-register-ui` | Componentes base + login/register conectados |

**Demo Sprint 1:** Un visitante ve la landing, navega al catálogo, reserva una capacitación y se registra. Un admin inicia sesión y llega al dashboard (vacío por ahora).

---

### Sprint 2 — Semanas 7–8: Módulos Core

**Objetivo:** Flujo completo de contratación: catálogo → checkout → suscripción + pago. Dashboard con datos básicos.

| Desarrollador | Tareas | Ramas | Entregable |
|---|---|---|---|
| Carlos | Edge Function suscripciones + RLS refinamiento | `feature/edge-function-suscripciones`, `feature/rls-politicas-seguridad` | Motor de renovación + seguridad validada |
| Alejandro | Lógica contratación + transacciones | `feature/suscripciones-contratacion` | Flujo de compra completo en backend |
| Juan | Catálogo UI + Checkout UI | `feature/catalogo-servicios-ui`, `feature/checkout-ui` | Flujo de compra completo en frontend |
| Christian | Dashboard + Reservas admin | `feature/dashboard-graficos`, `feature/reservas-admin-ui` | Panel admin con métricas básicas |

**Demo Sprint 2:** Un cliente puede ver servicios, contratar un paquete y se genera su suscripción. El admin ve reservas y métricas básicas.

---

### Sprint 3 — Semanas 9–10: Integración

**Objetivo:** Métricas financieras reales, gestión completa de módulos, cumplimiento LOPDP.

| Desarrollador | Tareas | Ramas | Entregable |
|---|---|---|---|
| Carlos | Edge Function métricas + optimización SQL | `feature/edge-function-dashboard-metrics` | API de métricas financieras |
| Alejandro | Vistas SQL + Realtime + refinamiento BD | `feature/migraciones-refinamiento` | BD optimizada con datos realistas |
| Juan | Política privacidad + responsive | `feature/politica-privacidad` | LOPDP cumplida + UX mobile pulida |
| Christian | Servicios admin + Transacciones admin | `feature/servicios-admin-ui`, `feature/transacciones-admin-ui` | Panel admin completo |

**Demo Sprint 3:** Dashboard con métricas reales y gráficos. Admin gestiona todos los módulos. LOPDP publicada.

---

### Sprint 4 — Semanas 11–12: Cierre de Desarrollo

**Objetivo:** Pulir todo, documentar y preparar para QA.

| Desarrollador | Tareas | Ramas | Entregable |
|---|---|---|---|
| Carlos | Documentación técnica + code review | — | Docs de arquitectura, APIs, deploy |
| Alejandro | Seed data final + migraciones definitivas | `feature/migraciones-refinamiento` | BD lista para producción |
| Juan | Pulido responsive + pruebas interfaz | `feature/pulido-responsive` | UX mobile impecable |
| Christian | Realtime dashboard + pulido admin | `feature/dashboard-realtime` | Dashboard en tiempo real |

**Demo Sprint 4:** Sistema completo end-to-end, listo para QA.

---

## 5. Fase de QA — Semanas 13–14

| Tipo de Prueba | Responsable | Herramienta | Qué se prueba |
|---|---|---|---|
| Pruebas funcionales e integración | Alejandro | Vitest + tests manuales | Cada Server Action con datos válidos e inválidos |
| Flujos completos E2E | Juan | Playwright | Registro → login → reserva → contratación → dashboard |
| Cálculos financieros | Carlos | Queries SQL + comparación manual | Que las métricas del dashboard coincidan con los datos reales |
| Pruebas de error (edge cases) | Christian | Tests manuales + Vitest | Inputs inválidos, campos vacíos, doble submit |
| Seguridad (RLS, auth, inyección) | Carlos | Tests manuales + SQL directo | Intentar acceder a datos de otros usuarios |
| Auditoría de datos | Alejandro | SQL queries | Integridad referencial, datos huérfanos |
| Pruebas de carga | Carlos | k6 o similar | Múltiples usuarios concurrentes |
| Validación de roles | Christian | Playwright | Que admin y client vean solo lo que les corresponde |
| UX y mobile | Juan | Navegadores reales + Playwright mobile | Responsive en dispositivos reales |

---

## 6. Fase de Implantación — Semanas 15–16

| Actividad | Responsable | Detalle |
|---|---|---|
| Deploy frontend en Vercel | Carlos | Conectar repo GitHub, configurar variables de entorno de producción, verificar build |
| Configurar Supabase producción | Alejandro | Aplicar migraciones al proyecto de producción, configurar auth providers, seed data real |
| Configurar PWA | Juan | Verificar manifest.json, íconos en diferentes tamaños, instalabilidad en mobile |
| Migración de datos reales | Alejandro | Script SQL para importar clientes/datos existentes del emprendimiento |
| Configurar dominio | Carlos | DNS, SSL (incluido en Vercel/Supabase automáticamente) |
| Manuales de usuario | Juan + Christian | Guía para admin (cómo usar dashboard) + guía para cliente (cómo reservar y contratar) |
| Capacitación al cliente | Todo el equipo | Sesión presencial con la propietaria del emprendimiento mostrando el sistema |
| Cierre del proyecto | Carlos | Presentación final universitaria, entrega de documentación, acta de cierre |
