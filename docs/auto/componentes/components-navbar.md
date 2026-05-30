# Documentación técnica: components/navbar.tsx

Archivo: components/navbar.tsx (navbar.tsx)

Propósito general
- Implementa una barra de navegación fija y adaptativa para RNG Vantage.
- Soporta vistas de escritorio y móvil, autenticación de usuario, roles (usuario/administrador) y visualización de estado (transparencia al hacer scroll) basada en la ruta actual.
- Se integra con Supabase para obtener información del usuario y gestionar el inicio/cierre de sesión, y utiliza componentes de UI propios (Button, Sheet, etc.) para consistencia visual.

## Descripción general
navbar.tsx define un componente React de cliente ("use client") que:
- Muestra un logo y enlaces principales (Servicios, Capacitación, Reservar).
- Presenta diferentes elementos de la interfaz según el estado de autenticación y el rol (usuario normal o administrador).
- Cambia estilos de fondo según la posición de scroll y la ruta actual (transparente en hero, opaco en resto).
- Ofrece un menú móvil basado en Sheet (panel deslizante desde la derecha) con la misma lógica de enlaces y opciones de autenticación.
- Sin props externas; gestiona su propio estado y referencia a la ruta actual.

## Responsabilidades
- Gestión del estado de la barra de navegación (open del menú móvil, autenticación, rol de administrador, nombre para mostrar, scroll).
- Detección de ruta actual para resaltar enlace activo y para decidir el comportamiento visual (transparencia).
- Carga y actualización del usuario desde Supabase, incluyendo el nombre para mostrar y si es administrador.
- Render condicional basado en estado de autenticación:
  - Usuario autenticado: mostrar nombre/usuario y opción de cerrar sesión.
  - No autenticado: mostrar opciones de Iniciar sesión y Comenzar.
- Navegación adaptativa entre desktop y móvil (enlaces visibles en escritorio; menú deslizante en móvil).
- Aislar efectos de scroll y cambios de sesión para evitar inconsistencias UI.

## Props / Parámetros
Este componente no recibe props.

- Nombre: Navbar
- Tipo: React.FC (función/component)
- Requerido: No aplica (sin props)

Descripción de comportamiento relacionado con props (no hay props explícitos):
- El componente internaliza su estado y estado de autenticación mediante Supabase y la ruta actual.
- No hay props para configuración externa en este archivo.

## Retorna
- Devuelve un elemento JSX que representa la cabecera (<header>) con:
  - Logo y nombre de la empresa.
  - Enlaces de navegación (Servicios, Capacitación, Reservar).
  - Acciones de usuario (perfil/mostrar nombre y cerrar sesión) o acciones de acceso (Iniciar sesión, Comenzar).
  - Menú móvil (Sheet) con navegación y autenticación.
  - Barra de separación decorativa cuando no está en estado transparente.

Formato devuelto: JSX.Element que compone la interfaz de usuario.

## Dependencias
Librerías, hooks y componentes externos utilizados:

- React
  - useEffect, useState
- Next.js
  - Link (desde next/link)
  - Image (desde next/image)
  - usePathname (desde next/navigation)
- Supabase
  - useSupabase (hook personalizado)
- Autenticación y acciones
  - logout (desde "@/app/(auth)/actions")
- UI components (local)
  - Button (desde "@/components/ui/button")
  - Sheet, SheetContent, SheetTrigger, SheetTitle (desde "@/components/ui/sheet")
- Iconografía
  - Menu (lucide-react)
- Archivos y rutas
  - usePathname para detección de ruta actual
  - rutas: "/catalogo", "/capacitacion", "/reservar", "/dashboard", "/perfil"
- Recursos estáticos
  - /images/logo-rng.webp (logo)
- Tipografías y estilos
  - Clases Tailwind (p. ej., bg-background, text-foreground, border-b-2, etc.)

