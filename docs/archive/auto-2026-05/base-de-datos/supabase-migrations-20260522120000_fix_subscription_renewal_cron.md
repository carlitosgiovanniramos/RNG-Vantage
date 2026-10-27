# Documentación técnica: 20260522120000_fix_subscription_renewal_cron.sql

 Archivo: supabase/migrations/20260522120000_fix_subscription_renewal_cron.sql  
 Tipo: migración de base de datos (PostgreSQL) para corrección del flujo de renovaciones de suscripciones

Fecha de última actualización: 29/5/2026

---

## Descripción general

Esta migración corrige la autenticación utilizada por el job de renovación de suscripciones. El employment anterior (migración 20260520100000) enviaba un token Bearer vacío porque el token se obtenía desde current_setting('app.settings.service_role_key'), una configuración que no existía en la migración y que provocaba respuestas 401 en la Edge Function encargada de la renovación. Como resultado, las suscripciones no se renovaban ni expiraban automáticamente.

La migración introduce una función wrapper que obtiene el service_role_key de Vault (Supabase Vault) y la utiliza para autenticar la llamada HTTP a la Edge Function subscription-renewal. Con ello se garantiza que la Edge Function recibe un token válido y puede procesar la renovación de suscripciones correctamente.

Requisitos operativos (una sola vez, fuera de esta migración):
- Crear el secreto en Vault: vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key')
- La Edge Function subscription-renewal debe estar desplegada con la versión que acepta el service_role_key como secreto compartido.

Qué hace en resumen:
- Define la función pública trigger_subscription_renewal() que:
  - Lee el secret service_role_key desde vault.decrypted_secrets.
  - Si no existe, emite una advertencia y omite el crono.
  - Llama a la Edge Function subscription-renewal con un HTTP POST autenticado mediante Bearer <service_role_key>.
- Reprograma el job del cron daily-subscription-renewal para invocar la función wrapper a las 06:00 UTC todos los días.

---

## Responsabilidades

- Proveer un mecanismo seguro para invocar la Edge Function de renovación de suscripciones mediante un secret almacenado en Vault.
- Evitar errores de autenticación que provoquen fallos en la renovación automática.
- Mantener la programación del cron para ejecutar la verificación/renovación diaria en un horario fijo.
- Registrar advertencias cuando el secret no esté disponible para facilitar la observabilidad.

---

## Props / Parámetros

Si se considera la función como componente, sus parámetros son:

- trigger_subscription_renewal(): void
  - Descripción: Función wrapper PL/pgSQL que obtiene el service_role_key desde Vault y llama a la Edge Function de renovación.
  - Parámetros de entrada: ninguno.
  - Tipos relevantes en el código:
    - service_key: text (variable local que almacena el secret obtenido de Vault)
    - project_url: text (variable local con URL base de la Edge Function)

Notas:
- El valor de service_key se obtiene de vault.decrypted_secrets donde name = 'service_role_key'.
- La función no devuelve valor alguno (returns void) y se ejecuta con seguridad definer.
- El HTTP POST se realiza con:
  - URL: <project_url>/functions/v1/subscription-renewal
  - Headers: Content-Type: application/json, Authorization: Bearer <service_key>
  - Body: '{}'::jsonb

El scheduling del cron:
- Se desprograma (unschedule) el job diario si existe.
- Se programa (schedule) el job 'daily-subscription-renewal' para ejecutarse a las 06:00 todos los días y llamar a select public.trigger_subscription_renewal().

---

## Retorna

- trigger_subscription_renewal(): void
  - No devuelve valor.
  - Efectos colaterales: lectura de Vault, llamada HTTP externa a la Edge Function, posible creación de logs/advertencias mediante raise warning.

- Cron scheduling:
  - Las operaciones cron.unschedule y cron.schedule no devuelven valor utilizable para la lógica de negocio; su efecto es la reprogramación del job para ejecutar la función wrapper a la hora especificada.

---

## Dependencias

- Supabase Vault
  - Tabla vault.decrypted_secrets con registros de secretos desencriptados y disponibles para lectura por la función.
  - Nombre del secreto utilizado: service_role_key

