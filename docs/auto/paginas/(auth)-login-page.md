# Documentación técnica: app/(auth)/login/page.tsx

Este documento describe el archivo TypeScript/React app/(auth)/login/page.tsx del proyecto RNG Vantage. Proporciona una visión general, responsabilidades, API de componentes, dependencias, ejemplos de uso y notas técnicas para facilitar la comprensión y el mantenimiento sin necesidad de revisar el código fuente completo.

## Descripción general

El archivo define la página de inicio de sesión de la aplicación RNG Vantage. Es un componente de cliente (cliente de Next.js) que integra:
- Un formulario de inicio de sesión con validación (React Hook Form + Zod).
- Manejo de estado asíncrono para la acción de login y la reenvío de confirmación de correo.
- Visualización de mensajes de éxito/error y soporte para reenvío de confirmación.
- Detección de redirección post-login mediante query params.
- Opción para mostrar/ocultar la contraseña.
- Enlace a la página de registro.

La página utiliza componentes de UI propios (Button, Input, Label) y utiliza íconos de lucide-react para mejorar la UX. También maneja un modo de envío nativo para asegurar compatibilidad con la navegación de Next.js.

La página exporta un componente por defecto LoginPage que renderiza un login form dentro de Suspense y un enlace a la página de registro.

## Responsabilidades

- Presentar una interfaz de inicio de sesión con campos de correo electrónico y contraseña.
- Validar entradas con un esquema de validación (loginSchema) y mostrar errores de validación.
- Gestionar el estado de la acción de login (esperando, éxito, error) mediante useActionState.
- Gestionar el estado de la acción de reenviar la confirmación de registro (resendSignupConfirmation) y mostrar mensajes correspondientes.
- Soportar redirección tras el login mediante un parámetro redirect en la URL.
- Soportar parámetros de estado de la URL para mostrar mensajes de registro previo o hint de confirmación (registered, hint, email).
- Soportar reenvío de confirmación si el usuario no recibió el correo.
- Permitir mostrar u ocultar la contraseña mediante un botón de toggling.
- Mantener un layout y estilo consistente con los componentes de UI de la aplicación.

## Props / Parámetros

Este archivo define componentes React que no reciben props explícitos a través de JSX. En concreto:

- LoginPage
  - Props: ninguno
  - Descripción: Página que renderiza el formulario de inicio de sesión dentro de Suspense y un enlace a Registro.

- LoginForm (componente interno)
  - Props: ninguno
  - Descripción: Fragmento de UI que implementa el formulario de inicio de sesión y la lógica de interacción (validación, envío, mensajes, etc.).

Notas:
- No se exponen props para estos componentes en el archivo; el comportamiento está controlado por el estado interno y los hooks usados.
- Otros valores contextuales (redirection, prefill de email, mensajes) se obtienen de la URL mediante useSearchParams.

## Retorna

- LoginPage
  - Retorna JSX que compone la página de inicio de sesión, envuelta en un div con espaciado. Contiene:
    - Suspense con un fallback de carga.
    - El componente LoginForm.
    - Un párrafo con un enlace a la página de registro.

- LoginForm
  - Retorna JSX que compone:
    - Un bloque de cabecera con una etiqueta “Acceso seguro” y títulos.
    - Un formulario con:
      - Campos de correo electrónico y contraseña (con validación y errores).
      - Botón de mostrar/ocultar contraseña.
      - Botón de submit que cambia su texto cuando la acción está en curso.
    - Mensajes condicionados:
      - Confirmación de cuenta creada (wasRegistered).
      - Indicaciones para confirmar correo (hint).
      - Mensajes de éxito/errores de reenviar confirmación.
      - Mensajes de error de login.
    - Sección para reenviar la confirmación (mostrar cuando shouldShowResend es true):
      - Campo de correo para reenviar.
      - Botón de reenviar confirmación.
    - Botón de submit para iniciar sesión.
    - Enlaces y textos de ayuda.

## Dependencias

Este archivo depende de varias librerías, componentes y hooks:

- React y hooks de React:
  - useState, useEffect, useRef, Suspense
- Next.js:
  - Link (next/link)
  - useSearchParams (next/navigation)
- UI y composición:
  - Button, Input, Label (componentes propios)
- Iconografía:
  - lucide-react: Eye, EyeOff, LockKeyhole, Mail, Sparkles (Sparkles no se usa en el código mostrado)
- Gestión de formularios y validación:
  - react-hook-form: useForm
  - @hookform/resolvers: zodResolver
  - zod: integración vía loginSchema
