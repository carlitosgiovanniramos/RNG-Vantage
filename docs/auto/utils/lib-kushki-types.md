# Documentación técnica: lib/kushki/types.ts

Esta sección documenta el contenido del archivo TypeScript lib/kushki/types.ts del proyecto RNG Vantage. El archivo define tipos e interfaces que modelan las respuestas de la API de Kushki, así como el cuerpo de eventos de webhook y posibles errores. Es un conjunto de tipos de datos puros (no contiene lógica) que facilita el typing estático en todas las integraciones con Kushki (cargos, transferencias y suscripciones).

## Descripción general

- Propósito: Proveer tipos TypeScript que representen de forma fiel las respuestas que Kushki devuelve en operaciones de cargos, transferencias, suscripciones y en webhooks. Esto permite:
  - Validar estructuras de datos al consumir la API.
  - Garantizar consistencia de campo y tipado en toda la base de código.
  - Ayudar a detectar errores de integración en tiempo de compilación.
- Alcance: El archivo exporta tipos e interfaces, sin funciones. Se utiliza como fuente de verdad para el formato esperado de las respuestas y eventos de Kushki.
- Contexto: El scaffold está basado en la documentación oficial de Kushki. Se recomienda verificar nombres de campo al implementar cargos/transferencias, tal como indica el comentario inicial del archivo.

## Responsabilidades

- Definir el conjunto de tipos que describen:
  - Estados de transacción devueltos por Kushki en cargos y webhooks.
  - Respuestas de endpoints relevantes:
    - POST /card/v1/charges
    - POST /transfer/v1/init
    - POST /subscriptions/v1/card
  - Estructura de los eventos enviados por webhooks configurados.
  - Estructura del cuerpo de error de Kushki.
- Proporcionar una base tipada para:
  - Manejo de respuestas exitosas.
  - Manejo de errores.
  - Interpretación de estados de transacción en lógica de negocio.

## Props / Parámetros

A continuación se describen las interfaces y el tipo exportados en este archivo, con sus campos, tipos y si son requeridos u opcionales.

- KushkiTransactionStatus
  - Descripción: Unión de cadenas que representa los estados de transacción devueltos por Kushki en cargos y webhooks.
  - Valores permitidos:
    - "APPROVAL"
    - "DECLINED"
    - "INITIALIZED"
    - "PENDING"
    - "EXPIRED"

- KushkiChargeResponse
  - Descripción: Respuesta de POST /card/v1/charges.
  - Campos:
    - ticketNumber: string (requerido)
    - transactionReference: string (requerido)
    - approvalCode?: string (opcional)
    - responseCode?: string (opcional)
    - responseText?: string (opcional)

- KushkiTransferResponse
  - Descripción: Respuesta de POST /transfer/v1/init.
  - Campos:
    - transactionReference: string (requerido)
    - transactionId: string (requerido)
    - redirectUrl?: string (opcional)
    - pendingReference?: string (opcional)
  - Notas: redirectUrl suele ser la URL a la que se redirige al usuario para completar la transferencia; pendingReference es un código de referencia proporcionado para el flujo de usuario.

- KushkiSubscriptionResponse
  - Descripción: Respuesta de POST /subscriptions/v1/card (creación de suscripción).
  - Campos:
    - subscriptionId: string (requerido)
    - status?: KushkiTransactionStatus (opcional)

- KushkiWebhookEvent
  - Descripción: Payload que Kushki envía al webhook configurado.
  - Campos:
    - transactionId: string (requerido)
    - transactionReference?: string (opcional)
    - ticketNumber?: string (opcional)
    - status: KushkiTransactionStatus (requerido)
    - paymentMethod?: string (opcional)
    - amount?: number (opcional)
    - subscriptionId?: string (opcional)
    - metadata?: Record<string, unknown> (opcional)
  - Notas: subscriptionId está presente cuando el evento corresponde al cobro de una suscripción recurrente.

- KushkiErrorBody
  - Descripción: Forma del cuerpo de error de la API de Kushki.
  - Campos:
    - code?: string (opcional)
    - message?: string (opcional)

## Retorna

