# Documentación técnica: app/(dashboard)/clientes/actions.ts

Este archivo define funciones de servidor (server actions) para la gestión de clientes dentro del dashboard de RNG Vantage. Implementa autenticación basada en roles (solo admin) y operaciones sobre perfiles de clientes almacenados en Supabase, además de enriquecer la información de los clientes con correos electrónicos obtenidos desde el listado de usuarios admins.

- Ruta: app/(dashboard)/clientes/actions.ts
- Formato: TypeScript en modo “server” (use server)

## Descripción general

actions.ts expone funciones para:
- Verificar que el usuario actual sea admin y esté activo.
- Obtener la lista de clientes con información básica almacenada en la tabla profiles y enriquecerla con el correo electrónico de cada usuario.
- Actualizar datos de un cliente (nombre, apellidos e estado activo).
- Activar/desactivar un cliente.
- Revalidar la ruta de la interfaz de clientes para reflejar cambios en la UI.

Todo ello se ejecuta en el servidor, aprovechando las capacidades de Next.js App Router y Supabase para operaciones seguras y consistentes.

## Responsabilidades

- Validar permisos de administrador para todas las operaciones sensibles.
- Consultar y retornar la lista de clientes desde la tabla profiles.
- Enriquecer el listado de clientes con el correo electrónico correspondiente obtenido desde la API de administración de usuarios (admin.listUsers).
- Validar y/o sanitizar entradas de actualización de perfiles de clientes.
- Actualizar campos especificados (first_name, last_name, is_active) en perfiles de clientes.
- Cambiar el estado activo de un cliente (toggle).
- Revalidar rutas relevantes para mantener la UI sincronizada tras cambios (revalidatePath).

## Props / Parámetros

A continuación se detallan las firmas y descripciones de cada función exportada.

- ensureAdmin(): Promise<{ supabase: any; error: string | null }>
  - Descripción: Valida que haya un usuario autenticado con rol admin y activo. Devuelve el cliente de Supabase (para usar en consultas) y un error si no está autorizado.
  - Parámetros: Ninguno.
  - Retorna: Objeto con:
    - supabase: cliente de Supabase ya autenticado.
    - error: string o null. Si es no autorizado, contiene un mensaje.

- getClients(): Promise<{ data: ClientRow[] } | { error: string }>
  - Descripción: Obtiene la lista de perfiles con rol "client" y los ordena por fecha de creación descendente. Enriquede cada cliente con su email obtenido desde el listado de usuarios del admin (si es posible).
  - Parámetros: Ninguno.
  - Retorna:
    - Caso éxito: { data: ClientRow[] }
    - Caso error: { error: string }

- updateClient(
  id: string,
  formData: { first_name: string; last_name: string; is_active: boolean }
): Promise<{ error?: string; success?: boolean }>
  - Descripción: Actualiza los campos first_name, last_name e is_active del perfil con id dado y rol "client".
  - Parámetros:
    - id: string. Identificador del cliente (id de usuario).
    - formData: objeto con:
      - first_name: string (nombre)
      - last_name: string (apellido)
      - is_active: boolean (estado activo)
  - Retorna:
    - Caso éxito: { success: true }
    - Caso error: { error: string }

- toggleClientActive(id: string, isActive: boolean): Promise<{ error?: string; success?: boolean }>
  - Descripción: Actualiza el campo is_active para el perfil de cliente especificado.
  - Parámetros:
    - id: string. Identificador del cliente.
    - isActive: boolean. Nuevo estado activo.
  - Retorna:
    - Caso éxito: { success: true }
    - Caso error: { error: string }

## Dependencias

- next/cache
  - revalidatePath: función para invalidar/actualizar caché de rutas en Next.js.
- @/lib/supabase/server
  - createClient: constructor/cliente de Supabase para operaciones de lectura/escritura en el contexto del servidor (usuario actual y autorización).
- @/lib/supabase/admin
  - createAdminClient: cliente de Supabase configurado para operaciones administrativas (p. ej., admin.listUsers).
- Tipado local
  - ClientRow: tipo definido en el propio archivo para representar la fila de cliente con campos como id, first_name, last_name, email, role, is_active, created_at, updated_at.

