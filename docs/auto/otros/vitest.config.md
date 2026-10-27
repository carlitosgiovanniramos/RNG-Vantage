## Descripción general

El archivo vitest.config.ts define y exporta la configuración de Vitest para el proyecto RNG Vantage. Utiliza defineConfig de Vitest para estructurar la configuración y se integra con Vite mediante el plugin de React. Especifica el entorno de pruebas, archivos de setup, el patrón de inclusión de tests y un alias de rutas para simplificar imports en el proyecto.

---

## Responsabilidades

- Proporcionar la configuración de Vitest para ejecutar pruebas en un entorno simulado de navegador (jsdom).
- Integrar React con el entorno de pruebas a través del plugin @vitejs/plugin-react.
- Indicar el archivo de setup que Vitest debe cargar antes de las pruebas (vitest.setup.ts).
- Definir el patrón de archivos de prueba a incluir (archivos .test.ts y .test.tsx en cualquier subdirectorio).
- Configurar un alias de ruta (@"") que apunta a la raíz del proyecto para simplificar imports.

---

## Parámetros / Props

A continuación se detallan los parámetros de configuración relevantes y sus tipos. No corresponde a un componente React; se trata de la estructura de la configuración exportada por defineConfig.

- plugins
  - Tipo: Array
  - Descripción: Lista de plugins para usar con Vitest/Vite. En este caso se incluye el plugin de React.
  - Valor relevante: [react()]

- test
  - Tipo: Objeto
  - Descripción: Subconjunto de configuración específico para las pruebas.
  - Campos dentro:
    - environment
      - Tipo: string
      - Descripción: Entorno de ejecución de las pruebas. En este archivo se utiliza "jsdom" para simular un entorno de navegador.
      - Valor: "jsdom"
    - setupFiles
      - Tipo: string[]
      - Descripción: Archivos que se ejecutan antes de las pruebas para configurar el entorno (por ejemplo, mocks globales, configuraciones).
      - Valor: ["./vitest.setup.ts"]
    - include
      - Tipo: string[]
      - Descripción: Patrones glob para incluir archivos de prueba. Aquí se incluyen archivos que coincidan con "*.test.ts" y "*.test.tsx" en cualquier ruta.
      - Valor: ["**/*.test.{ts,tsx}"]

- resolve
  - Tipo: Objeto
  - Descripción: Configuración de resolución de módulos para Vitest (y de forma general para Vite).
  - Campos dentro:
    - alias
      - Tipo: Objeto
      - Descripción: Mapeos de alias para importar módulos de forma más conveniente.
      - Valor relevante:
        - "@": path.resolve(__dirname, ".")
      - Efecto: Permite importar módulos usando "@/ruta" para referirse a la raíz del proyecto.

---

## Retorna

- Tipo de retorno: Objeto de configuración de Vitest.
- Descripción: La llamada a defineConfig devuelve un objeto que Vitest consume para configurar su comportamiento de pruebas. Este objeto se exporta por defecto desde el archivo para que Vitest lo lea al ejecutar las pruebas.

---

## Dependencias

- vitest/config
  - Funcionalidad: Proporciona defineConfig para estructurar la configuración de Vitest.
- @vitejs/plugin-react
  - Funcionalidad: Plugin de React para Vite, necesario cuando se prueban componentes React con Vite.
- path (nativo de Node.js)
  - Funcionalidad: Proporciona path.resolve para resolver rutas de forma consistente.
- vitest setup (archivo vitest.setup.ts)
  - Funcionalidad: Archivo de configuración/initialización ejecutado antes de las pruebas (punto de entrada para mocks/global setup).

Notas:
- El alias "@": path.resolve(__dirname, ".") crea un atajo para importar desde la raíz del proyecto, facilitando imports como "@/components/..." en lugar de rutas relativas largas.

---

## Ejemplos de uso

- Ejecutar todas las pruebas con la configuración predeterminada:
  - npx vitest
- Ejecutar pruebas con un archivo de configuración específico (si fuese necesario):
  - npx vitest --config vitest.config.ts
- Ejecutarlo en modo observación (watch) para mantener pruebas actualizadas con cambios en el código:
  - npx vitest -w

Notas: En muchos proyectos, las pruebas se lanzan mediante un script npm o pnpm, por ejemplo:
- npm run test
- pnpm test

Asegúrate de que el script correspondiente esté definido en package.json si pretendes usar un comando específico.

---

## Notas técnicas

- Entorno de pruebas: environment configurado a "jsdom" para simular un entorno de navegador, lo que facilita probar componentes React y funciones dependientes del DOM.
- Integración de React: Se usa el plugin "@vitejs/plugin-react" para habilitar soporte adecuado de JSX/React durante las pruebas.
- Archivos de setup: setupFiles apunta a "./vitest.setup.ts", permitiendo inicializar mocks, extendensiones globales o configuraciones necesarias antes de cada prueba.
- Búsqueda de tests: el patrón "**/*.test.{ts,tsx}" cubre archivos de pruebas en cualquier subdirectorio con extensión .ts o .tsx que terminen en .test.
- Resolución de módulos: el alias "@" mapea a la raíz del proyecto, simplificando imports y reduciendo dependencias de rutas relativas.
- Rendimiento y mantenimiento: mantener este archivo ligero ayuda a evitar configuraciones innecesarias; cualquier nuevo plugin o ajuste debe añadirse de forma explícita y documentarse.

---

## Última actualización

12/5/2026

---