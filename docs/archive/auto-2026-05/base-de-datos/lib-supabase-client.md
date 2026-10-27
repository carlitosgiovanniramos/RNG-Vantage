## Descripción general

Este archivo define una utilidad para crear un cliente de Supabase en el lado del navegador. Exporta la función `createClient`, que envuelve la creación de un cliente de Supabase mediante `createBrowserClient` de la librería `@supabase/ssr`, usando las variables de entorno públicas de Next.js para la URL del proyecto y la clave anonima.

## Responsabilidades

- Proporcionar una única forma centralizada de instanciar un cliente de Supabase para el cliente (navegador).
- Leer las variables de entorno públicas `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` para configurar el cliente.
- Exponer una función reutilizable (`createClient`) para facilitar su uso en otras partes de la aplicación.

## Props / Parámetros

- Parámetros: ninguno.  
  Descripción: la función `createClient` no recibe argumentos y, al ser llamada, crea y devuelve una instancia de cliente de Supabase utilizando las variables de entorno.

## Retorna

- Devuelve una instancia de SupabaseClient creada por `createBrowserClient` con la URL y la anon key proporcionadas por las variables de entorno:
  - Tipo esperado: SupabaseClient (proporcionado por la librería de Supabase).
  - Formato: objeto cliente de Supabase listo para realizar operaciones (consultas, inserciones, autenticación, etc.) en el navegador.

## Dependencias

- `@supabase/ssr`: ofrece `createBrowserClient`, utilizado para crear la instancia del cliente de Supabase en el entorno del navegador.
- Variables de entorno públicas de Next.js:
  - `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto de Supabase.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave anonima pública para operaciones del cliente.
- Entorno de ejecución: Next.js (cliente/navegador).

Notas: el código utiliza non-null assertions (`!`) para las variables de entorno, lo que implica que se espera que estén definidas en tiempo de compilación/ejecución. Si alguna de estas variables no está definida, podría ocurrir un fallo en el runtime al construir el cliente.

## Ejemplos de uso

- Importar y obtener un cliente de Supabase para usar en la aplicación:

```ts
import { createClient } from "lib/supabase/client";

const supabase = createClient();

// Ejemplo de uso básico:
// const { data, error } = await supabase.from("customers").select("*");
```

Nota: la ruta de importación puede variar según la configuración de aliases de módulos de tu proyecto. Adjunta la importación correcta según la estructura de tu proyecto (por ejemplo, usar alias como `@/lib/supabase/client` si corresponde).

## Notas técnicas

- El cliente se crea en función; cada llamada a `createClient()` produce una nueva instancia de cliente de Supabase.
- Uso de `createBrowserClient` desde `@supabase/ssr` indica que esta configuración está pensada para el entorno del navegador. Asegúrate de no exponer claves secretas en el cliente (en este caso se utiliza una anon key pública, adecuada para llamadas del cliente).
- Las variables de entorno se acceden con el prefijo `NEXT_PUBLIC_`, lo que las hace disponibles en el código del cliente. Deben estar definidas en el entorno de ejecución.
- El código usa aserciones no nulas (`!`) para las variables de entorno. Esto evita errores de compilación en TypeScript pero puede provocar errores en tiempo de ejecución si las variables no están definidas en el entorno de ejecución.

## Última actualización

29/5/2026