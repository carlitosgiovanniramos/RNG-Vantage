# RNG Vantage - Migración 20260520000000_create_views.sql

Ruta: supabase/migrations/20260520000000_create_views.sql  
Nombre: 20260520000000_create_views.sql  
Líneas: 165

Este archivo contiene la migración SQL que define cinco vistas (views) en el schema público para optimizar el dashboard y la parte administrativa. Todas las vistas usan SECURITY INVOKER (comportamiento por defecto en PostgreSQL 15+), por lo que respe­tan las políticas de Row Level Security (RLS) existentes: administradores visualizan todos los registros y clientes ven solo sus propios datos.

La migración fue creada el 20 de mayo de 2026 y está orientada a respaldar la Edge Function dashboard-metrics (con fallback) y las tarjetas del dashboard principal, así como a exponer detalles útiles para dashboards y listados administrativos.

---

## Descripción general

Este archivo crea cinco vistas consumibles por la UI de administración y dashboard:

- v_dashboard_summary: resumen financiero en una sola fila con métricas clave (MRR, ingresos del mes, cuentas de suscripciones activas, etc.).
- v_monthly_income: ingresos mensuales agrupados por mes (últimos 6 meses) para gráficos de barras.
- v_service_mix: conteo de suscripciones activas agrupadas por tipo de servicio (para gráficos de torta).
- v_subscriptions_detail: detalle enriquecido de subscriptions (con nombre del cliente y datos del servicio).
- v_transactions_detail: detalle enriquecido de transacciones (con nombre del cliente).

Todas las vistas consultan tablas públicas y están diseñadas para alimentar componentes UI de dashboards y listados en la app.

---

## Responsabilidades

- Proporcionar una capa de lectura optimizada para dashboards, reduciendo la necesidad de consultas complejas desde la UI.
- Centralizar la lógica de agregación y formateo de datos en vistas SQL para consistencia entre componentes.
- Respetar políticas de seguridad existentes mediante SECURITY INVOKER para alinearse con RLS (Admins ven todo, Clients ven sus datos).
- Exponer estructuras de datos claras y autoexplicativas para uso directo en componentes frontend (dashboard, gráficos, listados).

---

## Estructura de las vistas y Parámetros

A continuación se detallan las cinco vistas creadas, su propósito, columnas resultantes y lógica principal.

### 1) v_dashboard_summary

Propósito: Resumen financiero en una sola fila para el dashboard y para fallback de la Edge Function dashboard-metrics.

Columnas y lógica:
- mrr (numeric(10,2))
  - Cálculo: suma de sv.price de subscriptions activas con sv.type = 'manejo_redes'.
  - Fórmula: COALESCE(SUM(sv.price) FILTER (WHERE sub.status = 'active' AND sv.type = 'manejo_redes'), 0)
- monthly_income (numeric(10,2))
  - Cálculo: suma de t.amount de transactions con t.status = 'completed' desde el inicio del mes actual.
  - Fórmula: COALESCE((SELECT SUM(t.amount) FROM public.transactions t WHERE t.status = 'completed' AND t.created_at >= date_trunc('month', now())), 0)
- active_subscriptions (integer)
  - Cálculo: conteo de subscriptions con sub.status = 'active'.
  - Fórmula: COUNT(*) FILTER (WHERE sub.status = 'active')
- recurring_subscriptions (integer)
  - Cálculo: conteo de subscriptions activas de tipo 'manejo_redes'.
  - Fórmula: COUNT(*) FILTER (WHERE sub.status = 'active' AND sv.type = 'manejo_redes')
- one_time_subscriptions (integer)
  - Cálculo: conteo de suscripciones activas cuyo tipo no es 'manejo_redes'.
  - Fórmula: COUNT(*) FILTER (WHERE sub.status = 'active' AND sv.type IS DISTINCT FROM 'manejo_redes')
- pending_reservations (integer)
  - Cálculo: conteo de reservas con status 'pending'.
  - Fórmula: COALESCE((SELECT COUNT(*) FROM public.reservations r WHERE r.status = 'pending'), 0)

Fuentes:
- FROM public.subscriptions sub
- LEFT JOIN public.services sv ON sv.id = sub.service_id

Notas:
- La vista agrega y resume información de distintas tablas para entregar un snapshot consolidado.

### 2) v_monthly_income

Propósito: Ingresos mensuales agrupados por mes para alimentar gráficos de barras (últimos 6 meses).

Columnas:
- month (text, formato 'YYYY-MM')
  - Cálculo: to_char(date_trunc('month', t.created_at), 'YYYY-MM')
- total (numeric(10,2))
  - Cálculo: COALESCE(SUM(t.amount), 0)

Fuente:
- FROM public.transactions t
- WHERE t.status = 'completed' AND t.created_at >= date_trunc('month', now()) - interval '5 months'
- GROUP BY date_trunc('month', t.created_at)
- ORDER BY date_trunc('month', t.created_at)

