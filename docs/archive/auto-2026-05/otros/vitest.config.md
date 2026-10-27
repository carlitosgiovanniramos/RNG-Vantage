# RNG Vantage - vitest.config.ts

Archivo de configuración de Vitest para el proyecto RNG Vantage. Define el entorno de pruebas, la integración con React a través de Vite, las reglas de descubrimiento de tests y las alias de resolución de módulos. Especifica un entorno de pruebas que emula el navegador (jsdom), carga un script de configuración previa y establece el comportamiento de verificación de tipos para archivos de prueba.

## Descripción general

Este archivo exporta la configuración de Vitest mediante la función helper `defineConfig`. Sus principales roles son:

- Integrar Vitest con el plugin de React de Vite para pruebas en un proyecto React.
- Configurar el entorno de pruebas a jsdom para simular un entorno de navegador.
- Especificar un script de configuración previa que se ejecuta antes de cada suite de pruebas (`vitest.setup.ts`).
- Definir qué archivos deben ser detectados como tests (`**/*.test.{ts,tsx}`).
- Habilitar la verificación de tipos para las pruebas TypeScript.
- Establecer un alias de resolución de módulos para simplificar imports, apuntando `@` al directorio raíz del proyecto.

## Responsabilidades

- Proveer un entorno de pruebas consistente para todas las pruebas unitarias y de integración.
- Integrar el plugin de React para que Vitest trabaje correctamente con archivos JSX/TSX.
- Asegurar que las pruebas se descubran automáticamente mediante patrones de archivos.
- Garantizar la verificación estática de tipos para las pruebas.
- Facilitar importaciones limpias mediante alias de ruta.

## Props / Parámetros

A continuación se describen las principales configuraciones (propiedades) dentro del objeto de configuración de Vitest:

- plugins
  - Tipo: array
  - Descripción: lista de plugins usados por Vitest. En este caso, se usa el plugin de React para Vite.
  - Valor: `[react()]`

- test
  - Tipo: objeto
  - Descripción: configuración específica para las pruebas.
  - Claves:
    - environment
      - Tipo: string
      - Descripción: entorno de ejecución de las pruebas.
      - Valor: `"jsdom"` (entorno de navegador simulado)
    - setupFiles
      - Tipo: array de string
      - Descripción: archivos que se ejecutan antes de las pruebas para preparar entorno/globales.
      - Valor: `["./vitest.setup.ts"]`
    - include
      - Tipo: array de string
      - Descripción: patrones glob para localizar archivos de prueba.
      - Valor: `["**/*.test.{ts,tsx}"]`
    - typecheck
      - Tipo: objeto
      - Descripción: configuración de verificación de tipos para las pruebas.
      - Claves:
        - enabled
          - Tipo: boolean
          - Descripción: activa/desactiva la verificación de tipos.
          - Valor: `true`
        - include
          - Tipo: array de string
          - Descripción: patrones para qué archivos deben ser typechecked.
          - Valor: `["**/*.test.{ts,tsx}"]`

- resolve
  - Tipo: objeto
  - Descripción: configuración de resolución de módulos.
  - Claves:
    - alias
      - Tipo: objeto
      - Descripción: mapeos de alias para importación.
      - Valor: `{ "@": path.resolve(__dirname, ".") }`
      - Nota: Esto permite usar importaciones como `import Something from "@/path/...";` para referirse al directorio raíz del proyecto.

- El código fuente de este archivo utiliza:
  - `defineConfig` de `vitest/config` para una configuración tipada.
  - `@vitejs/plugin-react` para compatibilidad con React.
  - `path` de Node para resolver rutas de alias.

## Retorna

La función exportada devuelve un objeto de configuración de Vitest (configuración de usuario) que es consumido por Vitest para ejecutar las pruebas. En concreto, se exporta un objeto a través de `export default defineConfig({...})`. No hay una función con un retorno dinámico; es una exportación de configuración estática.

## Dependencias

Este archivo depende de las siguientes librerías y módulos externos:

- vitest/config
  - Proporciona `defineConfig` para crear configuraciones tipadas y seguras.
- @vitejs/plugin-react
  - Plugin de Vite para habilitar React con soporte a JSX/TSX en el entorno de pruebas.
- path (núcleo de Node)
  - Utilizado para resolver rutas de alias en el proyecto.
- vitest (implícito por el uso de la configuración)
  - El motor de pruebas utilizado por el proyecto (unit/integration tests).
- vitest.setup.ts (archivo de setup)
  - Archivo de configuración previa que se ejecuta antes de las pruebas para establecer mocks globales o configuraciones necesarias.

## Ejemplos de uso

- Ejecutar las pruebas de Vitest
  - Si el proyecto tiene un script típico de pruebas, se puede ejecutar desde la raíz del proyecto con:
    - npm: npm test
    - yarn: yarn test
    - pnpm: pnpm test
  - Alternativamente, invocar directamente Vitest:
    - npx vitest
  - Nota: El comportamiento exacto depende de los scripts definidos en package.json; este archivo garantiza que las pruebas descubiertas sigan el patrón "**/*.test.{ts,tsx}" y se ejecuten en un entorno jsdom con la configuración de alias correspondiente.

- Estructura de pruebas esperada
  - Archivos de prueba deben terminar en .test.ts o .test.tsx.
  - Las pruebas pueden depender de importaciones relativas o de alias `@` para importar desde el root del proyecto.
  - Antes de cada suite de pruebas se ejecuta `vitest.setup.ts`.

## Notas técnicas

- Entorno de pruebas (jsdom)
  - Al usar `environment: "jsdom"`, Vitest simula un entorno de navegador. Es adecuado para pruebas de componentes React y código que interactúa con el DOM.
  - Limitaciones: ciertas APIs de Node o características de bajo nivel pueden no comportarse exactamente como en un entorno real de navegador o Node puro.

- Setup de pruebas
  - `setupFiles: ["./vitest.setup.ts"]` indica que antes de ejecutar las pruebas se correrá ese archivo para configurar globals, mocks, o inicializaciones necesarias. Es común para mocks de APIs, configuraciones de fetch, etc.

- Descubrimiento de tests
  - `include: ["**/*.test.{ts,tsx}"]` restringe la búsqueda a archivos que terminan con `.test.ts` o `.test.tsx`, en cualquier subdirectorio.
  - Esto mantiene una convención de nombres clara para las pruebas.

- Verificación de tipos
  - `typecheck.enabled: true` habilita la verificación de tipos para los archivos de prueba que coinciden con el patrón de inclusión.
  - Beneficio: atrapa errores de tipos en tests temprano, a costa de un ligero overhead de compilación.

- Aliases de importación
  - `resolve.alias: { "@": path.resolve(__dirname, ".") }` facilita imports con el alias `@`, por ejemplo: `import lib from "@/src/lib";`
  - `__dirname` se refiere al directorio donde se encuentra vitest.config.ts; por lo tanto, el alias apunta al directorio raíz del proyecto.

- Compatibilidad y mantenimiento
  - El uso de `defineConfig` aporta tipado estático y autocompletado en IDEs.
  - El archivo es relativamente pequeño y directo, lo que facilita su mantenimiento. Si se añaden nuevas necesidades de pruebas (p. ej., E2E, hooks globales adicionales), el objeto de configuración puede expandirse en las secciones correspondientes.

## Última actualización

29/5/2026

Si necesitas que añada ejemplos más específicos de configuración (por ejemplo, diferentes entornos para pruebas de componentes aislados, o ajustes para desempeño), dime y lo incorporo.