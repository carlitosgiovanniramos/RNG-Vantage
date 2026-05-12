# Documentación técnica: playwright.config.ts

Archivo: playwright.config.ts  
Ruta: raíz del proyecto RNG Vantage

Fecha de última actualización: 12/5/2026

---

## Descripción general

Este archivo define la configuración de Playwright para las pruebas end-to-end (e2e) de RNG Vantage. Implementa un conjunto de opciones que controlan:

- Dónde se ejecutan las pruebas y su paralelismo
- Comportamiento en entornos de Continuous Integration (CI)
- El formato y alcance de los reportes
- Los entornos de ejecución (navegadores y dispositivos)
- Un servidor web que arranca la aplicación durante las pruebas

En conjunto, permite ejecutar pruebas automatizadas sobre la aplicación en dos entornos de navegador: un escritorio Chrome y un dispositivo móvil simulado (Pixel 5), asegurando consistencia entre desarrollo y CI.

---

## Responsabilidades

- Configurar el directorio de pruebas: ubicar y ejecutar tests desde ./e2e.
- Controlar el paralelismo y el comportamiento en CI:
  - Ejecutar pruebas de forma completamente paralela.
  - Forzar la prohibición de utilizar test.only en CI.
  - Configurar reintentos y número de trabajadores según entorno (CI vs desarrollo).
- Definir la salida de reportes: generar un reporte HTML.
- Establecer un entorno de pruebas común:
  - Base URL de la aplicación bajo prueba.
  - Trazas de depuración durante reintentos.
- Especificar proyectos de pruebas para diferentes navegadores/dispositivos.
- Iniciar un servidor web para servir la aplicación durante las pruebas y reutilizarlo cuando corresponda.

---

## Props / Parámetros

A continuación se describen las principales opciones de configuración utilizadas en este archivo. Aunque no son componentes React ni funciones tradicionales, estos son los parámetros de configuración de Playwright que determinan el comportamiento del runner.

- testDir: string
  - Descripción: Ruta del directorio que contiene las pruebas e2e.
  - Valor en el archivo: "./e2e"

- fullyParallel: boolean
  - Descripción: Permite que todas las pruebas se ejecuten en paralelo entre sí.
  - Valor en el archivo: true

- forbidOnly: boolean
  - Descripción: Si está en true, evita que se ejecuten pruebas marcadas con .only (útil en CI para evitar ejecuciones accidentales).
  - Valor en el archivo: !!process.env.CI (true si CI está definido, false en desarrollo)

- retries: number
  - Descripción: Número de reintentos por prueba en caso de fallo.
  - Valor en el archivo: process.env.CI ? 2 : 0 (2 en CI, 0 en local)

- workers: number | undefined
  - Descripción: Número de workers concurrentes. Si no definido, Playwright gestiona un valor por defecto.
  - Valor en el archivo: process.env.CI ? 1 : undefined (1 en CI, undefined en desarrollo)

- reporter: string
  - Descripción: Formato del reporte de pruebas.
  - Valor en el archivo: "html"

- use: object
  - Descripción: Configuración global para cada prueba.
  - Subparámetros:
    - baseURL: string
      - Descripción: URL base para las páginas probadas.
      - Valor en el archivo: "http://localhost:3000"
    - trace: string
      - Descripción: Configuración de trazas para depuración y diagnóstico.
      - Valor en el archivo: "on-first-retry" (captura trazas en el primer reintento)

- projects: array
  - Descripción: Conjunto de proyectos de prueba para cubrir diferentes navegadores/dispositivos.
  - Estructura de cada proyecto:
    - name: string
      - Descripción: Nombre del proyecto (p. ej., "chromium", "mobile-chrome")
      - Valores en el archivo: "chromium" y "mobile-chrome"
    - use: object
      - Descripción: Configuración de dispositivo o navegador para el proyecto.
      - Valores en el archivo:
        - chromium: {...devices["Desktop Chrome"]} (Desktop Chrome)
        - mobile-chrome: {...devices["Pixel 5"]} (Pixel 5)

- webServer: object
  - Descripción: Configuración para arrancar un servidor web que sirva la aplicación durante las pruebas.
  - Subparámetros:
    - command: string
      - Descripción: Comando para iniciar el servidor de desarrollo.
      - Valor en el archivo: "npm run dev"
    - url: string
      - Descripción: URL a la que Playwright esperará que el servidor esté disponible.
      - Valor en el archivo: "http://localhost:3000"
    - reuseExistingServer: boolean
      - Descripción: Si es verdadero, reutiliza un servidor ya existente en lugar de iniciar uno nuevo (útil en entornos no CI).
      - Valor en el archivo: !process.env.CI (true cuando no está en CI)

