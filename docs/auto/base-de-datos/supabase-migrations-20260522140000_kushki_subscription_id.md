## Descripción general

Este archivo es una migración SQL para la base de datos del proyecto RNG Vantage. Su propósito es preparar el soporte para la reconciliación de cobros de Kushki en sus suscripciones recurrentes:

- Añade la columna `gateway_subscription_id` de tipo `text` a la tabla `public.subscriptions`.
- Crea un índice único parcial sobre esa columna para garantizar unicidad por suscripciones de Kushki y facilitar la reconciliación cuando se reciban webhooks de cobro.

El objetivo es almacenar el ID de la suscripción recurrente proporcionado por Kushki y usarlo para emparejar cada cobro con la suscripción correspondiente.

La migración utiliza operaciones idempotentes: utiliza `IF NOT EXISTS` en la columna y en el índice para evitar errores si la migración se ejecuta varias veces.

Archivo: `supabase/migrations/20260522140000_kushki_subscription_id.sql`

Contenido relevante resumido:
- Añade la columna `gateway_subscription_id text` en `public.subscriptions` si no existe.
- Crea un índice único parcial `idx_subscriptions_gateway_sub` en `public.subscriptions(gateway_subscription_id)` con la condición `WHERE gateway_subscription_id IS NOT NULL`.

Comentarios del archivo destacan que este ID permite conciliar cada cobro recurrente cuando llega por el webhook de Kushki.

## Responsabilidades

- Extender el esquema de la base de datos para almacenar Kushki subscription IDs.
- Proveer una forma eficiente y única de asociar cobros recurrentes con suscripciones específicas mediante un índice único parcial.
- Mantener idempotencia en la migración para evitar errores al aplicar múltiples veces.

## Parámetros

Este script no es un componente ejecutable con parámetros. Es una migración de base de datos que:
- No recibe entradas dinámicas.
- Modifica el esquema de la base de datos existente.

Si se requiere ejecutar fuera de un flujo de migración, se deben usar comandos de base de datos compatibles con PostgreSQL para aplicar el archivo.

## Retorna

No retorna valores ni estructuras de datos a la aplicación. Aplica cambios al esquema de la base de datos:

- Añade una columna `gateway_subscription_id` (texto) a `public.subscriptions`.
- Crea un índice único parcial `idx_subscriptions_gateway_sub` sobre esa columna para garantizar unicidad entre filas no nulas.

Si la migración se ejecuta en un conjunto de datos que ya no es idempotente (por ejemplo, ya existe una duplicación no nula de `gateway_subscription_id`), la creación del índice podría fallar; en ese caso habría que resolver las duplicaciones antes de volver a ejecutar.

## Dependencias

- Tabla existente: `public.subscriptions`.
- PostgreSQL compatible (uso de `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` y `CREATE UNIQUE INDEX IF NOT EXISTS ... WHERE ...`).
- Entorno de ejecución de migraciones de Supabase (o equivalente): debe poder aplicar migraciones SQL en el esquema público.
- Lógica de negocio de Kushki: se espera que, en producción, Kushki emita suscripciones y webhooks que contengan `gateway_subscription_id` para reconciliar cobros.

Notas sobre seguridad y compatibilidad:
- El índice es parcial y sólo considera filas con `gateway_subscription_id IS NOT NULL`, permitiendo múltiples filas con `NULL`, pero garantizando unicidad para valores no nulos.
- No se alteran restricciones de integridad existentes más allá de la nueva columna y el índice.

## Ejemplos de uso

- Aplicación mediante psql (ejecución directa del archivo de migración):
  - Construye la conexión a la base de datos y ejecuta el SQL:
    psql "postgresql://usuario:contraseña@host:5432/tu_base_de_datos" -f supabase/migrations/20260522140000_kushki_subscription_id.sql

- Integración en flujo de CI/CD (recomendado):
  - Incluir la migración en el pipeline de migraciones de la base de datos de Supabase. El runner de migraciones aplicará este archivo como parte del ciclo de despliegue.
  - Verificar que la migración se aplica correctamente y que la columna e índice quedan disponibles.

Notas sobre posibles errores:
- Si ya existe una fila con `gateway_subscription_id` no nulo y con valores duplicados, la creación del índice único parcial podría fallar. En ese caso, primero limpiar o normalizar los datos para asegurar unicidad antes de reintentar la migración.

## Notas técnicas

- Idempotencia: Se utilizan `IF NOT EXISTS` en la columna y en el índice para que la migración no falle si se reejecuta.
- Tipo de datos: la columna es de tipo `text`, suficiente para almacenar IDs de suscripción de Kushki.
- Índice parcial: El índice es único y parcial, aplicándose únicamente a filas donde `gateway_subscription_id IS NOT NULL`. Esto evita penalizar filas que no tienen todavía asignado un ID de Kushki y facilita el manejo de casos donde aún no se ha sincronizado el ID.
- Consulta de webhooks: Con este índice, cuando lleguen webhooks de Kushki, se podrá buscar de forma eficiente la suscripción correspondiente por su ID y reconciliar cobros.

## Última actualización

29/5/2026