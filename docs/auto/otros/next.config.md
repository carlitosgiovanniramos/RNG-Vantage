# next.config.ts – RNG Vantage

Documento técnico para comprender el comportamiento de este archivo de configuración de Next.js.

## Descripción general
Este archivo configura la integración de Serwist con Next.js para el proyecto RNG Vantage. Utiliza el wrapper de @serwist/next para generar y registrar un service worker a partir de la fuente especificada (swSrc) y desplegarlo en la carpeta pública (swDest). Además, desactiva el service worker durante el entorno de desarrollo para evitar registros en desarrollo.

En resumen, este archivo:
- Inicializa la configuración de Serwist con rutas de service worker.
- Envuelve la configuración de Next.js para exportar un NextConfig ya compatible con Serwist.
- Controla si el service worker debe estar activo según NODE_ENV.

## Responsabilidades
- Configurar Serwist con las rutas de origen y destino del service worker.
- Determinar si el service worker debe estar deshabilitado en desarrollo.
- Exportar la configuración de Next.js ya envuelta por Serwist para que la aplicación la consuma al construir/run.

## Props / Parámetros
Este archivo no define componentes React, sino que utiliza dos niveles de configuración:

- withSerwistInit (parámetros usados para inicializar Serwist):
  - swSrc: string
    - Descripción: Ruta relativa al source del service worker dentro del proyecto.
    - Valor actual: "app/sw.ts"
  - swDest: string
    - Descripción: Ruta de salida donde se generará el service worker compilado.
    - Valor actual: "public/sw.js"
  - disable: boolean
    - Descripción: Bandera que desactiva el service worker en el entorno de desarrollo.
    - Valor actual: proceso.env.NODE_ENV === "development"

- withSerwist (parámetros de la configuración de Next.js que se envuelve):
  - El objeto pasado a withSerwist() es la configuración de Next.js (NextConfig). En el código hay un placeholder:
    - // Next.js config options here
  - Descripción: Aquí irían las opciones habituales de Next.js (p. ej., reactStrictMode, images, etc.). En el archivo de ejemplo están omitidas, pero el wrapper espera un objeto de configuración de Next.js.

## Retorna
- La exportación por defecto es el resultado de llamar a withSerwist(...) con la configuración de Next.js.
- Formato: Next.js configuration object (NextConfig) ya envuelto por Serwist.
- En consecuencia, el archivo devuelve un objeto de configuración que Next.js puede consumir para inicializar la aplicación, con la integración de Serwist para manejo de service workers.

## Dependencias
- @serwist/next
  - Proporciona el wrapper para integrar Serwist con Next.js, gestionando la generación y el registro del service worker.
- Next.js (y sus tipos de configuración)
  - Permite exportar una configuración de NextConfig desde next.config.ts.
- Node.js (process.env)
  - La evaluación de NODE_ENV se usa para deshabilitar el service worker en desarrollo.

## Ejemplos de uso
A continuación se muestran ejemplos concretos de cómo podría verse este archivo funcionando en diferentes entornos:

- Ejemplo 1: Construcción en producción (service worker activo)
  - La configuración actual ya habilita el service worker cuando NODE_ENV no es "development".
  - Comportamiento esperado:
    - swSrc ("app/sw.ts") se utiliza para generar la versión compilada del service worker.
    - El archivo generado se coloca en "public/sw.js".
    - Al ejecutar la app en producción, la aplicación registrará el service worker desde /sw.js.

- Ejemplo 2: Desarrollo (service worker desactivado)
  - En desarrollo, la expresión disable: process.env.NODE_ENV === "development" se evalúa a true.
  - Comportamiento esperado:
    - El service worker no se genera ni se registra durante el desarrollo.
    - Puedes utilizar la ruta de desarrollo sin que el service worker interfiera en pruebas locales.

- Ejemplo 3: Añadir opciones de Next.js dentro del wrapper
  - Este archivo puede extenderse con opciones de Next.js dentro del objeto pasado a withSerwist:
    - export default withSerwist({
        reactStrictMode: true,
        images: { domains: ["example.com"] },
      });

  Nota: El ejemplo asume que se añaden opciones reales de Next.js en lugar del comentario placeholder.

## Notas técnicas
- Ubicación y propósito de los archivos:
  - swSrc: "app/sw.ts" indica la fuente del service worker en TypeScript dentro de la carpeta app.
  - swDest: "public/sw.js" define dónde se colocará el service worker generado para que pueda ser servido estáticamente desde la ruta raiz /sw.js.
- Comportamiento en dev vs prod:
  - disable está ligado a NODE_ENV. En desarrollo, el service worker queda desactivado para evitar registros y posibles interferencias en el flujo de desarrollo.
  - En producción, se espera que Serwist genere y registre el service worker, habilitando las funcionalidades de caché y offline proporcionadas por el SW.
- Tipado y consistencia:
  - El archivo usa TypeScript (next.config.ts) y exporta un NextConfig envuelto por Serwist. Las opciones de Next.js deben respetar el tipo NextConfig.
- Rendimiento y mantenimiento:
  - Mantener actualizada la dependencia @serwist/next es recomendable para aprovechar mejoras en la integración de service workers.
  - Cualquier cambio en los paths swSrc o swDest debe reflejarse en este archivo para evitar errores en la generación o en el registro del service worker.

## Última actualización
12/5/2026

Si necesitas ajustar opciones específicas de Next.js o cambiar rutas del service worker, dime qué configuraciones deseas y las incorporo en la documentación o en un ejemplo de código.