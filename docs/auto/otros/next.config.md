# Documentación técnica: next.config.ts (RNG Vantage)

 Este archivo define la configuración de Next.js para el proyecto RNG Vantage y la envuelve con el plugin de Serwist para gestionar el service worker de la aplicación. A través de esta capa, se especifican los paths del service worker y el comportamiento en desarrollo frente a producción.

---

## Descripción general

- Archivo: next.config.ts
- Propósito: Configurar Next.js y ampliar su configuración mediante el wrapper de Serwist (@serwist/next) para gestionar el service worker.
- Función principal: Crear una configuración de Next.js que incluye la generación y registro de un service worker, con rutas específicas para el código fuente y el destino del service worker.
- Comportamiento clave:
  - swSrc: ruta del source del service worker (app/sw.ts).
  - swDest: ruta de destino donde se genera el service worker compilado/publicado (public/sw.js).
  - disable: deshabilita la generación del service worker en ambientes de desarrollo (NODE_ENV === "development").

---

## Responsabilidades

- Integrar Serwist con la configuración de Next.js para habilitar un service worker en la aplicación.
- Definir las rutas del service worker:
  - Fuente (swSrc): app/sw.ts
  - Destino (swDest): public/sw.js
- Deshabilitar la generación del service worker en entorno de desarrollo para evitar cachés interferentes durante el desarrollo.
- Exportar la configuración de Next.js resultante para que Next.js la aplique en tiempo de compilación.

---

## Props / Parámetros

Este archivo no es un componente React ni una función exportada directamente, sino un módulo que exporta una configuración de Next.js envuelta por el wrapper de Serwist. A continuación se especifican los parámetros relevantes que se pasan al wrapper y cómo afectan al comportamiento:

- Parámetro del wrapper (contrato de withSerwistInit):
  - swSrc: string
    - Descripción: Ruta al source del service worker.
    - Valor en este archivo: "app/sw.ts"
  - swDest: string
    - Descripción: Ruta de salida donde se genera/coloca el service worker para servir en la aplicación.
    - Valor en este archivo: "public/sw.js"
  - disable: boolean
    - Descripción: Indica si se debe deshabilitar la generación/registración del service worker.
    - Valor en este archivo: process.env.NODE_ENV === "development" (true en desarrollo, false en producción)

- Parámetro de exportación (configuración Next.js):
  - El wrapper withSerwist recibe un objeto de configuración Next.js (p. ej., { /* opciones de Next.js */ }) y devuelve una configuración extendida que Next.js consume.
  - En el código proporcionado, el objeto de configuración de Next.js está vacío para este ejemplo, indicado por el comentario:
    - // Next.js config options here

---

## Retorna

- El archivo exporta por defecto el resultado de withSerwist({...}) aplicado a un objeto de configuración de Next.js.
- Formato devuelto: un objeto de configuración de Next.js (NextConfig), que incluye las opciones de Next.js y la configuración añadida/ajustada por el wrapper de Serwist para la gestión del service worker.
- En tiempo de ejecución durante el build/START, Next.js utiliza este objeto de configuración para construir la aplicación y registrar el service worker (según la configuración y el entorno).

---

## Dependencias

- @serwist/next
  - Proporciona el wrapper para integrar un service worker con Next.js, exponiendo swSrc, swDest y la opción disable.
- Next.js (y su configuración de NextConfig)
- TypeScript (archivo .ts)
- React (implícito si el proyecto usa React con Next.js)

Notas:
- Este archivo no importa otros módulos de negocio; su función es de configuración.
- Es importante que la ruta swSrc exista y apunte al script del service worker (app/sw.ts) y que swDest sea accesible públicamente (public/sw.js).

---

## Ejemplos de uso

- Ejemplo mínimo de configuración de Next.js integrando el wrapper de Serwist (tal como se encuentra en el archivo):

  - El wrapper se inicializa con las rutas del service worker y la condición de desactivación en desarrollo.
  - Se exporta el resultado al final para que Next.js lo consuma.

- Ejemplo de cómo ampliar la configuración de Next.js (agregar opciones de Next.js dentro del objeto pasado a withSerwist):

  - export default withSerwist({
      reactStrictMode: true,
      poweredByHeader: false,
      // otras opciones de Next.js...
    });

Notas de uso:
- En desarrollo, ya está configurado para deshabilitar la generación/uso del service worker. Si necesitas pruebas específicas de SW en dev, ajusta el valor de disable.
- En producción, se genera y sirve el service worker en public/sw.js a partir de app/sw.ts.

---

## Notas técnicas

- Ubicación del service worker:
  - swSrc: app/sw.ts
  - swDest: public/sw.js
  - Esto implica que el código fuente del service worker reside en app/sw.ts y, durante el build, Serwist genera/publica el service worker en public/sw.js para que el navegador lo registre.
- Comportamiento en entornos:
  - disable se evalúa con process.env.NODE_ENV === "development". En desarrollo, el service worker no se genera ni registra para evitar caching inesperado durante el desarrollo.
- Compatibilidad/consideraciones:
  - Este enfoque asume que el proyecto usa Next.js con un sistema de build que soporta wrappers de configuración (como el wrapper de Serwist).
  - Asegúrate de que las rutas y el flujo de build sean compatibles con la forma en que Serwist inyecta/o genera el service worker.
- Rendimiento:
  - La generación del service worker se realiza en build/start según lo configurado. En producción, el SW puede acelerar la carga y la experiencia offline, siempre que app/sw.ts esté correctamente implementado.
- Mantenimiento:
  - Si cambias rutas de SW o el destino, actualiza swSrc y swDest en este archivo para que el wrapper genere correctamente el service worker.

---

## Última actualización

- 29/5/2026

Si necesitas adaptar este archivo a un flujo particular (por ejemplo, añadir more Next.js config options o ajustar el comportamiento del service worker), indícame qué opciones quieres exponer y te ayudo a incorporarlas de forma segura.