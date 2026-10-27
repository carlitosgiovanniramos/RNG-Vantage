# seed.sql - Seed de datos de servicios (RGL Estudio)

Este archivo SQL sirve para poblar la tabla public.services con un conjunto de datos de prueba. Es utilizado durante el desarrollo para tener un catálogo de servicios predefinidos y facilitar pruebas de UI, flujos de compra y reservas.

---

## Descripción general

- Propósito: insertar 10 servicios predefinidos en la tabla public.services.
- Alcance: fedea datos de prueba para el catálogo de servicios de RNG Vantage. Es útil para entornos de desarrollo y pruebas.
- Contexto: ejecutado como parte de la semilla de la base de datos en Supabase. Los registros incluyen nombre, descripción, tipo, precio, duración en meses y estado activo.

---

## Responsabilidades

- Crear entradas iniciales en la tabla services con datos coherentes con el modelo de datos existente.
- Proporcionar variedad de tipos de servicio (manejo_redes, auditoria, otro, capacitacion) para cubrir casos de uso en la app.
- Mantener consistencia en campos requeridos: name, description, type, price, duration_months, is_active.

---

## Parámetros

Este script no recibe parámetros. Es una semilla con valores fijos:

- Tabla objetivo: public.services
- Columnas insertadas: name, description, type, price, duration_months, is_active
- Valores: 10 filas con datos estáticos descritos abajo.

Notas:
- No se insertan columnas de clave primaria (asumiendo que id es auto incremental).
- El script asume que la tabla y columnas existen con tipos compatibles (text para name/description/type, numeric para price, integer para duration_months, boolean para is_active).

---

## Estructura de la instrucción

- Operación principal: INSERT INTO public.services (name, description, type, price, duration_months, is_active)
- Formato: una única sentencia INSERT con 10 tuplas.

Campos:
- name: texto
- description: texto
- type: texto (categorización del servicio)
- price: numérico (precio)
- duration_months: entero (duración en meses)
- is_active: booleano (activo)

Contenido de los valores (resumen de las 10 filas):
1) Redes Sociales Inicial
   - description: Plan inicial de manejo de redes sociales para presencia constante en canales digitales.
   - type: manejo_redes
   - price: 299.99
   - duration_months: 1
   - is_active: true

2) Redes Sociales Work
   - description: Plan intermedio de manejo de redes sociales con mayor volumen de contenido.
   - type: manejo_redes
   - price: 319.99
   - duration_months: 1
   - is_active: true

3) Redes Sociales Premium
   - description: Plan premium de manejo de redes sociales con estrategia y ejecucion avanzada.
   - type: manejo_redes
   - price: 555.00
   - duration_months: 1
   - is_active: true

4) Auditoria
   - description: Diagnostico integral de canales digitales con recomendaciones de mejora.
   - type: auditoria
   - price: 70.00
   - duration_months: 1
   - is_active: true

5) Sesion Fotografica
   - description: Sesión fotografica profesional para contenido de marca.
   - type: otro
   - price: 130.00
   - duration_months: 1
   - is_active: true

6) Sesion Audiovisual (2 videos)
   - description: Produccion audiovisual de 2 videos editados para redes.
   - type: otro
   - price: 150.00
   - duration_months: 1
   - is_active: true

7) Sesion Audiovisual (6 videos)
   - description: Produccion audiovisual de 6 videos editados para redes.
   - type: otro
   - price: 230.00
   - duration_months: 1
   - is_active: true

8) Sesion Audiovisual (15 videos)
   - description: Produccion audiovisual de 15 videos editados para campanas completas.
   - type: otro
   - price: 500.00
   - duration_months: 1
   - is_active: true

9) Curso x 3 meses
   - description: Capacitacion estructurada de marketing digital durante 3 meses.
   - type: capacitacion
   - price: 500.00
   - duration_months: 3
   - is_active: true

10) Modelo por 1 hora
   - description: Servicio de modelo por hora para sesiones de contenido.
   - type: otro
   - price: 25.00
   - duration_months: 1
   - is_active: true

---

## Retorna

