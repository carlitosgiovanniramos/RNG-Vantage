# Plan de Desarrollo — RNG-Vantage

> Sistema integral de automatizacion de ventas, reservas y control financiero para un emprendimiento de marketing digital.

---

## 1. Informacion del Equipo

| Integrante | Rol Principal | Area | Par de Trabajo |
|---|---|---|---|
| **Carlos Giovanni Ramos Jacome** | Backend Lead + Gestion de Proyecto | Logica de negocio, APIs, seguridad, Edge Functions | Carlos + Alejandro |
| **Edison Alejandro Andrade Ocana** | Backend + Base de Datos | Esquema de datos, CRUD, endpoints, migraciones, validaciones | Carlos + Alejandro |
| **Juan Pablo Lopez Ramos** | Frontend Lead + UX | Interfaces publicas (cliente), formularios, experiencia mobile-first | Juan + Christian |
| **Christian Alexis Hurtado Torres** | Frontend + Dashboard UI | Interfaces de admin, graficos, tablas, sistema de diseno | Juan + Christian |

**Distribucion de carga:** Backend (Carlos + Alejandro) = 55% | Frontend (Juan + Christian) = 45%

**Metodologia:** Programacion en pares. Cada par trabaja en la misma area para garantizar transferencia de conocimiento y evitar cuellos de botella si un integrante no esta disponible.

---

## 2. Cronograma General

Basado en el cronograma academico de 16 semanas (Enero 2026 – Julio 2026):

| Fase | Semanas | Periodo | Descripcion |
|---|---|---|---|
| Inicio y Planificacion | 1-2 | Ene 2026 | Requisitos, historias de usuario, alcance, project charter |
| Analisis y Diseno | 3-4 | Feb 2026 | Arquitectura de datos, prototipos Mobile-First, diseno LOPDP |
| **Desarrollo Sprint 1** | **5-6** | **Feb-Mar 2026** | **Base funcional: auth, reservas, landing, sistema de diseno** |
| **Desarrollo Sprint 2** | **7-8** | **Mar 2026** | **Modulos core: suscripciones, catalogo, dashboard, checkout** |
| **Desarrollo Sprint 3** | **9-10** | **Abr 2026** | **Integracion: metricas, realtime, LOPDP, responsive** |
| **Desarrollo Sprint 4** | **11-12** | **Abr-May 2026** | **Cierre: documentacion, migraciones finales, pulido UX** |
| Pruebas y QA | 13-14 | May-Jun 2026 | Tests funcionales, E2E, seguridad, carga, validacion de roles |
| Implantacion y Cierre | 15-16 | Jun-Jul 2026 | Deploy produccion, migracion datos reales, capacitacion, manuales |

---

## 3. Roles y Tareas Detalladas

---

### 3.1 Carlos Giovanni Ramos Jacome

**Cargo:** Backend Lead + Gestion de Proyecto
**Responsabilidad:** Toda la logica de negocio del servidor, seguridad del sistema, Edge Functions de Supabase y coordinacion general del equipo.

---

#### Tarea 1: Sistema de Autenticacion y Seguridad

**Descripcion:** Implementar el flujo completo de autenticacion usando Supabase Auth, incluyendo registro, login, asignacion automatica de roles y cumplimiento LOPDP en el proceso de registro.

**Archivos a crear/modificar:**
- `app/(auth)/login/page.tsx` — conectar con la logica de signIn (coordinacion con Christian que hace la UI)
- `app/(auth)/register/page.tsx` — conectar con la logica de signUp
- `lib/supabase/server.ts` — agregar funciones helper de auth si se necesitan
- `supabase/migrations/` — agregar trigger para asignar rol por defecto al registrarse
- `middleware.ts` — refinar la proteccion de rutas por rol (ya tiene estructura base)

**Criterios de aceptacion:**
- Un usuario puede registrarse con email y contrasena
- Al registrarse se crea automaticamente su perfil con `role = 'client'`
- El primer usuario admin se configura manualmente desde SQL o desde un endpoint protegido
- El checkbox de consentimiento LOPDP es obligatorio y se guarda `data_consent_at` en el perfil
- Las rutas `/dashboard`, `/reservas`, `/servicios`, `/transacciones` solo son accesibles para usuarios con `role = 'admin'`
- Las rutas `/catalogo`, `/reservar`, `/checkout` son accesibles para cualquier usuario autenticado

**Rama:** `feature/auth-registro-login`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Ninguna (es la primera tarea)
**Bloquea a:** Christian (necesita auth funcional para conectar las paginas de login/register)

---

#### Tarea 2: Validacion y Refinamiento de Politicas RLS

**Descripcion:** Revisar y probar todas las politicas Row Level Security de cada tabla para garantizar que los clientes solo ven sus datos y los admins ven todo. Corregir posibles brechas.

**Archivos a modificar:**
- `supabase/migrations/00000000000000_init.sql` — corregir o agregar politicas si se encuentran problemas
- Crear nueva migracion si el esquema cambia: `supabase/migrations/00000000000001_rls_fix.sql`

**Criterios de aceptacion:**
- Un usuario con `role = 'client'` NO puede ver reservas, suscripciones ni transacciones de otros usuarios
- Un usuario con `role = 'client'` NO puede acceder a la tabla `profiles` de otros usuarios
- Un usuario con `role = 'admin'` puede ver TODOS los registros de todas las tablas
- Un usuario no autenticado NO puede leer ni escribir en ninguna tabla
- Tests manuales documentados con capturas de pantalla o queries SQL

