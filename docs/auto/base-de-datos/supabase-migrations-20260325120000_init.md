# Documentación técnica: Migración inicial de RNG Vantage
Ruta: supabase/migrations/20260325120000_init.sql

Este archivo define la migración inicial para el sistema RNG Vantage, estableciendo la estructura de la base de datos, las políticas de seguridad mediante Row Level Security (RLS), y los mecanismos de auditoría y sincronización de metadatos. Está orientado a Supabase (PostgreSQL) y asume la existencia del esquema auth propio de Supabase para usuarios.

---

## Descripción general
La migración crea las tablas principales del sistema y sus relaciones:

- profiles: extensión de auth.users para almacenar datos de perfil.
- services: catálogo de servicios/paquetes.
- reservations: reservas de capacitaciones.
- subscriptions: suscripciones activas a servicios.
- transactions: registro de ventas/pagos.

Además:
- habilita la extensión UUID (uuid-ossp) para generar identificadores únicos.
- activa Row Level Security (RLS) en las tablas y define políticas detalladas de acceso.
- define funciones y triggers para mantener datos consistentes (p. ej., updated_at) y para crear perfiles automáticamente al generar un usuario.
- utiliza referencias a auth.users del esquema público de Supabase.

---

## Responsabilidades
- Definir la estructura básica de la base de datos para perfiles, servicios, reservas, suscripciones y transacciones.
- Habilitar y aplicar RLS en todas las tablas relevantes.
- Proporcionar políticas de seguridad basadas en el rol del usuario (admin vs. cliente) y en la pertenencia a registros.
- Implementar mecanismos de auditoría y sincronización de metadatos mediante triggers y funciones:
  - crear perfil automáticamente al signup.
  - actualizar updated_at en modificaciones de registros.
- Definir dependencias necesarias (extensión uuid-ossp) para generación de UUIDs.

---

## Estructura de la base de datos (entidades principales)

Notas generales:
- Todas las tablas llevan created_at y updated_at (donde aplica) para trazabilidad.
- Se asume la existencia de auth.users en Supabase, con id como UUID.
- Las claves foráneas usan comportamientos de eliminación definidos por cada entidad (cascade, set null, restrict).

1) PROFILES (extiende auth.users)
- id: uuid, primary key, referencias auth.users on delete cascade, not null
- full_name: text
- avatar_url: text
- role: text, not null, default 'client', check (role in ('admin','client'))
- data_consent_at: timestamptz
- created_at: timestamptz, default now(), not null
- updated_at: timestamptz, default now(), not null
- Seguridad: RLS habilitado con políticas para ver/actualizar/insertar/crear perfiles (ver más abajo)
- Funciones/Triggers:
  - handle_new_user(): al crear un auth.user, inserta un registro en profiles con id, full_name y avatar_url extraídos de new.raw_user_meta_data.
  - handle_updated_at(): actualiza updated_at en cambios de perfiles.
  - Triggers: on_auth_user_created (después de insert en auth.users) y on_profiles_updated (antes de update en profiles).

2) SERVICES (catálogo de servicios/paquetes)
- id: uuid, primary key, default uuid_generate_v4()
- name: text, not null
- description: text
- type: text, not null, check (type in ('manejo_redes','auditoria','capacitacion','otro'))
- price: numeric(10,2), not null, check (price >= 0)
- duration_months: int, not null, default 1, check (duration_months > 0)
- is_active: boolean, not null, default true
- created_at: timestamptz, default now(), not null
- updated_at: timestamptz, default now(), not null
- Seguridad: RLS habilitado
- Políticas:
  - Anyone can view active services (is_active = true)
  - Admins can view all services
  - Admins can insert/update/delete (revisión de admin en people profile)
- Trigger: on_services_updated para actualizar updated_at.

3) RESERVATIONS (reservas de capacitaciones)
- id: uuid, primary key, default uuid_generate_v4()
- user_id: uuid, referencias auth.users on delete set null
- full_name: text, not null
- email: text, not null
- phone: text
- preferred_date: timestamptz, not null
- status: text, not null, default 'pending', check (status in ('pending','confirmed','cancelled','completed'))
- notes: text
- data_consent: boolean, not null, default false
- created_at: timestamptz, default now(), not null
- updated_at: timestamptz, default now(), not null
- Seguridad: RLS habilitado
- Políticas:
  - Users can view their own reservations (auth.uid() = user_id)
  - Admins can view all reservations
  - Authenticated users can insert (create) reservations (auth.uid() is not null)
  - Admins can update any reservation
- Trigger: on_reservations_updated para actualizar updated_at.

4) SUBSCRIPTIONS (suscripciones activas)
- id: uuid, primary key, default uuid_generate_v4()
- user_id: uuid, referencias auth.users on delete cascade not null
- service_id: uuid, referencias public.services on delete restrict not null
- starts_at: timestamptz, not null, default now()
- ends_at: timestamptz, not null
- status: text, not null, default 'active', check (status in ('active','expired','cancelled','pending'))
- auto_renew: boolean, not null, default false
- created_at: timestamptz, default now(), not null
- updated_at: timestamptz, default now(), not null
- Seguridad: RLS habilitado
- Políticas:
  - Users can view their own subscriptions
  - Admins can view all subscriptions
  - Authenticated users can create subscriptions (auth.uid() = user_id)
  - Admins can update subscriptions
