# Documentación técnica – providers.tsx

Archivo: components/providers.tsx  
Nombre: providers.tsx  
Total de líneas: 23

Este archivo define un componente cliente de React llamado `Providers` que prepara y provee una instancia de React Query (TanStack) a toda la aplicación a través de `QueryClientProvider`. Es un envoltorio simple cuyo objetivo es centralizar la configuración de consultas y asegurar un único `QueryClient` a lo largo del árbol de componentes.

## Descripción general

El componente `Providers` es un wrapper de alto nivel que:

- Marca el archivo como componente cliente (directiva `"use client"`).
- Crea de forma lazy una instancia de `QueryClient` con opciones por defecto para las consultas.
- Expone `QueryClient` a través de `QueryClientProvider` para que los componentes hijos puedan usar hooks de React Query (por ejemplo, `useQuery`, `useMutation`).
- Evita re-inicializar el `QueryClient` entre renders gracias a `useState`.

Este patrón facilita la gestión centralizada de la configuración de React Query y evita duplicados de la instancia del cliente en el árbol de componentes.

## Responsabilidades

- Proveer un `QueryClient` configurado con opciones globales para todas las consultas.
- Exponer el `QueryClientProvider` envolviendo a los `children` recibidos.
- Garantizar que la instancia de `QueryClient` se cree una sola vez por ciclo de vida del componente (sin recreación innecesaria).
- Mantener el comportamiento por defecto de React Query para no refetch al enfocarse la ventana si no se especifica lo contrario.

## Props / Parámetros

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| children | ReactNode | Sí | Contenido (componentes) que deben tener acceso a React Query a través del contexto proporcionado por `QueryClientProvider`. |

Notas sobre el diseño:
- Este es un componente de envoltura; su único propósito es inicializar y propagar el `QueryClient` a sus hijos.

## Retorna

- Un elemento React (`ReactElement`) que consiste en un `QueryClientProvider` con la instancia de `queryClient` inyectada y que envuelve a `children`. No devuelve nada por fuera del árbol de React; su efecto es disponibilizar el contexto de React Query a todos los componentes hijos.

## Dependencias

- React (hooks: `useState`, tipo `ReactNode`).
- @tanstack/react-query (exporta `QueryClient`, `QueryClientProvider`).
- Directiva de Next.js/React 18 para componentes cliente: `"use client"` al inicio del archivo.
- Este archivo forma parte de un proyecto Next.js con TypeScript.

## Ejemplos de uso

Ejemplo mínimo de uso en una app Next.js:

```tsx
"use client";

import { Providers } from "../components/providers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
```

Otro ejemplo típico sería envolver toda la aplicación, por ejemplo en `_app.tsx` o `layout.tsx` (según la estructura del proyecto) para que todas las rutas/child components tengan acceso a React Query sin necesidad de envolver cada página individualmente.

## Notas técnicas

- Inicialización lazy: la instancia de `QueryClient` se crea dentro de `useState` mediante una función de inicialización. Esto garantiza que el `QueryClient` se construya una única vez y no se recree en cada render, lo cual es crucial para evitar la pérdida de estado de consultas y reacciones globales.
- Configuración por defecto: `defaultOptions.queries` establece:
  - `staleTime: 60 * 1000` (60 segundos): las respuestas se consideran frescas durante 60 segundos, por lo que no se vuelven a fetchear a menos que haya una invalidación explícita o un refetch programado.
  - `refetchOnWindowFocus: false`: evita que las consultas se refetcheen automáticamente cuando la ventana recupera el foco, reduciendo solicitudes de red no deseadas durante la navegación.
- Alcance: al usar este componente, todos los componentes hijos pueden usar hooks de React Query sin necesidad de crear sus propios `QueryClient` ni pasar proveedores individualmente.
- Rendimiento: al centralizar la instancia de `QueryClient` y sus opciones, se reduce overhead asociado a múltiples instancias y posibles inconsistencias en la configuración de consultas a través de la aplicación.

## Última actualización

29/5/2026

Si necesitas adaptar el comportamiento de React Query (por ejemplo, cambiar `staleTime` o habilitar `refetchOnWindowFocus`), puedes modificar las opciones dentro de la creación de `QueryClient` en este archivo, manteniendo la misma estructura para no afectar a los componentes que consumen el contexto.