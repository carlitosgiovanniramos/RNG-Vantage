# Documentación técnica: app/(auth)/layout.tsx

Archivo: layout.tsx (Ruta: app/(auth)/layout.tsx)

Última actualización: 12/5/2026

Descripción general
-------------------
AuthLayout es un componente de React utilizado como layout de la sección de autenticación del proyecto RNG Vantage. Implementa una estructura visual con una barra lateral informativa y un panel principal que contiene el contenido de las pantallas de login/registro (o cualquier página hija dentro de la ruta /auth). El layout añade elementos decorativos de fondo y proporciona un enlace para regresar al Panel principal.

Este archivo forma parte del App Router de Next.js y funciona como layout compartido para todas las rutas hijas bajo la carpeta (auth). Por tanto, el contenido de las páginas hijas se inyecta en la posición de {children}.

Responsabilidades
---------------
- Proporcionar una estructura de UI consistente para las pantallas de autenticación.
- Renderizar una barra lateral informativa visible en pantallas grandes y oculta en móvil.
- Ofrecer un panel principal con borde y fondo semitransparente que aloja el contenido de cada página hija.
- Incluir un enlace de navegación para regresar al panel principal y un icono de flecha (ArrowLeft) para claridad de navegación.
- Aplicar estilos visuales mediante Tailwind CSS para mantener coherencia con el diseño de la aplicación (colores, gradients, sombras, etc.).

Props / Parámetros
------------------
| Nombre      | Tipo                      | Requerido | Descripción                                                                                     |
|-------------|---------------------------|-----------|-------------------------------------------------------------------------------------------------|
| children    | React.ReactNode           | Sí        | Contenido de la página hija que se renderiza dentro del panel principal del layout.            |

Retorna
-------
- Un componente React que devuelve un árbol JSX representando el layout de autenticación.
- Estructura principal:
  - Contenedor background con decoraciones (gradientes y formas blurred).
  - Grid responsive con dos áreas: una barra lateral de información (aside) y un panel principal (main).
  - En el panel principal, un botón/enlace de retorno a la página de Panel principal y la renderización de {children}.

Dependencias
------------
- React (tipado con React.ReactNode).
- Next.js (Link desde "next/link" para navegación cliente).
- lucide-react (Icono ArrowLeft).
- Tailwind CSS (clases de estilo para diseño, colores, sombras y comportamiento responsive).
- No se observan dependencias dinámicas o hooks propios en este archivo; es un componente de presentación puro (stateless).

Notas técnicas
-------------
- Diseño responsive:
  - Usa una cuadrícula (grid) con: lg:grid-cols-[1fr_minmax(360px,460px)], lo que significa que en pantallas grandes la página se reparte en dos columnas, y en pantallas pequeñas se ajusta para presentar el contenido de forma vertical.
  - El aside está oculto en pantallas pequeñas (className: "hidden ... lg:flex"), asegurando que la experiencia móvil se centre en el contenido principal.
- Decoración visual:
  - El layout añade varias capas absolutas para efectos visuales (gradientes radial y blur) para enriquecer el fondo sin interferir con el contenido principal.
- Accesibilidad:
  - Se utiliza semantic elements: aside y main para delimitar claramente áreas de información y contenido principal, mejorando la navegación con lectores de pantalla.
  - El enlace de retorno incluye un icono (ArrowLeft) para reforzar la navegación, y está estilizado como botón con texto descriptivo.
- Dependencia de estilo:
  - El estilo depende de Tailwind CSS y de tokens de diseño como bg-background, text-foreground, etc. Específicamente, se utilizan clases con valores en Tailwind para colores, border, sombras y fondos con transparencia.
- Rendimiento:
  - Es un componente estático sin lógica de negocio ni estado, por lo que es eficiente y simple de cachear en renderizados.
  - No realiza llamadas a APIs ni manipulaciones de datos; su función es meramente estructural/estilística.

Ejemplos de uso
--------------
Este layout se ubica en la ruta app/(auth)/layout.tsx, por lo que actúa como layout para todas las páginas hijas de ese segmento. En Next.js App Router, las páginas hijas (por ejemplo, /auth/login, /auth/register) se renderizarán dentro del {children} de este layout.

Ejemplo conceptual de estructura de página hija:
- Archivo: app/(auth)/login/page.tsx
  - Contenido de la página (por ejemplo, formulario de inicio de sesión).

Ejemplo de flujo de renderizado:
- La ruta /auth/login utiliza este layout.
- Next.js renderiza AuthLayout y, dentro de {children}, coloca el contenido de app/(auth)/login/page.tsx.
- Así, la barra lateral informativa está presente en la vista de la página de login, junto con el panel principal que contiene el formulario.

Código de ejemplo ilustrativo (no debe copiarse literalmente aquí, solo para claridad):
- app/(auth)/login/page.tsx
  - export default function LoginPage() {
      return (
        <form>...formulario de inicio de sesión...</form>
      );
    }

Notas adicionales
------------------
- Este archivo no gestiona lógica de negocio ni estados; su propósito es estructurar la UI para las pantallas de autenticación.
- Si se requiere cambiar el diseño para toda la sección de autenticación, modificar este layout afectará a todas las páginas hijas de /auth.
- Asegúrate de que Tailwind CSS esté configurado para admitir valores arbitrarios en clases como bg-[radial-gradient(...)] que se usan en este layout.

Última actualización
-------------------
12/5/2026

---
Si necesitas, puedo adaptar esta documentación para incluir diagramas de flujo o un esquema de árbol de rutas de la carpeta app/ para clarificar visualmente cómo se encaja este layout dentro de la estructura de Next.js App Router.