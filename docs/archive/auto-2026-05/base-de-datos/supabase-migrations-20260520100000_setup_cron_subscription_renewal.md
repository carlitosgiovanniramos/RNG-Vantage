# 20260520100000_setup_cron_subscription_renewal.sql

Migration SQL para configurar cron jobs y la renovación diaria de suscripciones en RNG Vantage.

---

## Descripción general

Este archivo es una migración de Supabase/PostgreSQL cuyo objetivo es habilitar las extensiones necesarias para ejecutar tareas programadas y realizar llamadas HTTP desde PostgreSQL hacia una función de Edge (Edge Function) para renovar suscripciones. En concreto:

- Instala y expone las extensiones pg_cron (programación de tareas) y pg_net (realizar HTTP requests desde PostgreSQL).
- Otorga permisos al rol postgres para usar las extensiones en el esquema cron.
- Programa una tarea diaria a las 06:00 UTC (01:00 en Ecuador) que invoca la función de renovación de suscripciones mediante una llamada HTTP POST.

La configuración también incluye un bloque de notas comentadas con una alternativa para la invocación (wrapper de función) en caso de que current_setting no funcione como fuente del service_role_key.

---

## Responsabilidades

- Habilitar las extensiones necesarias:
  - pg_cron: permite programar tareas periódicas dentro de PostgreSQL.
  - pg_net: permite realizar HTTP requests desde PostgreSQL (útil para invocar Edge Functions).
- Configurar permisos para el usuario postgres en el esquema cron.
- Programar la tarea diaria de renovación de suscripciones:
  - Nombre del job: daily-subscription-renewal
  - Horario: 0 6 * * * (06:00 UTC; 01:00 en Ecuador)
  - Acción: ejecutar un HTTP POST hacia la función de renovación de suscripciones.
- Proporcionar una ruta de fallback mediante un wrapper (comentario) para obtener la clave de servicio de diferentes orígenes (vault o environment) si current_setting falla.
- Dejar documentado el comportamiento esperado y las consideraciones de seguridad.

---

## Parámetros (Parámetros relevantes dentro del script)

Este script no es una función ni componente, por lo que no tiene props en el sentido de React. Sin embargo, a continuación se documentan los parámetros relevantes de la tarea programada incluido en cron.schedule:

- cron.schedule(...) "daily-subscription-renewal"
  - Nombre del job: daily-subscription-renewal (texto)
  - Cron expression: '0 6 * * *' (texto)
  - Comando/Acción a ejecutar:
    - Un bloque SQL que realiza un HTTP POST usando pg_net:
      - URL: https://uzsasdbcewymviuelcsi.supabase.co/functions/v1/subscription-renewal
      - Headers: Content-Type: application/json; Authorization: Bearer <service_role_key obtenido con current_setting('app.settings.service_role_key', true)>
      - Body: '{}'::jsonb

Notas sobre el header de autorización:
- Authorization: Bearer concatenado con current_setting('app.settings.service_role_key', true)

Bloque alternativo comentado (opcional):
- Si current_setting no funciona, existe un wrapper de función (public.trigger_subscription_renewal()) que:
  - Intenta obtener service_role_key desde vault.decrypted_secrets
  - Si no está, intenta obtenerlo desde current_setting('supabase.service_role_key', true)
  - Realiza el http_post hacia la URL del proyecto + '/functions/v1/subscription-renewal' con el header Authorization Bearer <service_key>

Este bloque está comentado y sirve como guía de implementación alternativa.

---

## Retorna

- Este archivo no define funciones ni componentes con retornos. Es una migración SQL que:
  - Crea extensiones si no existen.
  - Otorga permisos.
  - Registra un job cron que ejecuta una instrucción SQL (POST HTTP).

Por lo tanto, no retorna valores en sí mismo; su efecto es la creación/actualización de estructuras y de la tarea programada en la base de datos.

---

## Dependencias

- Extensiones:
  - pg_cron: para programar tareas dentro de PostgreSQL.
  - pg_net: para realizar HTTP requests desde PostgreSQL.
- Permisos y alcance:
  - Permisos en el esquema cron para el usuario postgres (USAGE y ALL PRIVILEGES en tablas dentro del esquema cron).
- Endpoint de destino:
  - Edge Function en Supabase alojada en https://uzsasdbcewymviuelcsi.supabase.co/functions/v1/subscription-renewal
- Autenticación de la solicitud HTTP:
  - Bearer token obtenido desde current_setting('app.settings.service_role_key', true) (posible fallback vía vault o environment si se habilita el bloque alternativo).
- Dependencias de entorno:
  - Si se desea usar la ruta alternativa, se requiere vault.decrypted_secrets disponible o el secret en variables de entorno configuradas en la base de datos.

---

## Ejemplos de uso

- Después de aplicar la migración, verifica que el job quedó registrado:
  - Consulta rápida (ejemplo):
    - select * from cron.job where jobname = 'daily-subscription-renewal';
  - Verifica que el job esté activo y que el estado sea enabled (según versión/estado de cron).

- Comportamiento del job:
  - A las 06:00 UTC cada día, se ejecuta el bloque de código que envía un POST a la función de renovación de suscripciones.
  - El cuerpo de la solicitud es un JSON vacío: {}.
  - El header de autorización incluye el Bearer token obtenido de app.settings.service_role_key.

- Verificación de la operación:
  - Revisa logs de Edge Functions si la PSN devuelve éxito o error.
  - Si funciona, la función subscription-renewal manejará la renovación de suscripciones y cualquier lógica posterior necesaria.

---

## Notas técnicas

- Seguridad de claves:
  - La clave service_role_key se toma de current_setting('app.settings.service_role_key', true). Es crucial que este valor sea seguro y esté disponible en el contexto de la base de datos para que el cron pueda invocar la función remota.
  - Existe un bloque alternativo (comentado) que demuestra cómo obtener la clave desde vault.decrypted_secrets o desde una variable de entorno (supabase.service_role_key). Si se habilita, debe asegurarse de que el flujo de obtención de claves sea seguro y que la clave no quede expuesta en logs o trazas.
- Robustez y fallos:
  - El script asume que las extensiones pg_cron y pg_net pueden instalarse/registrarse en la base de datos.
  - Si la llamada HTTP falla (por ejemplo, por red, credenciales o estado de la Edge Function), el cron podría quedar en estado de error; considerar manejo de reintentos o alertas adicionales si el entorno lo permite.
- Notas de zona horaria:
  - El schedule está definido como '0 6 * * *', que corresponde a las 06:00 UTC. El comentario indica que equivalen a 01:00 en Ecuador. Asegúrate de que los responsables entiendan la zona horaria objetivo, especialmente si el sistema de despliegue cambia la zona horaria o si la región de operación se modifica.
- Mantenibilidad:
  - El bloque alternativa en comentarios sirve como guía para migraciones futuras si se desea modularizar la obtención de la clave y/o cambiar la forma de invocar la función de renovación.
  - Si en el futuro cambian las rutas de Edge Functions o el formato de autenticación, se debe actualizar este script para reflejar esos cambios.
- Compatibilidad:
  - Este script asume una instancia de PostgreSQL compatible con pg_cron y pg_net y con soporte para current_setting y jsonb. Verifica la versión de PostgreSQL y la compatibilidad de las extensiones en tu entorno.

---

## Última actualización

29/5/2026

---

Si necesitas que adapte la documentación a un formato más corto o más detallado en alguna sección, dime y lo ajusto.