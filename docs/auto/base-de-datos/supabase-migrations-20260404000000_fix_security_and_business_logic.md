# RNG Vantage - Migración 20260404000000_fix_security_and_business_logic.sql

Documento técnico que describe el propósito, alcance y cambios introducidos por el archivo de migración SQL ubicado en `supabase/migrations/20260404000000_fix_security_and_business_logic.sql`. Este script agrupa correcciones de seguridad y lógica de negocio tras una auditoría de la base de datos.

## Descripción general

Este archivo de migración agrupa correcciones de seguridad y de la lógica de negocio para las tablas críticas de RNG Vantage (usuarios, perfiles, reservas, suscripciones, servicios y transacciones). Incluye:

- Ajuste del estatus por defecto de subscriptions a `pending` para evitar activación automática sin confirmación de pago.
- Reemplazo de políticas admin basadas en estructuras de tablas por políticas basadas en app_metadata (JWT de Supabase), evitando problemas de recursión y de mapeo incorrecto del role.
- Políticas de inserción para reservas que permiten creación por usuarios no autenticados siempre que acepten la data_consent.
- Contención de escalada de privilegios en profiles: restricciones para usuarios normales y políticas de actualización para admins.
- Sincronización del role de profile con el JWT vía un par de funciones y triggers (con seguridad definer y path de búsqueda explícito).
- Inicialización del role en JWT al crear un nuevo usuario (desde el registro).
- Regla de negocio para forzar auto_renew en servicios únicos, basada en el tipo de servicio.
- Asegurar updated_at con un trigger explícitamente configurado para search_path estable.
- Creación de índices de rendimiento para evitar full table scans en consultas comunes.
- Backfill para sincronizar el role existente en raw_app_meta_data de usuarios ya registrados.

Este conjunto de cambios está orientado a reforzar la seguridad (RLS y app_metadata), mejorar la coherencia entre JWT y datos de usuario, y optimizar el rendimiento.

## Responsabilidades

- Establecer un flujo correcto de estado para subscriptions (default a pending).
- Centralizar la autorización de administrador mediante app_metadata en lugar de consultas EXISTS sobre perfiles.
- Permitir creación de reservas por usuarios sin sesión con un requisito mínimo de consentimiento.
- Evitar escaladas de privilegios en profiles y proporcionar una vía para que los admins gestionen perfiles.
- Mantener la consistencia entre perfiles y los datos del usuario en auth.users (raw_app_meta_data).
- Mantener el valor de updated_at y forzar reglas de negocio para renovación de suscripciones.
- Optimizar el rendimiento mediante índices relevantes.
- Sincronizar datos históricos para roles existentes (backfill).

## Estructura y componentes clave

El archivo contiene los siguientes bloques principales:

- Modificación de columnas
  - Cambios de DEFAULT para subscriptions.status.
- Políticas de seguridad (RLS)
  - Reemplazo de políticas de admin para varios recursos usando app_metadata.
  - Política de inserción para reservations para usuarios anónimos con data_consent.
  - Políticas para profiles (inserción, actualización y admin actualización).
- Funciones y disparadores (Triggers)
  - sync_profile_role_to_auth(): sincroniza profile.role con raw_app_meta_data en auth.users.
  - handle_new_user(): inicializa perfil y role de nuevo usuario en JWT al registrarse.
  - enforce_auto_renew_rule(): fuerza auto_renew a false para ciertos tipos de servicio.
  - handle_updated_at(): actualiza updated_at de registros.
- Indices de rendimiento
  - Índices agregados para subscriptions, transactions, reservations y services.
- Backfill de datos
  - Sincronización de role en raw_app_meta_data para usuarios existentes.
  
Notas sobre dependencias y entorno:
- Este script asume que las tablas public (subscriptions, profiles, reservations, services, transactions) están bajo Row Level Security (RLS) y que las políticas definidas se aplican cuando corresponde.
- Se utiliza la estructura de autenticación de Supabase: auth.users y el objeto app_metadata dentro del JWT. El path para el role es app_metadata ->> 'role'.
- Las funciones con SECURITY DEFINED (security definer) requieren privilegios adecuados para modificar auth.users.