**Rama:** `feature/rls-politicas-seguridad`
**Sprint:** 1-2 (Semanas 5-8, en paralelo con otras tareas)
**Dependencias:** Tarea 1 (auth debe funcionar para probar roles)

---

#### Tarea 3: Motor de Suscripciones — Edge Function

**Descripcion:** Desarrollar una Edge Function en Deno que se ejecute periodicamente para gestionar el ciclo de vida de las suscripciones: detectar vencimientos, renovar automaticamente o expirar.

**Archivos a crear:**
- `supabase/functions/subscription-renewal/index.ts` — logica principal
- `supabase/functions/subscription-renewal/deno.json` — config de Deno
- Actualizar `supabase/config.toml` — registrar la nueva funcion

**Logica detallada:**
```
1. Consultar suscripciones donde ends_at <= now() AND status = 'active'
2. Para cada suscripcion:
   a. Si auto_renew = true:
      - Calcular nueva ends_at sumando duration_months del servicio asociado
      - Actualizar starts_at = ends_at anterior, ends_at = nueva fecha
      - Crear una transaccion con status = 'pending' por el monto del servicio
   b. Si auto_renew = false:
      - Cambiar status a 'expired'
3. Retornar resumen: X renovadas, Y expiradas
```

**Criterios de aceptacion:**
- La funcion procesa correctamente suscripciones vencidas
- Las renovaciones crean una transaccion pendiente asociada
- Las suscripciones no renovables cambian a `expired`
- La funcion es idempotente (ejecutarla dos veces no duplica datos)
- Se puede invocar manualmente via `curl` para testing

**Rama:** `feature/edge-function-suscripciones`
**Sprint:** 2 (Semanas 7-8)
**Dependencias:** Tarea 1 (auth) + Alejandro debe tener la logica de contratacion lista

---

#### Tarea 4: API de Metricas del Dashboard — Edge Function

**Descripcion:** Desarrollar una Edge Function que calcule y retorne todas las metricas financieras que el dashboard necesita mostrar.

**Archivos a crear:**
- `supabase/functions/dashboard-metrics/index.ts`
- `supabase/functions/dashboard-metrics/deno.json`
- Opcionalmente: crear vistas SQL en una nueva migracion para optimizar consultas

**Metricas a calcular:**
| Metrica | Query |
|---|---|
| Ingresos del mes actual | SUM(amount) de transactions WHERE status='completed' AND created_at del mes actual |
| Ingresos por tipo de servicio | JOIN transactions → subscriptions → services, agrupado por service.type |
| Suscripciones activas | COUNT de subscriptions WHERE status='active' |
| Suscripciones por vencer (proximos 7 dias) | COUNT de subscriptions WHERE ends_at BETWEEN now() AND now()+7 days |
| Reservas pendientes | COUNT de reservations WHERE status='pending' |
| Transacciones del mes | Lista de transactions del mes actual con datos del usuario |
| Tasa de conversion | (COUNT subscriptions / COUNT reservations) * 100 |

**Criterios de aceptacion:**
- La funcion retorna un JSON con todas las metricas en una sola llamada
- Los calculos son correctos contra datos de prueba conocidos
- El tiempo de respuesta es menor a 500ms con datos de prueba
- Solo usuarios admin pueden invocar esta funcion (JWT verificado)

**Rama:** `feature/edge-function-dashboard-metrics`
**Sprint:** 3 (Semanas 9-10)
**Dependencias:** Alejandro debe tener datos en todas las tablas (transacciones, suscripciones, reservas)
**Bloquea a:** Christian (necesita esta API para alimentar los graficos del dashboard)

---

#### Tarea 5: Logica de Transacciones y Preparacion para Pasarela de Pago

**Descripcion:** Implementar la logica server-side para el registro de pagos, disenar el flujo de estados y preparar la estructura para integrar una pasarela de pago real en el futuro.

**Archivos a crear/modificar:**
- `app/api/transactions/route.ts` — Route Handler para registrar transacciones
- `lib/validators/transaction.ts` — schema Zod (coordinacion con Alejandro)
- `supabase/functions/payment-webhook/index.ts` — placeholder para webhook de pasarela futura

**Flujo de estados de una transaccion:**
```
pending → completed    (pago exitoso)
pending → failed       (pago rechazado)
completed → refunded   (devolucion, solo admin)
```

**Criterios de aceptacion:**
- Un admin puede registrar un pago manual desde la interfaz
- Al completar un pago, la suscripcion asociada se activa automaticamente
- El webhook placeholder esta documentado para integracion futura
- Las transacciones se validan con Zod antes de insertarse

**Rama:** `feature/transacciones-logica-pagos`
**Sprint:** 2 (Semanas 7-8)
**Dependencias:** Tarea 1 (auth)

---

#### Tarea 6: Gestion del Proyecto y Documentacion

**Descripcion:** Mantener la coordinacion del equipo, facilitar reuniones, hacer code review y elaborar la documentacion tecnica final.

**Actividades continuas (todas las semanas):**
- Configurar y mantener el tablero de tareas en GitHub Projects
- Facilitar reunion semanal de seguimiento (15-30 min) con el equipo
- Revisar y aprobar Pull Requests de todos los integrantes
- Resolver conflictos de merge en `develop`
- Garantizar que el build pase antes de cada merge

**Documentacion tecnica (Sprint 4, semanas 11-12):**
- Documentar la arquitectura del sistema
- Documentar las Edge Functions (parametros, respuestas, como probarlas)
- Documentar el esquema de base de datos final
- Crear guia de deploy a produccion

