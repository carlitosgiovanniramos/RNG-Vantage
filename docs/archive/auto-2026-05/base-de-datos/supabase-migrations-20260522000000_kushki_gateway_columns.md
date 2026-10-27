# 20260522000000_kushki_gateway_columns.sql — Documentación técnica

Archivo: supabase/migrations/20260522000000_kushki_gateway_columns.sql  
Nombre: 20260522000000_kushki_gateway_columns.sql  
Total de líneas: 28 (contenido relevante mostrado en el bloque de código)

Resumen rápido
- Propósito: Ampliar la tabla public.transactions para soportar la conciliación con la pasarela Kushki añadiendo columnas relacionadas con el gateway y un índice único parcial para acelerar búsquedas y evitar duplicados.
- Comportamiento clave: la columna gateway se establece como no nula con valor por defecto 'manual' y se añade una restricción de verificación para limitar valores. Se añaden columnas para IDs y referencias de Kushki y un índice único parcial sobre gateway_transaction_id no nulo.

## Descripción general
Este archivo de migración modifica el esquema de la tabla transactions para facilitar la conciliación entre las transacciones y la pasarela Kushki. Mantiene intacto el flujo manual existente: las transacciones que actualmente no usan pasarela siguen marcándose como 'manual'. Con estas columnas, se puede distinguir entre transacciones manuales y Kushki, almacenar el identificador de Kushki para cada transacción, una referencia de gateway para transferencias, y el estado crudo reportado por Kushki para fines de auditoría. Además, se crea un índice único parcial sobre gateway_transaction_id para garantizar unicidad en las transacciones de Kushki y acelerar la búsqueda por ese campo, dejando fuera las filas con gateway_transaction_id NULL (comportamiento típico de transacciones manuales).

## Responsabilidades
- Ampliar el esquema de la tabla public.transactions con soporte para Kushki.
- Garantizar integridad de datos con:
  - gateway: columna de tipo texto, no nula, valor por defecto 'manual' y restricción de dominio ('manual' o 'kushki').
  - gateway_transaction_id: columna de texto para el ID de transacción devuelto por Kushki.
  - gateway_reference: columna de texto para la referencia mostrada al cliente.
  - gateway_status: columna de texto para el estado crudo reportado por Kushki.
- Asegurar unicidad y rendimiento con:
  - Un índice único parcial idx_transactions_gateway_txn sobre gateway_transaction_id, aplicado solo cuando gateway_transaction_id no es NULL.
- Mantener idempotencia al usar IF NOT EXISTS en las sentencias de alter/crear índice.

## Parámetros (Columnas y índice añadidos)
- gateway
  - Tipo: text
  - Requerido: sí (NOT NULL)
  - Valor por defecto: 'manual'
  - Restricción: check (gateway in ('manual', 'kushki'))
  - Descripción: Describe si la transacción se gestiona manualmente o a través de Kushki para conciliación.
- gateway_transaction_id
  - Tipo: text
  - Requerido: no (NULL permitido)
  - Descripción: ID de transacción devuelto por Kushki para conciliación.
- gateway_reference
  - Tipo: text
  - Requerido: no (NULL permitido)
  - Descripción: Código de referencia visible para el cliente al realizar una transferencia bancaria.
- gateway_status
  - Tipo: text
  - Requerido: no (NULL permitido)
  - Descripción: Estado crudo reportado por Kushki (con fines de auditoría).
- idx_transactions_gateway_txn
  - Tipo: índice único
  - Columna: (gateway_transaction_id)
  - Condición: where gateway_transaction_id is not null
  - Descripción: Garantiza unicidad para las transacciones asociadas a Kushki y mejora la velocidad de lookup; las filas con gateway_transaction_id NULL (típicamente transacciones manuales) quedan fuera del índice.

Notas sobre idempotencia:
- Todas las operaciones usan IF NOT EXISTS donde corresponde, por lo que ejecutar la migración varias veces no provocará errores ni duplicados y solo aplicará cambios si no existen ya las columnas/índice.

## Retorna
- No devuelve valor. Es una migración de esquema que altera la estructura de la base de datos (tabla y índice).

## Dependencias
- PostgreSQL (Subestructura de base de datos de Supabase).
- Tabla existía previamente: public.transactions.
- Compatibilidad de operaciones: añadir columnas con NOT NULL y DEFAULT implica rellenar filas existentes con el valor por defecto ('manual').
- El índice idx_transactions_gateway_txn es un índice único parcial sobre gateway_transaction_id cuando este no es NULL.

## Ejemplos de uso
Ejemplo concreto de aplicación de la migración usando psql (conexión a la base de datos destino):
- Comando:
psql "postgres://USUARIO:PASSWORD@HOST:5432/BASE_DE_DATOS" -f supabase/migrations/20260522000000_kushki_gateway_columns.sql

Notas:
- Sustituye USUARIO, PASSWORD, HOST y BASE_DE_DATOS por las credenciales y la URL de tu entorno (desarrollo, staging o producción).
- Este comando ejecuta la migración tal como está publicada en el archivo SQL.

Otras formas de aplicar la migración dependen de la herramienta de migraciones que use tu proyecto (p. ej., la CLI de Supabase o un flujo de CI/CD). Consulta la documentación de tu entorno para aplicar migraciones desde el directorio de migraciones.

## Notas técnicas
- La columna gateway se define con NOT NULL y un DEFAULT 'manual', lo que garantiza que las filas existentes se rellenarán con 'manual' al aplicar la migración y evita registros nulos para la columna de gateway.
- La restricción CHECK en gateway asegura que solo se acepten los valores permitidos ('manual' o 'kushki'), añadiendo una capa de integridad de datos.
- gateway_transaction_id es el identificador que permitirá el cruce con los webhooks de Kushki; su presencia solo aplica a pagos gestionados por Kushki.
- gateway_reference y gateway_status permiten auditoría y trazabilidad adicional sin afectar el flujo existente de transacciones manuales.
- El índice único parcial idx_transactions_gateway_txn mejora el rendimiento de consultas y garantiza unicidad para los pagos gestionados por Kushki, evitando duplicados cuando gateway_transaction_id ya está presente. Al ser parcial (where gateway_transaction_id is not null), las filas sin Kushki (manual) no se indexan, ahorrando espacio y manteniendo el foco en las transacciones relevantes.
- En entornos con datos existentes, las filas actuales pasarán a tener gateway='manual' de forma uniforme debido al DEFAULT y NOT NULL; esto facilita la coexistencia de nuevas y antiguas transacciones sin inconsistencias.

## Última actualización
29/5/2026

Observaciones finales
- Esta migración es focal para habilitar la conciliación y auditoría de Kushki sin afectar el flujo existente de transacciones manuales.
- Asegúrate de revisar los datos históricos de gateway_transaction_id y gateway_status tras la aplicación para validar que los datos se comportan como se espera con el nuevo modelo.