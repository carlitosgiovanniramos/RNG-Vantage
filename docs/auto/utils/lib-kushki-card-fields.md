# RNG Vantage - lib/kushki/card-fields.ts

Resumen: Este archivo maneja la tokenización de tarjetas en el cliente utilizando KushkiJS. Expone funciones para inicializar los campos de la tarjeta (dentro de iframes), solicitar el token de la tarjeta y desasignar las instancias. El procesamiento de datos de la tarjeta se realiza en el navegador para cumplir con PCI, sin que el número de tarjeta toque el DOM de la aplicación.

## Descripción general
La implementación utiliza KushkiJS para montar campos de tarjeta alojados en iframes y obtener un token de la tarjeta ingresada. Es compartido entre el flujo de checkout (card-form) y la actualización de método de pago (update-card-form). La tokenización ocurre en el navegador y el número de tarjeta nunca se expone en el DOM de la aplicación. El módulo está diseñado para ser consumido desde Client Components y admite un único formulario de tarjeta montado a la vez (instancia de SDK a nivel de módulo).

## Responsabilidades
- Inicializar KushkiJS y montar los campos de tarjeta (nombre, número, fecha de expiración, CVV) en contenedores del DOM.
- Soportar configuración de monto, moneda y si la tokenización es para una suscripción.
- Proporcionar una función para solicitar el token de la tarjeta tokenizada.
- Proporcionar una función para liberar las instancias cuando se desmonta el formulario.
- Mantener una única instancia global (a nivel de módulo) para Kushki y el objeto de tarjeta.

## Props / Parámetros

### initKushkiCardFields(amount: number, isSubscription: boolean): Promise<void>
- Descripción: Inicializa el SDK de Kushki y monta los campos de tarjeta en los contenedores del DOM.
- Parámetros:
  - amount: number
    - Descripción: Monto de referencia para la tokenización.
  - isSubscription: boolean
    - Descripción: Indica si la tokenización corresponde a una suscripción (true) o a un pago único (false).
- Retorna: Promise<void>
  - Resuelve cuando la inicialización y la creación de los campos de tarjeta han finalizado.

Notas sobre parámetros y configuración:
- Utiliza la variable de entorno NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID para obtener la credencial pública de Kushki.
- Usa NEXT_PUBLIC_KUSHKI_ENV para determinar si está en modo de prueba o producción (inTest: true si no es producción).
- Los campos se conectan a los siguientes selectores del DOM:
  - cardholderName: selector "kushki-card-name"
  - cardNumber: selector "kushki-card-number"
  - expirationDate: selector "kushki-card-expiry"
  - cvv: selector "kushki-card-cvv"
- Placeholder asociados para cada campo.
- Estilos: define estilos para contenedor e inputs para integrarse con el diseño de la página.

### requestCardToken(): Promise<string>
- Descripción: Solicita el token de la tarjeta tokenizada.
- Parámetros: ninguno
- Retorna: Promise<string>
  - El token obtenido de Kushki (response.token).
- Errores posibles:
  - Si el SDK no ha sido inicializado: "Card SDK no ha sido inicializado".
  - Si no se obtiene un token: "No se pudo obtener el token de la tarjeta".

### resetKushkiCardFields(): void
- Descripción: Libera/limpia las instancias del SDK. Llamar al desmontar el formulario.
- Parámetros: ninguno
- Retorna: void

## Retorna

- initKushkiCardFields(amount, isSubscription): Promise<void>
- requestCardToken(): Promise<string>
- resetKushkiCardFields(): void

## Dependencias

- @kushki/js-sdk
  - Proporciona IKushki y la función init.
- @kushki/js-sdk/Card
  - Proporciona ICard y la función initCardToken.
- Variables de entorno necesarias:
  - NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID: identificador público del comerciante en Kushki.
  - NEXT_PUBLIC_KUSHKI_ENV: define si la integración está en entorno de producción o pruebas.
- Comportamiento dependiente del entorno:
  - inTest se determina como: NEXT_PUBLIC_KUSHKI_ENV !== "production".
- Requisitos del cliente:
  - Este módulo está destinado a Client Components y depende de campos del DOM para los iframes alojados.
  - Debe existir en el cliente (navegador) para que los iframes funcionen correctamente.

## Ejemplos de uso

Ejemplo 1: flujo de checkout con tokenización de tarjeta
```ts
import { initKushkiCardFields, requestCardToken, resetKushkiCardFields } from "./lib/kushki/card-fields";

async function startCheckout(amount: number) {
  // Inicializar campos de tarjeta (no debe haber otro formulario montado)
  await initKushkiCardFields(amount, false);

  // En algún momento del flujo (al confirmar pago)
  const token = await requestCardToken();
  // Usar token para procesar el pago en backend
  // ...

  // Al desmontar el formulario (p. ej., navegar fuera del checkout)
  resetKushkiCardFields();
}
```

Ejemplo 2: flujo de actualización de método de pago (suscripción)
```ts
import { initKushkiCardFields, requestCardToken, resetKushkiCardFields } from "./lib/kushki/card-fields";

async function updatePaymentMethod(amount: number) {
  await initKushkiCardFields(amount, true);

  const token = await requestCardToken();
  // Utilizar token para actualizar método de pago en backend
  // ...

  resetKushkiCardFields();
}
```

Notas sobre los ejemplos:
- Asegúrate de que el HTML de la página contenga los elementos con IDs/Selectores esperados:
  - kushki-card-name
  - kushki-card-number
  - kushki-card-expiry
  - kushki-card-cvv

## Notas técnicas

- Diseño de instancias:
  - El módulo mantiene kushkiInstance y cardInstance a nivel de módulo (singleton). Solo debe haber un formulario de tarjeta montado al mismo tiempo para evitar conflictos.
  - Estas instancias se resetean con resetKushkiCardFields(), liberando recursos y permitiendo un nuevo montaje más adelante.
- Seguridad y cumplimiento PCI:
  - La tokenización ocurre en el navegador mediante campos alojados en iframes, por lo que el número de tarjeta nunca toca el DOM de la aplicación.
- Configuración y entornos:
  - La inicialización depende de NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID para la credencial pública y NEXT_PUBLIC_KUSHKI_ENV para determinar el modo de prueba vs producción.
  - inTest se configura en función de NEXT_PUBLIC_KUSHKI_ENV != "production".
- Compatibilidad y uso correcto:
  - Este módulo está destinado a Client Components. No debe importarse en código que se ejecute en el servidor.
  - Solo debe haber un formulario de tarjeta montado a la vez; el código no gestiona colisiones entre múltiples montajes.
- Errores y validaciones:
  - Si falta NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID, initKushkiCardFields falla con "Missing NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID".
  - Si intentas solicitar un token sin haber inicializado el formulario, se lanza "Card SDK no ha sido inicializado".
  - Si Kushki no devuelve un token, se lanza "No se pudo obtener el token de la tarjeta".
- Rendimiento:
  - La creación de la tarjeta y tokenización se realiza de forma asíncrona durante la inicialización; el tiempo de tokenización está sujeto a la interacción del usuario y a la respuesta de Kushki.

## Última actualización
29/5/2026

Este documento describe fielmente las funcionalidades expuestas por lib/kushki/card-fields.ts, sin asumir comportamientos no presentes en el código. Si en el futuro se extienden las capacidades (p. ej., soporte para otros idiomas, monedas, o tipos de campos), se recomienda actualizar esta documentación para reflejar los cambios.