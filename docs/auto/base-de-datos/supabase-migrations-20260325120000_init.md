# Migración inicial RNG Vantage - 20260325120000_init.sql

Esta migración establece la base de datos para el sistema RNG Vantage, cubriendo perfiles de usuarios, servicios, reservas, suscripciones y transacciones. También configura políticas de seguridad a nivel de fila (Row Level Security, RLS), y disparadores (triggers) para mantener campos de auditoría como created_at y updated_at. Incluye mecanismos para crear perfiles automáticamente al registrarse un usuario y para actualizar la marca de tiempo de registro/desactualización.

## Descripción general
- Origen: migración inicial del proyecto RNG Vantage en Supabase.
- Propósito: crear las tablas principales (profiles, services, reservations, subscriptions, transactions), activar RLS y definir políticas de acceso, así como disparadores para sincronizar metadatos y crear perfiles de usuario automáticamente.
- Extensiones y dependencias: habilita la extensión UUID (uuid-ossp) y asume la presencia de auth.users en el esquema público; las tablas utilizan claves foráneas y múltiples políticas para garantizar seguridad y consistencia de datos.

## Responsabilidades
- Crear y estructurar las tablas centrales del dominio de ventas, reservas y finanzas.
- Habilitar Row Level Security (RLS) en todas las tablas relevantes y definir políticas claras de acceso para usuarios, administradores y terceros autorizados.
- Implementar disparadores y funciones para:
  - Crear automáticamente un perfil en perfiles cuando se crea un usuario en auth.users.
  - Mantener actualizado el campo updated_at en cambios de registros.
- Definir controles de integridad (check constraints) y valores por defecto razonables para campos como estado, tipo y fechas.
- Proporcionar una base sólida para futuras migraciones, con una separación clara entre perfiles, servicios, reservas, suscripciones y transacciones.

## Estructura de migración (Tablas y objetos)

A continuación se describe cada objeto principal creado en esta migración, con columnas, tipos y restricciones relevantes.

- Extensión y soporte
  - Extensión: uuid-ossp (create extension if not exists "uuid-ossp";) para generar UUIDs cuando no se especifican.
  - Tabla de referencia para usuarios: auth.users (utilizada por múltiples tablas mediante claves foráneas).

- 1. PROFILES (extiende auth.users)
  - Tabla: public.profiles
  - Columnas:
    - id: uuid, primary key, referencias auth.users on delete cascade, not null
    - full_name: text
    - avatar_url: text
    - role: text, not null, default 'client', check (role in ('admin','client'))
    - data_consent_at: timestamptz
    - created_at: timestamptz, default now(), not null
    - updated_at: timestamptz, default now(), not null
  - Seguridad: habilitada Row Level Security (alter table ... enable row level security;)
  - Políticas (SELECT/UPDATE/INSERT):
    - "Users can view their own profile": usar auth.uid() = id
    - "Admins can view all profiles": permitir si existe un perfil admin con id = auth.uid()
    - "Users can update their own profile": usar auth.uid() = id
    - "Users can insert their own profile": permitir inserción con auth.uid() = id
  - Disparador/Función:
    - handle_new_user(): al crear un usuario, inserta un perfil con id, full_name y avatar_url tomados de new.raw_user_meta_data
    - on_auth_user_created: dispara after insert on auth.users para ejecutar handle_new_user()
    - handle_updated_at(): actualiza updated_at = now(); disparador on_profiles_updated antes de UPDATE
  - Disparadores:
    - on_profiles_updated: before update on public.profiles

