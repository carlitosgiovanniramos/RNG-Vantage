# Documentación técnica: components/navbar.tsx

Archivo: navbar.tsx  
Ruta: components/navbar.tsx  
Líneas: 295

Desarrollador: RNG Vantage (sistema de automatización de ventas, reservas y control financiero)  
Tecnologías: Next.js, TypeScript, React, Supabase

---

## Descripción general

El archivo define el componente React de nivel superior Navbar para la aplicación RNG Vantage. Es un componente cliente ("use client") que proporciona:

- una barra de navegación fija en la parte superior de la página,
- navegación de escritorio y un menú móvil adaptable,
- integración con Supabase para mostrar información del usuario autenticado (nombre/rol) y manejar cierre de sesión,
- lógica de visualización dinámica basada en la ruta actual y si hay una sección de héroe en la página,
- un diseño responsive con transiciones y estilos que se adaptan al estado de transparencia/a fondo.

El Navbar presenta opciones de navegación principales (Servicios, Capacitación, Reservar) y, según la autenticación del usuario, muestra acciones para gestionar la sesión o para iniciar sesión/registrarse. En dispositivos móviles, se utiliza un Sheet (panel deslizante) para las opciones de navegación.

---

## Responsabilidades

- Renderizar una barra de navegación fija con logo, enlaces de navegación y acciones de usuario.
- Determinar el modo visual (transparente o fondo) basado en la ruta y el desplazamiento de la página.
- Detectar si la ruta actual corresponde a la página de inicio o a secciones relacionadas para activar estilos (hasHero).
- Manejar el estado de autenticación del usuario mediante la hook useSupabase:
  - obtener usuario actual,
  - extraer nombre para mostrar (nombre completo, nombre corto o correo),
  - verificar si el usuario es administrador (rol === "admin"),
  - adaptar el enlace de cuenta a "/dashboard" o "/perfil".
- Proporcionar un botón de "Cerrar sesión" que invoca la acción de logout.
- Implementar navegación de escritorio con énfasis visual en el enlace activo.
- Proporcionar un menú móvil accesible mediante un Sheet con:
  - logo y título,
  - enlaces de navegación,
  - opciones de autenticación (Iniciar sesión / Registrarse) o nombre de usuario y cierre de sesión.
- Manejar correctamente la suscripción a cambios de autenticación (onAuthStateChange) y prevenir actualizaciones de estado en componentes desmontados (usando isMounted).
- Realizar limpiezas adecuadas de efectos secundarios (removeEventListener, unsubscribe) al desmontar.

---

## Props / Parámetros

Este componente Navbar no recibe props externos. Es un componente React funcional que gestiona su propio estado y depende del contexto de la aplicación (ruta, autenticación, etc.).

Tabla de props (aplicable para un componente React):

| Propiedad | Tipo | Requerido | Descripción |
|---|---|---|---|
| No aplica | - | - | Este componente no recibe props. Indica explícitamente que la personalización se deriva del estado interno y del contexto de la ruta y la autenticación. |

---

## Retorna

El componente Navbar retorna un elemento JSX que representa una cabecera (header) fija en la parte superior de la página. Su estructura principal es:

- Logo y nombre de la empresa como enlace a la página raíz.
- Navegación de escritorio (visible en pantallas medianas y grandes).
- Área de CTAs (Iniciar sesión/Comenzar o nombre de usuario y Cerrar sesión) para escritorio.
- Navegación móvil mediante un Sheet (panel deslizante) con menú, enlaces y acciones de autenticación.
- Línea horizontal decorativa cuando no está en modo transparente.

Formato de retorno: JSX.Element (renderizado en el árbol de React).

---

## Dependencias

Este archivo utiliza varias dependencias internas y externas:

- React (useEffect, useState)
- Next.js:
  - Link (next/link)
  - Image (next/image)
  - usePathname (next/navigation)
- Núcleo de UI del proyecto:
  - Button (componentes/ui/button)
  - Sheet, SheetContent, SheetTrigger, SheetTitle (componentes/ui/sheet)
- Iconografía:
  - Menu (lucide-react)
- Autenticación y datos:
  - logout (desde "@/app/(auth)/actions")
  - useSupabase (hook personalizado)
- Lógica de navegación/estado:
  - navLinks estático dentro del archivo
  - condiciones basadas en pathname
- Registros de estado:
  - Estados locales: open, isAuthenticated, isAdmin, displayName, scrolled
  - Efectos secundarios para scroll y carga de usuario
  - Suscripción a cambios de autenticación (onAuthStateChange) y limpieza