**No tiene rama especifica** — es trabajo continuo.

---

### 3.2 Edison Alejandro Andrade Ocana

**Cargo:** Backend + Base de Datos
**Responsabilidad:** Todo lo relacionado con el esquema de datos, operaciones CRUD, validaciones Zod, migraciones SQL y seed data.

---

#### Tarea 1: Schemas de Validacion Zod

**Descripcion:** Crear todos los esquemas de validacion reutilizables que seran usados tanto en el backend (Server Actions) como en el frontend (React Hook Form).

**Archivos a crear:**
- `lib/validators/auth.ts`
- `lib/validators/reservation.ts`
- `lib/validators/service.ts`
- `lib/validators/subscription.ts`
- `lib/validators/transaction.ts`
- `lib/validators/index.ts` — re-exportar todos los schemas

**Detalle de cada schema:**

```typescript
// auth.ts
loginSchema: { email (email valido), password (min 6 chars) }
registerSchema: { email, password, full_name (min 2 chars), data_consent (debe ser true) }

// reservation.ts
createReservationSchema: {
  full_name (min 2, max 100),
  email (email valido),
  phone (opcional, formato ecuatoriano 09XXXXXXXX),
  preferred_date (fecha futura),
  notes (opcional, max 500),
  data_consent (debe ser true)
}

// service.ts
createServiceSchema: {
  name (min 3, max 100),
  description (opcional, max 500),
  type (enum: manejo_redes | auditoria | capacitacion | otro),
  price (numero >= 0),
  duration_months (entero > 0),
  is_active (boolean, default true)
}

// subscription.ts
createSubscriptionSchema: {
  service_id (uuid),
  auto_renew (boolean, default false)
}

// transaction.ts
createTransactionSchema: {
  subscription_id (uuid, opcional),
  amount (numero > 0),
  payment_method (enum: cash | transfer | card),
  notes (opcional, max 500)
}
```

**Criterios de aceptacion:**
- Cada schema valida correctamente datos validos e invalidos
- Los mensajes de error estan en espanol
- Los schemas son importables desde `@/lib/validators`
- Unit tests para cada schema (al menos 3 tests por schema: valido, invalido, edge case)

**Rama:** `feature/validators-zod-schemas`
**Sprint:** 1 (Semanas 5-6) — es lo primero que debe estar listo porque todos dependen de esto
**Dependencias:** Ninguna
**Bloquea a:** Juan (formulario de reserva), Christian (formularios admin), Carlos (Server Actions)

---

#### Tarea 2: Modulo de Captacion y Reservas — Backend

**Descripcion:** Implementar toda la logica del servidor para el sistema de reservas de capacitaciones: creacion desde el formulario publico, cambio de estados por el admin y notificaciones en tiempo real.

**Archivos a crear:**
- `app/(public)/reservar/actions.ts` — Server Action para crear reserva
- `app/(dashboard)/reservas/actions.ts` — Server Actions para actualizar estado

**Logica de Server Action (crear reserva):**
```
1. Validar datos con reservationSchema
2. Obtener user_id si el usuario esta autenticado (opcional para reservas)
3. Insertar en tabla reservations con status = 'pending'
4. Retornar { success: true } o { error: 'mensaje' }
```

**Logica de Server Action (actualizar estado):**
```
1. Verificar que el usuario es admin
2. Validar que el nuevo estado es valido (pending → confirmed | cancelled, confirmed → completed | cancelled)
3. Actualizar el registro
```

**Criterios de aceptacion:**
- Un visitante puede crear una reserva desde `/reservar` sin estar autenticado
- Un visitante autenticado tiene su `user_id` asociado automaticamente
- El admin puede cambiar el estado de cualquier reserva desde `/reservas`
- No se puede saltar estados (por ejemplo, de pending a completed directamente)
- Los datos se validan con el schema Zod antes de tocar la base de datos

**Rama:** `feature/reservas-backend-crud`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Tarea 1 (schemas Zod)
**Bloquea a:** Juan (necesita el Server Action para conectar el formulario)

---

#### Tarea 3: Modulo de Servicios/Catalogo — Backend

**Descripcion:** Implementar el CRUD completo de servicios que el admin usara para gestionar el catalogo de paquetes.

**Archivos a crear:**
- `app/(dashboard)/servicios/actions.ts` — Server Actions CRUD

**Server Actions:**
| Accion | Descripcion |
|---|---|
| `createService(formData)` | Crea un nuevo servicio, validado con serviceSchema |
| `updateService(id, formData)` | Actualiza un servicio existente |
| `toggleServiceActive(id)` | Activa/desactiva un servicio (soft delete) |

**Criterios de aceptacion:**
- El admin puede crear servicios nuevos con todos los campos requeridos
- El admin puede editar servicios existentes
- El admin puede desactivar un servicio (no se elimina, solo `is_active = false`)
- Los servicios desactivados no aparecen en el catalogo publico pero si en la vista admin
- Validacion Zod en todos los inputs

**Rama:** `feature/servicios-backend-crud`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Tarea 1 (schemas Zod)
**Bloquea a:** Juan (catalogo UI) y Christian (servicios admin UI)

---

#### Tarea 4: Modulo de Suscripciones — Logica de Contratacion

**Descripcion:** Implementar la logica para que un cliente contrate un paquete/servicio, creando la suscripcion y la transaccion asociada.

