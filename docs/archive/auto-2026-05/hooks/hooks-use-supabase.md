# Documentación técnica: hooks/use-supabase.ts

Archivo: hooks/use-supabase.ts  
Ruta: hooks/use-supabase.ts  
Tipo: Hook de React (cliente)

Total de líneas: 9

---

## Descripción general

useSupabase es un hook de React que devuelve una instancia de cliente de Supabase. La instancia se crea llamando a createClient() y se memoiza con useMemo para evitar recalcularla en re-renders del componente. El archivo incluye la directiva "use client", lo que indica que es un componente cliente de Next.js y debe ejecutarse en el lado del cliente.

---

## Responsabilidades

- Proporcionar un acceso fácil y consistente a una instancia de cliente de Supabase a partir de un hook.
- Garantizar que la instancia del cliente no se recree en cada renderizado del componente mediante memoización (useMemo).
- Envolver la creación del cliente para centralizar la lógica de inicialización del cliente de Supabase.

---

## Props / Parámetros

Este hook no recibe parámetros.

- useSupabase(): No tiene parámetros de entrada.

---

## Retorna

- Un valor que corresponde a la instancia devuelta por createClient(), envuelto en useMemo. En otras palabras, devuelve una instancia del cliente de Supabase (el tipo exacto depende de la implementación de createClient; típicamente sería SupabaseClient en proyectos que usan Supabase).

Formato de retorno:
- Type: el tipo devuelto por createClient (no especificado en este archivo). Tipo recomendado para referencia: SupabaseClient, dependiendo de la implementación de createClient.
- Descripción: la instancia memoizada del cliente de Supabase para ser utilizada en operaciones de consulta/autoría en la app.

---

## Dependencias

- react: useMemo (hook de memoización de React)
- "@/lib/supabase/client": createClient (función propietaria que crea la instancia del cliente de Supabase)
- "use client": Directiva de Next.js que marca este archivo como un componente cliente

Notas sobre dependencias:
- No hay props ni dependencias externas dentro de useSupabase; la memoización se basa únicamente en la función createClient al momento de la primera ejecución del hook en un componente.
- Cada componente que consuma este hook obtendrá, tras su montaje, su propia instancia memoizada hasta que ese componente se desmonte.

---

## Ejemplos de uso

Ejemplo mínimo de uso en un componente React dentro de Next.js:

```tsx
// Importa el hook desde su ruta
import { useSupabase } from "@/hooks/use-supabase";

export default function MiComponente() {
  const supabase = useSupabase();

  // Ejemplo de uso: realizar una consulta
  // const { data, error } = await supabase.from("clientes").select("*");

  return (
    <div>Componente con acceso a Supabase</div>
  );
}
```

Notas:
- El hook devuelve una instancia de cliente que se puede usar para interactuar con la base de datos a través de las APIs de Supabase.
- Dado que la instancia está memoizada, no se recrea entre re-renders del mismo componente.

---

## Notas técnicas

- Memoización: useMemo(() => createClient(), []) garantiza que la creación del cliente ocurra una sola vez por ciclo de vida del componente que use el hook. No se recrea al re-renderizar.
- Alcance de la instancia: cada componente que use este hook recibirá su propia instancia memoizada. Esto evita efectos colaterales entre componentes, pero significa que no hay un singleton global compartido a nivel de toda la app. Si se requiere un único cliente compartido, podría considerarse crear el cliente en un módulo/singleton independiente y exportarlo.
- Comportamiento del cliente: la implementación de createClient() determina el tipo exacto del objeto devuelto y sus capacidades (consultas, autenticación, etc.). Este archivo no define ese tipo; solo delega la creación al helper correspondiente.
- Entorno de ejecución: al contener la directiva "use client", este hook debe ejecutarse únicamente en componentes cliente de Next.js.

---

## Última actualización

29/5/2026

---

Si necesitas, puedo añadir ejemplos más avanzados de manejo de errores o de integración con otras partes del flujo de ventas y reservas de RNG Vantage.