Notas sobre dependencias: se espera que el proyecto tenga configurados los componentes UI (Button, Sheet) y el hook useSupabase para interactuar con la instancia de Supabase.

---

## Ejemplos de uso

Este Navbar está diseñado para ser incluido en el layout o en páginas específicas para que aparezca en todas las vistas. Un ejemplo típico de uso en un layout podría ser:

```tsx
// pages/_app.tsx o layout.tsx (según la estructura del proyecto)
import { Navbar } from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

Notas:
- No requiere props. Se adapta automáticamente según la ruta actual y el estado de autenticación del usuario.
- Se integra con el flujo de autenticación de Supabase y con las rutas definidas para mostrar el nombre del usuario y las acciones correspondientes.

---

## Notas técnicas

- Componente cliente: la presencia de "use client" al inicio indica que es un componente que se ejecuta en el cliente, manejando estado y efectos.
- Gestión de scroll y hero:
  - Tiene un efecto que detecta si hay hero en la página (hasHero) y si el usuario ha hecho scroll para actualizar el estado scrolled.
  - Si hasHero es verdadero, se añade un listener de scroll que actualiza scrolled cuando la posición es mayor a 60 píxeles.
  - El estilo del header cambia según la variable transparent (basada en hasHero y scrolled), alternando entre fondo y transparencia.
- Cálculo de hasHero:
  - hasHero es true si la ruta es "/" (home) o "/catalogo" o "/capacitacion". Esto permite que el Navbar sepa cuándo mostrar un fondo transparente o no.
- Autenticación y perfil de usuario:
  - Al cargar, se consulta supabase.auth.getUser() para obtener el usuario actual.
  - Si no hay usuario, se desactiva la autenticación y se limpia el displayName.
  - Si hay usuario, se intenta extraer el nombre completo desde user_metadata (full_name, first_name, last_name) y construir displayName.
  - Se consulta la tabla "profiles" para obtener first_name, last_name y role. Si el perfil existe y tiene nombre, displayName se actualiza con ese nombre; isAdmin se establece si role === "admin".
  - Se suscribe a cambios de autenticación con supabase.auth.onAuthStateChange para recargar información del usuario cuando cambia el estado de autenticación.
  - Se usa un flag isMounted para evitar actualizar el estado después de desmontaje.
- Enlaces y estado activo:
  - La lógica de navegación activa compara pathname con href o con rutas que empiezan con href + "/".
  - En el enlace activo, se aplica un estilo visual (texto primary y border inferior) para marcar la sección actual.
- Diseño responsive:
  - Desktop: navegación visible solo en md+ (className "hidden md:flex").
  - Mobile: botón de menú que abre Sheet desde la derecha con el contenido del panel; el Sheet incluye enlaces y acciones de autenticación.
- Acciones de usuario:
  - Si está autenticado: se muestran el nombre/usuario y un botón "Cerrar sesión" que envía a la acción logout (form action).
  - Si no está autenticado: se muestran enlaces para iniciar sesión y registrarse.
- Rendimiento y limpieza:
  - Se limpian listeners y suscripciones en los efectos correspondientes para evitar fugas de memoria.
  - Uso de "void" al invocar loadUser desde onAuthStateChange para evitar promesas no gestionadas en este contexto.
- Accesibilidad:
  - El SheetTrigger incluye un botón con clase para dispositivos móviles.
  - Se añaden textos ocultos (sr-only) para describir el objetivo del botón de menú.
- Tipografías y estilos:
  - Se utilizan clases Tailwind (ej., font-spaceGrotesk, text-foreground, bg-primary) para coherencia visual con el resto de la aplicación.
  - El logo y el nombre de la empresa están renderizados mediante Next/Image para optimización.

Limitaciones conocidas:
- Este componente depende de la estructura de rutas y de la API de Supabase tal como está implementada en el proyecto (estructura de perfiles, metadata, y la query a la tabla "profiles"). Si se modifican esos esquemas, el comportamiento podría requerir ajustes.
- El comportamiento de “hasHero” está acoplado a rutas específicas ("/", "/catalogo", "/capacitacion"). Cambios en la navegación podrían requerir actualización de la lógica.

---

## Última actualización

12/5/2026

---

Si necesitas que amplíe alguna sección (por ejemplo, agregar diagramas de flujo de autenticación o un mapa de estados del Navbar), dime y lo añado.