# Documentación técnica: lib/kushki/webhook.ts

Ruta: lib/kushki/webhook.ts  
Nombre: webhook.ts  
Líneas: 39

Este archivo contiene la lógica pura del webhook de Kushki. No tiene dependencias de entorno ni de red, lo que facilita su pruebas unitarias. Exporta dos utilidades relacionadas con estados de transacciones y su mapeo a estados internos.

## Descripción general

El módulo implementa:

- Una lista de estados finales de una transacción, que no deben reprocesarse (idempotencia del webhook).
- una función para verificar si un estado de Kushki es final.
- una función para mapear estados de Kushki a estados internos entendibles por el sistema (completed, failed, pending).

Todo el código es puramente lógico y no realiza operaciones de red, I/O ni depende de configuración de entorno.

## Responsabilidades

- Definir y exponer los estados finales de una transacción:
  - FINAL_TRANSACTION_STATUSES: ["completed", "failed", "refunded"].
- Proporcionar una utilidad para verificar la idempotencia basada en estados finales:
  - isFinalTransactionStatus(status: string): boolean.
- Proporcionar un mapeo claro de los estados de Kushki a estados internos del sistema:
  - mapKushkiStatus(status: KushkiTransactionStatus): "completed" | "failed" | "pending".

## Props / Parámetros

A continuación se describen los parámetros de cada función:

- isFinalTransactionStatus(status: string): boolean
  - status: string — estado recibido de Kushki (o de algún webhook). No está tipado con la unión de Kushki, se acepta cualquier string.
  - Devuelve: booleano que indica si el estado es uno de FINAL_TRANSACTION_STATUSES.

- mapKushkiStatus(status: KushkiTransactionStatus): "completed" | "failed" | "pending"
  - status: KushkiTransactionStatus — estado de la transacción tal como lo reporta Kushki. Ejemplos típicos (según el código):
    - "APPROVAL"
    - "DECLINED"
    - "EXPIRED"
    - "PENDING"
    - "INITIALIZED"
  - Devuelve: una etiqueta interna del sistema que puede ser "completed", "failed" o "pending".

Nota: KushkiTransactionStatus es un tipo importado desde "./types" (type-only import), por lo que no tiene efectos de ejecución en tiempo de runtime.

## Retorna

- isFinalTransactionStatus(status: string): boolean
  - Retorna true si status está dentro de FINAL_TRANSACTION_STATUSES; false en caso contrario.

- mapKushkiStatus(status: KushkiTransactionStatus): "completed" | "failed" | "pending"
  - Retorna uno de los tres estados internos:
    - "completed": cuando Kushki está en estado "APPROVAL".
    - "failed": cuando Kushki está en estados "DECLINED" o "EXPIRED".
    - "pending": para "PENDING", "INITIALIZED" o cualquier otro valor no cubierto explícitamente (default).

## Dependencias

- Dependencias de tiempo de compilación:
  - import type { KushkiTransactionStatus } from "./types";
    - Es una importación de tipo (type-only), por lo que no genera código en runtime.
- No hay dependencias de librerías externas, ni de APIs, ni de entorno.
- El archivo es auto-contenido y puro (sin side effects).

## Ejemplos de uso

Ejemplos prácticos para usar la utilidad exportada en el proyecto:

- Verificar si un estado es final (idempotencia):
  - isFinalTransactionStatus("completed") => true
  - isFinalTransactionStatus("initialized") => false

- Mapear estados de Kushki a estados internos:
  - mapKushkiStatus("APPROVAL")  => "completed"
  - mapKushkiStatus("DECLINED")  => "failed"
  - mapKushkiStatus("EXPIRED")   => "failed"
  - mapKushkiStatus("PENDING")   => "pending"
  - mapKushkiStatus("INITIALIZED") => "pending"

Código de ejemplo ( TypeScript ):
```ts
import { isFinalTransactionStatus, mapKushkiStatus } from "./kushki/webhook";
import type { KushkiTransactionStatus } from "./kushki/types";

const s1 = "completed";
console.log(isFinalTransactionStatus(s1)); // true

const s2: KushkiTransactionStatus = "APPROVAL";
console.log(mapKushkiStatus(s2)); // "completed"

const s3: KushkiTransactionStatus = "PENDING";
console.log(mapKushkiStatus(s3)); // "pending"
```

## Notas técnicas

- pureza y testabilidad:
  - El código es completamente puro: no realiza I/O, llamadas de red ni dependencias de entorno. Esto facilita la creación de pruebas unitarias deterministas.
- Extensibilidad:
  - FINAL_TRANSACTION_STATUSES está definido con as const, lo que permite mantener tipos literales y facilita la verificación estática. Si se agregaran nuevos estados finales en el futuro, se podrían añadir a este arreglo.
  - mapKushkiStatus cubre estados comunes de Kushki y tiene un default que mapea cualquier otro estado a "pending". Si Kushki introduce nuevos estados, podrían requerir actualización de este mapeo.
- Consistencia de enumera­ciones:
  - El mapeo está diseñado para convertir estados de Kushki a un conjunto limitado de estados internos ("completed", "failed", "pending"), lo que facilita el manejo en el resto del sistema.
- Compatibilidad de tipos:
  - El uso de import type indica que KushkiTransactionStatus es puramente un tipo y no afectará al runtime, reduciendo posibles cargas de código innecesarias.

## Última actualización

29/5/2026

Si necesitas ampliar la funcionalidad o adaptar el comportamiento ante nuevos estados de Kushki, este módulo está pensado para cambios mínimos y pruebas focalizadas, manteniendo la lógica de negocio de forma aislada y testable.