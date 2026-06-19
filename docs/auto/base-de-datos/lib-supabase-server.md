# Documentación técnica: lib/supabase/server.ts

Archivo: lib/supabase/server.ts  
Nombre: server.ts  
Líneas: 29

Este archivo define una utilidad para crear un cliente de Supabase en el contexto de Next.js Server Components, conectando el cliente SSR de Supabase con el sistema de cookies de Next.js para gestionar la sesión del usuario en el lado del servidor.

## Descripción general

La función createClient() crea y devuelve un cliente de Supabase para uso en el servidor, utilizando el paquete @supabase/ssr. Integra las cookies gestionadas por Next.js (a través de next/headers) para sincronizar el estado de sesiones entre el cliente SSR de Supabase y el entorno de Next.js. Específicamente:
- Obtiene el store de cookies del entorno de Next.js mediante cookies().
- Invoca createServerClient con la URL y la clave anónima de Supabase extraídas de variables de entorno.
- Proporciona un adaptador de cookies para getAll y setAll:
  - getAll() delega a cookieStore.getAll().
  - setAll(cookiesToSet) intenta iterar y establecer cada cookie en cookieStore; falla silenciosamente si ocurre un error, con el comentario indicando que suele ocurrir cuando se llama desde un Server Component y podría ignorarse si hay un middleware que refresca sesiones.

En resumen, este archivo facilita la creación de un cliente de Supabase que respeta y actualiza las cookies de sesión dentro del flujo de renderizado del lado del servidor en Next.js.

## Responsabilidades

- Proveer una función asíncrona que devuelve un cliente SSR de Supabase configurado para el entorno de Next.js.
- Integrar el manejo de cookies de Next.js (cookies API) con el cliente de Supabase SSR.
- Exponer getAll para leer cookies existentes y setAll para escribir cookies desde el servidor.
- Manejar de forma robusta posibles fallos al establecer cookies, con una nota de no impacto si se utiliza middleware para refrescar sesiones.

## Parámetros

- No recibe parámetros directos.
- Dependencias de entrada a través de variables de entorno:
  - NEXT_PUBLIC_SUPABASE_URL: URL del proyecto de Supabase.
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: Clave anónima de Supabase.
- Notas:
  - Ambos valores se asumen presentes y se fuerzan con el operador de aserción no nulo (!). Si alguna de estas variables no está definida, podría provocar un fallo en tiempo de ejecución.
  - Estos valores se utilizan para inicializar el cliente SSR de Supabase.

## Retorna

- Un cliente de servidor de Supabase creado por createServerClient.
- Tipo: el tipo devuelto por createServerClient de @supabase/ssr (cliente SSR de Supabase).
- Este cliente ya está configurado para interactuar con el backend de Supabase y gestionar cookies a través de la API de cookies de Next.js.

## Dependencias

- @supabase/ssr: Proporciona createServerClient, utilizado para crear el cliente de Supabase en el SSR.
- next/headers: Proporciona la API cookies() para manipular cookies en el contexto de Next.js.
- Entorno de ejecución: Next.js (Server Components/SSR) y variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.

## Ejemplos de uso

Ejemplo mínimo de uso en un Server Component o en código de servidor:

```ts
import { createClient } from '@/lib/supabase/server';

export async function someServerFunction() {
  const supabase = await createClient();

  // Ejemplo de consulta usando el cliente SSR de Supabase
  const { data, error } = await supabase.from('users').select('*');
  // Manejo de data y error según la lógica de la aplicación
  return { data, error };
}
```

Notas sobre uso:
- Este patrón es adecuado para funciones y componentes del lado del servidor que requieren acceso a la base de datos sin exponer credenciales en el cliente.
- Debe invocarse en contexto SSR (Server Components, middleware, funciones de servidor), no en el código que se ejecuta en el cliente.

## Notas técnicas

- Cookies: La implementación utiliza la API de cookies de Next.js (cookies()) para obtener el store de cookies del request/response del servidor.
- Compatibilidad SSR: El método setAll está envuelto en un try/catch sin acción en el catch, con un comentario que indica que la llamada a setAll puede ocurrir desde un Server Component y podría ignorarse si hay un middleware que refresca sesiones.
- Ejecución segura: El código utiliza neutralización de null con el operador ! para NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. Es responsabilidad del entorno de despliegue asegurar que estas variables estén definidas; de lo contrario, podría producirse un fallo de inicialización.
- Performance: Al ser una creación de cliente por llamada, conviene usarla en contextos donde se necesite un acceso SSR, evitando crear clientes innecesarios en bucles o en múltiples invocaciones sin necesidad.
- Seguridad: Al exponer variables de entorno públicas (NEXT_PUBLIC_*), se debe asegurar que la configuración de Supabase permita solo las operaciones necesarias desde el frontend/SSR y que el manejo de cookies sea correcto para la sesión.

## Última actualización

12/5/2026

Notas finales:
- La implementación es directa y no introduce complejidad adicional más allá de la integración entre Supabase SSR y el manejo de cookies de Next.js.
- Si se requieren cambios para soportar otros métodos de manejo de cookies o políticas de sesión, se puede extender el objeto cookies dentro de la llamada a createServerClient manteniendo la compatibilidad con SSR.