- Validaciones y tipos:
  - loginSchema, type LoginInput desde "@/lib/validators/auth"
- Acciones asíncronas:
  - login, resendSignupConfirmation desde "@/app/(auth)/actions"
  - useActionState (hook propio para manejar estados de acción asíncrona)
- Navegación y parámetros de la URL:
  - useSearchParams para leer redirect, registered, hint, email
- Comportamiento de submit:
  - Mecanismo para coordinar submit nativo y manejo con React Hook Form (allowNativeSubmitRef)

Notas técnicas relevantes:
- Sparkles está importado pero no utilizado en el código mostrado.
- El formulario utiliza un truco para combinar manejo de submit de React Hook Form y submit nativo para compatibilidad con Next.js Actions:
  - handleSubmit(() => { allowNativeSubmitRef.current = true; formElement.requestSubmit(); })
- Se emplea Suspense para el LoginForm con fallback de carga, lo que sugiere que la carga de datos podría ser asíncrona o que se prefiere mostrar un estado de carga inicial.
- Validación de campos:
  - email: requerido, formato email (validación proviene de loginSchema).
  - password: requerido.
- UI/UX:
  - Campos con iconografía, entradas con estilos de Tailwind, telemetro de accesibilidad con aria-label en el botón de toggling de contraseña.
  - Mensajes de estado de operaciones mostrados de forma destacada (con colores como border/red/green etc.) según estado.

## Ejemplos de uso

- Acceder a la página de inicio de sesión:
  - URL: /login
- Pasar redirección después del login:
  - URL: /login?redirect=/dashboard
- Mostrar mensaje de cuenta creada y pedir confirmación:
  - URL: /login?registered=1
- Indicar que se debe confirmar el correo antes de iniciar sesión:
  - URL: /login?hint=confirm-or-login
- Prefijar email para el formulario:
  - URL: /login?email=usuario@example.com
- Reenviar confirmación si no llegó el correo:
  - Cuando la URL contiene hint con valor relacionado o al activar Resend, se muestra el bloque para reenviar (gracias a shouldShowResend).

Ejemplo mínimo de uso en tu proyecto Next.js:
- Coloca este archivo en app/(auth)/login/page.tsx.
- Accede a la ruta /login desde el navegador para ver la página de inicio de sesión con funcionalidad completa.

## Notas técnicas

- Manejo de estado asíncrono:
  - login y resendSignupConfirmation se gestionan mediante el hook personalizado useActionState, devolviendo [state, action, isPending] o [resendState, resendAction, isResending].
  - isPending e isResending se utilizan para deshabilitar botones y mostrar textos de estado.
- Redirección y prefilling:
  - redirectParams se obtiene desde la query param redirect.
  - El formulario incluye un input oculto con name="redirect" y value del redirectParams para conservar la información durante el flujo de envío.
  - Prefill email desde state.values.email o from query param email.
- Validación y errores:
  - Se utiliza zodResolver con loginSchema para validar los campos.
  - Errores se muestran bajo cada campo cuando existen.
  - Mensajes de error globales se muestran en bloques de alerta (rojo) y mensajes de éxito (verde) para acciones de reenviar.
- Reenvío de confirmación:
  - El bloque de reenvío aparece condicionalmente en shouldShowResend, que depende de hint y/o errores de confirmación de correo.
  - El formulario de reenviar utiliza resendAction y un input de correo con valor por defecto de state.values.email, prefillEmail o resends values.
- Enlace a registro:
  - Debajo del formulario, se ofrece un enlace a /register para que los usuarios creen una cuenta.
- Consideraciones de rendimiento:
  - Suspense envuelve el login form; el fallback es un texto de carga centrado.
  - Uso de timers en useEffect para detectar autofill/prefill de correo y resetear el formulario en consecuencia (tiene un setTimeout de 120 ms).
- Accesibilidad:
  - Campos tienen etiquetas y placeholders descriptivos.
  - Botón para mostrar/ocultar contraseña tiene aria-label adecuado.
- Observaciones:
  - Sparkles importado, pero no utilizado en el código proporcionado.
  - La estructura maneja tanto submit para React Hook Form como submit nativo vía requestSubmit para interoperabilidad con Next.js Actions.

## Última actualización

12/5/2026

Si necesitas que agregue ejemplos adicionales, pruebas unitarias/mocks para los componentes o una breve guía de migración para cambios futuros, dímelo y lo amplio.