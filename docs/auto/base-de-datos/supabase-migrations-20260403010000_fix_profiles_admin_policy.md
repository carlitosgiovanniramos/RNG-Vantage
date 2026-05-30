# Documentación técnica: 20260403010000_fix_profiles_admin_policy.sql

Archivo: supabase/migrations/20260403010000_fix_profiles_admin_policy.sql  
Nombre: 20260403010000_fix_profiles_admin_policy.sql  
Total de líneas: 9

Contenido principal del script (resumen)
- Propósito: corregir la política de Row Level Security (RLS) para la tabla public.profiles, asegurando que solo los perfiles con role 'admin' puedan realizar consultas SELECT.
- Operaciones:
  - Elimina la política existente con el nombre "Admins can view all profiles" si existe.
  - Crea una nueva política con el mismo nombre, aplicable a SELECT sobre public.profiles, usando una condición basada en el JWT del usuario: (auth.jwt() ->> 'role') = 'admin'.

Descripción general
Este archivo es una migración SQL de Supabase destinada a asegurar que la política de RLS para la tabla profiles funcione correctamente. Se encarga de eliminar cualquier política previa con el mismo nombre para evitar inconsistencias y luego define una nueva política que permite que solo los administradores, identificados por el claim 'role' en el JWT, puedan realizar consultas SELECT sobre la tabla. El comentario inicial indica que se trata de una corrección para evitar una posible recursión infinita en la política de admin.

Responsabilidades
- Mantener la seguridad de acceso a perfiles a través de RLS.
- Garantizar que la política "Admins can view all profiles" esté definida de forma correcta y sin duplicados.
- Asegurar que el acceso de lectura (SELECT) a public.profiles esté restringido a usuarios con role = 'admin'.

Props / Parámetros
- Este archivo es un script de migración SQL. No expone parámetros modificables.
- No hay props React ni entradas de función; las modificaciones son directas sobre el esquema de la base de datos mediante DDL.

Retorna
- No devuelve valores. Ejecuta cambios en la base de datos (DDL) y no produce outputs de retorno en el flujo de ejecución normal.

Dependencias
- PostgreSQL con Row Level Security (RLS) habilitado en la tabla public.profiles.
- Supabase (o entorno compatible) que expone la función auth.jwt() para extraer claims del JWT.
- El comportamiento depende de que el claim 'role' exista en el JWT y que el valor sea comparable con la cadena 'admin'.
- Es recomendable ejecutar dentro de un entorno de migraciones gestionado para evitar inconsistencias entre entornos.

Ejemplos de uso
- Ejecución directa de la migración (PSQL):
  - psql "postgres://USER:PASSWORD@HOST:5432/DATABASE" -f supabase/migrations/20260403010000_fix_profiles_admin_policy.sql
- Verificación de la política tras la migración:
  - psql -d DATABASE -c "SELECT polname, relid::regclass, permissive FROM pg_policies WHERE polname = 'Admins can view all profiles';"
  - o, para ver la lógica de la política:
    - SELECT policyname, cmd, qual FROM pg_policy JOIN pg_class ON pg_policy.polrelid = pg_class.oid WHERE pg_class.relname = 'profiles' AND polname = 'Admins can view all profiles';
Notas:
- Si se utiliza el flujo de migraciones de Supabase CLI, asegúrate de que el entorno de destino aplique la migración en el orden correcto.
- Después de aplicar, la política debe permitir SELECT solo a usuarios cuyo JWT tenga role = 'admin'. Otros roles no verán filas de profiles (asumiendo que no exista otra política que lo permita).

Notas técnicas
- La migración es idempotente en cuanto a la eliminación de la política existente: DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles; Esto evita duplicaciones si el script se ejecuta varias veces.
- La nueva política está definida con USING ((auth.jwt() ->> 'role') = 'admin'), lo que implica:
  - Se evalúa el valor del claim 'role' dentro del JWT del usuario autenticado.
  - Solo los usuarios con role 'admin' cumplen la condición de visibilidad de filas.
  - La cláusula FOR SELECT especifica que la política aplica a consultas SELECT sobre public.profiles.
- Requisitos previos:
  - RLS debe estar habilitado en public.profiles para que las políticas tengan efecto.
  - La función auth.jwt() debe estar disponible (común en entornos Supabase) y el claim 'role' debe formar parte del JWT.
- Limitaciones:
  - Si existen otras políticas de acceso a public.profiles, su interacción dependerá de la configuración de RLS (por ejemplo, políticas adicionales podrían ampliar o restringir el acceso). Esta migración asume el diseño deseado: un único control de acceso basado en admin para lectura.
  - Si el JWT no contiene el claim 'role' o si el valor no es 'admin', la política actual negará el acceso a lectura, a menos que haya políticas adicionales que lo permitan de forma explícita.

Última actualización
29/5/2026

Fragmento relevante del contenido (para referencia)
- Eliminación de política existente:
  DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
- Creación de la nueva política:
  CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
      (auth.jwt() ->> 'role') = 'admin'
    );