# RNG Vantage – app/(auth)/login/page.tsx

Archivo: app/(auth)/login/page.tsx  
Propósito: Página de inicio de sesión (cliente) del flujo de autenticación. Implementa un formulario controlado con validación, manejo de estados de acción (login y reenvío de confirmación), y soporte para parámetros de URL como redirección y estado de registro.

Fecha de última actualización: 29/5/2026

---

## Descripción general

Este archivo define una página de inicio de sesión para la plataforma RNG Vantage. Es un componente cliente de Next.js que integra:

- Un formulario de inicio de sesión con validación basada en zod (loginSchema) a través de react-hook-form.
- Estados de acción gestionados por useActionState para dos acciones de servidor:
  - login: captura credenciales y ejecuta la autenticación.
  - resendSignupConfirmation: reenvía el correo de confirmación para usuarios que no han verificado su cuenta.
- Soporte para parámetros de URL:
  - redirect: ruta a la que redirigir tras un inicio de sesión exitoso.
  - registered: indica que la cuenta fue creada (muestra un mensaje).
  - hint: guía adicional para mostrar mensajes como “confirm-or-login”.
  - email: prellena el campo de correo electrónico.
- UI accesible y visual con íconos y estados deError/exito.
- Opción para mostrar/ocultar la contraseña.
- Formulario de reenvío de confirmación que aparece condicionalmente cuando procede.

La página principal (LoginPage) renderiza un formulario de inicio de sesión dentro de un contenedor con Suspense y ofrece un enlace a la página de registro.

---

## Responsabilidades

- Proveer una interfaz de inicio de sesión funcional con validación en el cliente.
- Gestionar visibilidad de la contraseña (toggle).
- Coordinar con acciones de servidor (login y resendSignupConfirmation) mediante useActionState.
- Mostrar mensajes de error y de éxito relevantes para el usuario.
- Soportar redirección post-login a través del parámetro redirect.
- Ofrecer un camino para reenvío de confirmación en caso de no haber sido confirmada la cuenta.
- Integrar con el flujo de registro existente (mensaje cuando ya hay una cuenta creada).
- Mantener la experiencia UX incluso cuando la página es cargada inicialmente o cuando hay prefill de datos desde la URL.

---

## Props / Parámetros

Nota: Este archivo exporta componentes React sin props explícitos visibles para su uso externo. A continuación se describe lo relevante.

| Componente | Prop | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| LoginForm (componente interno) | none | — | Sí | No tiene props públicos; maneja su estado, validación y acciones de login y reenvío internamente. |
| LoginPage (exportado por defecto) | none | — | Sí | No recibe props; renderiza LoginForm y un enlace a la página de registro. |

Observación: Todas las interacciones y datos (estado, errores, etc.) se gestionan internamente dentro de LoginForm y mediante el hook useActionState.

---

## Retorna

- LoginPage:
  - Un contenedor principal con:
    - Un bloque Suspense que renderiza LoginForm (con fallback de “Cargando formulario...”).
    - Un párrafo con un enlace a la página de registro.
- LoginForm:
  - Un formulario de inicio de sesión con campos de correo electrónico y contraseña, con validación de errores.
  - Mensajes condicionados para: cuenta creada, confirmación pendiente, errores de login, y errores de reenvío de confirmación.
  - Botón de inicio de sesión que refleja el estado de carga.
  - Opción para mostrar/ocultar la contraseña.
  - Formulario adicional para reenviar la confirmación (visible cuando corresponde).

---

## Dependencias

- React (client) y hooks:
  - useEffect, useRef, useState
- Next.js:
  - Link (navegación), useSearchParams (parámetros de URL)
- UI components:
  - Button, Input, Label desde "@/components/ui/..."
- Iconografía:
  - lucide-react (Eye, EyeOff, LockKeyhole, Mail)
- Formulario y validación:
  - react-hook-form (useForm)
  - @hookform/resolvers/zod (zodResolver)
  - zod (a través de loginSchema)
