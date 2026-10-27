# 20260402000000_split_full_name.sql

Archivo: supabase/migrations/20260402000000_split_full_name.sql

Tipo: Migración SQL

Propósito: Separar el campo full_name en first_name y last_name en las tablas Profiles y Reservations, y definir una función de trigger para sincronizar nuevos usuarios en Profiles.

---

## Descripción general

Esta migración realiza tres bloques principales:

1) PROFILES
- Añade las columnas first_name y last_name a la tabla public.profiles.
- Migra los datos existentes de full_name dividiéndolos en first_name (la primera palabra) y last_name (el resto tras la primera palabra, con trimming).
- Elimina la columna full_name de public.profiles.

2) RESERVATIONS
- Añade las columnas first_name y last_name a la tabla public.reservations.
- Migra los datos existentes de full_name de la misma lógica que en Profiles.
- Elimina la columna full_name de public.reservations.
- Establece las columnas first_name y last_name como NOT NULL.

3) TRIGGER handle_new_user
- Crea o reemplaza la función pública public.handle_new_user() que devuelve un trigger.
- Al activarse, inserta un registro en public.profiles con id, first_name, last_name y avatar_url extraídos de new.raw_user_meta_data (campos first_name, last_name y avatar_url).

Notas importantes:
- La migración define la función handle_new_user, pero no adjunta un trigger explícito en este archivo. Se espera que haya un trigger existente (o definido en otra migración) que invoque esta función al insertar un nuevo usuario.
- El procesamiento de strings maneja casos simples: primero se toma la primera palabra como first_name y lo que sigue (si hay espacio) como last_name; si no hay espacio, last_name queda como cadena vacía. Si full_name es NULL, no se migra ese registro.

---

## Responsabilidades

- Modificar el esquema de datos:
  - Añadir columnas: public.profiles(first_name text, last_name text) y public.reservations(first_name text, last_name text).
- Migración de datos existente:
  - Para cada fila con full_name no null:
    - first_name = primera palabra de full_name (split_part(full_name, ' ', 1)).
    - last_name = resto tras la primera palabra, con trim para eliminar espacios exteriores.
  - Eliminar full_name de ambas tablas.
- Consistencia de datos:
  - En reservations, asegurar que first_name y last_name sean NOT NULL tras la migración.
- Extensión de lógica de negocio:
  - Definir la función handle_new_user para sincronizar nuevos usuarios en profiles usando metadata de usuario (raw_user_meta_data).

---

## Párrafos / Parámetros

Este archivo no es una función React ni una función de código con parámetros; es una migración SQL. Por lo tanto:
- Parámetros: No aplica.
- Retorno: No aplica (la migración modifica esquema y datos; no devuelve valores).

---

## Retorna

La migración no retorna valores. Efectúa cambios en el esquema (agregar/eliminar columnas) y en los datos (migración de full_name a first_name/last_name) y define una función de trigger.

---

## Dependencias

- PostgreSQL (funcionalidades nativas utilizadas: split_part, position, substring, trim, y operadores JSON/JSONB).
- Esquemas y tablas implicados:
  - public.profiles con columnas previas: id, full_name, avatar_url, entre otras.
  - public.reservations con columnas previas: id, full_name, entre otras.
- raw_user_meta_data en la tabla de usuarios (o la entidad que dispara el trigger) con claves:
  - first_name, last_name, avatar_url (accedidas con ->>'clave').
- La migración define la función public.handle_new_user, pero el trigger que invoca la función debe existir o definirse por separado.

---

## Ejemplos de uso

- Aplicación manual mediante psql (para entornos de desarrollo o pruebas):
 1) Consolida la conexión a la base de datos:
    psql "postgres://usuario:clave@host:5432/tu_basedatos"
 2) Ejecuta la migración:
    \i supabase/migrations/20260402000000_split_full_name.sql

- En entorno de Supabase (flujo recomendado):
  - Coloca el archivo en supabase/migrations/20260402000000_split_full_name.sql dentro del repositorio.
  - Ejecuta el flujo normal de migraciones de Supabase (por ejemplo, mediante la CLI de Supabase o el flujo de CI/CD configurado). La migración se aplicará como parte del proceso de despliegue y/o sincronización de la base de datos.

Notas:
- Se recomienda realizar un respaldo de la base de datos y probar la migración en staging antes de aplicarla en producción.
- Verifica si existe el trigger que referenciará la función handle_new_user; si no está presente, la función quedará creada sin ser ejecutada.

---

## Notas técnicas

- Lógica de separación de nombres
  - first_name: se asigna split_part(full_name, ' ', 1) — la primera palabra.
  - last_name: se determina con una expresión que toma el resto después del primer espacio y se aplica trim para eliminar espacios iniciales/finales. Si no hay espacio, last_name queda como cadena vacía ('').
- Edge cases de nombres
  - Si full_name tiene varias palabras, last_name contendrá todo lo que siga a la primera palabra, incluyendo posibles espacios internos.
  - Si full_name contiene solo una palabra, last_name se establece en '' (cadena vacía) y first_name toma esa palabra.
  - Si full_name es NULL, no se migra ese registro y las nuevas columnas quedan con NULL (en Profiles) hasta que se actualicen de forma adicional.
- Resiliencia de la migración
  - profiles: no se fuerza NOT NULL en first_name/last_name; por lo tanto, posibles NULLs persisten si full_name era NULL.
  - reservations: se establece NOT NULL para first_name y last_name tras la migración, asegurando integridad para reservas futuras.
- Trigger handle_new_user
  - La función usa datos de new.raw_user_meta_data (JSON) para poblar perfiles con id, first_name, last_name y avatar_url.
  - El comportamiento de inserción depende de la presencia de estos campos en el JSON; si alguno falta, ese valor será NULL en el registro de perfiles.
  - La función está definida con "SECURITY DEFINER".
  - Este archivo no aplica un trigger directamente; se asume que existe o se definirá un trigger que invoque handle_new_user al insertar un nuevo usuario.
- Rendimiento y migración de datos
  - Las operaciones de actualización recorren filas existentes de profiles y reservations. En tablas grandes, considera ejecutar en ventanas o monitorizar el impacto de carga durante la migración.
  - El uso de funciones de manipulación de cadenas en PostgreSQL (split_part, position, substring, trim) es eficiente para este tipo de migración, pero puede requerir ajustes si las tablas son extremadamente grandes.

---

## Última actualización

29/5/2026

---

Esta documentación cubre el comportamiento, las dependencias y el impacto esperado de la migración 20260402000000_split_full_name.sql para que cualquier desenvolvedor nuevo entienda el propósito y la implementación sin necesidad de revisar el código completo.