**Archivos a crear:**
- `app/(public)/checkout/actions.ts` — Server Action para contratar
- `app/api/subscriptions/route.ts` — Route Handler alternativo si se necesita

**Logica de contratacion:**
```
1. Recibir service_id y auto_renew del formulario de checkout
2. Validar con subscriptionSchema
3. Obtener el servicio y verificar que is_active = true
4. Calcular ends_at = now() + duration_months del servicio
5. Insertar en subscriptions: { user_id, service_id, starts_at: now(), ends_at, status: 'active', auto_renew }
6. Insertar en transactions: { user_id, subscription_id, amount: service.price, payment_method: 'pending', status: 'pending' }
7. Retornar { success: true, subscription_id }
```

**Criterios de aceptacion:**
- Un cliente autenticado puede contratar cualquier servicio activo
- Se crea la suscripcion con fechas correctas segun la duracion del servicio
- Se crea automaticamente una transaccion pendiente asociada
- Un cliente no puede contratar un servicio desactivado
- Un usuario no autenticado es redirigido a login

**Rama:** `feature/suscripciones-contratacion`
**Sprint:** 2 (Semanas 7-8)
**Dependencias:** Tarea 1 (schemas), Tarea 3 (servicios deben existir), Carlos Tarea 1 (auth)
**Bloquea a:** Juan (checkout UI necesita esta accion), Carlos (Edge Function de renovacion)

---

#### Tarea 5: Mantenimiento de Base de Datos

**Descripcion:** Mantener el esquema de datos actualizado, crear nuevas migraciones cuando sea necesario, y mantener seed data realista para testing.

**Actividades continuas:**
- Si algun integrante necesita un campo nuevo en alguna tabla, crear la migracion correspondiente
- Despues de cada cambio en el esquema, ejecutar:
  ```bash
  npx supabase gen types typescript --local > types/database.ts
  ```
- Mantener `supabase/seed.sql` con datos que permitan probar todos los flujos
- Crear vistas SQL si Carlos las necesita para las metricas del dashboard

**Seed data final (Sprint 4):**
- Al menos 2 usuarios de prueba (1 admin, 1 client)
- Los 6 servicios actuales mas cualquiera que se agregue
- Al menos 10 reservas con diferentes estados
- Al menos 5 suscripciones (activas, expiradas, canceladas)
- Al menos 10 transacciones con diferentes estados y metodos de pago

**Rama:** `feature/migraciones-refinamiento`
**Sprint:** Continuo (Semanas 5-12)

---

### 3.3 Juan Pablo Lopez Ramos

**Cargo:** Frontend Lead + UX
**Responsabilidad:** Todas las interfaces que ve el cliente final (parte publica del sistema), experiencia mobile-first, formularios y flujos de usuario.

---

#### Tarea 1: Navbar, Footer y Layout Publico

**Descripcion:** Implementar la estructura visual que envuelve todas las paginas publicas: barra de navegacion superior y pie de pagina.

**Archivos a modificar/crear:**
- `app/(public)/layout.tsx` — ya existe con placeholder, implementar layout completo
- `components/navbar.tsx` — componente de navegacion
- `components/footer.tsx` — componente de pie de pagina

**Especificacion de la Navbar:**
- Logo o nombre "RNG-Vantage" (link a `/`)
- Links: Servicios (`/catalogo`), Reservar (`/reservar`)
- Boton: "Iniciar Sesion" (`/login`) o nombre del usuario si esta autenticado
- **Mobile:** hamburger menu que despliega los links en un panel lateral (usar ShadCN Sheet)

**Especificacion del Footer:**
- Links: Politica de Privacidad (`/politica-privacidad`), Contacto
- Copyright del emprendimiento
- Diseno simple, una sola fila

**Criterios de aceptacion:**
- La navbar es sticky (se queda fija arriba al hacer scroll)
- En mobile (< 768px) los links se colapsan en un hamburger menu
- El boton de login cambia a mostrar el nombre del usuario cuando esta autenticado
- El footer se ve bien en todas las resoluciones

**Rama:** `feature/navbar-footer-publico`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Ninguna
**Componentes ShadCN necesarios:** `npx shadcn@latest add sheet button`

---

#### Tarea 2: Landing Page

**Descripcion:** Disenar e implementar la pagina principal del emprendimiento, que es lo primero que ve cualquier visitante.

**Archivo a modificar:**
- `app/page.tsx` — ya existe con placeholder, implementar diseno completo

**Secciones de la landing:**

| Seccion | Contenido |
|---|---|
| **Hero** | Titulo principal, subtitulo con propuesta de valor, 2 botones CTA ("Ver Servicios" y "Reservar Capacitacion"), imagen o ilustracion de fondo |
| **Servicios Destacados** | Preview de 3 servicios principales con cards (traer de Supabase), boton "Ver todos" → `/catalogo` |
| **Como Funciona** | 3 pasos ilustrados: 1) Reserva tu capacitacion gratuita → 2) Elige tu paquete → 3) Gestiona tus redes. Iconos de Lucide React |
| **CTA Final** | Frase motivacional + boton grande "Empieza Ahora" → `/reservar` |

**Criterios de aceptacion:**
- La pagina se ve profesional y alineada con un emprendimiento de marketing digital
- Es 100% responsive: se ve bien en mobile (320px), tablet (768px) y desktop (1280px)
- Los servicios destacados se cargan desde Supabase (Server Component)
- Las imagenes/ilustraciones estan optimizadas con `next/image`
- Carga inicial rapida (no bloquea render con queries pesadas)

