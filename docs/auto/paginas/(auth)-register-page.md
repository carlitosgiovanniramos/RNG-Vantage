# RNG Vantage - app/(auth)/register/page.tsx

Descripción: página de registro de usuarios en RNG Vantage. Es un componente cliente de Next.js que renderiza un formulario de registro con validación basada en Zod, manejo de estado asíncrono para la acción de signup y controles de UI para una experiencia de usuario rica (mostrar/ocultar contraseñas, validaciones, consentimiento de datos, etc.). Se integra con el flujo de autenticación del proyecto y utiliza componentes de UI propios.

## Descripción general

- Es una página de registro accesible en la ruta correspondiente del proyecto Next.js (Next.js App Router).  
- Renderiza un formulario con los siguientes campos: nombre, apellido, correo electrónico, contraseña, confirmar contraseña y consentimiento de datos (LOPDP).  
- Valida entradas mediante un esquema de validación (registerSchema) usando react-hook-form con resolutor zodResolver.  
- Integra una acción asíncrona de signup y gestiona su estado con useActionState(signup, initialState).  
- Soporta autofill/auto-completado y restablece campos para evitar conservar contraseñas o datos no deseados cuando se detecta autofill.  
- Proporciona controles para mostrar/ocultar contraseñas y muestra mensajes de error específicos de cada campo.  
- Incluye enlaces a la política de datos y a la página de login.

## Responsabilidades

- Renderizar la interfaz de registro con diseño de dos columnas para nombre y apellido.  
- Gestionar visibilidad de contraseñas (password y confirm_password) mediante estados showPassword y showConfirmPassword.  
- Integrar la validación de entradas con el esquema registerSchema y mostrar errores de validación por campo.  
- Enviar datos del formulario a través de la acción signup y reflejar el estado de procesamiento (isPending) en el botón de envío.  
- Manejar un banner de error general para state.error proveniente de la acción de signup.  
- Implementar lógica de restablecimiento del formulario cuando ciertas condiciones de autofill se cumplen (evita conservar contraseñas o datos prellenados inesperados).  
- Requerir consentimiento de datos (data_consent) y enlazar a la política de privacidad.  
- Proporcionar navegación a la página de login para usuarios ya registrados.

## Props / Parámetros

Este componente es una página de ruta (page.tsx) y no recibe props. Por lo tanto:

- Nombre: RegisterPage
- Tipo: React.FC/JSX.Element (componente de página)
- Props: ninguno

Notas:
- El estado y valores iniciales se gestionan internamente mediante hooks (initialState y useActionState).  
- Si en el futuro se expusieran props, se documentarían aquí.

## Retorna

- JSX que representa la página de registro. Incluye:
  - Encabezados y descripciones de la página.
  - Un formulario con campos controlados por react-hook-form.
  - Mensajes de error global y por campo.
  - Controles para mostrar/ocultar contraseñas.
  - Checkbox de consentimiento y enlace a la política.
  - Botón de envío que cambia a "Creando cuenta..." mientras está en estado pendiente.
  - Enlaces de navegación: “Inicia sesión” y “Leer política”.

Formato de retorno: un árbol de componentes React renderizado en el DOM con divs, labels, inputs, botones y enlaces.

## Dependencias

- React (hook useEffect, useState, useRef)  
- Next.js (Link, app router)  
- “signup” acción: "@/app/(auth)/actions"  
- useActionState: hook para manejar estado de acciones asíncronas con initialState  
- lucide-react: Iconos para UI (Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound)  
- Componentes UI propios:
  - Button: "@/components/ui/button"
  - Input: "@/components/ui/input"
  - Label: "@/components/ui/label"
- react-hook-form: useForm  
- @hookform/resolvers/zod: zodResolver  
- Validadores de autenticación: "@/lib/validators/auth" (registerSchema, type RegisterInput)

Notas técnicas importantes:
- El esquema de validación utilizado es registerSchema (x) y se aplica mediante zodResolver para validar en el formulario.
- El tipo de datos del formulario se define como RegisterInput, lo que aporta tipado estático a los campos del formulario.
- El estado del proceso de signup se maneja con useActionState(signup, initialState), exponiendo state, formAction y isPending.
- Los campos tienen validación a nivel de interfaz y también a través del esquema; los mensajes de error se muestran debajo de cada input cuando existen.
- El manejo del submit alterna entre submit nativo y submit controlado para soportar el flujo de Next.js y el formulario nativo (ver onSubmit del form y allowNativeSubmitRef).
- Hay lógica de autofill para evitar conservar datos sensibles tras autocompletar campos (120 ms after mount, comprueba si el usuario prellenó los campos y resetea si corresponde).
- El consentimiento de datos es obligatorio y enlaza a "/politica-privacidad".

## Ejemplos de uso

- Uso típico dentro de la app Next.js (ruta de la página):
  - Ruta: app/(auth)/register/page.tsx
  - Este archivo exporta por defecto RegisterPage, que se renderiza como la página de registro en la ruta correspondiente.
- Fragmento mínimo ilustrativo (conceptual, fuera de este archivo):
  - No es necesario instanciar este componente desde otro lugar; está diseñado para ser una página de ruta en el proyecto.

Código relevante (extracto, orientativo):
- No se deben copiar/pegar grandes porciones del código, pero para entender la API:
  - useForm<RegisterInput> con resolver: zodResolver(registerSchema)
  - useActionState(signup, initialState)
  - Campos: first_name, last_name, email, password, confirm_password, data_consent
  - UI: Input, Label, Iconos (UserRound, Mail, LockKeyhole, Eye, EyeOff)
  - Submit button: cambia a "Creando cuenta..." cuando isPending

Notas técnicas destacadas:
- La UI utiliza dos columnas para Nombre y Apellido, y una fila completa para Email, Contraseña y Confirmar contraseña.
- El checkbox data_consent es obligatorio y muestra una nota de “Requerido para continuar” junto a un enlace a la política.
- El comportamiento de “prefill” evita que, si el usuario ya ingresó datos manualmente o el sistema detecta autofill, se conserven contraseñas y datos no intencionados tras la detección.
- El campo full_name está definido en el estado inicial pero no se presenta en la UI; podría haber sido un placeholder para compatibilidad futura.

## Notas técnicas

- Compatibilidad de submit: El formulario utiliza onSubmit con una lógica que alterna entre submit nativo y controlado. Esto se logra con allowNativeSubmitRef. Este patrón ayuda a mantener compatibilidad con el flujo de Next.js y la validación de react-hook-form sin romper el comportamiento del formulario nativo.
- Orden de efectos: Hay dos useEffect principales:
  - Uno que llama a reset para sincronizar valores por causas externas (state?.values, etc.), garantizando que el formulario muestre valores actuales del estado.
  - Otro que observa cambios en state.values para detectar autofill y reiniciar valores del formulario si se detecta autofill de perfil o contraseñas.
- Dependencias de validación: El formulario depende de registerSchema para validar los campos. Los mensajes de error se exponen a través de errors del formState.
- Acceso a campos: Los inputs están ligados mediante {...register("campo")} para integrarse con react-hook-form y la validación.
- Mensajes de error: Existe un banner de error general cuando state.error está presente, y mensajes de error por campo cuando errors.campo está definido.

## Última actualización

12/5/2026

---

Si necesitas que adapte la documentación a un formato distinto (por ejemplo, incluir tablas para Props, o ampliar el diagrama de flujo), dime y lo ajusto.