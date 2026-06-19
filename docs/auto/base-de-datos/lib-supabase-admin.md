# Documentación Técnica – lib/supabase/admin.ts

A continuación se detalla el propósito, uso y consideraciones del archivo lib/supabase/admin.ts del proyecto RNG Vantage.

## Descripción general

Este archivo exporta la función createAdminClient, que crea y devuelve un cliente de Supabase configurado para uso administrativo.  
Principales características:

- Garantía de ejecución en servidor mediante la importación "server-only".
- Utiliza variables de entorno para obtener la URL de Supabase y la clave de servicio (service role key).
- Configura el cliente de Supabase para deshabilitar la gestión de sesión y la actualización automática de tokens, asegurando que las operaciones administrativas no generen sesiones de usuario.

El propósito dentro del proyecto es proporcionar un cliente de admin de Supabase listo para realizar operaciones con privilegios elevados sin exponer credenciales en el cliente.

## Responsabilidades

- Crear y devolver un cliente de Supabase preparado para uso administrativo.
- Validar la presencia de las variables de entorno necesarias y fallar temprano si no están definidas.
- Configurar el cliente para operar sin manejo de sesiones (persistencia de sesión deshabilitada y desactivación de auto-refresh de tokens), adecuado para operaciones server-side con la service role key.

## Parámetros

La función no recibe parámetros explícitos. Sin embargo, utiliza las siguientes entradas desde el entorno:

- NEXT_PUBLIC_SUPABASE_URL (string): URL de la instancia de Supabase.
  - Descripción: punto de conexión de la instancia de Supabase.
- SUPABASE_SERVICE_ROLE_KEY (string): Service Role Key de Supabase.
  - Descripción: clave de rol de servicio con privilegios elevados. Debe permanecer en el servidor y no exponerse al cliente.

La función valida que ambas variables existan y, en su ausencia, lanza un error.

## Retorna

- Un objeto de tipo SupabaseClient (proveniente de @supabase/supabase-js), configurado para uso administrativo.
- Configuración específica:
  - auth.autoRefreshToken: false
  - auth.persistSession: false

Este cliente está preparado para realizar operaciones administrativas sin gestionar sesiones de usuario.

## Dependencias

- @supabase/supabase-js: biblioteca cliente de Supabase para TypeScript/JavaScript.
- server-only: importación que fuerza que este código se ejecute sólo en el entorno del servidor (Next.js), evitando uso en el cliente.
- Entorno (variables de entorno):
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY

## Ejemplos de uso

Ejemplo básico de uso en un entorno servidor (por ejemplo, en una ruta API o en un servidor de Next.js):

```ts
import { createAdminClient } from "@/lib/supabase/admin";

const adminClient = createAdminClient();

// Ejemplo: usar el cliente para consultar una tabla con privilegios de administrador
// const { data, error } = await adminClient.from('some_table').select('*');
```

Notas:
- Este helper debe invocarse solo en código del servidor y no en el cliente, ya que utiliza la service role key.
- El cliente devuelto puede realizar operaciones administrativas en la base de datos a través de la API de Supabase.

## Notas técnicas

- Seguridad de credenciales:
  - La clave de servicio (SERVICE ROLE KEY) tiene privilegios elevados. Debe mantenerse en el entorno del servidor y no debe exponerse al cliente.
  - La presencia de "server-only" en el archivo ayuda a evitar cargas en el cliente por parte de Next.js.
- Configuración de autenticación:
  - Se desactiva el manejo de tokens de sesión en el cliente del administrador: autoRefreshToken y persistSession están deshabilitados. Esto evita la creación de sesiones de usuario en operaciones administrativas.
- Validación temprana:
  - Si faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY, se lanza un error claro en tiempo de ejecución para evitar inicializar un cliente incompleto.
- Limitaciones:
  - El código no implementa manejo adicional de errores de conexión o validación de permisos más allá de la verificación de env vars.
  - No se realiza logging dentro del helper; cualquier logging debe hacerse en las capas que utilicen el cliente.

## Última actualización

12/5/2026

Si necesitas adaptar este archivo a un entorno distinto (por ejemplo, usar una clave de servicio distinta o permitir ciertas interacciones de sesión en escenarios específicos), asegúrate de actualizar las validaciones de entorno y la configuración de autenticación según corresponda.