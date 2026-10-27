# Documentación técnica: playwright.config.ts

Archivo: playwright.config.ts  
Proyecto: RNG Vantage (automatización de pruebas end-to-end con Playwright)

Fecha de última actualización: 29/5/2026

---

## Descripción general

El archivo playwright.config.ts define la configuración de Playwright Test para el proyecto RNG Vantage. Especifica dónde se ubican las pruebas de extremo a extremo, cómo se ejecutan (paralelismo y CI), qué dispositivos se simulan, cómo se genera el informe y cómo se levanta el servidor de desarrollo para las pruebas. En resumen, centraliza la orquestación de las pruebas E2E, con un enfoque de pruebas en múltiples dispositivos (Desktop Chrome y Mobile Chrome) y un flujo de servidor web integrado.

---

## Responsabilidades

- Configurar el entorno de pruebas E2E con Playwright Test.
- Definir el directorio de pruebas (testDir) y habilitar ejecución en paralelo.
- Establecer reglas específicas para CI (forbidOnly, retries, número de workers).
- Configurar un reporte HTML para las pruebas.
- Definir contextos/entornos de prueba (proyectos) para reproducibilidad entre dispositivos.
- Automatizar la inicialización del servidor de desarrollo (webServer) antes de ejecutar las pruebas y gestionar su reutilización.

---

## Parámetros (Propiedades principales)

A continuación se documentan las claves principales de la configuración y su significado:

- testDir: "./e2e"
  - Directorio donde se ubican las pruebas E2E.

- fullyParallel: true
  - Ejecuta las pruebas de forma totalmente paralela entre archivos de prueba.

- forbidOnly: !!process.env.CI
  - Si se está en CI (variable CI definida), prohíbe el uso de tests con .only para evitar ejecuciones incompletas.

- retries: process.env.CI ? 2 : 0
  - Número de reintentos por prueba. En CI se reintenta 2 veces; en desarrollo local no se reintenta.

- workers: process.env.CI ? 1 : undefined
  - Cantidad de workers (concurrentes). En CI se usa 1 worker; en local se deja que Playwright determine el valor por defecto.

- reporter: "html"
  - Tipo de reporte generado. En este caso, un informe HTML interactivo.

- use: { baseURL, trace }
  - use: contexto por defecto para las pruebas:
    - baseURL: "http://localhost:3000" (URL base para las pruebas)
    - trace: "on-first-retry" (recolecta trazas únicamente en el primer reintento)

- projects: [ ... ]
  - Conjunto de proyectos de prueba para ejecutar en diferentes entornos/dispositivos.
  - project 1:
    - name: "chromium"
    - use: { ...devices["Desktop Chrome"] } (configuración de dispositivo Desktop Chrome)
  - project 2:
    - name: "mobile-chrome"
    - use: { ...devices["Pixel 5"] } (configuración de dispositivo móvil Pixel 5)

- webServer: { command, url, reuseExistingServer }
  - Configuración para levantar un servidor de desarrollo durante las pruebas:
    - command: "npm run dev" (comando para iniciar el servidor)
    - url: "http://localhost:3000" (URL base donde el servidor sirve la app)
    - reuseExistingServer: !process.env.CI (si no es CI, reutiliza un servidor existente si ya está en funcionamiento)

---

## Retorna

Este archivo exporta por defecto una configuración de Playwright Test mediante defineConfig. No es una función que retorne un valor dinámico; es una configuración estática (con algunas condiciones dinámicas basadas en process.env) que Playwright consume al ejecutar las pruebas.

Formato devuelto:
- Un objeto de configuración de Playwright Test que incluye testDir, paralelismo, comportamiento en CI, reportes, contextos de prueba (use), proyectos (chromium y mobile-chrome) y configuración de webServer.

---

## Dependencias

- @playwright/test (Playwright Test)
- dispositivos predefinidos de Playwright (devices)
- npm/yarn para ejecutar:
  - npm run dev (para levantar el servidor de desarrollo)
  - npx playwright test (para ejecutar las pruebas)
- El comportamiento de CI depende de la variable de entorno CI (presente en entornos de integración continua)

Notas:
- El proyecto asume que existe un script npm dev para arrancar la app en http://localhost:3000.
- Los dispositivos utilizados son Desktop Chrome y Pixel 5, importados desde devices de Playwright.

---

## Ejemplos de uso

- Ejecutar todas las pruebas E2E (con la configuración por defecto del archivo):
  - npx playwright test
- Ejecutar pruebas solo con el proyecto Chromium:
  - npx playwright test --project=chromium
- Ejecutar pruebas solo con el proyecto Mobile Chrome:
  - npx playwright test --project=mobile-chrome
- Durante CI, Playwright iniciará un único worker, reintentará 2 veces y no permitirá test.only:
  - CI=true npx playwright test
- Ver informe HTML generado:
  - Revisa la carpeta de reportes HTML generada por el runner (configurada por reporter: "html")

Notas:
- Playwright gestionará automáticamente el webServer especificado para levantar el servidor de desarrollo antes de las pruebas y cerrarlo al finalizar, salvo que se configure reuseExistingServer para continuar con un servidor ya activo.

---

## Notas técnicas

- Pruebas en paralelo
  - El uso de fullyParallel permite ejecutar archivos de prueba de forma concurrente, lo que acelera la ejecución, pero requiere pruebas con aislamiento adecuado para evitar conflictos entre tests.

- Comportamiento en CI
  - forbidOnly evita que se suba código con uses de test.only a CI.
  - retries es 2 para permitir capturar fallos intermitentes en CI.
  - workers se limita a 1 para reducir la carga en entornos de CI y evitar condiciones de rendimiento.

- Captura de trazas
  - trace: "on-first-retry" ayuda a diagnosticar fallos tras el primer reintento sin generar trazas en ejecuciones exitosas, reduciendo costo de almacenamiento.

- Reportes
  - reporter: "html" genera un informe navegable para analizar resultados de pruebas de forma visual.

- Soporte multi-dispositivo
  - Los proyectos definen dos entornos: Desktop Chrome y Pixel 5, lo que facilita la verificación de la app en diferentes tamaños de pantalla y resoluciones sin duplicar configuración.

- Inicio del servidor
  - webServer con command "npm run dev" garantiza que la app esté sirviéndose en http://localhost:3000 durante las pruebas. reuseExistingServer: true en local evita iniciar un nuevo proceso si ya hay uno corriendo; en CI se fuerza a iniciar una nueva instancia para evitar colisiones.

- Dependencias del entorno
  - El comportamiento dinámico depende de process.env.CI para adaptar configuración entre local y CI.

---

## Última actualización

29/5/2026

---

Si necesitas adaptar este config para un entorno específico (por ejemplo, añadir más dispositivos, cambiar el puerto, o ajustar el comportamiento en CI), dime qué cambios quieres y te entrego una versión actualizada de la documentación y del archivo.