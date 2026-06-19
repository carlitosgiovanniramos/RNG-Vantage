# lib/supabase/client.ts

Contenido resumido del archivo: exporta una función que crea y devuelve un cliente de Supabase para uso en el navegador, utilizando valores de entorno y la utilidad createBrowserClient de @supabase/ssr.

## Descripción general
Este archivo define y exporta la función createClient, la cual genera una instancia de SupabaseClient para uso en el cliente (navegador). Se apoya en la utilidad createBrowserClient provista por el paquete @supabase/ssr y se configura mediante dos variables de entorno públicas: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.

## Responsabilidades
- Proporcionar una forma centralizada de crear un cliente de Supabase para el cliente (browser).
- Leer y utilizar las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para la configuración.
- Delegar la creación real del cliente a createBrowserClient de @supabase/ssr.

## Props / Parámetros
- Ninguno. La función no recibe argumentos.
- Nota: la configuración se realiza a partir de variables de entorno disponibles en tiempo de ejecución:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

## Retorna
- Retorna una instancia de SupabaseClient creada por createBrowserClient.
- Formato/Tipo de retorno: SupabaseClient (tipo de @supabase/supabase-js), configurado con la URL y la anon key proporcionadas.
- Es importante notar que las variables de entorno se fuerzan a existir mediante el uso de el operador de aserción no nulo (!), por lo que si no están definidas en tiempo de ejecución podría producirse un fallo.

## Dependencias
- @supabase/ssr: proporciona createBrowserClient, que se utiliza para crear el cliente de Supabase en el navegador.
- Proceso.env (NEXT_PUBLIC_SOMETHING): se emplean variables de entorno públicas disponibles en el navegador.
- TypeScript: el código está tipado y utiliza la configuración de tipos de Supabase.

## Ejemplos de uso
Ejemplo básico de uso en una aplicación Next.js:
```ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Ejemplo de uso
// const { data, error } = await supabase.from('customers').select('*');
```

Notas:
- Debes asegurarte de que los valores NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén definidos en el entorno de ejecución (por ejemplo, en .env.local o en la configuración de tu entorno de despliegue).

## Notas técnicas
- Seguridad y errores: se utiliza el operador de aserción no nulo (!) al leer las variables de entorno, lo cual desconoce en tiempo de compilación si están definidas y podría provocar errores en tiempo de ejecución si no lo están. Es recomendable garantizar estas variables en el entorno de despliegue y/o añadir validaciones si se desea una respuesta más robusta.
- Cliente por llamada: la función crea y devuelve una nueva instancia de SupabaseClient en cada invocación; si se necesita un singleton, se podría memoizar o exportingear una instancia única fuera de la función.
- Compatibilidad SSR/CSR: aunque el nombre de la utilidad es createBrowserClient, este enfoque está orientado a uso en el cliente (CSR). Asegúrate de que se invoque en entornos adecuados (navegador) para evitar problemas en SSR.
- Dependencia de entorno público: al usar NEXT_PUBLIC_*, estas variables expondrán su valor al cliente. Debes gestionar con cuidado estos valores en cuanto a seguridad y permisos de acceso a la base de datos.

## Última actualización
12/5/2026