- Extensiones/funcionalidades de PostgreSQL utilizadas:
  - net.http_post: para realizar la llamada HTTP POST a la Edge Function.
  - jsonb_build_object: para construir cabeceras HTTP en formato JSON.
  - cron (extensión de PostgreSQL para manejo de jobs):
    - cron.unschedule
    - cron.schedule

- Edge Function de renovación de suscripciones:
  - URL esperada: <PROJECT_URL>/functions/v1/subscription-renewal
  - Requiere token Bearer de service_role_key en la cabecera Authorization.

- Servicio externo:
  - La Edge Function en sí misma debe estar desplegada con versión que acepte el secreto compartido service_role_key.

- Requisitos operativos externos (documentados en los comentarios):
  - El secret debe existir en Vault antes de ejecutar la migración (una vez): vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key').

---

## Ejemplos de uso

- Contexto de migración:
  - Al aplicar esta migración, se define la función trigger_subscription_renewal y se reprograma el job diario para invocar dicha función a las 06:00 UTC.
  - Si el secret service_role_key no está disponible en Vault, la ejecución no llama a la Edge Function y emite una advertencia: “[subscription-renewal] Falta el secreto service_role_key en Vault; cron omitido”.

- Flujo operativo esperado tras la migración:
  1. Se dispone de Vault con secret service_role_key.
  2. Se ejecuta la migración 20260522120000_fix_subscription_renewal_cron.sql.
  3. El cron daily-subscription-renewal se reprograma para invocar trigger_subscription_renewal() cada día a las 06:00.
  4. A las 06:00, trigger_subscription_renewal():
     - Recupera service_role_key de Vault.
     - Si existe, realiza un POST autenticado a la Edge Function de renovación.
     - Si no existe, registra una advertencia y no realiza el POST.

- Nota de seguridad: el token es obtenido en tiempo de ejecución desde Vault y no se almacena en código ni en configuraciones estáticas de la migración.

---

## Notas técnicas

- Seguridad y permisos:
  - La función trigger_subscription_renewal está declarada con SECURITY DEFINER, lo que implica que se ejecuta con los permisos del owner (definer). Esto es coherente con su necesidad de acceder a Vault y realizar llamadas HTTP externas.
  - El secret service_role_key se obtiene de vault.decrypted_secrets, garantizando que el token no queda expuesto en logs de forma directa (se maneja como secreto desencriptado dentro de la función).

- Manejo de errores:
  - Si no hay secret service_role_key, la función emite una advertencia y detiene la ejecución para ese ciclo, evitando llamadas innecesarias a la Edge Function.

- Requisitos operativos fuera de la migración:
  - Un único paso fuera de la migración para crear el secret en Vault (ver Requisitos operativos).
  - Confirmar que la Edge Function subscription-renewal esté en la versión que admite el secret como Bearer compartido.

- Compatibilidad:
  - Este enfoque asume que Vault está integrado y accesible desde la base de datos (supabase vault extension).
  - La URL de la Edge Function se define como project_url dentro de la función; si el entorno cambia, debe actualizarse el valor.

- Rendimiento y carga:
  - La migración realiza una única lectura de Vault por invocación y una llamada HTTP externa. No hay bucles ni operaciones intensivas en disco durante la ejecución de trigger_subscription_renewal.

- Observabilidad:
  - En caso de fallo por secreto faltante, se genera una advertencia en el log de PostgreSQL.
  - Debe complementarse con monitoreo de la Edge Function para confirmar que las renovaciones se están procesando como se espera.

---

## Última actualización

- Fecha: 29/5/2026

- Versión: 20260522120000_fix_subscription_renew.sql

- Notas de mantenimiento:
  - Esta migración está pensada como corrección operativa ante un fallo de autenticación en el flujo de renovación. Asegúrate de que el secret en Vault exista y que la Edge Function acepte el secret como Bearer compartido antes de desplegar o ejecutar la migración. En entornos de staging y producción, valida el end-to-end del flujo tras la migración.