## Detalles por secciones del código

A continuación se resume cada cambio incluido en la migración.

### 1. CORRECCIÓN: DEFAULT de subscriptions.status
- Cambio:
  - alter table public.subscriptions alter column status set default 'pending';
- Propósito:
  - Evitar activar suscripciones automáticamente sin pago confirmado.
  - Flujo correcto esperado: checkout → 'pending' → administrador confirma → 'active'.
- Impacto:
  - Nuevas filas en subscriptions heredan status por defecto 'pending'.
  - No modifica estados existentes; solo establece el valor por defecto.

### 2. CORRECCIÓN: Políticas admin — reemplazar EXISTS(profiles) por app_metadata
- Cambios clave:
  - Reemplazo de políticas que dependían de EXISTS(SELECT FROM profiles WHERE role='admin') por políticas que verifican (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' para las entidades:
    - profiles
    - reservations
    - services
    - subscriptions
    - transactions
- Detalles relevantes:
  - Todas las políticas de visualización (SELECT) y/o modificación (INSERT/UPDATE/DELETE) ahora se basan en el role del JWT, mapeado por app_metadata.
  - Esto evita recursión y problemas de path del JWT en Supabase.
- Impacto:
  - Mayor seguridad y coherencia entre el JWT y los permisos de acceso.
  - Requiere que RLS esté habilitado y que app_metadata refleje correctamente el rol.

### 3. CORRECCIÓN: Política INSERT de reservations
- Cambio:
  - Eliminación de la política anterior "Authenticated users can create reservations".
  - Nueva política: "Anyone can create reservations" para insert en public.reservations with check (data_consent = true).
- Propósito:
  - Permitir que usuarios no autenticados puedan enviar reservas siempre que hayan dado su consentimiento explícito mediante data_consent.
- Impacto:
  - Se abre la capacidad de creación de reservas a usuarios no autenticados, con una validación explícita de consentimiento.

### 4. CORRECCIÓN: Políticas de profiles — prevenir escalada de privilegios
- Cambios:
  - Eliminación de la política "Users can insert their own profile" y creación de:
    - "Users can insert their own profile": insert to authenticated with check (auth.uid() = id and role = 'client').
    - "Users can update their own profile": update to authenticated with (auth.uid() = id) and with check (auth.uid() = id and role = 'client').
    - "Admins can update all profiles": update to authenticated con using (admin) en both using y with check.
- Propósito:
  - Impedir que usuarios normales elevan su rol (por ejemplo SET role='admin'), restringiendo operaciones para usuarios normales a role 'client' y proporcionando una vía para admins para actualizar perfiles.
- Impacto:
  - Mejor control de privilegios y mitigación de escalada de permisos a través de perfiles.

### 5. FUNCIÓN + TRIGGER: Sincronizar profiles.role → raw_app_meta_data
- Función:
  - public.sync_profile_role_to_auth(): returns trigger
  - Lógica: si old.role es distinto de new.role, actualizar auth.users estableciendo raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.role) donde id = new.id.
  - Declaración: language plpgsql security definer; set search_path = public, pg_temp.
- Trigger asociado:
  - trg_sync_profile_role: AFTER UPDATE OF role ON public.profiles; FOR EACH ROW; EXECUTE FUNCTION public.sync_profile_role_to_auth().
- Propósito:
  - Asegurar que cambios de rol en profiles se reflejen en el JWT en la próxima login, al propagarse a raw_app_meta_data.
- Impacto:
  - Consistencia entre el rol del usuario en profiles y el app_metadata usado en el JWT.

### 6. CORRECCIÓN: handle_new_user — inicializar role en JWT desde el registro
- Función:
  - public.handle_new_user(): returns trigger
  - Acciones:
    - Inserta en public.profiles (id, first_name, last_name, avatar_url) tomando datos desde new.raw_user_meta_data.
    - Actualiza auth.users para establecer raw_app_meta_data = raw_app_meta_data || '{"role": "client"}'::jsonb donde id = new.id.
  - Declaración: language plpgsql security definer; set search_path = public, pg_temp.
