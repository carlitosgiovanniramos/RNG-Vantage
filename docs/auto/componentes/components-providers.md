# Documentación técnica – Providers (components/providers.tsx)

Archivo: components/providers.tsx  
Nombre: providers.tsx  
Líneas: 23

 Descripción general
Este archivo define el componente React Providers, un wrapper de alto nivel que inicializa y proporciona un cliente de React Query (TanStack Query) a todos sus hijos. Está diseñado para centralizar la configuración global de consultas y asegurar que los componentes dentro de la aplicación puedan suscribirse y realizar consultas de forma consistente.

 Responsabilidades
- Crear una instancia de QueryClient con configuración predeterminada.
- Proveer ese QueryClient a través de QueryClientProvider para que los componentes hijos puedan usar React Query.
- Garantizar que la instancia de QueryClient se mantenga estable entre re-renders del componente, utilizando useState para creación perezosa.
- Configurar límites de rendimiento y comportamiento de reconsulta para las consultas (staleTime y refetchOnWindowFocus).

 Props / Parámetros
- Componente: Providers
  - children: ReactNode
    - Tipo: ReactNode
    - Requerido: Sí
    - Descripción: Contenido que consume el contexto de React Query proporcionado por este componente.

 Retorna
- Un elemento React: QueryClientProvider con la propiedad client estableciendo la instancia de QueryClient, envolviendo a {children}.
- Formato: ReactElement (QueryClientProvider) que envuelve a los hijos.

 Dependencias
- @tanstack/react-query
  - QueryClient: clase para crear la instancia de cliente de consultas.
  - QueryClientProvider: proveedor de contexto para React Query.
- React
  - useState: para crear y mantener la instancia de QueryClient.
  - ReactNode: tipo de los hijos (children).
- Next.js (directiva de componente)
  - "use client": indica que este archivo es un componente cliente (client component) para el app router, necesario para usar React Query en el cliente.

 Ejemplos de uso
- Descripción: Envolver la aplicación o una sección de la app con este proveedor para habilitar React Query en todos los componentes hijos.
- Ejemplo básico:
  - Dentro de un layout o componente raíz:

    import { Providers } from "./components/providers";

    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="es">
          <body>
            <Providers>
              {children}
            </Providers>
          </body>
        </html>
      );
    }

- Otro ejemplo mínimo:
  - En una página que requiera consultas, simplemente envolver el árbol de componentes con <Providers> para habilitar React Query en esa sección.

 Notas técnicas
- Creación y persistencia del QueryClient:
  - El QueryClient se crea dentro de useState utilizando una función de inicialización. Esto garantiza que la instancia se cree una sola vez y persista entre re-renders del componente Providers.
- Configuración predeterminada (defaultOptions):
  - staleTime: 60 * 1000 (60 segundos). Las consultas permanecen consideradas “frescas” durante 1 minuto, evitando re-consultas innecesarias.
  - refetchOnWindowFocus: false. No se disparan re-consultas automáticas cuando la ventana recupera el foco, reduciendo tráfico de red y ruido de actualizaciones frecuentes.
- Alcance del contexto:
  - Este proveedor envuelve a {children}, por lo que todas las consultas realizadas por componentes descendientes pueden usar hooks como useQuery, useMutation, etc., sin necesidad de reconfigurar el cliente en cada parte de la app.
- Consideraciones de rendimiento y escalabilidad:
  - La configuración actual es razonable para muchas apps pequeñas o medianas, pero puede ajustarse fácilmente para escenarios que requieran reconsultas más agresivas o más conservadoras.
  - Si en el futuro se quisiera personalizar comportamientos por ruta o por tipo de consulta, se podría ampliar este componente para aceptar props de configuración adicionales o crear múltiples QueryClientProviders anidados con diferentes configuraciones.
- Compatibilidad:
  - Diseñado para Next.js con la app router (componente cliente). Asegúrate de que este archivo se utilice en contextos donde React Query pueda ejecutarse en el cliente.

 Última actualización
- 12/5/2026

Observaciones especiales
- El archivo es relativamente simple (23 líneas) y no introduce lógica adicional fuera de la creación del QueryClient y su provisión a través de QueryClientProvider.
- No se añaden efectos secundarios ni lógica de negocio; su propósito es puramente estructural y de configuración de React Query para la aplicación RNG Vantage.