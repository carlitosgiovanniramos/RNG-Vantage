# RNG Vantage - Migrations: 20260404000000_fix_security_and_business_logic.sql

Este documento describe en detalle la migración SQL 20260404000000_fix_security_and_business_logic.sql del proyecto RNG Vantage. La migración realiza correcciones de seguridad y mejoras en la lógica de negocio a nivel de base de datos (PostgreSQL) para asegurar coherencia entre perfiles de usuario, JWT/app_metadata, políticas de RLS, y reglas de negocio críticas (subscriptions, reservations, servicios, etc.). Aplica cambios que fueron revisados tras auditoría de la DB y están alineados con las prácticas de Supabase.

- Aplicado el 2026-04-04 vía Supabase MCP.
- Cubre cambios en: default de estado de subscriptions, políticas de admin y usuarios, creación de reservas y perfiles, sincronización entre profiles y auth, reglas de renovación, manejo de timestamps, índices y backfill de usuarios existentes.

---

## Descripción general

La migración agrupa 10 bloques distintos:

1) Corrección: establecer default de subscriptions.status a 'pending'
2) Corrección: políticas de admin usando app_metadata (en lugar de EXISTS(profiles))
3) Corrección: política de inserción de reservations
4) Corrección: políticas de profiles para evitar escalada de privilegios y complementar con políticas de admins
5) Función + Trigger: sincronizar profiles.role con auth.users.raw_app_meta_data para reflejar cambios de rol en el JWT
6) Función handle_new_user: inicializar perfiles y role de usuario en JWT desde el registro
7) Función + Trigger: forzar auto_renew=false en servicios únicos
8) Corrección: handle_updated_at con path explícito (search_path) para consistencia
9) Índices de rendimiento: creación de índices para mejorar rendimiento de consultas
10) Backfill: sincronización de role en raw_app_meta_data para usuarios existentes

Estas correcciones buscan garantizar que los tokens JWT usados por Supabase reflejen correctamente el rol del usuario, que las políticas de seguridad sean coherentes y que la lógica de negocio siga un flujo claro (por ejemplo, reserva debe conservar data_consent, y solo ciertos servicios pueden renovarse automáticamente).

---

## Responsabilidades

- Asegurar consistencia entre perfiles de usuario (public.profiles) y la metadata de autenticación (auth.users.raw_app_meta_data) utilizada en el JWT.
- Fortalecer las políticas de acceso (RLS) para evitar escaladas de privilegios.
- Aplicar reglas de negocio críticas en subscriptions, reservations y services.
- Proporcionar mecanismos de rendimiento (índices) para consultas frecuentes.
- Mantener la integridad de campos de auditoría (updated_at) y sincronización de roles desde el primer login.
- Realizar backfill para usuarios antiguos para alinearlos con el estado actual de la seguridad y lógicas de negocio.

---

## Estructura y detalles de cambios

A continuación se detalla cada bloque de la migración con su objetivo y efecto.

### 1) CORRECCIÓN: DEFAULT de subscriptions.status

- Cambio: alter table public.subscriptions alter column status set default 'pending';
- Propósito: evitar que una suscripción quede en estado 'active' sin haber confirmado pago. El flujo correcto es checkout → 'pending' → admin confirma → 'active'.

Impacto: garantiza consistencia de estado por defecto en nuevas suscripciones.

### 2) CORRECCIÓN: Políticas admin — reemplazar EXISTS(profiles) por app_metadata

- Contexto: las políticas de admin basadas en EXISTS(SELECT FROM profiles WHERE role='admin') podían generar recursión y usaban un path del JWT incorrecto. En Supabase, auth.jwt() ->> 'role' no corresponde al rol personalizado; el path correcto es app_metadata que mapea a raw_app_meta_data.
- Cambios principales:
  - Políticas para profiles, reservations, services, subscriptions y transactions que permiten acceso para usuarios con role 'admin' según auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'.
  - Se crean políticas de SELECT, UPDATE, INSERT y DELETE (según corresponda) para cada tabla afectada.
- Objetivo: asegurar que el control de acceso basado en rol admin funcione con el JWT correcto y evitar dependencias incorrectas de profiles para la verificación de admin.

Impacto: seguridad de acceso mejorada y coherente con la metadata de autenticación.

### 3) CORRECCIÓN: Política INSERT de reservations

- Problema previo: la política de inserción bloquearía a usuarios anónimos.
- Cambio: se crea una política "Anyone can create reservations" con INSERT permitido para PUBLIC y con la condición data_consent = true.
- Nota: el formulario /reservar es público y data_consent funciona como mínimo requisito para crear una reserva.
- Impacto: habilita la creación de reservas sin sesión, siempre que se haya dado consentimiento explícito.