- 2. SERVICES (catálogo de servicios/paquetes)
  - Tabla: public.services
  - Columnas:
    - id: uuid, default uuid_generate_v4(), primary key
    - name: text, not null
    - description: text
    - type: text, not null, check (type in ('manejo_redes','auditoria','capacitacion','otro'))
    - price: numeric(10,2), not null, check (price >= 0)
    - duration_months: int, not null, default 1, check (duration_months > 0)
    - is_active: boolean, not null, default true
    - created_at: timestamptz, default now(), not null
    - updated_at: timestamptz, default now(), not null
  - Seguridad: habilitada Row Level Security
  - Políticas:
    - "Anyone can view active services": is_active = true
    - "Admins can view all services": admin check via profiles
    - "Admins can insert/update/delete services": admin check en cada operación
  - Disparador:
    - on_services_updated: before update on public.services para ejecutar handle_updated_at()
  - Notas: las políticas permiten visibilidad y control/edición sólo a admins. Entrada y actualización registran updated_at.

- 3. RESERVATIONS (reservas de capacitaciones)
  - Tabla: public.reservations
  - Columnas:
    - id: uuid, default uuid_generate_v4(), primary key
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
  - Seguridad: habilitada Row Level Security
  - Políticas:
    - "Users can view their own reservations": auth.uid() = user_id
    - "Admins can view all reservations": admin check via profiles
    - "Authenticated users can create reservations": insert permitido si auth.uid() no es null
    - "Admins can update reservations": admin check para update
  - Disparador:
    - on_reservations_updated: before update para actualizar updated_at
  - Notas: diseño orientado a usuario/cliente con capacidad de crear y a admin para gestión.

- 4. SUBSCRIPTIONS (suscripciones activas)
  - Tabla: public.subscriptions
  - Columnas:
    - id: uuid, default uuid_generate_v4(), primary key
    - user_id: uuid, referencias auth.users on delete cascade not null
    - service_id: uuid, referencias public.services on delete restrict not null
    - starts_at: timestamptz, not null, default now()
    - ends_at: timestamptz, not null
    - status: text, not null, default 'active', check (status in ('active','expired','cancelled','pending'))
    - auto_renew: boolean, not null, default false
    - created_at: timestamptz, default now(), not null
    - updated_at: timestamptz, default now(), not null
  - Seguridad: habilitada Row Level Security
  - Políticas:
    - "Users can view their own subscriptions": auth.uid() = user_id
    - "Admins can view all subscriptions": admin check
    - "Authenticated users can create subscriptions": insert permitido si auth.uid() = user_id
    - "Admins can update subscriptions": admin check
  - Disparador:
    - on_subscriptions_updated: before update para actualizar updated_at

- 5. TRANSACTIONS (registro de ventas/pagos)
  - Tabla: public.transactions
  - Columnas:
    - id: uuid, default uuid_generate_v4(), primary key
    - user_id: uuid, referencias auth.users on delete set null
    - subscription_id: uuid, referencias public.subscriptions on delete set null
    - amount: numeric(10,2), not null, check (amount >= 0)
    - payment_method: text, not null, default 'pending', check (payment_method in ('cash','transfer','card','pending'))
    - status: text, not null, default 'pending', check (status in ('pending','completed','failed','refunded'))
    - notes: text
    - created_at: timestamptz, default now(), not null
    - updated_at: timestamptz, default now(), not null
  - Seguridad: habilitada Row Level Security
  - Políticas:
    - "Users can view their own transactions": auth.uid() = user_id
    - "Admins can view all transactions": admin check
    - "Admins can insert transactions": admin check
    - "Admins can update transactions": admin check
  - Disparador:
    - on_transactions_updated: before update para actualizar updated_at

- Notas de seguridad y políticas de acceso
  - Cada tabla habilita RLS y define políticas específicas para:
    - Lectura: quién puede ver solo su propio registro o todos (según rol).
    - Inserción/Actualización/Eliminación: controlado principalmente por roles de administrador; algunas operaciones permiten inserciones por usuarios autenticados (por ejemplo, reservas y suscripciones por usuario).
  - Las políticas utilizan consultas basadas en auth.uid() y verificación de rol a través de la tabla public.profiles.

## Props / Parámetros
Este archivo es una migración SQL y no define componentes ni funciones con parámetros de entrada para ser consumidos por código. A continuación se describen, de forma estructurada, las principales entidades y sus campos para comprender cómo está compuesto el esquema:

