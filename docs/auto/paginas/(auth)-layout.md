# Documentación técnica: app/(auth)/layout.tsx

Archivo: layout.tsx (Ruta: app/(auth)/layout.tsx)

Propósito general:
AuthLayout es un componente de layout utilizado en la sección de autenticación de la aplicación RNG Vantage. Proporciona una estructura visual coherente para las pantallas de acceso (login/registro) con una columna de presentación atractiva en pantallas amplias y una experiencia optimizada para dispositivos móviles. El layout envuelve el contenido de la página (children) con estilos, gráficos de fondo, y una navegación ligera hacia el panel principal.

## Descripción general
AuthLayout renderiza una estructura de dos columnas (en pantallas grandes) con:
- Una columna lateral opcional (aside) que contiene branding, explicaciones y una imagen decorativa.
- Un área principal (main) que contiene un enlace para volver al panel principal y el contenido proporcionado por children.
- Elementos decorativos en el fondo (gradientes, círculos, sombras) para un aspecto moderno.

El diseño está implementado con Tailwind CSS (clases utilitarias) y utiliza componentes de Next.js (Link, Image) y un icono de lucide-react (ArrowLeft).

## Responsabilidades
- Proveer un layout consistente para las pantallas de autenticación (login/registro) de la app.
- Envolver y presentar el contenido específico de cada página de autenticación a través de {children}.
- Ofrecer navegación rápida de regreso al panel principal desde la página de autenticación.
- Incluir elementos visuales de fondo y branding que refuerzan la identidad de la marca.
- Asegurar que el layout se adapte a diferentes tamaños de pantalla (columna lateral en lg, oculto en tamaños pequeños).

## Props / Parámetros
Tabla de props del componente React:

- nombre: children
  - Tipo: React.ReactNode
  - Requerido: Sí
  - Descripción: Contenido principal que se renderiza dentro del layout en la sección de <main>. Este contenido típicamente corresponde a formularios de autenticación (login/registro) u otros componentes de autenticación.

Notas:
- Este componente no expone otros props. Todo su comportamiento y contenido externo se gestiona a través de los children.

## Retorna
- Tipo: JSX.Element
- Descripción: Un árbol React que representa el layout de autenticación. Consta de una estructura de divs con elementos decorativos y una zona donde se renderiza el contenido recibido por children. Incluye un enlace para volver al panel principal y un aside informativo visible en pantallas grandes.

## Dependencias
Bibliotecas y componentes externos utilizados:

- Next.js
  - Link: para navegación hacia la ruta principal ("/").
  - Image: para mostrar la imagen decorativa (/images/auth-vantage.gif). Nota: utiliza la propiedad unoptimized.
- lucide-react
  - ArrowLeft: icono mostrado junto al enlace de regreso al panel principal.
- React
  - React.ReactNode: tipado de las props.
- Tailwind CSS (clases utilitarias)
  - Varios estilos para diseño responsivo, sombras, bordes, fondos y efectos visuales.
- Recursos de proyecto
  - /images/auth-vantage.gif: imagen decorativa del layout.

Notas técnicas sobre dependencias:
- El componente depende del tema/color palette definido en las clases como bg-background, text-foreground, border-border, etc. Estas variantes deben estar definidas en la configuración de Tailwind del proyecto.
- El layout utiliza un grid con lg:grid-cols-[1fr_minmax(360px,460px)], permitiendo una columna flexible para el contenido y una columna lateral con ancho mínimo/máximo específico en pantallas grandes.
- El uso de Image con unoptimized implica que la imagen no pasa por la optimización de Next.js (caching, resizing dinámico). Se utiliza aquí probablemente para mantener un tamaño fijo y evitar transformaciones en tiempo de ejecución.

## Ejemplos de uso

Nota: En Next.js App Router, este layout se aplica automáticamente a las rutas hijas de app/(auth)/. Aún así, a continuación se muestran dos ejemplos: uno típico de uso dentro de la jerarquía de Next.js y otro uso aislado para fines de documentación.

Ejemplo típico en Next.js App Router (uso recomendado):
- Ubicación: app/(auth)/login/page.tsx
- Comportamiento: la página de login se renderiza dentro del AuthLayout sin necesidad de importar explícitamente el layout en cada página; Next.js lo aplica automáticamente.

Ejemplo aislado (propósito demostrativo, no representa la estructura de enrutamiento):
- Código:
 
  import AuthLayout from './layout'; // Ruta relativa al layout dentro del proyecto

  function DemoLoginContent() {
    return (
      <form>
        {/* Contenido del formulario de ejemplo */}
        <label>Email</label>
        <input type="email" />
        <label>Contraseña</label>
        <input type="password" />
        <button type="submit">Iniciar sesión</button>
      </form>
    );
  }

  export default function DemoAuthLayoutUsage() {
    return (
      <AuthLayout>
        <DemoLoginContent />
      </AuthLayout>
    );
  }

Notas sobre el uso correcto en la aplicación:
- El layout está diseñado para envolver las páginas de autenticación. En la estructura de Next.js App Router, las rutas bajo app/(auth)/ tendrán este layout aplicado de forma automática, y el contenido de cada página se entrega a través del prop children.

## Notas técnicas
- Diseño y estilo:
  - El layout utiliza una capa de fondo con gradientes radiales y varios elementos decorativos (círculos borrosos) para un look moderno.
  - El aside contiene branding (“RGL Estudio”) y un bloque informativo con texto de accesibilidad y seguridad.
  - El main incluye un enlace de navegación hacia el panel principal y renderiza el contenido pasado como children.
- Responsividad:
  - La estructura principal es una grid con esquema lg:grid-cols-[1fr_minmax(360px,460px)]. En pantallas grandes, la columna de la izquierda (aside) se muestra; en pantallas pequeñas, el aside está oculto y solo se renderiza el área central.
- Accesibilidad:
  - El enlace de regreso al panel principal utiliza un icono (ArrowLeft) acompañado de texto claro.
  - Uso semántico básico: aside para información secundaria y main para el contenido principal.
- Rendimiento y mantenimiento:
  - Imagen decorativa usa unoptimized para evitar transformaciones de Next.js; si se desea optimización, podría habilitarse mediante roces de Next/Image sin cambiar el diseño.
  - Las decoraciones de fondo son elementos puramente visuales y no deben bloquear la experiência de usuario. Son elementos absolutely posicionados para no afectar el flujo principal.
- Limitaciones conocidas:
  - El aside solo se muestra en pantallas grandes (lg). En dispositivos pequeños, la experiencia se centra en el contenido de autenticación.
  - Al ser un layout, las variaciones de contenido deben gestionarse a través de los children; cualquier estado de autenticación debe implementarse dentro de las páginas hijas.

## Última actualización
29/5/2026

Si necesitas adaptar el layout para un caso de autenticación distinto (p. ej., registro o recuperación de contraseña), puedes reusar este componente y proporcionar el contenido específico a través del prop children, manteniendo la consistencia visual y de marca de la aplicación RNG Vantage.