- Trigger: on_subscriptions_updated para actualizar updated_at.

5) TRANSACTIONS (registro de ventas/pagos)
- id: uuid, primary key, default uuid_generate_v4()
- user_id: uuid, referencias auth.users on delete set null
- subscription_id: uuid, referencias public.subscriptions on delete set null
- amount: numeric(10,2), not null, check (amount >= 0)
- payment_method: text, not null, default 'pending', check (payment_method in ('cash','transfer','card','pending'))
- status: text, not null, default 'pending', check (status in ('pending','completed','failed','refunded'))
- notes: text
- created_at: timestamptz, default now(), not null
- updated_at: timestamptz, default now(), not null
- Seguridad: RLS habilitado
- Políticas:
  - Users can view their own transactions
  - Admins can view all transactions
  - Admins can insert/update transactions (operadas por admin)
- Trigger: on_transactions_updated para actualizar updated_at.

---

## Políticas de seguridad y RLS (Row Level Security)

- Todas las tablas relevantes (profiles, services, reservations, subscriptions, transactions) habilitan RLS.
- Las políticas permiten:
  - Lectura/visualización restringida a registros propios para usuarios comunes (por ejemplo, perfiles de usuario, reservas propias, transacciones propias, suscripciones propias).
  - Visualización general para admins (existencia de usuario con rol admin en profiles).
  - Inserciones y actualizaciones controladas para administradores en las tablas correspondientes.
  - Ciertas tablas permiten a usuarios autenticados crear registros (p. ej., reservas y suscripciones), siempre que exista un usuario autenticado.
- Las funciones utilizadas para seguridad y auditoría:
  - auth.uid(): para determinar la identidad del usuario autenticado.
  - handle_new_user(): crea automáticamente un registro en profiles al crear un usuario en auth.users.
  - handle_updated_at(): actualiza updated_at en cada modificación de filas.
- Notas: estas políticas dependen del esquema public y del tabla auth.users proporcionado por Supabase. En entornos fuera de Supabase, puede requerirse ajuste de schemas o de funciones de autenticación.

---

## Dependencias

- Extensión PostgreSQL: uuid-ossp (create extension if not exists "uuid-ossp";) para generar UUIDs con uuid_generate_v4().
- Esquema auth de Supabase: uso de auth.users como fuente de identidad (foreign keys y triggers).
- Funciones y triggers definidos en el mismo script:
  - public.handle_new_user()
  - public.handle_updated_at()
  - public.handle_updated_at() aplicado a varias tablas
- Row Level Security (RLS) habilitado en todas las tablas relevantes.

---

## Ejemplos de uso

- Ejecutar la migración (local o en un entorno de despliegue):
  - En un entorno típico con PostgreSQL (psql):
    - psql -h <host> -U <usuario> -d <base_de_datos> -f supabase/migrations/20260325120000_init.sql
  - En Supabase CLI / migraciones integradas:
    - La migración se aplica como parte del flujo de migrations al inicializar el proyecto o al aplicar cambios en la base de datos.
- Verificación rápida post-migración:
  - Verificar tablas creadas:
    - SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  - Verificar RLS y políticas:
    - SELECT * FROM pg_rls; (o consultar las políticas en las tablas con pg_policy)
  - Verificar triggers y funciones:
    - \d+ public.handle_new_user
    - \d+ public.handle_updated_at
  - Comprobar extensión UUID:
    - SELECT extname FROM pg_extension;

- Observaciones para mantenimiento:
  - Si se añade un nuevo tipo para Service (en services.type), debe actualizarse la restricción check correspondiente.
  - Cualquier cambio en las políticas de seguridad debe ser probado con diferentes perfiles de usuario (admin vs cliente) para evitar brechas.

---

## Notas técnicas

- Consistencia de timestamps: updated_at se mantiene actualizado mediante triggers before update en cada tabla, asegurando trazabilidad de modificaciones.
- Integración con auth.users: las referencias y permisos se basan en la identidad proporcionada por auth.uid() y en la existencia de usuarios en el esquema auth de Supabase.
- Seguridad por defecto: se adoptan políticas de mínimo privilegio, permitiendo a usuarios autenticados ver sus propios datos y administradores gestionar todos los registros.
- Eliminación de registros:
  - profiles.id está ligado a auth.users con on delete cascade (última instancia de usuario elimina su perfil).
  - transactions.user_id y subscriptions.user_id usan on delete set null / cascade, según el caso, para preservar histórico de transacciones aun si el usuario se elimina.
  - subscriptions.service_id usa on delete restrict para evitar que se elimine un servicio con suscripciones activas.
- Validaciones de negocio:
  - Estados y tipos limitados por check constraints para evitar valores no soportados.
  - Fechas y duraciones deben respetar rangos y lógicas de negocio (e.g., duration_months > 0, ends_at > starts_at implícitamente esperado por uso).

---

## Última actualización
29/5/2026

---

Si necesitas que la documentación se extienda con diagramas ER, ejemplos de consultas de uso común (SELECTs para obtener perfiles, reservas, etc.), o una guía de migraciones incremental para cambios futuros, dímelo y lo incorporo.