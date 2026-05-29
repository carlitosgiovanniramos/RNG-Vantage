# Documentación técnica: app/(auth)/register/page.tsx

Archivo: page.tsx (Ruta: app/(auth)/register/page.tsx)

Total de líneas: 393

Este archivo define la página de registro de usuarios en RNG Vantage. Es un componente cliente de Next.js que presenta un formulario de creación de cuenta, valida la entrada del usuario mediante una validación basada en Zod y envía la acción de “signup” al servidor mediante un servidor de acciones (server action). Incluye utilidades de UX como ver/ocultar contraseñas, validación en tiempo real y manejo de consentimiento de datos.

## Descripción general

- Es un componente React de cliente (directiva "use client") que representa la página de registro.
- Presenta un formulario con campos: nombre, apellido, correo, contraseña, confirmación de contraseña y consentimiento de datos.
- Valida la entrada del usuario usando react-hook-form en combinación con un esquema Zod (registerSchema) y valida con RegisterInput.
- Envía el formulario a una acción de servidor `signup` y maneja el estado de la acción (errores, progreso) a través de un hook auxiliar `useActionState`.
- Implementa utilidades de UX:
  - Ocultar/mostrar contraseñas con iconos.
  - Validación de campos y mensajes de error junto a cada campo.
  - Revisión de autofill para evitar datos mezclados en la sesión.
  - Consentimiento de datos con enlace a la política de privacidad.

## Responsabilidades

- Renderizar la interfaz de registro con una disposición clara y accesible.
- Gestionar el estado del formulario y la validación de entrada.
- Coordinar la interacción entre el cliente y la acción de servidor (`signup`) usando `formAction` y `handleSubmit`.
- Proporcionar feedback al usuario mediante mensajes de error y estado de procesamiento (isPending).
- Ofrecer experiencia de usuario mejorada para contraseñas (mostrar/ocultar) y detección de autofill para reiniciar campos si es necesario.
- Garantizar que el consentimiento de datos sea obligatorio y enlazar la política de privacidad.

## Props / Parámetros

- Este componente es una página de Next.js y no recibe props externos.
- No exporta tipos de props. Todo el estado y los valores iniciales se gestionan internamente o a través del estado de la acción y el formulario.

Notas:
- No hay props pasados al componente RegisterPage. El comportamiento se deriva de su estado local, el estado de la acción de servidor y las validaciones del formulario.

## Retorna

- Retorna un JSX completo que renderiza:
  - Encabezados “Nuevo registro” y “Crear una cuenta”.
  - Un formulario con campos de entrada y controles de UX (toggle de contraseñas, validaciones).
  - Mensajes de error por campo o globales (si existen).
  - Un botón de envío que muestra estado “Creando cuenta…” cuando la acción está pendiente.
  - Enlaces a inicio de sesión y política de privacidad.
- En resumen, es una página funcional de registro que integra UI, validación y envío a servidor.

## Dependencias

- React y hooks nativos: useState, useEffect, useRef
- Next.js (cliente): "use client", Link
- Acciones de servidor y estado de acción:
  - signup (importado desde "@/app/(auth)/actions")
  - useActionState (hook auxiliar para manejar estado de servidor)
- Formulario y validación:
  - react-hook-form: useForm
  - @hookform/resolvers/zod: zodResolver
  - registerSchema, tipo RegisterInput desde "@/lib/validators/auth"
- UI y estilos:
  - Componentes UI: Button, Input, Label (desde "@/components/ui/*")
  - Iconos: Eye, EyeOff, LockKeyhole, Mail, UserRound (lucide-react)
- También utiliza Link para navegación entre rutas ("/login", "/politica-privacidad").

Notas técnicas destacadas:
- El formulario usa un action de servidor (formAction) para enviar los datos al backend mediante un servidor de acciones de Next.js.
- El handleSubmit se orquesta para permitir submit nativo cuando corresponde (mecanismo toggle con allowNativeSubmitRef) para compatibilidad entre cliente y servidor de acciones.
- Se usa reset de react-hook-form para sincronizar valores por defecto con `state.values` proveniente del estado de la acción.
- Se implementa un efecto con temporizador (120 ms) para detectar autofill y resetear el formulario si hay autofill parcial que podría mezclar datos entre campos.
- La validación se realiza a través de un esquema Zod (registerSchema) enlazado con React Hook Form (zodResolver).
- El consentimiento de datos es obligatorio y se maneja como un checkbox registrado en el formulario; el enlace a la política de privacidad es una ruta interna.

## Ejemplos de uso

- Ruta de acceso:
  - URL: /register (equivalente a app/(auth)/register/page.tsx en Next.js)
- Flujo típico:
  - El usuario navega a /register.
  - Completa los campos: nombre, apellido, correo, contraseña y confirmación, y marca el consentimiento de datos.
  - Al pulsar “Registrarse”, se envía la acción de servidor `signup`.
  - Si ocurre un error, se muestra `state.error` o errores de campo basados en las validaciones de react-hook-form.
  - Si la acción está en curso, el botón muestra “Creando cuenta...”.

Ejemplo de uso en código (conceptual, no es parte del archivo):
- Importar y renderizar el componente RegisterPage dentro de una ruta de Next.js ya existente no es necesario, ya que es una página de ruta. Sin embargo, el comportamiento descrito se logra colocando este archivo en la ruta correspondiente y accediendo a la URL indicada.

## Notas técnicas

- Arquitectura y patrones:
  - Cliente-servidor con server actions: `signup` es invocado desde el formulario mediante `formAction`. El flujo de datos está orquestado para aprovechar las capacidades de server actions de Next.js.
  - Estado de acción gestionado con `useActionState(signup, initialState)`, que expone: `state` (información de la acción, incluyendo posibles errores y valores), `formAction` (función de acción para el formulario), `isPending` (indicador de proceso en curso).
- UX y accesibilidad:
  - Campos con etiquetas (Label) asociadas a inputs por medio de htmlFor/id.
  - Iconografía contextual para cada campo (correo, nombre, password, etc.) para mejora visual.
  - Botones de mostrar/ocultar contraseña con estados claros (Eye/EyeOff) y atributos aria-label para accesibilidad.
- Validaciones:
  - Se valida en el cliente con `react-hook-form` y un esquema `registerSchema` de Zod.
  - Validaciones visuales por campo (`errors.*.message`) para retroalimentación al usuario.
  - Requisitos de contraseña: mínimo de 8 caracteres, con combinación de letras mayúsculas/minúsculas, número y carácter especial (explicación en el título del input de contraseña).
- Rendimiento y estabilidad:
  - Uso de `useEffect` para sincronizar valores por defecto con `state.values` y evitar inconsistencias al cambiar el estado de la acción.
  - Detección de autofill con un temporizador para resetear el formulario cuando detecta datos llenados por el navegador, evitando “mezclas” de datos entre campos.
- Seguridad:
  - Enfoque de contraseñas seguras (validación y ocultación hasta que el usuario decida mostrarlas).
  - Consentimiento de datos expuesto como un checkbox obligatorio con enlace a la política de privacidad.

## Última actualización

29/5/2026

Observaciones finales:
- Esta documentación describe fielmente la estructura y el comportamiento presentes en el archivo page.tsx. No se han añadido funcionalidades inexistentes en el código.
- Si se añaden nuevas validaciones, campos o flujos (por ejemplo, verificación de correo duplicado, redirección tras registro exitoso, integración con otros servicios), conviene actualizar esta documentación con esos cambios.