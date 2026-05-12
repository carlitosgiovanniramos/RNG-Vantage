## Descripción general

Este archivo define un hook de React llamado `useSupabase` que proporciona una instancia de cliente de Supabase. La instancia se crea mediante la función `createClient` (ubicada en `@/lib/supabase/client`) y se memoiza con `useMemo` para evitar reacobrarla en renderizados subsecuentes dentro del mismo componente. Está diseñado para usarse en componentes del lado del cliente (con la directiva `"use client"`).

## Responsabilidades

- Proveer una instancia de cliente de Supabase para los componentes que lo consumen.
- Garantizar que la creación del cliente ocurra solo una vez por ciclo de vida del componente (mediante memoización).
- Asegurar que el hook se ejecute en componentes del cliente en Next.js (debido a la directiva `"use client"`).

## Props / Parámetros

Este hook es una función sin parámetros.

- none

## Retorna

- Una instancia del cliente de Supabase creada por `createClient()`. El tipo exacto depende de la implementación de `createClient`, pero en esencia es el objeto cliente que expone las APIs de interacción con la base de datos y el almacenamiento de Supabase.

## Dependencias

- React: utiliza `useMemo` para memoización.
- `@/lib/supabase/client`: importa la función `createClient` para construir la instancia del cliente.
- Next.js (cliente): la directiva `"use client"` indica que este código se ejecuta en el lado del cliente, por lo que debe ser consumible por componentes del cliente.

## Ejemplos de uso

Código de ejemplo básico de cómo utilizar este hook en un componente React:

```tsx
"use client";

import React from "react";
import { useSupabase } from "@/hooks/use-supabase";

export default function ExampleComponent() {
  const supabase = useSupabase();

  // Ejemplo de uso (puedes adaptar a tu flujo de trabajo)
  // const { data, error } = await supabase.from('tabla').select('*');

  return (
    <div>
      {/* Contenido del componente */}
    </div>
  );
}
```

## Notas técnicas

- Memoización: `useMemo(() => createClient(), [])` garantiza que la instancia del cliente se cree una única vez durante la vida del componente. Cada componente que use este hook y que se monte por primera vez obtendrá su propia instancia. No es un singleton global para toda la aplicación.
- Rendimiento: la creación del cliente podría ser costosa si implica operaciones de configuración o lectura de variables de entorno; al usar `useMemo` se evita recomputaciones en rerenders del mismo componente.
- Compatibilidad: al contener `"use client"`, este hook debe usarse únicamente en componentes del cliente en Next.js. No debe ser utilizado en componentes renderizados en el servidor.
- Extensibilidad: si en el futuro se desea compartir una única instancia entre todos los componentes, se podría refactorizar para crear y exportar una instancia singleton fuera de componentes o envolverla en un contexto (React Context).

## Última actualización

12/5/2026