- Efectos: inserta 10 filas en la tabla public.services.
- Valor de retorno: en ejecución SQL clásica, no retorna un valor estructurado; el resultado típico es un conteo de filas afectadas (10) y, si hay errores, un mensaje de error.
- No hay exportación/resultado de función; es una semilla que modifica el estado de la BD.

---

## Dependencias

- Requiere una base de datos PostgreSQL accesible (como la usada por Supabase).
- La tabla public.services debe existir con al menos las columnas:
  - name (text)
  - description (text)
  - type (text)
  - price (numeric/decimal)
  - duration_months (integer)
  - is_active (boolean)
- Si la estructura de la tabla difiere (tipos o nombres), el script podría fallar.

---

## Ejemplos de uso

- Ejecutar desde psql en un entorno de desarrollo o CI:

psql -h <host> -U <usuario> -d <base_de_datos> -f supabase/seed.sql

- En entornos con CLI de Supabase (si aplica), ejecutar el seed mediante la herramienta correspondiente para poblar la base de datos de desarrollo.

Notas: al ejecutar múltiples veces, este script no maneja conflictos de duplicados. Si se ejecuta repetidamente, podrían insertarse filas duplicadas, dependiendo de las constraints de la tabla. Considera ejecutar solo una vez o limpiar la tabla antes de volver a sembrar en entornos de desarrollo.

---

## Notas técnicas

- Formato y consistencia: se usa una única instrucción INSERT con múltiples valores para reducir llamadas a la base de datos.
- Lógica de negocio reflejada: todos los servicios están activos (is_active = true) al seed.
- Tipos de datos:
  - name, description, type: text
  - price: numeric (con decimales, ejemplos con 299.99, 555.00, etc.)
  - duration_months: integer
  - is_active: boolean
- Comentarios útiles presentes en el script original:
  - Nota: por regla de negocio, solo manejo_redes puede renovarse automaticamente.
  - El seed representa un “catálogo real de Ruth” con 10 servicios para pruebas.

---

## Última actualización

12/5/2026

---

## Contenido del archivo (seed.sql)

```sql
-- =============================================================
-- RGL Estudio: Seed data (datos de prueba)
-- =============================================================

-- Catalogo real de Ruth (10 servicios)
-- Nota: por regla de negocio, solo manejo_redes puede renovarse automaticamente.
insert into public.services (name, description, type, price, duration_months, is_active) values
  ('Redes Sociales Inicial', 'Plan inicial de manejo de redes sociales para presencia constante en canales digitales.', 'manejo_redes', 299.99, 1, true),
  ('Redes Sociales Work', 'Plan intermedio de manejo de redes sociales con mayor volumen de contenido.', 'manejo_redes', 319.99, 1, true),
  ('Redes Sociales Premium', 'Plan premium de manejo de redes sociales con estrategia y ejecucion avanzada.', 'manejo_redes', 555.00, 1, true),
  ('Auditoria', 'Diagnostico integral de canales digitales con recomendaciones de mejora.', 'auditoria', 70.00, 1, true),
  ('Sesion Fotografica', 'Sesion fotografica profesional para contenido de marca.', 'otro', 130.00, 1, true),
  ('Sesion Audiovisual (2 videos)', 'Produccion audiovisual de 2 videos editados para redes.', 'otro', 150.00, 1, true),
  ('Sesion Audiovisual (6 videos)', 'Produccion audiovisual de 6 videos editados para redes.', 'otro', 230.00, 1, true),
  ('Sesion Audiovisual (15 videos)', 'Produccion audiovisual de 15 videos editados para campanas completas.', 'otro', 500.00, 1, true),
  ('Curso x 3 meses', 'Capacitacion estructurada de marketing digital durante 3 meses.', 'capacitacion', 500.00, 3, true),
  ('Modelo por 1 hora', 'Servicio de modelo por hora para sesiones de contenido.', 'otro', 25.00, 1, true);
```

Este documento cubre el propósito, uso y consideraciones técnicas del seed.sql para RNG Vantage. Si necesitas adaptar el seed a un entorno específico (por ejemplo, agregar IDs explícitos, usar ON CONFLICT para idempotencia, o migrar a seeds en JS/TS), puedo ayudarte a ajustarlo.