- Validación y tipos:
  - loginSchema, type LoginInput desde "@/lib/validators/auth"
- Acciones de servidor (Next.js App Router):
  - login, resendSignupConfirmation desde "@/app/(auth)/actions"
  - useActionState para gestionar estados de acción y resultados
- Otros:
  - Suspense para renderizado asíncrono
  - Manejo de redirecciones y estados basados en URL (redirect, registered, hint, email)

Notas:
- login y resendSignupConfirmation son acciones del servidor; useActionState facilita su ejecución desde el cliente y expone state, action y isPending.
- El código hace uso de validación con un esquema Zod y maneja mensajes de error/éxito en la UI.
- Se utilizan componentes UI personalizados (Input, Button, Label) para consistencia visual.

---

## Ejemplos de uso

- Acceder a la página de login (ruta):
  - /login
- Inicio de sesión con redirección a una ruta tras el login:
  - /login?redirect=%2Fdashboard
  - En caso de éxito, el flujo redirige al path indicado en redirect.
- Caso de cuenta recién creada:
  - /login?registered=1
  - Se muestra un aviso informando que la cuenta fue creada y que hay que confirmar el correo.
- Caso de usar el flujo de confirmación:
  - /login?hint=confirm-or-login
  - Se muestra un mensaje que indica confirmar el correo si ya se registró.

Ejemplo mínimo de uso desde otro componente (conceptual):
- Navegar al login para autenticarse y luego redirigir a la ruta deseada:
  - <Link href="/login?redirect=/dashboard">Iniciar sesión</Link>

---

## Notas técnicas

- Cliente vs. servidor:
  - La página es un componente cliente (declara "use client" al inicio).
  - las acciones login y resendSignupConfirmation son acciones del servidor invocadas desde el cliente mediante useActionState.
- Flujo de envío:
  - El formulario utiliza un manejo mixto entre submit nativo y React Hook Form.
  - Una bandera allowNativeSubmitRef controla cuándo permitir submit nativo para que el flujo de Next.js App Router pueda interceptarlo adecuadamente.
  - Al hacer submit, se invoca handleSubmit y luego se activa el submit nativo para completar la acción del servidor.
- Validación y errores:
  - Se valida con loginSchema a través de zodResolver.
  - Errores de campos (email, password) se muestran bajo cada input.
  - Mensajes de error globales para estados de login y reenvío de confirmación se muestran en tarjetas con estilo consistente.
- Prefill y autofill:
  - Soporta prefillEmail desde el query parameter email.
  - Hay lógica para detectar autofill en el campo email o en password después de 120 ms y restablecer el formulario para evitar valores no deseados.
- Accesibilidad y UX:
  - Campos tienen etiquetas (Label) adecuadas.
  - Iconos de entrada (Mail, LockKeyhole) para indicar el tipo de input.
  - Botón de mostrar/ocultar contraseña con aria-label adecuado.
- Rendimiento y estabilidad:
  - Suspense alrededor del formulario puede permitir futuras mejoras de carga dinámica si las acciones del servidor requieren esperas.
  - Los mensajes de estado (cargando, errores, éxitos) están condicionados para evitar mostrar información irrelevante.
- Limitaciones conocidas:
  - El flujo de reenviar confirmación depende de la acción server-side resendSignupConfirmation y del estado mostrado por useActionState; cualquier cambio en la API de esas acciones puede requerir ajustes en la UI de mensajes.
  - El comportamiento de redirección asume que la ruta indicada en redirect es válida y accesible; validaciones adicionales podrían ser necesarias en producción.
- Mantenibilidad:
  - El uso de componentes UI reutilizables (Input, Button, Label) facilita consistencia visual a lo largo de la aplicación.
  - La lógica de prefill y autofill está encapsulada en el componente LoginForm, reduciendo el impacto en otras partes de la aplicación.

---

## Última actualización

29/5/2026

Si necesitas que ajuste la documentación a un formato distinto o quieras agregar ejemplos de prueba, házmelo saber.