## Descripción general

El archivo lib/utils.ts define y exporta una utilidad de nivel medio para manejo de clases CSS en la UI. Es un wrapper sencillo alrededor de las librerías clsx y tailwind-merge que permite construir cadenas de clases de manera segura, eliminando valores falsos y resolviendo conflictos entre utilidades de Tailwind. Su propósito es facilitar la construcción de className en componentes de la aplicación sin preocuparse por duplicados o conflictos de clases.

## Responsabilidades

- Combinar múltiples entradas de clases CSS en una única cadena.
- Filtrar valores falsos (por ejemplo, booleanos false/true, null, undefined) mediante clsx.
- Resolver conflictos de clases de Tailwind (por ejemplo, entre bg-*, text-*, p-*, etc.) usando tailwind-merge para asegurar que las utilidades finales son consistentes y válidas.
- Exportar una utilidad reutilizable, cn, para ser utilizada en cualquier componente que necesite className dinámico.

## Props / Parámetros

Dado que cn es una función, sus parámetros son:

- inputs: ClassValue[]
  - Descripción: conjunto de valores que representan clases CSS. Es un parámetro rest, por lo que se pueden pasar múltiples valores en una única llamada. ClaseValue es un tipo compatible con strings, números, booleanos, objetos de diccionario para condiciones, arrays, etc. Los valores falsos y opcionales se gestionan mediante clsx.
  - Tipo: ClassValue[] (parámetro rest, es decir, variádico). Ejemplos de contenido típico: strings como "p-4", objetos como { "hidden": isHidden }, valores booleanos para condicionales, etc.

Notas: clsx se encargará de aplanar y filtrar valores no deseados, y luego tailwind-merge se encargará de resolver posibles conflictos entre utilidades de Tailwind.

## Retorna

- Devuelve: string
- Formato: una cadena de clases CSS lista para pasar a className en componentes React (por ejemplo, className={cn("p-4", condition && "bg-blue-500")}).
- Comportamiento clave: la salida combina todas las entradas, elimina valores falsos y resuelve conflictos de Tailwind manteniendo la última utilidad relevante en caso de colisiones.

## Dependencias

- clsx (y su tipo ClassValue)
  - Función: clsx(inputs) para convertir una lista de valores en una cadena de clases, manejando condicionales y estructuras anidadas.
- tailwind-merge
  - Función: twMerge() para fusionar y priorizar clases de Tailwind cuando hay conflictos entre utilidades (por ejemplo, bg-*, text-*, p-*, etc.).

Código relevante (referencia del archivo):
- Importaciones:
  - import { clsx, type ClassValue } from "clsx"
  - import { twMerge } from "tailwind-merge"
- Exportación:
  - export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

## Ejemplos de uso

- Uso básico
  - const className = cn("p-4", "bg-blue-500")
  - Resultado esperado: "p-4 bg-blue-500"

- Uso con condicionales
  - const isActive = true
  - const className = cn("p-4", isActive && "bg-blue-500")
  - Si isActive es true, resultado: "p-4 bg-blue-500"

- Manejo de conflictos de Tailwind
  - const className = cn("p-4", "bg-red-500", "bg-red-700")
  - Resultado esperado: "p-4 bg-red-700" (tailwind-merge mantiene la última utilidad en conflicto)

- Uso con valores falsos/remanentes
  - const className = cn("p-4", false && "bg-green-500", null, undefined, ["rounded"])
  - Resultado esperado: "p-4 rounded" (clsx filtra valores falsos y aplanará el array)

## Notas técnicas

- Este archivo actúa como un wrapper puro y liviano (thin wrapper), no introduce estado ni side effects.
- La combinación de clsx + tailwind-merge facilita un patrón común en React/Next.js para gestionar className de forma limpia y eficiente.
- Importante notar que clsx ya maneja la aplanación de arrays y objetos de condiciones; tailwind-merge asegura que no haya conflictos entre utilidades de Tailwind al consolidar la cadena final.
- El enfoque es seguro para tree-shaking y compatible con componentes funcionales; no hay dependencias de contexto o hooks, lo que facilita la reutilización en distintos módulos.

## Última actualización

12/5/2026