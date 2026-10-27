# Documentación técnica: components/catalogo-hero.tsx

Archivo: components/catalogo-hero.tsx  
Tipo: Componente React (Next.js, TypeScript)

Resumen rápido
- Es un componente de tipo React que renderiza una sección hero con fondo de imagen, superposición oscura y texto descriptivo alineado al final de la vista.
- No recibe props; todo el contenido es estático dentro del componente.
- Emplea Next.js Image para manejo optimizado de imágenes y Tailwind CSS para estilos.

## Descripción general
CatalogoHero es un componente que genera una sección “hero” (portada) para la página de servicios del catálogo. Presenta una imagen de fondo de alta cobertura, una capa de superposición semitransparente para mejorar la legibilidad y un bloque de texto descriptivo ubicado en la parte inferior de la hero. El diseño utiliza posicionamiento relativo/absoluto y utilidades de Tailwind para lograr el efecto visual deseado.

Estructura principal:
- Contenedor principal con posición relativa y altura de pantalla completa (h-screen).
- Imagen de fondo con fill, cubriendo todo el área y manteniendo el enfoque mediante object-cover y un ajuste de posición.
- Capa de overlay negro semitransparente.
- Contenido textual dentro de un contenedor situado por encima de la overlay, con z-index alto para asegurar visibilidad.

## Responsabilidades
- Renderizar una hero estática con imagen de fondo y texto descriptivo.
- Garantizar legibilidad mediante una superposición oscura.
- Asegurar que la imagen de fondo cargue de forma eficiente (priority) y que ocupe todo el ancho y alto del contenedor.
- Mantener diseño responsive con ajustes de padding y tamaño de fuente mediante Tailwind.

## Props / Parámetros
Este componente no recibe props. Es completamente estático y no expone entradas configurables.

| Nombre | Tipo | Requerido | Descripción |
| - | - | - | - |
| N/A | N/A | N/A | Este componente no recibe props. |

## Retorna
- Un React element que representa un bloque div que contiene:
  - Una imagen de fondo (Next/Image) que usa layout fill para cubrir toda la hero.
  - Una capa de overlay negro semi-transparente.
  - Un bloque de texto con título y descripción, ubicado al fondo de la vista (flex container con justify-end).
- Formato devuelto: JSX.Element.

## Dependencias
- React (biblioteca base de React).
- Next.js (componente Image desde "next/image" para optimización de imágenes).
- Tailwind CSS (clases utilitarias para estilos y diseño responsive).
- Imagen estática: /images/catalogo-hero.webp (recurso utilizado como fondo).
- Otros: No se importan hooks, servicios o componentes externos adicionales.

Notas sobre dependencias y configuración:
- El componente utiliza el atributo fill de next/image, por lo que el contenedor padre debe tener posición relativa y dimensiones definidas (ya lo tiene: w-full, h-screen, overflow-hidden).
- La clase object-[center_80%] es una utilidad de Tailwind con valor arbitrario para controlar la posición de la imagen de fondo.
- La capa overlay utiliza bg-black/50 para aplicar opacidad y mejorar la legibilidad del texto.

## Ejemplos de uso
Una forma típica de usar este componente en una página:

```tsx
import { CatalogoHero } from "@/components/catalogo-hero";

export default function ServiciosPage() {
  return (
    <main>
      <CatalogoHero />
      {/* Otros componentes de la página */}
    </main>
  );
}
```

Notas:
- El componente está exportado como named export: `export function CatalogoHero() { ... }`, por lo que debe importarse con `{ CatalogoHero }`.

## Notas técnicas
- Rendimiento y carga:
  - Se utiliza Next/Image con la prop `priority`, lo que indica al motor de optimización que esta imagen debe cargarse de forma prioritaria.
  - La prop `sizes="100vw"` ayuda al navegador a elegir el formato de imagen adecuado para la anchura de la ventana.
  - La imagen usa `fill` para cubrir todo el contenedor; el contenedor padre debe controlar su tamaño (en este caso, `w-full h-screen`).
- Diseño y estilo:
  - El contenedor utiliza `-mt-[90px]` para desplazar visualmente el hero hacia arriba, creando un efecto de superposición con la sección anterior (comportamiento que podría requerir ajuste en diferentes resoluciones o al integrar con cabeceras fijas).
  - El overlay `bg-black/50` crea contraste para el texto blanco y asegura legibilidad independientemente de la imagen de fondo.
  - El bloque de texto está ubicado al final del contenedor con `flex` y `justify-end`, y se mantiene por encima de la overlay con `z-10`.
  - El uso de utilidades como `text-4xl sm:text-6xl md:text-8xl` y otros tamaños de fuente soporta responsive scaling.
- Consideraciones de accesibilidad:
  - Imagen recibe un atributo `alt` descriptivo: "RGL Estudio — Servicios".
  - El texto es legible gracias al overlay; sin embargo, si se cambia la imagen de fondo, conviene revisar contraste.
- Limitaciones:
  - Es un componente estático; para contenido dinámico (tipos de servicio, variaciones de texto o imágenes diferentes por página) se requeriría habilitar props y lógica de contenido.

## Última actualización
29/5/2026

---

Si necesitas que el componente acepte props para personalizar el título, la descripción o la imagen de fondo, puedo proponerte una versión con props tipadas en TypeScript y ejemplos de uso.