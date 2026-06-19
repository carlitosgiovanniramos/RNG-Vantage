# RNG Vantage — app/(auth)/actions.ts

Este archivo define las acciones de servidor para autenticación en la aplicación RNG Vantage. Implementa flujos de login, signup, cierre de sesión y resending de confirmación de cuenta utilizando Supabase, con apoyo para administración de usuarios y manejo de perfiles.

- Ruta: app/(auth)/actions.ts
- Directorio: app/(auth)
- Tipo de contenido: acciones de servidor (server actions) con "use server"

## Descripción general

Las funciones exportadas en este archivo proporcionan los flujos de autenticación del lado del servidor:

- login: valida credenciales, autentica al usuario y redirige según el rol (admin o cliente). Si el perfil no existe, realiza una auto-curación (self-healing) insertando un registro de perfil básico basado en metadata del usuario.
- signup: valida y registra a un nuevo usuario, almacena datos de perfil (nombre, apellido, nombre completo) y establece el rol por defecto como cliente. Si hay conflicto (ya registrado o necesidad de confirmación), redirige o devuelve errores amigables.
- logout: cierra la sesión y redirige al login.
- resendSignupConfirmation: reenvía el correo de confirmación de registro y maneja errores de forma amigable.

La lógica hace uso de dos clientes de Supabase:

- createClient: cliente de Supabase para operaciones regulares.
- createAdminClient: cliente con permisos de administrador para operaciones de alto privilegio (p. ej., upsert de perfiles).

Se apoya en el esquema de perfiles (table: profiles) para roles y datos de consentimiento.

## Responsabilidades

- Validación de entradas de usuario y normalización de datos:
  - Validación de email (regex).
  - Validación de contraseñas (política de complejidad).
  - Normalización de nombres (splitFullName, manejo de first_name / last_name).
  - Verificación de consentimiento de datos (data_consent).
- Autenticación y manejo de sesiones con Supabase:
  - login usa signInWithPassword.
  - signup usa signUp y maneja casos de confirmación y/o conflictos de correo.
- Gestión de perfiles:
  - Lectura del rol desde la tabla profiles.
  - Self-healing: creación de un perfil si no existe al iniciar sesión.
  - Upsert de perfiles al registrar (primero con adminClient, luego fallback al service role a través de supabase).
- Manejo de errores y mensajes amigables:
  - mapSupabaseAuthError traduce mensajes de Supabase a mensajes en español.
  - Respuestas de error se devuelven al frontend con valores previos para facilitar reintentos.
- Flujo de redirección:
  - Si la autenticación o el registro es exitoso, se redirige a páginas adecuadas (dashboard para admins, catálogo para clientes).
  - En signup, si no hay sesión tras la creación, se redirige a login con indicador de registro.
  - En resend, se construye la URL de redirección usando NEXT_PUBLIC_SITE_URL cuando está disponible.
- Seguridad y entorno:
  - Las acciones se ejecutan en el servidor ("use server").
  - Se soporta un fallback si el servicio key de administrador no está disponible localmente.

## Props / Parámetros

A continuación se detallan las firmas y descripciones de cada función exportada (son server actions):

- AuthFormState (tipo interno)
  - error: string
  - values?: objeto con posibles campos
    - full_name?: string
    - first_name?: string
    - last_name?: string
    - email?: string
    - data_consent?: boolean

- ResendConfirmationState (tipo interno)
  - error: string
  - success: string
  - values?: { email?: string }

- splitFullName(fullName: string): { firstName: string; lastName: string }
  - Descripción: normaliza y separa el nombre completo en nombre(s) y apellido(s).

- mapSupabaseAuthError(errorMessage: string): string
  - Descripción: mapea errores de Supabase a mensajes amigables en español.

- login(_prevState: AuthFormState, formData: FormData): Promise<any>
  - Parámetros:
    - _prevState: AuthFormState (no utilizado directamente en la lógica; se mantiene por compatibilidad de server action).
    - formData: FormData
      - email: string (correo del usuario)
      - password: string (contraseña)
      - redirect?: string (ruta deseada tras login)
  - Retorno: devuelve un objeto de error con campos { error: string; values?: { email?: string } } en caso de error. En caso de éxito, realiza una redirección mediante redirect y no devuelve valor explícito.

- signup(_prevState: AuthFormState, formData: FormData): Promise<any>
  - Parámetros:
    - _prevState: AuthFormState
    - formData: FormData
      - email: string
      - password: string
      - first_name?: string
      - last_name?: string
      - full_name?: string
      - data_consent?: string (valor proveniente de checkbox)
  - Retorno: devuelve un objeto de error con valores de formulario en caso de error. En éxito, puede redirigir a login (si no hay sesión) o hacia catálogo, según el flujo y la sesión. No devuelve valor explícito en el éxito.

- logout(): Promise<void>
  - Parámetros: ninguno.
  - Retorno: void. Realiza signOut y redirige a /login.

- resendSignupConfirmation(_prevState: ResendConfirmationState, formData: FormData): Promise<any>
  - Parámetros:
    - _prevState: ResendConfirmationState
    - formData: FormData
      - email: string
  - Retorno: objeto con { error: string; success: string; values?: { email?: string } }. En caso de error, error contiene mensaje amigable; en éxito, se devuelve con un mensaje de éxito.

