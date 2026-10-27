# RNG Vantage - Documento técnico del archivo: app/(auth)/actions.ts

Ruta del archivo: app/(auth)/actions.ts  
Nombre: actions.ts  
Líneas: 385

Este archivo implementa las acciones del lado del servidor para autenticación (login, signup, logout) y reenvío de confirmaciones de cuenta. Utiliza Supabase para la gestión de usuarios y perfiles, y está diseñado para usarse desde el App Router de Next.js mediante acciones de formulario.

---

## Descripción general

El módulo exporta las siguientes funciones del lado del servidor:

- login: valida credenciales, autentica al usuario con Supabase, gestiona el rol del usuario a partir de la tabla profiles, crea el registro de perfil si falta (auto-corrección), y redirige al dashboard adecuado según el rol.
- signup: valida entradas de registro, crea la cuenta en Supabase, actualiza/crea el registro de perfil (con rol "client"), maneja la necesidad de verificación de correo y redirige adecuadamente.
- logout: cierra la sesión y redirige a la página de login.
- resendSignupConfirmation: reenvía un correo de confirmación de cuenta y maneja validaciones de entrada y errores.

Además, contiene helpers para validación y seguridad:

- splitFullName: normaliza y divide un nombre completo en nombre y apellido.
- mapSupabaseAuthError: normaliza y mapea errores de Supabase a mensajes de usuario en español.
- safeRelativeRedirect: evita open redirects asegurando que las rutas sean relativas y seguras.

La lógica está pensada para ser invocada desde formularios en la UI (server actions), devolviendo errores/valores para mostrar al usuario o ejecutando redirects para navegar.

---

## Responsabilidades

- Validación de entradas de usuario:
  - Verificación de campos requeridos (email, password, nombres, consentimiento de datos).
  - Validación de formato de correo electrónico (regex).
  - Validación de complejidad de contraseñas (regex fuerte).
  - Validación de consentimiento explícito para el tratamiento de datos.
  - Normalización y partición de nombre completo en first_name y last_name.
- Autenticación y gestión de usuarios:
  - Inicio de sesión con correo y contraseña mediante Supabase.
  - Verificación y manejo del estado de la cuenta (activo/inactivo).
  - Auto-creación de registro de perfil si no existe (self-healing).
  - Asignación de rol por defecto ("client") y persistencia de datos de usuario.
- Registro de usuarios:
  - Registro de usuario con campos adicionales (full_name, first_name, last_name) en la data del usuario.
  - Persistencia del perfil (cliente) vía adminClient cuando sea posible, con fallback al servicio estándar de Supabase si no hay clave de servicio.
  - Manejo de flujo de verificación de correo (redirecta a login si se necesita verificación).
- Reenvío de confirmación:
  - Reenvío de correo de confirmación de cuenta con URL de redirección segura.
- Seguridad y experiencia de usuario:
  - Prevención de open redirects mediante safeRelativeRedirect.
  - Traducción de errores de Supabase a mensajes claros y en español.
  - Self-healing de perfiles para evitar estados inconsistentes.
  - Redirección adecuada según rol (admin -> /dashboard, cliente -> /catalogo) o ruta indicada por redirect.
- Observabilidad y compatibilidad:
  - Soporte para entornos donde el key de servicio no está disponible (fallback a la base de datos normal).
  - Manejo de errores coherente para UI con mensajes amigables.

---

## Props / Parámetros

Dado que este archivo contiene funciones de servidor (server actions), cada exportado es una función con parámetros específicos:

- login(_prevState: AuthFormState, formData: FormData)
  - _prevState: AuthFormState (no utilizado en la implementación actual, sirve para la firma de acción).
  - formData: FormData
    - Obtiene: email (string), password (string), redirect (string opcional).
  - Descripción: Valida y realiza el inicio de sesión. Puede devolver un objeto con error y valores para la UI, o redirigir al usuario.

- signup(_prevState: AuthFormState, formData: FormData)
  - _prevState: AuthFormState (no utilizado).
  - formData: FormData
    - Obtiene: email, password, first_name, last_name, full_name, data_consent.
  - Descripción: Valida entradas de registro, ejecuta SignUp en Supabase, actualiza el perfil (con fallback a adminClient) y redirige según el flujo (requiere verificación de correo o va al catálogo).

- logout()
  - Sin parámetros.
  - Descripción: Cierra la sesión y redirige a /login.

- resendSignupConfirmation(_prevState: ResendConfirmationState, formData: FormData)
  - _prevState: ResendConfirmationState (no utilizado).
  - formData: FormData
    - Obtiene: email.
  - Descripción: Reenvía la confirmación de registro a través de Supabase, validando email y devolviendo mensajes de éxito/error.

Funciones auxiliares internas (no exportadas):
- splitFullName(fullName: string)
  - Descripción: Normaliza y separa un nombre completo en firstName y lastName.
- mapSupabaseAuthError(errorMessage: string)
  - Descripción: Normaliza mensajes de error de Supabase a textos claros en español.
- safeRelativeRedirect(path: string | null)
  - Descripción: Valida que la ruta sea interna y relativa para evitar redirecciones externas.

---

## Retorna

- login, signup, resendSignupConfirmation retornan objetos con la forma:
  - { error: string, success?: string, values?: Record<string, any> }
  - Cuando hay errores de validación o de negocio, se devuelven errores legibles y se reenvía el estado de los campos relevantes para rellenar formularios.
- En flujos de negocio exitosos (login/signup) la función realiza redirecciones mediante redirect(...) y no devuelve un valor utilizable (la navegación se procesa en el servidor).
- logout realiza una redirección a /login y no devuelve un valor utilizable.
- En signup, si no hay sesión (debido a verificación necesaria), se redirige a /login?registered=1&email=...; si hay sesión, se redirige a /catalogo.