- Este archivo no define funciones ni clases, sino tipos/interfaces. Por lo tanto, “retorna” no aplica en el sentido tradicional.
- Qué devuelve: al importar estos tipos, se obtiene un conjunto de tipos estáticos que describen las estructuras de datos de Kushki:
  - Tipos de estados de transacción.
  - Respuestas de cargos, transferencias y suscripciones.
  - Eventos de webhook y errores de la API.
- Formato de retorno: tipos TypeScript/interfaces. Se utilizan como tipado de entrada/salida en las capas que consumen Kushki dentro del proyecto.

## Dependencias

- TypeScript (interfaces y tipos).
- No hay dependencias externas declaradas en este archivo. Utiliza tipos nativos de TypeScript como Record<string, unknown>.
- Comentario de documentación menciona la documentación oficial de Kushki como fuente de los nombres de campo y estructuras.

## Ejemplos de uso

A continuación se muestran ejemplos de cómo podría utilizarse este archivo en código de proyecto. Estos ejemplos son ilustrativos y no añaden lógica de negocio por sí mismos.

- Ejemplo 1: Validar estructuras de respuestas de Kushki

  - Supongamos que recibes una respuesta de un cargo y quieres verificar su formato con tipos.

  ```
  import type { KushkiChargeResponse } from '../lib/kushki/types';

  function handleChargeResponse(res: KushkiChargeResponse) {
    const { ticketNumber, transactionReference, approvalCode } = res;

    // Ejemplo de uso: registrar campos requeridos y opcionales
    console.log(`Ticket: ${ticketNumber}, Ref: ${transactionReference}`);
    if (approvalCode) {
      console.log(`Approval code: ${approvalCode}`);
    }
  }
  ```

- Ejemplo 2: Manejo de un webhook recibido (tipado)

  ```
  import type { KushkiWebhookEvent, KushkiTransactionStatus } from '../lib/kushki/types';

  function handleWebhook(event: KushkiWebhookEvent) {
    // status es obligatorio en el payload según la definición
    switch (event.status) {
      case "APPROVAL":
        // procesar aprobación
        break;
      case "DECLINED":
        // manejar rechazo
        break;
      // otros casos...
    }

    // acceso a campos opcionales con comprobación de existencia
    if (event.subscriptionId) {
      // flujo de suscripción recurrente
    }
  }
  ```

- Ejemplo 3: Construcción de un tipo para error de Kushki

  ```
  import type { KushkiErrorBody } from '../lib/kushki/types';

  const error: KushkiErrorBody = {
    code: '400',
    message: 'Bad Request',
  };
  ```

- Ejemplo 4: Utilizar el estado de transacción

  ```
  import type { KushkiTransactionStatus } from '../lib/kushki/types';

  function isFinalStatus(status: KushkiTransactionStatus) {
    return status === 'DECLINED' || status === 'EXPIRED';
  }
  ```

## Notas técnicas

- Consistencia de nombres de campos:
  - Los nombres de campos siguen la documentación de Kushki y están reflejados tal cual en las interfaces.
  - Campos opcionales (con ?) representan información que Kushki puede omitir según el contexto de la operación (p. ej., approvalCode, redirectUrl, etc.).
- Tipado de estados:
  - KushkiTransactionStatus define un conjunto limitado de estados compatibles con cargos y webhooks, lo que facilita el manejo de flujo de negocio y UI.
- Modelado de webhooks:
  - KushkiWebhookEvent captura el payload típico enviado por Kushki. Incluye fields relevantes para suscripciones (subscriptionId) y metadatos genéricos (metadata).
- Extensibilidad:
  - Al ser interfaces simples, es fácil extender la tipificación si Kushki agrega nuevos campos en futuras versiones de la API. Sin embargo, se deben validar los nuevos campos contra la documentación oficial.
- Rendimiento:
  - Son solo definiciones de tipos, no generan código en tiempo de ejecución. No impactan en rendimiento al ejecutar la aplicación.

## Última actualización

- 29/5/2026

Notas finales:
- Este documento está basado en el header del archivo, que señala que es un scaffold basado en la documentación oficial de Kushki y recomienda verificar nombres de campo al implementar cargos/transferencias.
- Si se añaden nuevos endpoints o campos en Kushki, este archivo debe actualizarse para reflejar las nuevas estructuras de datos y mantener el typing coherente en todo el proyecto.