**Rama:** `feature/landing-page`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Tarea 1 (navbar/footer para que la pagina tenga estructura)

---

#### Tarea 3: Formulario de Reserva

**Descripcion:** Implementar el formulario completo de reserva de capacitaciones en `/reservar`, que es el punto principal de captacion de prospectos.

**Archivos a modificar/crear:**
- `app/(public)/reservar/page.tsx` — ya existe con placeholder, implementar formulario completo
- Usar schema de `lib/validators/reservation.ts` (creado por Alejandro)
- Conectar con Server Action de `app/(public)/reservar/actions.ts` (creado por Alejandro)

**Campos del formulario:**

| Campo | Tipo | Validacion | Requerido |
|---|---|---|---|
| Nombre completo | text | Min 2, max 100 caracteres | Si |
| Email | email | Formato email valido | Si |
| Telefono | tel | Formato 09XXXXXXXX | No |
| Fecha preferida | date picker | Debe ser fecha futura | Si |
| Notas | textarea | Max 500 caracteres | No |
| Consentimiento LOPDP | checkbox | Debe ser true | Si |

**Flujo de usuario:**
```
1. Usuario llena el formulario
2. Validacion en tiempo real (mensajes de error debajo de cada campo)
3. Click en "Enviar Reserva"
4. Loading state en el boton
5. Si exito: mostrar toast de confirmacion + limpiar formulario
6. Si error: mostrar toast de error con mensaje descriptivo
```

**Criterios de aceptacion:**
- El formulario funciona sin estar autenticado (captacion de prospectos)
- Validacion client-side en tiempo real con React Hook Form + Zod
- El checkbox de LOPDP muestra un link a `/politica-privacidad`
- El date picker no permite seleccionar fechas pasadas
- Feedback visual claro de exito y error
- Funciona correctamente en mobile

**Rama:** `feature/reservar-formulario`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Alejandro Tarea 1 (schema Zod) y Tarea 2 (Server Action)
**Componentes ShadCN necesarios:** `npx shadcn@latest add form input textarea calendar popover checkbox toast`

---

#### Tarea 4: Catalogo de Servicios — UI

**Descripcion:** Implementar la pagina del catalogo donde los clientes ven todos los servicios/paquetes disponibles y pueden iniciar la contratacion.

**Archivo a modificar:**
- `app/(public)/catalogo/page.tsx` — ya existe con placeholder, implementar completo

**Diseno:**
- Grid de cards (1 columna en mobile, 2 en tablet, 3 en desktop)
- Cada card muestra: nombre, descripcion corta, precio, duracion, boton "Contratar"
- Filtro por tipo de servicio (tabs o botones: Todos, Manejo de Redes, Auditoria, Capacitacion)
- Los servicios se cargan desde Supabase (solo `is_active = true`)

**Criterios de aceptacion:**
- Los servicios se cargan desde la base de datos (Server Component)
- El filtro por tipo funciona correctamente
- El boton "Contratar" redirige a `/checkout?service_id=xxx`
- Las cards se ven bien en todas las resoluciones
- Si no hay servicios, mostrar un mensaje apropiado

**Rama:** `feature/catalogo-servicios-ui`
**Sprint:** 2 (Semanas 7-8)
**Dependencias:** Alejandro Tarea 3 (servicios CRUD, para que haya datos)
**Componentes ShadCN necesarios:** `npx shadcn@latest add card badge tabs`

---

#### Tarea 5: Flujo de Checkout — UI

**Descripcion:** Implementar la pagina de checkout donde el cliente confirma la contratacion de un servicio.

**Archivo a modificar:**
- `app/(public)/checkout/page.tsx` — ya existe con placeholder, implementar completo

**Flujo:**
```
1. URL: /checkout?service_id=xxx
2. Cargar datos del servicio desde Supabase
3. Mostrar resumen: nombre del servicio, descripcion, precio, duracion
4. Si auto_renew: mostrar checkbox "Renovar automaticamente al vencer"
5. Boton "Confirmar Contratacion"
6. Si no esta autenticado → redirigir a /login?redirect=/checkout?service_id=xxx
7. Si esta autenticado → ejecutar Server Action de contratacion (de Alejandro)
8. Exito: mostrar confirmacion con numero de suscripcion
9. Error: mostrar mensaje de error
```

**Criterios de aceptacion:**
- Si no hay `service_id` en la URL, redirigir a `/catalogo`
- Si el servicio no existe o esta desactivado, mostrar error
- El usuario debe estar autenticado para completar la compra
- Despues de la compra exitosa, mostrar resumen claro

**Rama:** `feature/checkout-ui`
**Sprint:** 2 (Semanas 7-8)
**Dependencias:** Alejandro Tarea 4 (Server Action de contratacion), Carlos Tarea 1 (auth)
**Componentes ShadCN necesarios:** `npx shadcn@latest add card checkbox separator`

---

#### Tarea 6: Politica de Privacidad

**Descripcion:** Implementar la pagina de politica de privacidad y tratamiento de datos personales conforme a la LOPDP de Ecuador.

**Archivo a modificar:**
- `app/(public)/politica-privacidad/page.tsx` — ya existe con placeholder

**Secciones del contenido:**
1. Responsable del tratamiento de datos (nombre del emprendimiento)
2. Datos que se recopilan (nombre, email, telefono, datos de pago)
3. Finalidad del tratamiento (gestion de reservas, suscripciones, comunicacion)
4. Base legal (consentimiento explicito del usuario)
5. Derechos del titular (acceso, rectificacion, eliminacion)
6. Tiempo de conservacion
7. Medidas de seguridad (cifrado, RLS, SSL)
8. Contacto para ejercer derechos