- Propósito:
  - Garantizar que los usuarios nuevos tengan un role inicial en el JWT desde el primer login, evitando que el JWT carezca de rol hasta que ocurra un UPDATE de perfil.
  - Menciona también la migración anterior: se actualizó de full_name a first_name + last_name.
- Impacto:
  - Mejora la coherencia inicial entre usuario y permisos.

### 7. FUNCIÓN + TRIGGER: Forzar auto_renew=false en servicios únicos
- Función:
  - public.enforce_auto_renew_rule(): returns trigger
  - Lógica:
    - Obtiene el tipo de servicio as=service_type para service_id en la fila nueva/actual.
    - Si service_type != 'manejo_redes', asigna new.auto_renew := false.
  - Declaración: language plpgsql security definer; set search_path = public, pg_temp.
- Trigger asociado:
  - trg_enforce_auto_renew: BEFORE INSERT OR UPDATE ON public.subscriptions; FOR EACH ROW; EXECUTE FUNCTION public.enforce_auto_renew_rule().
- Propósito:
  - Asegurar que los pagos únicos (auditoria, capacitación, etc.) no se renueven automáticamente, limitando el auto_renew solo al tipo de servicio permitido ('manejo_redes').
- Impacto:
  - Alinea la facturación y renovación con la lógica de negocio definida.

### 8. CORRECCIÓN: handle_updated_at — search_path explícito
- Cambio:
  - create or replace function public.handle_updated_at() RETURNS trigger
  - Lógica: new.updated_at = now();
  - Declaración: language plpgsql set search_path = public, pg_temp.
- Propósito:
  - Garantizar consistencia de search_path y evitar advertencias de seguridad de Supabase.
  - Nota: la función es SECURITY INVOKER por defecto.
- Impacto:
  - Evita problemas de configuración de search_path y mejora la seguridad/consistencia de auditoría.

### 9. ÍNDICES DE RENDIMIENTO
- Cambios:
  - Creación de índices si no existen:
    - idx_subscriptions_user_id (subscriptions(user_id))
    - idx_subscriptions_service_id (subscriptions(service_id))
    - idx_subscriptions_status (subscriptions(status))
    - idx_transactions_user_id (transactions(user_id))
    - idx_transactions_subscription_id (transactions(subscription_id))
    - idx_reservations_user_id (reservations(user_id))
    - idx_reservations_status (reservations(status))
    - idx_services_is_active (services(is_active))
    - idx_services_type (services(type))
- Propósito:
  - Reducir consultas costosas por full table scan y mejorar tiempos de respuesta en consultas comunes basadas en estas columnas.
- Impacto:
  - Mejor rendimiento de lectura y filtrado en las tablas críticas.

### 10. BACKFILL: Sincronizar role en raw_app_meta_data para usuarios existentes
- Cambio:
  - UPDATE auth.users u
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', p.role)
  - FROM public.profiles p
  - WHERE p.id = u.id AND (u.raw_app_meta_data ->> 'role') IS DISTINCT FROM p.role;
- Propósito:
  - Realinear el JWT de usuarios existentes con el rol almacenado en profiles, para asegurar consistencia entre usuarios antiguos y la nueva lógica de roles.
- Impacto:
  - Evita desincronizaciones entre el role almacenado en profiles y el JWT actual para usuarios ya registrados.

## Funciones y disparadores (parámetros y retorno)

A continuación se detallan las funciones creadas o modificadas que funcionan como parte de esta migración (con su firma y comportamiento principal).

- sync_profile_role_to_auth()
  - Firma: RETURNS trigger
  - Parámetros: ninguno (utiliza NEW/OLD)
  - Comportamiento: Si old.role != new.role, actualiza auth.users para reflejar el nuevo role en raw_app_meta_data.
  - Disparador: trg_sync_profile_role AFTER UPDATE OF role ON public.profiles FOR EACH ROW

- handle_new_user()
  - Firma: RETURNS trigger
  - Parámetros: ninguno (utiliza NEW)
  - Comportamiento: Inserta en public.profiles datos derivados de NEW.raw_user_meta_data y actualiza auth.users para establecer role='client' en raw_app_meta_data.
  - Disparador: típicamente en insert de auth.users (no mostrado explícitamente en el script, pero diseñado para disparar en la creación de un nuevo usuario)

