## Descripción general
Este archivo es una migración SQL para el proyecto RNG Vantage que modifica el esquema de la tabla colaboradores de Supabase (public.profiles). Su objetivo es permitir que un administrador pueda activar o desactivar clientes sin borrar su historial, añadiendo una columna de estado activo y un índice para optimizar consultas por rol y estado.

Contiene dos operaciones idempotentes:
- Añade la columna is_active de tipo boolean, con valor por defecto true y no acepta valores nulos.
- Crea el índice idx_profiles_role_is_active sobre las columnas (role, is_active).

Código relevante de la migración (resumen de las sentencias):
```
-- Permite al administrador activar o desactivar clientes sin eliminar su historial.
alter table public.profiles
  add column if not exists is_active boolean not null default true;

create index if not exists idx_profiles_role_is_active
  on public.profiles(role, is_active);
```

## Responsabilidades
- Extender el esquema de la tabla profiles para soportar un flag de actividad de los perfiles (is_active).
- Añadir un índice para acelerar consultas que filtren por role y por is_active.
- Garantizar idempotencia en la migración mediante IF NOT EXISTS, para evitar errores al volver a ejecutar la migración.

## Props / Parámetros
Este archivo no es un componente ni una función; es una migración SQL. No recibe parámetros ni devuelve valores. En consecuencia:
- No aplica sección de props/parametros.
- No devuelve valores; la ejecución de la migración modifica el esquema y no produce un retorno.

## Retorna
No retorna valores. Al ejecutar la migración, se aplican cambios al esquema de la base de datos:
- La tabla public.profiles pasa a tener la columna is_active (boolean, NOT NULL, DEFAULT TRUE).
- Se crea (si no existe) el índice idx_profiles_role_is_active sobre (role, is_active).

## Dependencias
- PostgreSQL (el motor de base de datos utilizado por Supabase).
- Tabla existente public.profiles.
- Permisos adecuados para ALTER TABLE y CREATE INDEX.
- Soporte de las sentencias IF NOT EXISTS para evitar errores en ejecuciones repetidas.

## Ejemplos de uso
- Despliegue de migraciones: este archivo se ejecuta como parte del proceso de migración de la base de datos en un despliegue de la aplicación RNG Vantage.
- Estado esperado tras la migración:
  - La tabla profiles tiene la columna is_active boolean NOT NULL DEFAULT TRUE.
  - Existe el índice idx_profiles_role_is_active en las columnas (role, is_active) para acelerar consultas que filtren por rol y por estado activo.
- Comportamiento práctico:
  - Anteriormente, la activación/desactivación de perfiles requería cambios en datos sin un flag explícito; con is_active, se puede deshabilitar cuentas sin perder historial.

Notas: debido a la presencia de NOT NULL y DEFAULT en una adición de columna, la migración podría implicar una rewrite de la tabla si hay filas existentes, lo que puede impactar temporalmente el rendimiento en tablas grandes. El índice se crea de forma condicional para evitar errores si ya existe.

## Notas técnicas
- Idempotencia: el uso de ADD COLUMN IF NOT EXISTS y CREATE INDEX IF NOT EXISTS garantiza que la migración no falle si se vuelve a ejecutar.
- Impacto en tablas grandes: añadir una columna NOT NULL con DEFAULT puede requerir reescritura de la tabla para rellenar valores por defecto en filas existentes; evaluar el tamaño de public.profiles en entornos de producción y planificar ventanas de mantenimiento si es necesario.
- Consistencia de datos: el valor por defecto de is_active es true, lo que implica que, a menos que se establezca explícitamente lo contrario, los perfiles existentes quedarán activos tras la migración.

## Última actualización
29/5/2026