- Tablas y columnas clave (resumen)
  - profiles(id, full_name, avatar_url, role, data_consent_at, created_at, updated_at)
  - services(id, name, description, type, price, duration_months, is_active, created_at, updated_at)
  - reservations(id, user_id, full_name, email, phone, preferred_date, status, notes, data_consent, created_at, updated_at)
  - subscriptions(id, user_id, service_id, starts_at, ends_at, status, auto_renew, created_at, updated_at)
  - transactions(id, user_id, subscription_id, amount, payment_method, status, notes, created_at, updated_at)

- Funciones y disparadores (sin parámetros visibles)
  - handle_new_user(): inserta un perfil al momento de crear un auth.user
  - handle_updated_at(): actualiza updated_at en cada update
  - Disparadores: on_auth_user_created, on_profiles_updated, on_services_updated, on_reservations_updated, on_subscriptions_updated, on_transactions_updated

- Dependencias y extensiones
  - Extensión uuid-ossp para generar UUIDs compatibles
  - auth.users como fuente de identidades y referencia para profiles, transactions, subscriptions (según corresponda)

## Dependencias
- Dependencias de base de datos:
  - PostgreSQL con extensión uuid-ossp
  - Esquemas: public (con auth.users de Supabase)
- Lógica de negocio y seguridad:
  - Row Level Security (RLS) activada en todas las tablas pertinentes
  - Políticas de acceso basadas en auth.uid() y roles almacenados en public.profiles
  - Funciones/Disparadores para sincronización de metadatos y creación de perfiles

## Ejemplos de uso
- Aplicar migration desde psql (ejemplo típico)
  - psql "postgres://usuario:contraseña@host:5432/base_de_datos" -f 20260325120000_init.sql
- Uso desde consola de Supabase (CLI/editor SQL)
  - Copiar y ejecutar el contenido del archivo en una ventana SQL de Supabase Studio o mediante CLI correspondiente a tu flujo de trabajo de migraciones.
- Nota sobre reversión
  - Este archivo no incluye una sección de "down" o migración de deshacer. Revertir cambios requeriría una migración adicional que elimine objetos en el orden inverso o restaure estados previos manualmente.

## Notas técnicas
- Consistencia y seguridad
  - Se utiliza RLS para encapsular el acceso a datos por usuario y rol, reduciendo exposición de datos sensibles.
  - Las políticas suelen usar patrones seguros como exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') para determinar privilegios de administrador.
- Integridad de datos
  - Check constraints en varios campos (p. ej., type en servicios, status en reservas, subscriptions, transactions) para garantizar que los valores sean válidos.
  - Valores por defecto útiles para created_at y updated_at, asegurando auditoría básica.
- Auditoría y trazabilidad
  - Disparadores para actualizar updated_at proporcionan una trazabilidad básica de cambios.
  - El disparador handle_new_user crea perfiles de usuario automáticamente, lo que facilita la onboarding sin intervención manual.
- Rendimiento y escalabilidad
  - Las políticas basadas en auth.uid() son comunes en arquitecturas con múltiples tablas vinculadas a usuarios; se debe considerar indexar columnas usadas en condiciones de filtrado frecuente (p. ej., user_id, id) para mejorar rendimiento de consultas con RLS.
- Limitaciones conocidas
  - No hay migración de tipo down en este archivo; para revertir cambios, se necesitaría crear migraciones complementarias.
  - Las restricciones de negocio están definidas a nivel de base de datos; cualquier validación adicional de negocio debe implementarse en la capa de servicio de la aplicación si fuese necesario.

## Última actualización
- Fecha: 12/5/2026

Si quieres que amplíe alguna sección (por ejemplo, una tabla con columnas de cada entidad en formato más detallado o ejemplos de consultas típicas que respeten las políticas de seguridad), dime y lo agrego.