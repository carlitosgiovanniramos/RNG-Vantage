# Documentación técnica: components/catalogo-hero.tsx

Archivo: catalogo-hero.tsx  
Ruta: components/catalogo-hero.tsx  
Líneas: 33

Resumen rápido
- Componente funcional de React/TypeScript que renderiza un hero de catálogo con una imagen de fondo, una superposición oscura y texto descriptivo. Está diseñado para ser utilizado como encabezado de la sección de servicios del sitio RNG Vantage.

## Descripción general
CatalogoHero es un componente de presentación (UI) que muestra un héroe con una imagen de fondo, una capa de overlay semitransparente y contenido textual en la parte inferior. La imagen se adapta al tamaño de la pantalla y se optimiza para carga con Next.js Image (priority). Está implementado con clases de Tailwind CSS para lograr el layout responsivo y las transiciones visuales.

Estructura principal del DOM (resumen):
- Contenedor externo: div relativo con negative top margin y tamaño de pantalla completa.
- Imagen de fondo: componente Image de Next.js con fill y object-cover, que llena el contenedor.
- Overlay: div absoluto que oscurece la imagen.
- Contenido: div relativo con z-index alto que alinea el texto en la parte inferior, incluyendo subheading, título y descripción.

## Responsabilidades
- Proporcionar un hero visual para la sección de Servicios del catálogo.
- Cargar y mostrar una imagen de fondo optimizada para SEO y rendimiento (priority).
- Asegurar legibilidad del texto mediante una overlay oscura.
- Soportar diseño responsive con cambios en tamaños de fuente y espaciado.

## Props / Parámetros
Este componente no recibe props. Es un componente autónomo que renderiza un contenido fijo.

- Pruebas técnicas relacionadas:
  - No hay props públicos.
  - No utiliza hooks externos ni estado local.

## Retorna
- Un React element (JSX) que representa el hero de la página.
- Formato devuelto: JSX.Element que contiene:
  - Un contenedor principal con posicionamiento relativo.
  - Un componente Image de Next.js configurado con fill y priority.
  - Un overlay negro semitransparente.
  - Contenido textual con jerarquía semántica (p, h1, p) y estilo responsivo.

## Dependencias
- next/image: para optimización de imágenes (componente Image con propiedades fill, priority, sizes, etc.).
- React + TypeScript: componente funcional en TSX.
- Tailwind CSS (implícito): clases de utilidad usadas para layout, espaciado, tipografía y colores (por ejemplo, relative, -mt-[90px], w-full, h-screen, overflow-hidden, z-10, etc.).
- Imagen pública: /images/catalogo-hero.webp debe estar disponible en la carpeta public.

Notas de implementación:
- La imagen usa fill para cubrir el contenedor; el contenedor padre debe ser relativo y con dimensiones definidas (en este caso, w-full h-screen).
- El overlay se implementa con un div absoluto que cubre todo el contenedor y aplica un color negro con opacidad (bg-black/50).
- El contenido textual está en un contenedor con z-10 para garantizar que quede por encima del overlay e imagen.
- Propiedades de la imagen:
  - src: "/images/catalogo-hero.webp"
  - alt: "RGL Estudio — Servicios" (accesibilidad)
  - fill: rellena el contenedor
  - sizes: "100vw" (optimiza carga según ancho de viewport)
  - priority: carga prioritaria
- Estilos de tipografía y espaciado están definidos con clases Tailwind, con textos responsivos (text-5xl, sm:text-6xl, md:text-8xl, etc.).

## Ejemplos de uso
Ejemplo mínimo de uso dentro de una página o componente React:

```tsx
import { CatalogoHero } from "../components/catalogo-hero";

export default function ServiciosPage() {
  return (
    <main>
      <CatalogoHero />
      {/* Otros componentes de la página... */}
    </main>
  );
}
```

Notas:
- Asegúrate de que la ruta de importación coincida con la estructura de tu proyecto.
- Verifica que el archivo público /images/catalogo-hero.webp exista en la carpeta public.

## Notas técnicas
- Rendimiento y accesibilidad:
  - La imagen tiene atributo alt para describir el contenido visual.
  - priority está activado para la imagen de hero para optimizar la carga perceptual.
- Rendimiento visual:
  - El overlay negro semitransparente facilita la legibilidad del texto sobre la imagen.
  - El conjunto de textos utiliza una jerarquía clara (p pequeño → h1 grande → párrafo) para mejorar la legibilidad.
- Responsividad:
  - El título principal utiliza escalas de tamaño (text-5xl, sm:text-6xl, md:text-8xl) para adaptarse a distintos tamaños de pantalla.
  - Los padding y layout están ajustados con breakpoints (px-4 sm:px-8 lg:px-16, pt-[90px], etc.) para mantener el contenido legible en dispositivos móviles y de escritorio.
- Dependencias de estilo:
  - Requiere Tailwind CSS (o un set equivalente de utilidades) para interpretar las clases usadas.
- Limitaciones:
  - No es parametrizable a través de props; el texto y la imagen están codificados en el componente. Para reutilizar en otros contextos, se requeriría refactorizar para aceptar props (texto, imagen, etc.).

## Última actualización
12/5/2026

Observaciones finales
- Este componente está diseñado para ser el hero de la sección de Servicios del catálogo. Si en el futuro se necesita reutilizarlo con diferentes textos o imágenes, considerar refactorizar para aceptar props (por ejemplo, titulo, subtitulo, descripción, srcImagen). Además, si se pretende eliminar la dependencia de Tailwind, habría que reemplazar las clases con CSS modular o styled-components.