### 4) CORRECCIÓN: Políticas de profiles — prevenir escalada de privilegios

- Problemas previos:
  - Un usuario podría intentar SET role='admin' en su propio perfil sin restricciones adecuadas.
  - Faltaba una política de UPDATE para admins.
- Cambios clave:
  - Insert: policy "Users can insert their own profile" en autenticado con check (auth.uid() = id and role = 'client').
  - Update: policy "Users can update their own profile" en autenticado con using (auth.uid() = id) y with check (auth.uid() = id and role = 'client').
  - Admin update: policy "Admins can update all profiles" con uso de rol admin obtenido de app_metadata.
- Objetivo: restringir la creación y actualización de perfiles solo a usuarios normales (client) y permitir que los admins actualicen perfiles cuando correspondan.

Impacto: evita que usuarios normales modifiquen roles y fortalece la separación de privilegios.

### 5) FUNCIÓN + TRIGGER: Sincronizar profiles.role → raw_app_meta_data

- Función: public.sync_profile_role_to_auth()
- Descripción: cuando cambia el rol en profiles, actualiza auth.users.raw_app_meta_data para incluir el par role: nuevo_rol. Esto permite que el JWT refleje el nuevo rol en el siguiente login.
- Detalles técnicos:
  - SECURITY DEFINER: para poder escribir en auth.users.
  - SET search_path: public, pg_temp para mitigar riesgos de injection y garantizar contexto.
  - Trigger: trg_sync_profile_role on update of role en public.profiles AFTER, por cada fila.
- Efecto: la metadata del JWT se mantiene consistente con el estado del perfil.

### 6) CORRECCIÓN: handle_new_user — inicializar role en JWT desde el registro

- Función: public.handle_new_user()
- Acciones:
  - Inserta en public.profiles (id, first_name, last_name, avatar_url) usando datos de new.raw_user_meta_data.
  - Actualiza auth.users para establecer raw_app_meta_data con role: 'client' (por defecto) para que el JWT tenga un rol coherente desde el primer login.
- Propósito: garantizar coherencia desde el primer registro, sin depender de una actualización de perfil para reflejar el rol.

### 7) FUNCIÓN + TRIGGER: Forzar auto_renew=false en servicios únicos

- Función: public.enforce_auto_renew_rule()
- Lógica: obtiene el tipo de servicio asociado (public.services where id = new.service_id). Si el tipo no es 'manejo_redes', establece new.auto_renew := false.
- Detalles:
  - Seguridad Definer para leer servicios sin restricciones de RLS (is_active).
  - SET search_path = public, pg_temp.
- Trigger: trg_enforce_auto_renew en before insert o update en public.subscriptions.
- Propósito: garantizar que la renovación automática solo esté habilitada para un servicio específico. Otros pagos deben ser únicos (no auto_renew).

### 8) CORRECCIÓN: handle_updated_at — search_path explícito

- Función: public.handle_updated_at()
- Propósito: configurar updated_at = now() en cada actualización.
- Detalles:
  - SECURITY INVOKER por defecto.
  - set search_path = public, pg_temp.
- Nota: se mantiene explícito el search_path para evitar warnings de seguridad y asegurar consistencia.

### 9) ÍNDICES DE RENDIMIENTO

- Creación de índices para mejorar rendimiento de consultas:
  - Subscriptions: user_id, service_id, status
  - Transactions: user_id, subscription_id
  - Reservations: user_id, status
  - Services: is_active, type
- Propósito: evitar full table scans en consultas comunes y mejorar rendimiento de filtrado y joins.

### 10) BACKFILL: Sincronizar role en raw_app_meta_data para usuarios existentes

- Acción: actualizar auth.users para alinear raw_app_meta_data con el rol de profiles existente donde sea distinto.
- Propósito: asegurar coherencia entre usuarios existentes y su JWT tras la migración.

---

## Parámetros y entrada de las funciones (descripción)

Existen tres funciones de triggers en esta migración. A continuación se describe, a alto nivel, la naturaleza de sus entradas y salidas.

- public.sync_profile_role_to_auth()
  - Tipo: función de trigger (no recibe parámetros explícitos; usa OLD y NEW).
  - Entrada: NEW y OLD en actualizaciones de public.profiles (cambio de role).
  - Salida: la fila NEW para continuar el flujo de la operación.
  - Propósito: actualizar auth.users.raw_app_meta_data cuando cambia el rol en profiles.