Observaciones:
- Los dispositivos usados son presets de Playwright:
  - Desktop Chrome (Desktop Chrome)
  - Pixel 5 (emulación de dispositivo móvil)
- La URL base coincide con el servidor de desarrollo configurado en webServer, y la ruta del servidor es http://localhost:3000.

---

## Retorna

Este archivo no exporta una función que retorne un valor. En su lugar, exporta por defecto una configuración de Playwright mediante defineConfig. Playwright lee y utiliza este objeto de configuración al ejecutar los tests. En consecuencia, no hay un valor de retorno en tiempo de ejecución; sí hay un objeto de configuración que Playwright consume para orquestar la ejecución de las pruebas.

---

## Dependencias

- @playwright/test
  - Proporciona la API de Playwright Test, utilería defineConfig y el manejo de dispositivos (devices).
- Playwright Devices
  - Todos los presets utilizados provienen de devices (Desktop Chrome, Pixel 5).
- NPM/Yarn y Node.js
  - Entorno de ejecución para ejecutar npm run dev y npx playwright test.

Notas:
- El comportamiento depende de la variable de entorno CI:
  - CI definido: retrys=2, workers=1, forbidOnly=true
  - no CI: retrys=0, workers undefinido (valor por defecto de Playwright)

---

## Ejemplos de uso

- Ejecutar pruebas E2E locales (con el servidor de desarrollo arrancando automáticamente):
  - npx playwright test
  - Este comando utilizará el testDir "./e2e", ejecutará en paralelo, lanzará el servidor con "npm run dev" y capturará trazas en el primer reintento si falla.

- Ejecutar pruebas en CI (con configuración específica para CI):
  - CI=true npx playwright test
  - Se emplearán 1 worker, 2 reintentos y forbidOnly estará activo.

- Ejecutar pruebas para un proyecto específico:
  - npx playwright test --project=chromium
  - npx playwright test --project=mobile-chrome

- Ejecutar pruebas en modo desarrollo sin reusar servidor existente:
  - Asegúrate de que CI no esté definido y no exista un servidor en ejecución, Playwright gestionará el ciclo de vida del servidor según webServer.reuseExistingServer.

- Acceder a los reportes HTML generados:
  - Después de la ejecución, abrir el reporte HTML generado (ruta típica según configuración de Playwright) para revisar resultados detallados y trazas.

---

## Notas técnicas

- Paralelismo y CI:
  - El archivo está configurado para ser “ci-friendly”: en CI, se reduce el paralelismo a 1 worker y se habilitan reintentos, además de forbiddown de test.only para evitar ejecuciones incompletas o accidentales.
- Entornos de ejecución:
  - Se soportan dos entornos: Desktop Chrome y un dispositivo móvil emulado (Pixel 5). Esto ayuda a validar la experiencia tanto en escritorio como en móvil.
- Trazas y depuración:
  - trace: "on-first-retry" permite capturar trazas cuando un test falla y se ejecuta un reintento, facilitando la localización de problemas.
- Servidor de la aplicación:
  - webServer.start command: "npm run dev" se encarga de levantar la aplicación durante las pruebas.
  - reuseExistingServer: true en entornos no CI para evitar arrancar múltiples instancias si ya hay una instancia en ejecución.
  - URL de la app para las pruebas: http://localhost:3000. Es importante que la aplicación se inicie en este puerto antes de que Playwright intente ejecutar las pruebas.
- Limitaciones y consideraciones:
  - Si la aplicación no arranca en http://localhost:3000, las pruebas fallarán al intentar cargar la página base.
  - El comportamiento de reintentos y trabajadores depende del entorno de CI; al migrar entre entornos, revisar estas variables de entorno puede ser necesario para ajustar rendimiento y fiabilidad.
  - Este archivo asume que la configuración de Playwright (scripts, dependencias, y estructura de directorios) está alineada con la convención de la project RNG Vantage (especialmente la ubicación de las pruebas y el script dev).

---

Si necesitas que adapte esta documentación a otro formato (por ejemplo, una guía de inicio rápido, una referencia de API detallada o un diagrama de flujo de ejecución), dime y lo preparo.