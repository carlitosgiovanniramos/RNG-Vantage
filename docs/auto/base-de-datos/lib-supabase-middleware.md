# Documentación técnica: lib/supabase/middleware.ts

Nombre del archivo: middleware.ts

Resumen: Implementa una utilidad para gestionar y sincronizar la sesión de usuario de Supabase en el contexto de Next.js SSR. Exporta la función updateSession que crea un cliente de Supabase en el servidor, enlazado a la petición entrante y a la respuesta que se devolverá, manejando cookies para mantener la sesión del usuario.

## Descripción general

Este archivo proporciona una función asíncrona, updateSession, que:

- Crea un cliente de Supabase para servidor (SSR) utilizando createServerClient.
- Utiliza las cookies de la solicitud entrante para leer y propagar cookies de sesión.
- Permite sincronizar cookies en la respuesta mediante un adapter de cookies proporcionado a Supabase.
- Solicita explícitamente el usuario actual con supabase.auth.getUser() para asegurar que la sesión esté inicializada y evitar logout aleatorios.
- Retorna un NextResponse que puede ser utilizado por el middleware de Next.js para continuar el flujo de respuesta con la sesión actualizada.

Este enfoque facilita la gestión de sesiones de usuario en SSR, asegurando que las cookies de sesión se manejen de forma coherente entre la solicitud entrante y la respuesta saliente.

## Responsabilidades

- Crear un cliente de Supabase SSR ligado a la request y a la Response de Next.js.
- Integrar un adaptador de cookies para:
  - Obtener cookies desde la request (getAll).
  - Escribir cookies en la respuesta (setAll).
- Forzar la inicialización de la sesión del usuario ejecutando supabase.auth.getUser().
- Garantizar que cualquier actualización de cookies se refleje en la respuesta mediante supabaseResponse.
- Documentar una advertencia sobre la secuencia de ejecución entre la creación del cliente y la obtención del usuario para evitar estados inconsistentes.

## Props / Parámetros

- request: NextRequest
  - Tipo: NextRequest
  - Descripción: Objeto de la solicitud entrante de Next.js. Se utiliza para:
    - Leer cookies existentes a través de request.cookies.getAll().
    - Actualizar cookies locales a través de request.cookies.set(...) en el callback setAll.
  - Rol en la función: Es el contexto de ejecución del SSR donde se construye el cliente de Supabase y se sincronizan las cookies.

## Retorna

- supabaseResponse: NextResponse
  - Descripción: Respuesta de Next.js que incorpora las cookies actualizadas de Supabase y conserva el flujo de la solicitud. Es la respuesta que puede devolverse desde el middleware de Next.js.
  - Formato: NextResponse (con el objeto request actualizado y cookies establecidas mediante el adapter de cookies).

## Dependencias

- @supabase/ssr
  - Función utilizada: createServerClient
  - Propósito: Crear un cliente de Supabase para SSR que comparta cookies con la request/response actuales.

- next/server
  - Funciones/Tipos utilizados: NextResponse, type NextRequest
  - Propósito: Proveer la respuesta de Next.js y el contexto de la solicitud en SSR.

- Variables de entorno requeridas:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Nota: Se usan con aserción no nula (!) en el código, por lo que deben estar definidas en entorno de ejecución para evitar errores.

- Flujo de cookies
  - getAll(): obtiene todas las cookies de la request.
  - setAll(cookiesToSet): actualiza cookies en la request y sincroniza con la respuesta mediante supabaseResponse.cookies.set.

## Ejemplos de uso

Ejemplo básico de uso en un middleware de Next.js:

- Archivo: middleware.ts (ejemplo conceptual)

- Uso de updateSession:

  - Importar la función:
    - import { updateSession } from "./lib/supabase/middleware";

  - Utilizar en el middleware para actualizar la sesión y devolver la respuesta:

    export async function middleware(req: NextRequest) {
      const res = await updateSession(req);
      return res;
    }

Este patrón garantiza que, en cada solicitud SSR, el cliente de Supabase esté correctamente configurado con las cookies de la request y que cualquier cambio de cookies se refleje en la respuesta.

## Notas técnicas

- Secuencia de ejecución crucial:
  - La creación del servidor de cliente de Supabase (createServerClient) debe ocurrir antes de llamar a supabase.auth.getUser().
  - Existe un comentario en el código que advierte: “No ejecutar código entre createServerClient y supabase.auth.getUser()” para evitar estados de usuario difíciles de depurar (p. ej., logout inconsistentes).

- Manejo de cookies:
  - El adapter de cookies enviado a createServerClient expone:
    - getAll(): devuelve las cookies de la request.
    - setAll(cookiesToSet): para cada cookie establecida:
      - Actualiza la cookie en la request localmente (request.cookies.set).
      - Reconfigura supabaseResponse para empezar con un nuevo NextResponse.next({ request }).
      - Establece las cookies en la respuesta (supabaseResponse.cookies.set) con sus opciones.
  - Este enfoque permite sincronizar de forma coherente el estado de la sesión entre la request entrante y la respuesta saliente.

- Consideraciones de ambiente y seguridad:
  - Se usan variables de entorno públicas (NEXT_PUBLIC_*) en un contexto de servidor. Asegúrate de que estas variables estén correctamente configuradas en el entorno de ejecución.
  - El uso de el operador de aserción no nula (!) en las variables de ambiente indica que el código asume que esos valores siempre están definidos; en entornos donde podrían faltar, conviene añadir validaciones para evitar errores en tiempo de ejecución.

- Rendimiento y footprint:
  - Cada llamada a updateSession instancia un nuevo cliente de Supabase SSR. En la práctica, esto es común en middleware SSR, pero puede haber consideraciones de rendimiento si se llama con alta frecuencia. Optimización adicional podría considerar caching ligero si aplica a la arquitectura del proyecto.

## Última actualización

12/5/2026

Observaciones finales:
- Este archivo está diseñado para facilitar la gestión de sesiones en SSR con Supabase en Next.js, asegurando que las cookies se lean desde la request y se escriban en la respuesta correspondiente.
- No se añaden funcionalidades fuera del alcance del código proporcionado; cualquier mejora debe respetar la lógica de manejo de cookies y la necesidad de llamar a supabase.auth.getUser() para inicializar la sesión correctamente.