Notas relevantes sobre retornos:
- Los errores de validación son devoluciones directas.  
- Los errores de autenticación (desde Supabase) se mapean a mensajes amigables en español mediante mapSupabaseAuthError.
- Los redirects se implementan con redirect(...) y no requieren retorno de valor para esa ruta.

---

## Dependencias

- Next.js (App Router) con acciones del servidor (server actions) habilitadas.
- Supabase (cliente de servidor) para autenticación y operaciones en la tabla profiles.
- Admin Supabase client (createAdminClient) para operaciones con una clave de servicio (service role) cuando está disponible.
- Bibliotecas:
  - next/navigation (redirect)
  - "@/lib/supabase/server" (createClient)
  - "@/lib/supabase/admin" (createAdminClient)
- Utilidades/env:
  - process.env.NEXT_PUBLIC_SITE_URL (en resendSignupConfirmation para construir redirect de correo)
- Tipos:
  - FormData nativo (para extracción de campos)
  - Tipos personalizados AuthFormState y ResendConfirmationState

Notas sobre comportamiento de dependencias:
- Existe una ruta de fallback para actualizar perfiles usando el servicio estándar de Supabase si no está disponible la clave de servicio, cubriendo escenarios de entornos donde no se expone la clave de servicio.
- safeRelativeRedirect protege contra open redirects al aceptar solo rutas relativas que no comiencen con // o similar.

---

## Ejemplos de uso

A. Uso típico en un formulario de login (server action) dentro de una página del App Router:

- En la página de login (p. ej., app/(auth)/login/page.tsx):
  - Importar la acción:
    - import { login } from "./actions";
  - Usar como action del formulario:
    - <form action={login}>
        <input name="email" type="email" />
        <input name="password" type="password" />
        <button type="submit">Iniciar sesión</button>
      </form>

B. Uso típico en un formulario de signup:

- En la página de signup (p. ej., app/(auth)/signup/page.tsx):
  - Importar la acción:
    - import { signup } from "./actions";
  - Usar como action del formulario:
    - <form action={signup}>
        <input name="email" type="email" />
        <input name="password" type="password" />
        <input name="first_name" type="text" />
        <input name="last_name" type="text" />
        <input name="full_name" type="text" />
        <input name="data_consent" type="checkbox" />
        <button type="submit">Crear cuenta</button>
      </form>

C. Reenviar confirmación de cuenta:

- En una página de login o recuperación:
  - import { resendSignupConfirmation } from "./actions";
  - <form action={resendSignupConfirmation}>
      <input name="email" type="email" />
      <button type="submit">Reenviar confirmación</button>
    </form>

D. Cerrar sesión:

- En un componente o página protegida:
  - import { logout } from "./actions";
  - <button onClick={() => logout()}>Cerrar sesión</button>

Notas sobre UX:
- En caso de errores de validación, las respuestas devuelven error y valores para rellenar de nuevo el formulario, permitiendo mostrar mensajes concretos y conservar entradas.
- En casos de flujo de signup con posible existencia previa de cuenta, se redirige al usuario hacia login con hints, para evitar bucles de creación.

---

## Notas técnicas

- Seguridad de ruta de redirección:
  - safeRelativeRedirect asegura que las rutas sean internas (empiecen con "/") y no permitan dominios externos o protocolo relativo inseguro. En caso contrario, se ignore la ruta y se usa una ruta por defecto.
- Manejo de perfiles:
  - Al realizar login, el código consulta la tabla profiles para obtener el rol y si está activo.
  - Si el perfil no existe al momento del login, se crea automáticamente usando la metadata del usuario (first_name/last_name) si están disponibles, y se asigna el rol "client" y is_active = true.
- Gestión de roles:
  - Admins: si el perfil obtenido tiene rol "admin", se redirige a /dashboard.
  - Clientes: redirige a /catalogo.
- Flujo de signup y verificación:
  - Si Supabase devuelve una sesión nula tras signUp (lo típico cuando se necesita verificación por correo), se redirige al login con parámetros indicativos.
  - Si hay un error en signup:
    - Se normaliza y mapea el error a un mensaje amigable en español.
    - Si el error sugiere que la cuenta ya existe o se excedió el rate limit, se redirige a login con hint (comprobar o iniciar sesión).
- Uso de adminClient vs fallback:
  - Al registrar un nuevo usuario, se intenta usar el adminClient para upsertar el perfil con datos de consentimiento y timestamps; si falla (por no estar disponible la clave de servicio), se recurre al cliente normal de Supabase para realizar el upsert.
- Validaciones específicas:
  - EMAIL_REGEX: valida formato de correo.
  - STRONG_PASSWORD_REGEX: exige al menos 8 caracteres, con al menos una letra mayúscula, una minúscula, un número y un caracter especial.
  - Validación de nombre y apellido: al menos 2 caracteres cada uno.
  - Consentimiento: debe estar marcado para continuar.
- Mensajes de usuario:
  - mapSupabaseAuthError traduce errores comunes de Supabase a textos claros en español (credenciales, rate limits, usuario ya registrado, correo sin confirmar, etc.).
- Entorno:
  - El reenvío de confirmación puede utilizar NEXT_PUBLIC_SITE_URL para construir la URL de redirección; si no está disponible, no se especifica redirect en las opciones de resend.

---

## Última actualización

29/5/2026

---

Si necesitas que ajuste la documentación a un formato específico (por ejemplo, plantillas de markdown para un repositorio en particular) o quieres ampliar con diagramas de flujo o ejemplos adicionales, dime y lo adapto.