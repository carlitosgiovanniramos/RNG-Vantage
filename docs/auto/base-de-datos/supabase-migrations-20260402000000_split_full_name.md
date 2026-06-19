# 20260402000000_split_full_name.sql

Archivo de migración SQL ubicado en: supabase/migrations/20260402000000_split_full_name.sql  
Nombre: 20260402000000_split_full_name.sql  
Líneas: 64

Este archivo implementa una migración para descomponer el campo full_name en first_name y last_name en dos tablas clave (profiles y reservations), y define un trigger (handle_new_user) para sincronizar nuevos usuarios con la tabla profiles.

## Descripción general

La migración realiza estas acciones en secuencia:

1) En la tabla public.profiles:
- Añade dos columnas: first_name y last_name (ambas de tipo text).
- Migra los datos existentes desde full_name dividiéndolos en first_name y last_name.
- Elimina la columna full_name.

2) En la tabla public.reservations:
- Añade dos columnas: first_name y last_name (ambas de tipo text).
- Migra los datos existentes desde full_name de forma similar a profiles.
- Elimina la columna full_name.
- Marca las columnas first_name y last_name como NOT NULL.

3) Crear o reemplazar la función de trigger public.handle_new_user:
- Es una función PL/pgSQL que se ejecuta como trigger y, cuando se active, inserta un registro en public.profiles basándose en datos contenidos en new.raw_user_meta_data (first_name, last_name, avatar_url) y asocia la fila con new.id.
- Esta parte facilita la creación automática de perfiles cuando se crea un nuevo usuario.

La migración está diseñada para simplificar la gestión de nombres y centralizar la información de identidad en perfiles, manteniendo coherencia entre perfiles y reservas.

## Responsabilidades

- Actualizar el esquema de datos:
  - profiles: añadir first_name, last_name; eliminar full_name.
  - reservations: añadir first_name, last_name; eliminar full_name; asegurar NOT NULL en las nuevas columnas.
- Extraer y migrar datos existentes desde full_name hacia first_name y last_name.
- Proporcionar un mecanismo de sincronización automática de usuarios con perfiles mediante la función handle_new_user (trigger pattern).

## Props / Parámetros

Este archivo no es un componente, sino una migración SQL más una función de trigger. A continuación se detallan los elementos funcionales relevantes y sus parámetros:

- Tabla: public.profiles
  - Nuevas columnas añadidas:
    - first_name: text
    - last_name: text

- Tabla: public.reservations
  - Nuevas columnas añadidas:
    - first_name: text
    - last_name: text

- Migración de datos:
  - full_name (origen) -> first_name, last_name
  - Lógica de extracción:
    - first_name = split_part(full_name, ' ', 1)
    - last_name = proceso condicional:
      - si hay al menos un espacio en full_name, toma la parte después del primer espacio
      - de lo contrario, asigna ''
    - Se aplica solo si full_name no es null

- Función de trigger: public.handle_new_user()
  - Firma:
    - retorna trigger
  - Parámetros: no tiene parámetros explícitos (usa el registro NEW propio de triggers)
  - Campos utilizados desde NEW:
    - NEW.id: id del usuario (para usar como id en profiles)
    - NEW.raw_user_meta_data: jsonb
      - NEW.raw_user_meta_data->>'first_name'
      - NEW.raw_user_meta_data->>'last_name'
      - NEW.raw_user_meta_data->>'avatar_url'
  - Comportamiento: inserta en public.profiles un registro con:
    - id = NEW.id
    - first_name = NEW.raw_user_meta_data->>'first_name'
    - last_name = NEW.raw_user_meta_data->>'last_name'
    - avatar_url = NEW.raw_user_meta_data->>'avatar_url'
  - Retorna: NEW

Nota: La migración define la función y su código, pero no se incluye el bloque de creación del trigger que referiría a handle_new_user. Se asume que en otras partes de la base de datos existe el trigger adecuado que invoca esta función al crear un nuevo usuario.

## Retorna