Notas:
- Agrupa por mes para un rango de 6 meses (mes actual + 5 anteriores).

### 3) v_service_mix

Propósito: Conteo de suscripciones activas agrupadas por tipo de servicio (para gráfico de torta).

Columnas:
- service_type (text) = sv.type
- count (integer) = COUNT(*) de suscripciones activas

Fuente:
- FROM public.subscriptions sub
- JOIN public.services sv ON sv.id = sub.service_id
- WHERE sub.status = 'active'
- GROUP BY sv.type
- ORDER BY count DESC

Notas:
- Útil para visualizar la distribución de tipos de servicio entre suscripciones activas.

### 4) v_subscriptions_detail

Propósito: Detalle enriquecido de subscriptions, incluyendo datos de cliente y servicio.

Columnas:
- id (uuid o similar) = sub.id
- user_id (uuid)
- service_id (uuid)
- starts_at
- ends_at
- status
- auto_renew
- created_at
- client_name (text)
  - Cálculo: CONCAT/COALESCE de p.first_name y p.last_name. Si no hay cliente, 'Sin cliente'.
- service_name (text)
  - Cálculo: sv.name o 'Servicio desconocido' si nulo.
- service_type (text) = sv.type
- price (numeric(10,2))
  - Cálculo: SV.price o 0

Fuentes:
- FROM public.subscriptions sub
- LEFT JOIN public.services sv ON sv.id = sub.service_id
- LEFT JOIN public.profiles p ON p.id = sub.user_id

Notas:
- Manejo de nombres de cliente con limpieza de espacios y valores nulos.
- Uso de LEFT JOIN para evitar perder filas de subscriptions sin datos de servicio o cliente.

### 5) v_transactions_detail

Propósito: Detalle enriquecido de transactions, incluyendo nombre del cliente cuando disponible.

Columnas:
- id
- user_id
- subscription_id
- amount
- payment_method
- status
- notes
- created_at
- client_name (text)
  - Cálculo: COALESCE(NULLIF(TRIM(COALESCE(p.first_name, '') || ' ' || COALESCE(p.last_name, '')), ''), 'Sin cliente')
- Fuente: public.transactions t
- LEFT JOIN public.profiles p ON p.id = t.user_id

Notas:
- Similar al detalle de subscriptions, maneja posibles usuarios nulos en transactions.

---

## Dependencias

- Base de datos PostgreSQL (psql) con soporte de vistas en schema public.
- Tablas involucradas:
  - public.subscriptions
  - public.services
  - public.profiles
  - public.transactions
  - public.reservations
- Reglas de seguridad:
  - Todas las vistas se crean con SECURITY INVOKER (respeta RLS existente en las tablas).
  - Con RLS, Admins deben ver todos los registros; Clients verán sus propios datos según políticas establecidas en las tablas subyacentes.

---

## Ejemplos de uso

- Obtener el resumen del dashboard:
  - SELECT * FROM public.v_dashboard_summary;

- Obtener ingresos mensuales (últimos 6 meses):
  - SELECT * FROM public.v_monthly_income;

- Ver distribución de tipos de suscripciones activos:
  - SELECT * FROM public.v_service_mix;

- Ver detalles de subscriptions para un usuario específico:
  - SELECT * FROM public.v_subscriptions_detail WHERE user_id = 'TU_USUARIO_UUID';

- Ver detalles de transacciones para un usuario específico:
  - SELECT * FROM public.v_transactions_detail WHERE user_id = 'TU_USUARIO_UUID';

Notas:
- Los ejemplos pueden devolver filas múltiples; la estructura de cada view determina las columnas y tipos descritos en la sección anterior.

---

## Notas técnicas

- Seguridad y políticas:
  - Las vistas usan SECURITY INVOKER para respetar las políticas de RLS de las tablas subyacentes. Ver políticas aplicables en las tablas relacionadas.
- Rendimiento:
  - v_dashboard_summary realiza agregaciones sobre subscriptions y transacciones; es recomendable tener índices adecuados en:
    - subscriptions(user_id, service_id, status)
    - services(id, type, price)
    - profiles(id)
    - transactions(id, user_id, status, created_at)
    - reservations(id, status)
  - Las vistas que incluyen subconsultas (monthly_income y pending_reservations) pueden beneficiarse de índices en created_at y status.
- Consistencia de datos:
  - En v_subscriptions_detail y v_transactions_detail se maneja la posible ausencia de datos de cliente (nombre) con valores por defecto ('Sin cliente').
- Compatibilidad:
  - Considerar versiones de PostgreSQL y el soporte de funciones usadas (date_trunc, to_char, FILTER, COALESCE, etc.).

---

## Última actualización

29/5/2026

Esta documentación describe de forma fiel las vistas definidas en la migración 20260520000000_create_views.sql y su propósito dentro del proyecto RNG Vantage. Si se realizan cambios en las vistas, conviene actualizar esta documentación para reflejar novedades en columnas, lógica o dependencias.