Notas sobre dependencias externas:
- La obtención de emails de clientes usa un cliente admin para llamar admin.listUsers, que puede no devolver direcciones para todos los usuarios; hay manejo de fallback (No disponible / Sin email).
- revalidatePath se usa tras actualizaciones para asegurar que la UI del dashboard se actualice de manera reactiva.

## Ejemplos de uso

A continuación se muestran ejemplos prácticos de uso en el contexto del App Router de Next.js. Los ejemplos asumen que se importan estas funciones desde este archivo en componentes/stack adecuados.

- Ejemplo 1: Obtener lista de clientes en un componente de servidor (SSR)
  - Este ejemplo asume que se está en un contexto de servidor (p. ej., una página o componente de servidor) y puede hacer await getClients() para visualizar la lista.

  ```
  // En un componente de servidor (página/segmento del dashboard)
  import { getClients } from "@/app/(dashboard)/clientes/actions";

  export default async function ClientsPage() {
    const { data: clients } = await getClients();
    // renderizar 'clients' en una tabla
    return (
      <div>
        {clients?.length ? (
          <ul>
            {clients.map((c) => (
              <li key={c.id}>
                {c.first_name} {c.last_name} - {c.email} ({c.is_active ? "Activo" : "Inactivo"})
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay clientes.</p>
        )}
      </div>
    );
  }
  ```

- Ejemplo 2: Actualizar un cliente (nombre, apellido y estado activo)
  - Este ejemplo muestra el uso como acción de formulario en Next.js (server action). El id debe proporcionarse desde el formulario (p. ej., como campo oculto).

  ```
  // En un formulario de cliente (server action)
  import { updateClient } from "@/app/(dashboard)/clientes/actions";

  // <form action={updateClient}> ... campos de nombre/apellido/activo y un input oculto con name="id" />
  ```

- Ejemplo 3: Activar/desactivar un cliente
  - Similar al anterior, pero para cambiar el estado sin actualizar nombres.

  ```
  import { toggleClientActive } from "@/app/(dashboard)/clientes/actions";

  // En un formulario o interacción que envíe id y isActive como datos del form
  // <form action={toggleClientActive}> ... </form>
  ```

Nota: Los ejemplos de uso pueden variar ligeramente dependiendo de la configuración exacta de tu App Router y de cómo integras server actions en tus formularios o componentes. En general, estas funciones están diseñadas para ser llamadas desde componentes de servidor o como acciones de formularios en la UI del dashboard.

## Notas técnicas

- Autorización y seguridad
  - every operación pública depende de ensureAdmin para confirmar que el usuario actual tiene el rol "admin" y está activo.
  - El flujo de autorización evita exponer operaciones de modificación a usuarios no autorizados.

- Enriquecimiento de datos
  - getClients consulta la tabla profiles para obtener información de los clientes y luego intenta enriquecer con el email a través de admin.listUsers.
  - Si la obtención de emails falla, el código usa un fallback seguro ("Sin email" o "No disponible"), evitando fallas completas de la operación.

- Rendimiento y límites
  - admin.auth.listUsers se invoca con page: 1, perPage: 1000. Si hay más de 1000 usuarios o si la API de admin limita la paginación, este enfoque podría no cubrir todos los usuarios. Se documenta y se maneja con una excepción fallida que cae a un mapa vacío.
  - Las consultas a Supabase para perfiles se ejecutan en una sola llamada de selección y ordenación por created_at.

- Consistencia de UI
  - Tras actualizaciones de perfiles (updateClient, toggleClientActive), se llama a revalidatePath("/clientes") para asegurar que la UI refleje los cambios sin depender exclusivamente del frontend.

- Tipos y consistencia
  - ClientRow define la estructura esperada de cada cliente en la UI, con first_name y last_name como string | null, email como string, etc.
  - La función getClients mapea perfiles a ClientRow y asegura valores por defecto cuando falta email.

- Limitaciones conocidas
  - Si no hay un usuario admin activo, todas las operaciones fallarán con el error "No autorizado".
  - El comportamiento de email depende de la disponibilidad de listUsers del admin; en caso de fallo, se usan valores por defecto.
  - Las definiciones de tipo son conservadoras respecto a la compatibilidad de datos provenientes de la API de Admin y la tabla profiles.

## Última actualización

29/5/2026

— Fin de la documentación. Si necesitas adaptaciones para un entorno específico de UI o ejemplos más completos de integración con componentes React, puedo ampliar los ejemplos según tu arquitectura de componentes.