Notas sobre implementación:
- El componente depende de Supabase para cargar el usuario y su perfil. Si no hay usuario, se ajusta el estado para no mostrar opciones de cuenta.
- La detección de administrador se realiza consultando la tabla profiles con el id del usuario y leyendo el campo role.
- El estado de “transparencia” (transparent) se determina con hasHero y scrolled, afectando el fondo y colores del texto.
- El comportamiento del menú móvil se encapsula en Sheet (panel deslizante) y se mantiene sincronizado al cerrar tras seleccionar un enlace.
- Se manejan efectos asíncronos con banderas isMounted para evitar estados en componentes desasociados durante actualizaciones asíncronas.

## Ejemplos de uso

- Uso básico en una página o layout donde se desee incluir la barra de navegación:
  - Importar y renderizar el componente en la parte superior de la página o layout.
  
Código de ejemplo ( TypeScript / React ):
```tsx
import { Navbar } from "@/components/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

Notas:
- Este componente está diseñado para ser usado como parte de un layout/global header de la aplicación.
- No requiere props y maneja su estado de autenticación de forma interna.

## Notas técnicas

- Registro de estado y efectos:
  - Estados manejados:
    - open: booleano para abrir/cerrar el Sheet del menú móvil.
    - isAuthenticated: indica si hay usuario autenticado.
    - isAdmin: indica si el usuario tiene rol de administrador.
    - displayName: cadena para mostrar en el botón de perfil/usuario.
    - scrolled: booleano que indica si el usuario hizo scroll más allá de 60px (para activar estilos).
  - useEffect para scroll:
    - Se activa solo si hasHero es verdadero (esHome, /catalogo o /capacitacion).
    - Añade listener de scroll y actualiza scrolled (booleano).
    - Limpia el listener en el cleanup.
  - useEffect para carga de usuario:
    - Carga el usuario actual mediante supabase.auth.getUser().
    - Si no hay usuario, resetea estados de autenticación y displayName.
    - Si hay usuario, determina displayName a partir de full_name o first/last name o correo.
    - Consulta a la tabla profiles para obtener first_name, last_name y role; asigna isAdmin si role === "admin".
    - Suscripción a supabase.auth.onAuthStateChange para recargar usuario cuando cambie el estado de autenticación.
    - Usa una bandera isMounted para evitar state updates en un componente ya desmontado.
- Rendimiento y seguridad:
  - Las llamadas a Supabase son asíncronas y se realizan sólo cuando es necesario (estado de autenticación, rol).
  - Evita memory leaks mediante limpieza de listeners y suscripciones en cleanup.
  - La UI evita exponer acciones de autenticación inseguras: el flow de logout se ejecuta mediante un formulario que envía la acción logout.
- Compatibilidad y accesibilidad:
  - Elementos accesibles: uso de sr-only para texto de accesibilidad en el menú móvil.
  - Enlaces activos detectados con path checks (pathname === href o pathname.startsWith(href + "/")) para aplicar estilo de estado activo.
  - Semántica HTML adecuada para header, nav y enlaces.
- Consideraciones de estilos:
  - El diseño utiliza clases de Tailwind para estilos condicionales entre estado “transparente” y “opaco” (bg-transparent vs bg-background).
  - El borde/indicadores de enlace activo se logran con border-b-2 y text-primary.
  - El menú móvil utiliza Sheet para una experiencia de panel deslizante con un trigger de botón tipo ghost.

## Última actualización
29/5/2026

Notas finales
- El archivo está diseñado para integrarse con la arquitectura de RNG Vantage, combinando Next.js, TypeScript y Supabase.
- No introduce dependencias de código externo fuera de las ya existentes en el proyecto; toda la lógica de autenticación y presentación se gestiona dentro de este componente o a través de hooks/componentes reutilizados ya presentes en el proyecto.
- Si se agrega funcionalidad adicional (p. ej., nuevos roles o secciones de navegación), se deberá extender la lógica de autenticación y la configuración de enlaces en navLinks, así como la lógica en la sección móvil para mantener consistencia visual y de flujo de usuario.