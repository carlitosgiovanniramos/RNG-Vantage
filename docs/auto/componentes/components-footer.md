# Documentación técnica: components/footer.tsx

Archivo: footer.tsx  
Ruta: components/footer.tsx  
Longitud: 37 líneas

Contenido relevante del componente
- El archivo exporta un componente React llamado Footer.
- Usa Next.js Link para vínculos internos.
- Estilizado con clases tipo utility (parecen de Tailwind CSS), con soporte para modo claro/oscuro mediante las variantes dark: en las clases.
- Estructura del DOM:
  - Footer principal con fondo y colores adaptables a modo claro/oscuro.
  - Contenedor interno con diseño responsive (flex en columna en mobile y fila en md+), alineación centrada y tamaño máximo de ancho.
  - Secciones: Logo, Enlaces legales (Política de Privacidad y Términos de Servicio) y Copyright.

## Descripción general
Footer es un componente estático que renderiza la sección inferior de la página. Proporciona:
- Identidad de la marca en formato texto estilizado ("RGL Estudio").
- Enlaces legales internos a políticas de privacidad y términos de servicio (ambos navegables internamente mediante Next.js Link).
- Información de derechos de autor.

El diseño es responsive: los elementos se apilan en columna en pantallas pequeñas y se disponen en fila en pantallas medianas y mayores. También está preparado para modo oscuro, invirtiendo colores entre el modo claro y oscuro.

## Responsabilidades
- Renderizar una barra de pie de página consistente en todas las páginas que lo utilicen.
- Proporcionar navegación interna a políticas y términos del servicio.
- Mantener consistencia visual con el resto del sitio mediante el uso de clases utilitarias.
- Soportar modo oscuro mediante variantes de clase (dark:).

## Props / Parámetros

Propiedades del componente Footer
| Propiedad | Tipo | Requerido | Descripción |
|---|---|---|---|
| Ninguna | N/A | N/A | Este componente no recibe props. Está diseñado para ser utilizado tal cual como un bloque estático de UI. |

Nota: No se esperan props para este componente; su contenido es estático (texto de logo, enlaces y copyright).

## Retorno

- Tipo: JSX.Element (componente React)
- Estructura devuelta:
  - footer (contiene un div de contención)
    - Div contenedor con tres secciones:
      - Logo: div con texto "RGL Estudio" estilizado.
      - Legal Links: nav con dos enlaces internos:
        - Política de Privacidad → /politica-privacidad
        - Términos de Servicio → /terminos-servicio
      - Copyright: texto estático © 2026 RGL Estudio. All rights reserved.
- Formato: JSX/HTML semántico con enlaces navegables internamente.

## Dependencias

- next/link: para navegación interna (componente Link).
- React: base para el componente.
- Clases CSS utilitarias (parecen Tailwind CSS):
  - Estilos de diseño responsive (flex, md:, etc.)
  - Estilos de color y modo oscuro (bg-*, text-*, dark:*)
  - Atributos de tipografía y espaciado (font-, uppercase, tracking-widest, px-/py-)
- No depende de datos externos ni de hooks de estado; es un componente puramente presentacional.

## Ejemplos de uso

Ejemplo mínimo de uso dentro de una página o layout:

```tsx
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <div>
      {/* Contenido de la página */}
      
      {/* Footer fijo en la página */}
      <Footer />
    </div>
  );
}
```

Notas:
- Asegúrate de que tu proyecto tenga Tailwind CSS configurado (o el sistema de utilidades equivalente) para que las clases se apliquen correctamente.
- Si tu estructura de rutas cambia, actualiza los href de los Link internos en el componente.

## Notas técnicas

- Diseño responsive:
  - El contenedor utiliza flexbox con dirección columna en dispositivos pequeños y fila en tamaños md y superiores.
  - Se aplica un ancho máximo de 1440px y relleno horizontal/vertical para un espaciado consistente.
- Estilo y modo oscuro:
  - El footer soporta modo claro y oscuro mediante las variantes dark:. Por ejemplo:
    - bg-[#2c2f2e] para el fondo en modo claro y dark:bg-[#f5f7f5] para el modo oscuro.
    - text colores adaptados con dark:text-...
  - El logo y el texto usan la fuente "font-spaceGrotesk" (clase) y mayúsculas con tracking ancho para una estética de branding.
- Accesibilidad:
  - Se usa un elemento semántico nav para el conjunto de enlaces legales.
  - El contenido visual es estático; si en el futuro se añaden props dinámicos, considerar roles o aria-labels para mayor accesibilidad.
- Limitaciones:
  - No hay props para personalización de textos o enlaces desde fuera del componente; cualquier cambio requeriría editar el archivo.
  - Las URLs de políticas están hardcodeadas; para internacionalización o configuración, podría externalizarse.

## Última actualización
29/5/2026

Si necesitas adaptar este footer a un proyecto diferente (por ejemplo, cambiar el branding, enlaces o estilos), puedo ayudarte a parametrizar el componente o a extraer constantes para facilitar su reutilización.