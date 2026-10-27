# Documentación técnica: lib/email/templates.ts

Proyecto: RNG Vantage (RGL Estudio)
Archivo: lib/email/templates.ts

Fecha de última actualización: 29/5/2026

Resumen
----------
Este archivo define las plantillas HTML para correos transaccionales utilizados por el sistema RNG Vantage. Proporciona una API sencilla para generar el contenido de correos (asunto y cuerpo HTML) de eventos como pagos confirmados, pagos fallidos, activación de suscripciones y cobros recurrentes. Las plantillas están diseñadas para ser compatibles con diversos clientes de correo mediante HTML simple y estilos inline.

Descripción general
-------------------
- El módulo exporta un tipo EmailContent y varias funciones que devuelven objetos con:
  - subject: título del correo.
  - html: cuerpo HTML ya formateado y listo para enviar.
- Las plantillas comparten un layout común que aplica un diseño consistente (título, cuerpo, separador, pie de página).
- Se usan funciones auxiliares para seguridad y formato de moneda:
  - escape(value: string): evita inyección HTML escapando caracteres peligrosos.
  - formatUsd(value: number): formatea números como moneda USD con localización es-EC.
  - layout(title, bodyHtml): genera la envoltura HTML con estilos inline.
- Las plantillas cubren:
  - Pago confirmado
  - Pago no completado
  - Suscripción activada
  - Recibo de cobro mensual
  - Cobro recurrente fallido (dunning)

Responsabilidades
---------------
- Proporcionar contenido HTML seguro y coherente para correos transaccionales.
- Asegurar que cualquier nombre de servicio (serviceName) proveniente de la BD no inyecte código HTML, gracias a escape.
- Unificar la apariencia de todos los correos mediante la función layout.
- Formatear montos en USD de manera consistente para los correos.

Props / Parámetros
------------------
Cada función exportada recibe un objeto de parámetros y devuelve EmailContent.

- paymentConfirmedEmail(p: { serviceName?: string; amount: number }): EmailContent
  - serviceName?: nombre del servicio asociado al pago (opcional).
  - amount: monto de la transacción ( USD ).
  - Retorna:
    - subject: "Pago confirmado - RGL Estudio"
    - html: cuerpo HTML con el texto de confirmación y el monto formateado.

- paymentFailedEmail(p: { serviceName?: string }): EmailContent
  - serviceName?: nombre del servicio asociado al pago (opcional).
  - Retorna:
    - subject: "Tu pago no se completo - RGL Estudio"
    - html: cuerpo HTML indicando que el pago no fue confirmado.

- subscriptionActivatedEmail(p: { serviceName: string; amount: number }): EmailContent
  - serviceName: nombre del servicio al que corresponde la suscripción (obligatorio).
  - amount: monto a cobrar cada mes (USD).
  - Retorna:
    - subject: "Suscripcion activada - RGL Estudio"
    - html: mensaje indicando que la suscripción está activa y el monto mensual.

- recurringChargeReceiptEmail(p: { serviceName?: string; amount: number }): EmailContent
  - serviceName?: nombre del servicio cobrado (opcional).
  - amount: monto cobrado (USD).
  - Retorna:
    - subject: "Recibo de tu cobro mensual - RGL Estudio"
    - html: recibo del cobro mensual.

- recurringChargeFailedEmail(p: { serviceName?: string }): EmailContent
  - serviceName?: nombre del servicio cobrado (opcional).
  - Retorna:
    - subject: "No pudimos cobrar tu suscripcion - RGL Estudio"
    - html: aviso de cobro fallido y recomendaciones.

Retorna
-------
- Cada función devuelve un objeto EmailContent:
  - subject: string
  - html: string (HTML ya preparado y seguro para envío)

Dependencias
------------
- Estilo y formato:
  - formatUsd(value: number): utiliza Intl.NumberFormat con locale "es-EC" y currency "USD" para formatear montos.
- Seguridad:
  - escape(value: string): escapa caracteres HTML para evitar inyección al injectarlos en el HTML generado.
- Plantilla/HTML:
  - layout(title: string, bodyHtml: string): genera la envoltura HTML con estilos inline para mejor compatibilidad entre clientes de correo.
- No depende de librerías externas. Usa APIs nativas de JavaScript/TypeScript.

Ejemplos de uso
---------------
- Importar y generar un pago confirmado:
  - import { paymentConfirmedEmail } from "./lib/email/templates";
  - const email = paymentConfirmedEmail({ serviceName: "Sesión de diseño", amount: 49.99 });
  - email.subject -> "Pago confirmado - RGL Estudio"
  - email.html -> HTML listo para enviar.

- Generar un cobro mensual sin especificar servicio:
  - import { recurringChargeReceiptEmail } from "./lib/email/templates";
  - const email = recurringChargeReceiptEmail({ amount: 29.0 });
  - email.subject -> "Recibo de tu cobro mensual - RGL Estudio"
  - email.html -> HTML con el monto formateado.

Notas técnicas
-------------
- Seguridad: El valor de serviceName se envuelve con escape(...) antes de insertarse en HTML. Esto evita inyecciones de código malicioso cuando los datos provienen de la BD.
- Formato de moneda: formatUsd usa la configuración "es-EC" con currency "USD". Esto garantiza consistencia en la visualización de montos dólares, respetando el formato de país configurado.
- Diseño: La función layout aplica estilos inline (font-family, color, tamaño, etc.) para maximizar la compatibilidad entre clientes de correo.
- Organización de plantillas: Cada correo es una combinación de un título específico (en el propio HTML) y un cuerpo formateado por template literals. Esto facilita la lectura y el mantenimiento.
- Extensibilidad: Si se requieren nuevos tipos de correos, se pueden añadir nuevas funciones exportadas que llamen a layout y fabriquen el HTML correspondiente manteniendo consistencia con el resto.

Notas de consistencia
---------------------
- Todos los textos de los correos están en español.
- El pie de página es el mismo en todas las plantillas, gracias al layout.
- Las plantillas contemplan la posibilidad de que serviceName no esté definido para algunos correos (la cadena se omite en ese caso).

Última actualización
-------------------
29/5/2026

Observaciones finales
---------------------
Este módulo está diseñado para ser simple y directo, priorizando compatibilidad entre clientes de correo y seguridad de los datos mostrados. Si en el futuro se requieren características más avanzadas (por ejemplo, plantillas con componentes dinámicos adicionales o pruebas unitarias específicas para las plantillas), se puede ampliar manteniendo la estructura existente y reutilizando layout, escape y formatUsd.