## Dependencias

- Librerías y servicios:
  - Next.js (App Router, server actions)
  - Supabase (cliente de autenticación y base de datos)
- Módulos locales:
  - "@/lib/supabase/server" -> createClient()
  - "@/lib/supabase/admin" -> createAdminClient()
- Base de datos y esquemas:
  - Tabla profiles con columnas: id, first_name, last_name, role, data_consent_at, etc. Se utiliza para almacenar roles (admin, client) y metadatos de usuario.
- Variables de entorno:
  - NEXT_PUBLIC_SITE_URL (se usa para construir la URL de redirección en resendSignupConfirmation)

## Ejemplos de uso

Los server actions están diseñados para ser utilizados como acciones de formulario en la UI (App Router). A continuación ejemplos de uso típicos:

- Login (en un formulario de login):
  - Form action: login
  - Campos esperados en FormData: email, password, redirect (opcional)
  - Ejemplo de JSX (ilustrativo):
    - <form action={login}>
        <input name="email" type="email" />
        <input name="password" type="password" />
        <input name="redirect" type="hidden" value="/catalogo" />
        <button type="submit">Entrar</button>
      </form>

- Signup (en un formulario de registro):
  - Form action: signup
  - Campos esperados: email, password, first_name, last_name, full_name, data_consent
  - Ejemplo ilustrativo:
    - <form action={signup}>
        <input name="email" type="email" />
        <input name="password" type="password" />
        <input name="first_name" />
        <input name="last_name" />
        <input name="full_name" />
        <input name="data_consent" type="checkbox" />
        <button type="submit">Registrarse</button>
      </form>

- Logout:
  - Form action: logout
  - Ejemplo:
    - <form action={logout}>
        <button type="submit">Cerrar sesión</button>
      </form>

- Reenvío de confirmación de registro:
  - Form action: resendSignupConfirmation
  - Campos esperados: email
  - Ejemplo:
    - <form action={resendSignupConfirmation}>
        <input name="email" type="email" />
        <button type="submit">Reenviar confirmación</button>
      </form>

Nota: En App Router, los server actions pueden ser invocados directamente desde el atributo action de un formulario; los métodos devuelven objetos de estado (errores/valores) que pueden ser manejados por la UI para mostrar mensajes.

## Notas técnicas

- Validación de errores y mensajes en español:
  - mapSupabaseAuthError traduce errores comunes de Supabase a mensajes legibles para el usuario en español, por ejemplo:
    - "invalid login credentials" -> "Credenciales inválidas"
    - "email rate limit exceeded" -> "Demasiados intentos seguidos. Espera unos minutos..."
    - "user already registered" -> "Ese correo ya está registrado. Inicia sesión o confirma tu correo."
    - "email not confirmed" -> "Debes confirmar tu correo electrónico..."
    - "password should be at least" -> "La contraseña debe tener al menos 6 caracteres" (nota de posible inconsistencia con el regex de 8 caracteres)
- Política de contraseñas:
  - STRONG_PASSWORD_REGEX exige al menos 8 caracteres, con al menos una minúscula, una mayúscula, un dígito y un carácter especial.
  - El mensaje de error asociado en login/signup parece mencionar 6 caracteres de mínimo; hay una discrepancia entre el enunciado del error y la validación real. Se recomienda alinearlo para evitar confusión.
- Self-healing de perfiles:
  - Tras un login exitoso, se consulta la tabla profiles para el rol del usuario.
  - Si no existe perfil, se crea automáticamente con:
    - id = data.user.id
    - first_name / last_name derivados de user_metadata si están disponibles
    - role = "client"
    - data_consent_at = timestamp actual
  - Esto facilita que usuarios recién autenticados sin perfil sean tratados como clientes sin interrupciones.
- Flujo de signup y manejo de conflictos:
  - Si Supabase devuelve errores como "email rate limit exceeded" o "user already registered", el flujo redirige a login con hint para confirmar o iniciar sesión, evitando bloquear al usuario en un intento de signup.
- Persistencia de perfiles:
  - Al finalizar el signup, se intenta upsert del perfil usando createAdminClient() (servicio con permisos de administrador).
  - Si falla (p. ej., ausencia de service key en entorno local), se hace un fallback usando el client normal para insertar el perfil.
  - El upsert lleva { onConflict: "id" } para evitar duplicados.
- Resend de confirmación:
  - Construye redirectUrl usando NEXT_PUBLIC_SITE_URL si está disponible.
  - Llama a supabase.auth.resend con type: "signup" y, si disponible, emailRedirectTo: redirectUrl.
- Redirecciones:
  - login: admin -> /dashboard, else -> /catalogo (con redirectTo si se proporciona).
  - signup: tras registro exitoso sin sesión, redirige a /login?registered=1&email=...; si hay sesión, redirige a /catalogo.
- Seguridad:
  - Todas las operaciones se corren en el servidor.
  - Se maneja la posibilidad de ausencia de claves de servicio de administrador de forma segura con fallback.

## Última actualización

12/5/2026

---

Si necesitas, puedo adaptar esta documentación para que se integre con tu guía de estilo o agregar ejemplos de pruebas (unitarias/integración) para estas acciones.