- En la migración:
  - Cambios de esquema en profiles y reservations.
  - Actualización de datos existente y eliminación de full_name.
  - Añadidos índices o no; el script no define índices nuevos.
- En la función handle_new_user:
  - Returna NEW (el registro recién insertado) para que el flujo de triggers continúe.

Nota: No hay una exportación o valor de retorno para una función independiente aquí; es una función de trigger que devuelve un registro (RETURNS trigger).

## Dependencias

- PostgreSQL (al menos versión que soporte:
  - ALTER TABLE, ADD COLUMN, DROP COLUMN
  - UPDATE con expresiones SQL complejas
  - TRIGGER FUNCTION (RETURNS trigger) en PL/pgSQL
  -Uso de funciones de texto y jsonb:
  - split_part, position, substring, trim
  - NEW.raw_user_meta_data (jsonb) ->> operador para extraer texto
- Esquemas existentes:
  - public.profiles debe existir (con id y otros campos)
  - public.reservations debe existir (con full_name antes de migrar)
- Supabase/SaaS de migraciones: este archivo es parte de la carpeta de migraciones (supabase/migrations) y se espera que se aplique mediante el sistema de migraciones de Supabase.

Notas de implementación:
- La extracción de last_name asume que el nombre consta de al menos una palabra, con la posibilidad de no haber espacio (en cuyo caso last_name resulta en una cadena vacía).
- Después de mover full_name fuera de profiles y reservations, la columna full_name se elimina, por lo que cualquier lógica que dependa de full_name debe migrarse o ajustarse.
- En reservations, se establece NOT NULL para first_name y last_name luego de la migración. Si hay filas que no cumplen estas columnas tras la migración, la migración fallará; de lo contrario, las filas quedan con estos campos como NOT NULL.

## Ejemplos de uso

- Aplicar la migración:
  - En un entorno con psql o mediante el pipeline de migraciones de Supabase, este archivo se ejecuta como parte de la secuencia de migraciones para actualizar el esquema y los datos.
- Creación de nuevos usuarios (comportamiento esperado con trigger):
  - Al insertarse un nuevo registro en la tabla de usuarios (no incluido en este snippet), el trigger (asumiendo su existencia) llamaría a public.handle_new_user para crear un correspondiente perfil con first_name, last_name y avatar_url tomados desde new.raw_user_meta_data.

Ejemplo conceptual del flujo de datos para handle_new_user:
- Registro nuevo en la tabla de usuarios con:
  - id: 123
  - raw_user_meta_data: {"first_name": "Ana", "last_name": "Pérez", "avatar_url": "http://..."}
- El trigger ejecuta handle_new_user:
  - Inserta en public.profiles: (id=123, first_name='Ana', last_name='Pérez', avatar_url='http://...')
  - Retorna NEW para continuar el flujo del trigger original.

## Notas técnicas

- Complejidad de migración de datos:
  - La migración de full_name a first_name y last_name depende de la presencia de espacios en full_name.
  - Si full_name contiene más de un espacio, la lógica toma la primera palabra como first_name y la parte restante (después del primer espacio) como last_name (con trim).
  - Si full_name es una sola palabra, last_name quedaría como '', lo cual podría contravenir NOT NULL en reservations; este riesgo es parte del comportamiento descrito por la migración y debe ser considerado al planificar datos existentes.
- Rendimiento:
  - Las migraciones de datos en tablas grandes pueden ser costosas; la migración aplica UPDATEs por fila con operaciones de texto, que son razonables para cantidades moderadas de datos. En escenarios con tablas muy grandes, podría requerirse un enfoque por lotes.
- Seguridad y privilegios:
  - La función handle_new_user está definida como SECURITY DEFINER, lo que implica que se ejecuta con los privilegios del definidor, no del usuario que ejecuta el trigger. Esto puede tener implicaciones de permisos y seguridad si se modifica el contexto de ejecución.

## Última actualización

12/5/2026

Si necesitas que adapte la documentación a un público específico (por ejemplo, equipo de frontend, DevOps o DBA), o que añada ejemplos de scripts de rollback, puedo ampliarlo.