**Rama:** `feature/politica-privacidad`
**Sprint:** 3 (Semanas 9-10)

---

#### Tarea 7: Pulido Responsive y Pruebas de Interfaz

**Descripcion:** Revisar todas las paginas publicas en diferentes resoluciones y corregir problemas de responsive.

**Actividades:**
- Probar en: 320px (mobile pequeno), 375px (iPhone), 768px (tablet), 1024px (laptop), 1280px+ (desktop)
- Corregir overflow, textos cortados, botones inaccesibles
- Verificar que los formularios son usables en mobile (campos no se tapan con el teclado)
- Ejecutar tests E2E con el perfil mobile-chrome de Playwright

**Rama:** `feature/pulido-responsive`
**Sprint:** 4 (Semanas 11-12)

---

### 3.4 Christian Alexis Hurtado Torres

**Cargo:** Frontend + Dashboard UI
**Responsabilidad:** Todas las interfaces del panel administrativo, graficos con Recharts, tablas de datos y el sistema de diseno visual.

---

#### Tarea 1: Sistema de Diseno y Componentes Base

**Descripcion:** Definir la identidad visual del proyecto y preparar todos los componentes ShadCN que el equipo necesitara.

**Archivos a modificar/crear:**
- `app/globals.css` — ajustar la paleta de colores al branding del emprendimiento
- `lib/design-tokens.ts` — actualizar con los colores y valores definitivos
- `components/ui/` — instalar componentes ShadCN necesarios

**Componentes a instalar:**
```bash
npx shadcn@latest add button input textarea form card table dialog sheet toast badge tabs separator popover calendar checkbox select dropdown-menu avatar
```

**Componentes custom a crear (si se necesitan):**
- `components/status-badge.tsx` — badge que muestra el estado con color (pending=amarillo, active=verde, expired=rojo, etc.)
- `components/data-card.tsx` — card de metrica para el dashboard (titulo, valor, icono, tendencia)
- `components/data-table.tsx` — wrapper de table con paginacion y filtros basicos

**Criterios de aceptacion:**
- La paleta de colores es coherente con un emprendimiento de marketing digital
- Los componentes custom son reutilizables y aceptan props tipados
- El dark mode funciona correctamente (los tokens CSS estan definidos para ambos temas)

**Rama:** `feature/sistema-diseno-shadcn`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Ninguna (es lo primero del frontend)
**Bloquea a:** Todas las demas tareas de UI

---

#### Tarea 2: Paginas de Login y Register — UI

**Descripcion:** Implementar las interfaces de autenticacion y conectarlas con la logica de Supabase Auth que Carlos desarrolla.

**Archivos a modificar:**
- `app/(auth)/login/page.tsx` — ya existe con placeholder
- `app/(auth)/register/page.tsx` — ya existe con placeholder
- `app/(auth)/layout.tsx` — ya existe, ajustar si es necesario

**Pagina de Login:**
- Formulario: email + contrasena
- Boton "Iniciar Sesion"
- Link "No tienes cuenta? Registrate" → `/register`
- Validacion con schema `auth.ts` de Alejandro
- Despues del login: redirigir segun rol (admin → `/dashboard`, client → `/catalogo`)

**Pagina de Register:**
- Formulario: nombre completo + email + contrasena + confirmar contrasena
- Checkbox de consentimiento LOPDP (obligatorio)
- Boton "Crear Cuenta"
- Link "Ya tienes cuenta? Inicia Sesion" → `/login`

**Criterios de aceptacion:**
- Ambas paginas usan React Hook Form + Zod
- Errores de autenticacion se muestran de forma clara (email ya registrado, contrasena incorrecta, etc.)
- El redirect post-login funciona correctamente segun el rol
- Diseno centrado, limpio, mobile-first

**Rama:** `feature/auth-login-register-ui`
**Sprint:** 1 (Semanas 5-6)
**Dependencias:** Carlos Tarea 1 (auth backend), Alejandro Tarea 1 (schema Zod auth)

---

#### Tarea 3: Dashboard Financiero — UI

**Descripcion:** Implementar la pagina principal del panel administrativo con metricas visuales, graficos y tabla de transacciones recientes.

**Archivo a modificar:**
- `app/(dashboard)/dashboard/page.tsx` — ya existe con placeholder

**Layout del dashboard:**