- enforce_auto_renew_rule()
  - Firma: RETURNS trigger
  - Parámetros: ninguno (utiliza NEW)
  - Comportamiento: Verifica el type del servicio asociado y fuerza new.auto_renew a false si no es 'manejo_redes'.
  - Disparador: trg_enforce_auto_renew BEFORE INSERT OR UPDATE ON public.subscriptions FOR EACH ROW

- handle_updated_at()
  - Firma: RETURNS trigger
  - Parámetros: ninguno (utiliza NEW)
  - Comportamiento: Asigna new.updated_at = now()
  - Disparador: utilizado por triggers que requieren actualizaciones de timestamps (notas de uso en código)

Notas sobre dependencias de estas funciones:
- Seguridad: las funciones 5, 6 y 7 están definidas como SECURITY DEFINER, lo que les permite ejecutar con privilegios de propietario para modificar tablas fuera del alcance directo del rol de ejecución. Debe gestionarse el control de privilegios para evitar abuso.
- Path de búsqueda (search_path): se especifica en varias funciones para evitar vulnerabilidades de search_path injection y asegurar un contexto de ejecución estable.

## Dependencias y entorno

- Base de datos PostgreSQL (compatibilidad con las funciones y políticas de PostgreSQL soportadas por Supabase).
- Row Level Security (RLS) habilitada en las tablas relevantes (profiles, reservations, services, subscriptions, transactions).
- Supabase Auth: uso de auth.users y del campo raw_app_meta_data para reflejar el role en el JWT.
- Estructura de app_metadata en JWT de Supabase (app_metadata -> role).
- JSONB y operaciones de concatenación para actualizar raw_app_meta_data.

## Ejemplos de uso

- Crear una suscripción sin pago confirmado (para probar el flujo):
  - SQL (ejemplo de inserción; asume campos mínimos requeridos):
    - INSERT INTO public.subscriptions (user_id, service_id, ... /* otros campos requeridos */) VALUES ('user-uuid', 'service-uuid', ...);
  - Resultado esperado:
    - El campo status tendrá el valor por defecto 'pending' (no 'active') hasta que un administrador confirme el pago.

- Crear una reserva sin sesión (con consentimiento):
  - SQL (ejemplo de inserción):
    - INSERT INTO public.reservations (service_id, date, data_consent, /* otros campos */) VALUES ('service-uuid', '2026-07-01', true, ...);
  - Requiere data_consent = true para que la inserción sea permitida por la política.

- Verificación de políticas admin (en desarrollo):
  - Intentar un SELECT sobre public.profiles con un JWT cuyo app_metadata 'role' no es 'admin' debería estar restringido por RLS; un usuario con role 'admin' en el JWT debe poder ejecutar SELECTs permitidos por las políticas definidas.

- Verificación de sincronización de role en JWT al actualizar profiles:
  - Actualiza el campo role en profiles para un usuario admin y verifica que, tras el siguiente login, el JWT refleje el nuevo role a través de raw_app_meta_data.

- Backfill de roles existentes:
  - Si ya existen usuarios, el script actualiza auth.users para alinear raw_app_meta_data con el role correspondiente en profiles para cada usuario existente.

Notas de validación:
- Después de aplicar la migración, valida:
  - Nueva fila en subscriptions tiene status 'pending' por defecto.
  - Las políticas admin se aplican correctamente según app_metadata.
  - Reservations pueden crearse sin sesión siempre que data_consent sea true.
  - Roles en profiles y en raw_app_meta_data están sincronizados tras actualizaciones y/o nuevos usuarios.
  - Los triggers funcionan como se espera (sync_profile_role_to_auth, enforce_auto_renew_rule, handle_updated_at).
  - Los índices mejoran los tiempos de consulta para las tablas afectadas.

## Última actualización

29/5/2026

---

Si necesitas una versión más detallada de cada bloque de código (p. ej., el texto exacto de cada política o cada definición de función), puedo incluir extractos específicos o comentar sobre cada política/función de forma separada.