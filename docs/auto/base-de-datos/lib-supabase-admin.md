# Documentación técnica: lib/supabase/admin.ts

Archivo: lib/supabase/admin.ts  
Nombre: admin.ts  
Total de líneas: 19

Entrega: Función para crear un cliente de Supabase autenticado con rol de servicio (admin) para uso en el servidor.

---

## Descripción general
Este archivo exporta la función createAdminClient(), que genera y devuelve un cliente de Supabase autorizado con la clave de rol de servicio. El cliente está configurado para operar en entorno de servidor (server-side) y no mantiene sesiones de usuario ni refresca tokens, ya que se utiliza para operaciones administrativas mediante la clave de servicio.

---

## Responsabilidades
- Proporcionar un cliente de Supabase configurado con un rol de servicio (admin) para operaciones administrativas en el backend.
- Validar la presencia de las variables de entorno necesarias (URL de Supabase y clave del rol de servicio) y lanzar un error si faltan.
- Configurar el cliente para no gestionar autenticación de usuario (autoRefreshToken: false, persistSession: false).
- Garantizar que el módulo se ejecute en el entorno de servidor mediante la instrucción "server-only".

---

## Props / Parámetros
- Sin parámetros de entrada (la función no recibe argumentos).
- Variables de entorno requeridas:
  - NEXT_PUBLIC_SUPABASE_URL: URL de la instancia de Supabase.
  - SUPABASE_SERVICE_ROLE_KEY: Clave de rol de servicio (admin) para autenticación con privilegios elevados.
- Comportamiento ante ausencia de variables:
  - Si alguno de los valores falta, la función lanza un Error con el mensaje: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY".

Nota: Aunque la URL lleva el prefijo NEXT_PUBLIC_, este módulo está marcado como server-only, por lo que no debería exponerse al cliente. Sin embargo, conviene entender que NEXT_PUBLIC_ indica que, fuera de este contexto, esa variable podría ser expuesta al cliente.

---

## Retorna
- Un objeto de tipo SupabaseClient (proporcionado por @supabase/supabase-js) configurado con:
  - URL de Supabase: based on NEXT_PUBLIC_SUPABASE_URL
  - Llave de servicio: based on SUPABASE_SERVICE_ROLE_KEY
  - Configuración de autenticación:
    - auth.autoRefreshToken = false
    - auth.persistSession = false
- Este cliente está destinado a uso en operaciones administrativas en el backend.

---

## Dependencias
- @supabase/supabase-js: Biblioteca cliente de Supabase para TypeScript/JavaScript.
- server-only: Directiva de Next.js para asegurar que el módulo se ejecute únicamente en el servidor.
- Entorno de ejecución Node/Next.js (con soporte para process.env).

---

## Ejemplos de uso

Ejemplo de uso típico en código del servidor (p. ej., en rutas API o funciones del servidor):

```ts
import { createAdminClient } from "@/lib/supabase/admin";

const admin = createAdminClient();

// Ejemplo de consulta administrativa
const { data, error } = await admin.from("admin_logs").select("*").limit(100);
```

Notas:
- Este módulo debe importarse y utilizarse únicamente en código del lado del servidor (server components/API routes, etc.). No debe ser utilizado desde código que se ejecute en el cliente.
- Debido a que usa la clave de servicio, las operaciones deben restringirse adecuadamente y no exponer datos sensibles.

---

## Notas técnicas
- Seguridad de credenciales:
  - La clave del rol de servicio (SUPABASE_SERVICE_ROLE_KEY) es una credencial sensible; debe almacenarse en variables de entorno seguras y no registrarse.
  - El archivo garantiza que la clave no se use en el cliente gracias a "server-only".
- Publicidad de la URL:
  - NEXT_PUBLIC_SUPABASE_URL es una variable de entorno con prefijo NEXT_PUBLIC, lo cual la haría pública si se ejecutara en el cliente. Sin embargo, al ser un módulo server-only, la variable y su valor permanecen en el entorno del servidor y no se exponen al cliente.
- Configuración de autenticación:
  - El cliente se crea con autoRefreshToken: false y persistSession: false, lo que evita la gestión de tokens de sesión de usuario. Esto es adecuado para interacciones administrativas con clave de servicio, pero no para operaciones de usuario final.
- Manejo de errores:
  - Si faltan las variables de entorno necesarias, se lanza un Error claro, evitando que se cree un cliente mal configurado.
- Consideraciones de rendimiento:
  - La función crea un nuevo cliente cada vez que se invoca. Si se van a hacer múltiples llamadas, podría considerarse reutilizar un cliente (p. ej., cachearlo en un singleton) para evitar reconstrucciones repetidas. Actualmente, el código no implementa caching.

---

## Última actualización
29/5/2026

---