```
┌─────────────────────────────────────────────────┐
│  [Card]         [Card]         [Card]    [Card] │
│  Ingresos Mes   Suscripciones  Reservas  Trans. │
│  $2,450.00      12 activas     5 pend.   28     │
├─────────────────────────┬───────────────────────┤
│                         │                       │
│  [BarChart]             │  [PieChart]           │
│  Ingresos ultimos       │  Rentabilidad por     │
│  6 meses                │  tipo de servicio     │
│                         │                       │
├─────────────────────────┴───────────────────────┤
│  [Table] Transacciones recientes                │
│  Fecha | Cliente | Servicio | Monto | Estado    │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

**Graficos con Recharts:**
- BarChart o AreaChart para ingresos mensuales (ultimos 6 meses)
- PieChart para distribucion de ingresos por tipo de servicio
- Usar colores de `lib/design-tokens.ts` (`CHART_COLORS`)

**Datos:** Consumir desde la Edge Function `dashboard-metrics` de Carlos (TanStack Query)

**Criterios de aceptacion:**
- Las 4 cards muestran datos reales de Supabase
- Los graficos se renderizan correctamente con Recharts
- La tabla muestra las ultimas 10 transacciones con paginacion
- El dashboard se actualiza en tiempo real via Supabase Realtime (al menos las cards)
- Es responsive: en mobile las cards se apilan verticalmente y los graficos ocupan todo el ancho

**Rama:** `feature/dashboard-graficos`
**Sprint:** 2 (Semanas 7-8) para estructura + Sprint 3 (Semanas 9-10) para datos reales
**Dependencias:** Carlos Tarea 4 (Edge Function de metricas)
**Componentes ShadCN necesarios:** `npx shadcn@latest add card table`

---

#### Tarea 4: Gestion de Reservas — UI Admin

**Descripcion:** Implementar la vista donde el admin gestiona todas las reservas de capacitaciones.

**Archivo a modificar:**
- `app/(dashboard)/reservas/page.tsx` — ya existe con placeholder

**Funcionalidades:**
- Tabla con columnas: nombre, email, telefono, fecha, estado, acciones
- Filtro por estado (tabs: Todas, Pendientes, Confirmadas, Completadas, Canceladas)
- Boton de accion por fila: cambiar estado (dropdown con opciones validas segun estado actual)
- Dialog de detalle: al hacer click en una fila se abre un modal con toda la info de la reserva

**Criterios de aceptacion:**
- La tabla carga todas las reservas desde Supabase
- Los filtros funcionan correctamente
- El cambio de estado llama al Server Action de Alejandro
- Se muestra un toast de confirmacion/error despues de cada accion
- Nueva reserva aparece en tiempo real (Supabase Realtime)

**Rama:** `feature/reservas-admin-ui`
**Sprint:** 2 (Semanas 7-8)
**Dependencias:** Alejandro Tarea 2 (CRUD reservas backend)

---

#### Tarea 5: Gestion de Servicios — UI Admin

**Descripcion:** Implementar la vista donde el admin gestiona el catalogo de servicios.

**Archivo a modificar:**
- `app/(dashboard)/servicios/page.tsx` — ya existe con placeholder

**Funcionalidades:**
- Tabla con columnas: nombre, tipo, precio, duracion, estado (activo/inactivo), acciones
- Boton "Nuevo Servicio" que abre un dialog con formulario
- Accion por fila: editar (abre dialog con datos precargados) y activar/desactivar (toggle)
- StatusBadge para mostrar activo (verde) / inactivo (gris)

**Criterios de aceptacion:**
- El admin puede crear, editar y desactivar servicios sin salir de la pagina
- Los formularios usan React Hook Form + Zod (schema de Alejandro)
- El toggle activo/inactivo es inmediato con feedback visual
- Los servicios desactivados se muestran con opacidad reducida

**Rama:** `feature/servicios-admin-ui`
**Sprint:** 3 (Semanas 9-10)
**Dependencias:** Alejandro Tarea 3 (CRUD servicios backend)

---

#### Tarea 6: Registro de Transacciones — UI Admin

**Descripcion:** Implementar la vista donde el admin ve y registra pagos/transacciones.

**Archivo a modificar:**
- `app/(dashboard)/transacciones/page.tsx` — ya existe con placeholder

**Funcionalidades:**
- Tabla con columnas: fecha, cliente, monto, metodo de pago, estado, acciones
- Filtros: por estado (pending, completed, failed, refunded) y por rango de fechas
- Boton "Registrar Pago" que abre dialog con formulario (para pagos en efectivo o transferencia manual)
- StatusBadge por estado con colores apropiados

**Criterios de aceptacion:**
- La tabla carga transacciones con paginacion
- Los filtros combinan correctamente (estado + fechas)
- El formulario de registro manual valida con Zod
- Se muestra el total filtrado en la parte superior

**Rama:** `feature/transacciones-admin-ui`
**Sprint:** 3 (Semanas 9-10)
**Dependencias:** Carlos Tarea 5 (logica de transacciones)

---

#### Tarea 7: Supabase Realtime en Dashboard

**Descripcion:** Implementar actualizaciones en tiempo real en el dashboard para que las metricas se actualicen sin recargar la pagina.

**Archivos a crear/modificar:**
- `hooks/use-realtime-metrics.ts` — custom hook que escucha cambios en tablas relevantes
- `app/(dashboard)/dashboard/page.tsx` — integrar el hook

**Tablas a escuchar:**
- `reservations` — para actualizar el contador de reservas pendientes
- `transactions` — para actualizar ingresos y transacciones recientes
- `subscriptions` — para actualizar suscripciones activas

**Criterios de aceptacion:**
- Cuando se crea una nueva reserva, el contador se actualiza en el dashboard sin recargar
- Cuando se registra un pago, los ingresos del mes se actualizan
- No hay memory leaks (el listener se desuscribe correctamente al desmontar)

**Rama:** `feature/dashboard-realtime`
**Sprint:** 4 (Semanas 11-12)
**Dependencias:** Tarea 3 (dashboard base)

---

## 4. Sprints Detallados

### Sprint 1 — Semanas 5-6: Base Funcional

**Objetivo:** Que el sistema tenga autenticacion funcional, el formulario de reservas operativo y la identidad visual definida.

| Desarrollador | Tarea | Rama | Entregable |
|---|---|---|---|
| Carlos | Auth completo + roles + LOPDP | `feature/auth-registro-login` | Login/register funcional con roles |
| Alejandro | Schemas Zod + CRUD reservas + CRUD servicios | `feature/validators-zod-schemas`, `feature/reservas-backend-crud`, `feature/servicios-backend-crud` | Schemas + Server Actions listos |
| Juan | Navbar/Footer + Landing page + Formulario reserva | `feature/navbar-footer-publico`, `feature/landing-page`, `feature/reservar-formulario` | Paginas publicas operativas |
| Christian | Sistema de diseno + Auth UI | `feature/sistema-diseno-shadcn`, `feature/auth-login-register-ui` | Componentes base + login/register UI |

**Demo de Sprint 1:** Un visitante puede ver la landing, navegar al catalogo, reservar una capacitacion y registrarse. Un admin puede iniciar sesion y ver el dashboard (vacio por ahora).

---

### Sprint 2 — Semanas 7-8: Modulos Core

**Objetivo:** Que el flujo completo de contratacion funcione: catalogo → checkout → suscripcion + pago. Dashboard con datos basicos.

| Desarrollador | Tarea | Rama | Entregable |
|---|---|---|---|
| Carlos | Edge Function suscripciones + RLS refinamiento | `feature/edge-function-suscripciones`, `feature/rls-politicas-seguridad` | Motor de renovacion + seguridad validada |
| Alejandro | Logica contratacion + transacciones | `feature/suscripciones-contratacion` | Flujo compra completo en backend |
| Juan | Catalogo UI + Checkout UI | `feature/catalogo-servicios-ui`, `feature/checkout-ui` | Flujo compra completo en frontend |
| Christian | Dashboard (estructura + graficos) + Reservas admin | `feature/dashboard-graficos`, `feature/reservas-admin-ui` | Panel admin con datos basicos |

**Demo de Sprint 2:** Un cliente puede ver servicios, contratar un paquete y se genera su suscripcion. El admin ve reservas y metricas basicas en el dashboard.

---

### Sprint 3 — Semanas 9-10: Integracion

**Objetivo:** Metricas financieras reales en el dashboard, gestion completa de servicios y transacciones, cumplimiento LOPDP.

| Desarrollador | Tarea | Rama | Entregable |
|---|---|---|---|
| Carlos | Edge Function metricas + optimizacion SQL | `feature/edge-function-dashboard-metrics` | API de metricas financieras |
| Alejandro | Vistas SQL + Realtime + refinamiento BD | `feature/migraciones-refinamiento` | BD optimizada con datos realistas |
| Juan | Politica privacidad + responsive | `feature/politica-privacidad` | LOPDP cumplida + UX mobile pulida |
| Christian | Servicios admin + Transacciones admin | `feature/servicios-admin-ui`, `feature/transacciones-admin-ui` | Panel admin completo |

**Demo de Sprint 3:** Dashboard con metricas reales y graficos. Admin puede gestionar servicios, reservas y transacciones. Politica de privacidad publicada.

---

### Sprint 4 — Semanas 11-12: Cierre de Desarrollo

**Objetivo:** Pulir todo, documentar, preparar para la fase de QA.

| Desarrollador | Tarea | Rama | Entregable |
|---|---|---|---|
| Carlos | Documentacion tecnica + code review | — | Docs de arquitectura, APIs, deploy |
| Alejandro | Seed data final + migraciones definitivas | `feature/migraciones-refinamiento` | BD lista para produccion |
| Juan | Pulido responsive + pruebas interfaz | `feature/pulido-responsive` | UX mobile impecable |
| Christian | Realtime dashboard + pulido admin | `feature/dashboard-realtime` | Dashboard en tiempo real |

**Demo de Sprint 4:** Sistema completo funcionando end-to-end, listo para la fase de QA.

---

## 5. Fase de QA — Semanas 13-14

**Todos los integrantes participan en testing:**

| Tipo de Prueba | Responsable Principal | Herramienta |
|---|---|---|
| Pruebas funcionales y de integracion | Alejandro | Vitest + tests manuales |
| Pruebas de flujo completo (E2E) | Juan | Playwright |
| Validacion de calculos financieros | Carlos | Queries SQL + comparacion manual |
| Pruebas de error (inputs invalidos, edge cases) | Christian | Tests manuales + Vitest |
| Pruebas de seguridad (RLS, auth, inyeccion) | Carlos | Tests manuales + SQL |
| Auditoria de datos (integridad, consistencia) | Alejandro | SQL queries |
| Pruebas de carga | Carlos | Herramienta a definir (k6 o similar) |
| Validacion de roles (admin vs client) | Christian | Playwright + tests manuales |
| Pruebas de interfaz y UX (mobile) | Juan | Navegadores reales + Playwright mobile |

---

## 6. Fase de Implantacion — Semanas 15-16

| Actividad | Responsable | Detalle |
|---|---|---|
| Deploy frontend en Vercel | Carlos | Conectar repo GitHub, configurar env vars de produccion |
| Configurar Supabase produccion | Alejandro | Aplicar migraciones, seed data real, configurar auth providers |
| Configurar PWA | Juan | Verificar manifest, iconos, instalabilidad en mobile |
| Migracion de datos reales | Alejandro | Script para importar clientes/datos existentes del emprendimiento |
| Configurar dominio | Carlos | DNS, SSL (incluido en Vercel/Supabase) |
| Manuales de usuario | Juan + Christian | Guia para el admin (dashboard) y guia para el cliente (reservas, catalogo) |
| Capacitacion al cliente | Todo el equipo | Sesion presencial con la propietaria del emprendimiento |
| Cierre del proyecto | Carlos | Presentacion final, entrega de documentacion, acta de cierre |
