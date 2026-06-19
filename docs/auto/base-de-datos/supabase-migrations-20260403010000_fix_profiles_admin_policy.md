# Documentación técnica – 20260403010000_fix_profiles_admin_policy.sql

Contenido del archivo
- Ruta: supabase/migrations/20260403010000_fix_profiles_admin_policy.sql
- Nombre: 20260403010000_fix_profiles_admin_policy.sql
- Líneas: 9

Este archivo es una migración de Supabase/PostgreSQL destinada a corregir la política de control de acceso en la tabla public.profiles para el rol de admin. En concreto, reemplaza la política existente por una versión que utiliza el claim role del JWT para permitir el acceso de lectura (SELECT) a todos los perfiles cuando el usuario tiene rol admin, evitando posibles problemas de recursión infinita en la definición de la política.

## Descripción general

La migración realiza lo siguiente:
- Elimina (si existe) la política denominada "Admins can view all profiles" sobre la tabla public.profiles.
- Recrea dicha política para la operación FOR SELECT, utilizando una cláusula USING que verifica que el rol extraído del JWT sea 'admin':
  - auth.jwt() ->> 'role' = 'admin'
- El objetivo es asegurar que los administradores pueden visualizar todos los perfiles, evitando una recursión infinita en la política anterior.

Propósito dentro del proyecto:
- Garantizar un comportamiento estable y predecible de la seguridad a nivel de fila (RLS) para la tabla de perfiles cuando se realizan consultas de lectura, confiando en el token JWT proporcionado por Supabase.

## Responsabilidades

- Mantener la política de RLS para public.profiles enfocada en permitir lectura (SELECT) a usuarios con rol admin.
- Evitar problemas de recursión infinita en la definición de la política mediante un reemplazo explícito de la política existente.
- Asegurar que la migración se aplique de forma atómica: se elimina la política anterior (si existe) y se crea la nueva en el mismo script.

## Props / Parámetros

Este archivo no es un componente ni una función de código ejecutable en frontend; es una migración SQL. A continuación se describen los elementos relevantes de la migración:

- DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
  - Elimina la política existente con ese nombre en la tabla public.profiles si ya está definida.
- CREATE POLICY "Admins can view all profiles"
  - ON public.profiles FOR SELECT
  - USING ((auth.jwt() ->> 'role') = 'admin');
  - Crea una nueva política denominada exactamente "Admins can view all profiles" para operaciones de SELECT en public.profiles.
  - La cláusula USING utiliza la función auth.jwt() (proveída por Supabase) para obtener el claim 'role' del JWT y admite la vista de filas solo cuando ese valor es 'admin'.

Parámetros clave dentro de la política:
- auth.jwt(): función que devuelve el JWT decodificado del usuario actual.
- ->> 'role': extrae el valor del claim 'role' como texto.
- = 'admin': condición que debe cumplirse para que la fila sea visible a través de esta política (solo para administradores).

## Retorna

- Esta migración no devuelve valores. Su efecto es modificar la configuración de seguridad a nivel de fila (RLS) de la tabla public.profiles.
- En el entorno de ejecución de la base de datos, la migración se aplica como un script DDL que altera la política.

## Dependencias

- PostgreSQL con Row Level Security (RLS) habilitada para la tabla public.profiles (ENABLE ROW LEVEL SECURITY).
- Supabase Auth: la función auth.jwt() para leer claims del token JWT.
- Política de seguridad basada en RLS: la política depende de la presencia de la función auth.jwt() y del uso de la cláusula USING para definir visibilidad de filas.
- Nombre de la política: "Admins can view all profiles" (debe coincidir para que el DROP funcione con IF EXISTS).

## Ejemplos de uso

- Caso de administrador (role = 'admin'):
  - Un usuario con JWT cuyo claim role es 'admin' ejecuta:
    - SELECT * FROM public.profiles;
  - Resultado: se devuelve todas las filas de public.profiles (dado que la cláusula USING se evalúa como verdadera para admin).

- Caso no administrador (otros roles):
  - Un usuario con JWT cuyo claim role no es 'admin' ejecuta:
    - SELECT * FROM public.profiles;
  - Resultado: no se devuelve ninguna fila debido a la política de RLS que evalúa USING como false para esas filas/usuarios.

Notas:
- Esta política sólo define visibilidad para SELECT. Si hay otras políticas o permisos, su interacción debe revisarse para evitar restricciones no deseadas.
- Si se desea restringir filas a ciertos criterios incluso para admins, se podría ampliar la cláusula USING; en la versión actual, cualquier fila es visible para admins.

## Notas técnicas

- El nombre de la política contiene espacios y se cita con comillas dobles para asegurar la coincidencia exacta.
- El uso de auth.jwt() permite depender del token de sesión de Supabase, lo cual facilita la verificación basada en JWT sin mantener información adicional en la base de datos.
- Esta migración presume que la máquina de despliegue ya tiene habilitada RLS en public.profiles; no habilita RLS ni crea otras políticas de seguridad adicionales.
- Es recomendable revisar la consistencia de políticas en la tabla public.profiles tras aplicar la migración, para confirmar que no existan políticas conflictivas o redundantes.

## Última actualización

12/5/2026

Observaciones finales:
- Este archivo es una migración de estructura de base de datos (SQL) y no un componente de frontend o una función en TypeScript. Su objetivo es corregir la definición de una política de seguridad para asegurar que los administradores puedan ver todos los perfiles mediante la verificación del rol admin en el JWT.