- public.handle_new_user()
  - Tipo: función de trigger (no recibe parámetros explícitos; usa NEW).
  - Entrada: NEW (registro de usuario recién creado).
  - Salida: la fila NEW para continuar.
  - Propósito: poblar profiles con datos iniciales y establecer role='client' en raw_app_meta_data para el JWT desde el primer login.

- public.enforce_auto_renew_rule()
  - Tipo: función de trigger (no recibe parámetros explícitos; usa NEW).
  - Entrada: NEW (registro de suscripción) en operaciones INSERT/UPDATE.
  - Salida: la fila NEW con potential modificación de auto_renew.
  - Propósito: garantizar que auto_renew solo pueda estar activo para determinados tipos de servicio.

- public.handle_updated_at()
  - Tipo: función de trigger (no recibe parámetros explícitos; usa NEW).
  - Entrada: NEW (registro actualizado).
  - Salida: la fila NEW con updated_at actualizado.
  - Propósito: asegurar que updated_at se mantenga actualizado en cada modificación.

Notas: todos estos son triggers/funciones de PostgreSQL, por lo que no exponen interfaces de software típicas como props. Su uso está acoplado a eventos de la base de datos (INSERT/UPDATE) sobre las tablas involucradas.

---

## Dependencias

- PostgreSQL (capas de esquema public y auth) con soporte de RLS (Row Level Security) y políticas basadas en roles.
- Supabase: implementación de JWT con app_metadata que mapea a raw_app_meta_data en auth.users.
- Extensiones y capacidades de jsonb, trig ers y funciones PL/pgSQL.
- Estructuras de tablas: public.subscriptions, public.profiles, public.reservations, public.services, public.transactions.
- Políticas de seguridad (RLS) ya definidas para estas tablas.
- Migración debe ejecutarse en un entorno con permisos suficientes para modificar estructuras, políticas, funciones y triggers.

---

## Ejemplos de uso

- Validar flujo de suscripción tras la migración:
  - Crear una suscripción sin pago confirmado y verificar que el status por defecto es 'pending' (no 'active').
- Verificar políticas admin:
  - Iniciar sesión con un usuario cuyo app_metadata.role es 'admin' y comprobar que puede leer/editar perfiles, reservas, servicios, transacciones y subscriptions.
  - Intentar un usuario con role 'client' y confirmar que no puede realizar operaciones reservadas para admin.
- Crear una reserva sin sesión (anónimo) pero con data_consent = true:
  - Confirmar que la reserva se crea correctamente.
- Probar manejo de perfil:
  - Actualizar el rol de un usuario a través de profiles y verificar que el JWT se actualiza en el siguiente login gracias a sync_profile_role_to_auth.
- Registro de nuevo usuario:
  - Crear un nuevo usuario y verificar que handle_new_user inserta un perfil y establece role='client' en raw_app_meta_data para el JWT.
- Renovación de servicios:
  - Insertar una suscripción asociada a un servicio cuyo type es 'manejo_redes' y otra con otro type; verificar que auto_renew se mantenga en true solo para manejo_redes.
- Backfill:
  - Verificar que la sincronización de role entre auth.users y profiles ya se haya aplicado para usuarios existentes.

---

## Notas técnicas

- Seguridad y design choices:
  - Uso de SECURITY DEFINER para funciones que modifican auth.users, asegurando que las operaciones de escritura se ejecuten con un privilegio suficiente, evitando restricciones de RLS para lectura/escritura.
  - Uso de set search_path = public, pg_temp en funciones para mitigar injection y asegurar un contexto estable.
- Consistencia entre JWT y datos de usuario:
  - La migración centra la fuente de verdad en app_metadata (mapeada a raw_app_meta_data) para roles en JWT, reduciendo inconsistencias entre profiles y tokens.
- Rendimiento:
  - Índices añadidos en campos frecuentemente filtrados/joins (user_id, service_id, status, etc.) para evitar full table scans en consultas comunes.
- Migración incremental:
  - Incluye backfill para usuarios existentes para alinear token metadata con la realidad de perfiles, evitando estados inconsistentes tras la migración.
- Limitaciones conocidas:
  - La migración depende de la infraestructura de Supabase (auth y app_metadata) y podría requerir reindexación o verificación de permisos en entornos muy restringidos.
  - Los cambios en políticas de admin deben ser compatibles con la configuración actual de RLS y pruebas de seguridad previas.

---

## Última actualización

12/5/2026

---

Este documento está diseñado para que un desarrollador nuevo entienda qué cambios proporciona la migración 20260404000000_fix_security_and_business_logic.sql, por qué se realizaron y cómo verificar su comportamiento en un entorno de desarrollo o staging. Si necesitas ejemplos de pruebas automatizadas o una checklist de validación adicional, puedo prepararla.