# RNG Vantage - Dashboard (app/(dashboard)/dashboard/page.tsx)

Archivo: page.tsx  
Ruta: app/(dashboard)/dashboard/page.tsx  
Lenguaje: TypeScript / React (Server Component de Next.js)

Este archivo implementa la página de tablero administrativo del módulo RNG Vantage. Se trata de un componente de servidor que solicita datos a Supabase, calcula métricas clave y renderiza un dashboard con tarjetas de datos, un resumen operativo y gráficos.

---

## Descripción general

DashboardPage es una página de Next.js 13+ (App Router) que:

- Conecta con Supabase a través de un cliente servidor.
- Recupera datos de suscripciones activas, transacciones completadas y reservas pendientes.
- Calcula métricas de negocio relevantes:
  - MRR (ingresos recurrentes mensuales) específicamente para servicios de tipo `manejo_redes`.
  - Ingresos del mes actual y una serie de ingresos por mes de los últimos seis meses.
  - Recuentos de suscripciones recurrentes vs. únicas.
  - Reservas pendientes.
  - Resumen operativo (Suscripciones activas, recurrencia y reservas por gestionar).
- Presenta estos datos mediante:
  - DataCard: tarjetas con KPIs.
  - DashboardCharts: gráficos de ingresos y mezcla de servicios.
  - RealtimeRefresher: actualización en tiempo real de tablas específicas.
- Integra navegación hacia secciones relevantes (Panel principal, Reservas, Servicios, Suscripciones, Transacciones).

La implementación está centrada en el cálculo claro y preciso de métricas, y en exponer datos de negocio de forma visual para toma de decisiones.

---

## Responsabilidades

- Gestionar la conexión y consulta de datos desde Supabase en un contexto de servidor.
- Construir métricas financieras y operativas a partir de los datos de subscriptions, transactions y reservations.
- Filtrar y normalizar los datos de servicios para el cálculo de MRR.
- Generar series temporales (ingresos por mes) y un breakdown de tipos de servicios.
- Componer la UI del dashboard con componentes reutilizables (DataCard, DashboardCharts, RealtimeRefresher).
- Proveer una navegación rápida hacia secciones administrativas relevantes.

---

## Props / Parámetros

Este componente no recibe props externos. Es una página de Next.js que se ejecuta como servidor y genera su salida JSX a partir de consultas a la base de datos.

Tabla de props (aplicando la convención solicitada; este componente no expone props):
| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| N/A | - | - | Este componente no recibe props. Es una página de la ruta /dashboard y se ejecuta en el servidor para renderizar el dashboard. |

Notas:
- El código define tipos internos para normalización y estructura de datos (ServiceJoin, ActiveSubscriptionRow, CompletedTransactionRow) que se usan para el procesamiento dentro de la página.

---

## Retorna

La función DashbaordPage retorna un React elemento (JSX) que representa la sección principal del dashboard. Es un server component (async) que:

- Genera una estructura de sección con clase de diseño.
- Incluye RealtimeRefresher para actualizaciones en tiempo real.
- Renderiza un header informativo y una serie de tarjetas (DataCard) con métricas.
- Muestra un bloque de resumen operativo con un grid de indicadores.
- Inserta DashboardCharts con las series de ingresos mensuales y la mezcla de servicios.

Formato de retorno: Promise<JSX.Element> (servidor) que produce el árbol de componentes de la página.

---

## Dependencias

Librerías y componentes utilizados en este archivo:

- Supabase
  - import { createClient } from "@/lib/supabase/server";
  - Uso: crear cliente servidor para consultas a tablas: subscriptions, transactions y reservations.
- Next.js
  - Link desde "next/link" para navegación entre secciones.
- Icons
  - lucide-react: ArrowUpRight, CalendarClock, CreditCard, Home, Repeat, TrendingUp.
- Componentes de UI
  - DataCard ( "@/components/data-card" )
  - DashboardCharts ( "@/components/dashboard-charts" )
  - RealtimeRefresher ( "@/components/realtime-refresher" )
- Tipos/Utilidades internas
  - Definición de tipos: ServiceJoin, ActiveSubscriptionRow, CompletedTransactionRow
  - Funciones utilitarias: normalizeService, formatCurrency, formatMonthLabel, getMonthKey

Funciones y estructuras clave dependen exclusivamente de estos elementos para procesar y presentar los datos.

---

## Detalles de implementación principales

- Preparación de fechas
  - monthStart: primer día del mes actual (00:00) para delimitar el mes en curso.
  - chartStart: fecha de inicio para el rango de 6 meses de gráficos (meses previos al mes actual).
  - lastSixMonths: arreglo con las 6 fechas de primer día de cada mes (desde 6 meses atrás hasta el actual).

- Datos recuperados de Supabase
  - subscriptionsData: SELECT id, auto_renew, services(type, price) FROM subscriptions WHERE status = 'active'
  - completedTransactions: SELECT amount, created_at FROM transactions WHERE status = 'completed' AND created_at >= chartStart
  - pendingReservations: COUNT de reservas con status = 'pending'

- Cálculos principales
  - normalizeService: helper para normalizar el campo services (puede ser objeto o arreglo, o null). Devuelve ServiceJoin o null.
  - MRR: suma de price del servicio de tipo "manejo_redes" entre subscriptions activas.
  - recurringSubscriptions: cantidad de suscripciones cuyo servicio normalizado tiene type === "manejo_redes".
  - oneTimeSubscriptions: total de subscriptions activas menos las recurrentes.
  - monthlyIncome: suma de amounts de transacciones completadas dentro del mes actual.
  - incomeByMonth: mapa de ingresos por mes (clave "YYYY-MM").
  - monthlyIncomeSeries: arreglo de objetos { label, value } para DashboardCharts (meses recientes con nombre corto y valor numérico).
  - serviceMixCounts / serviceMixSeries: conteo por tipo de servicio (normalizado) para un gráfico de mezcla de servicios.
  - operationsSummary: array con tres entradas: Suscripciones activas, Recurrencia en manejo de redes, Reservas por gestionar.

- Renderizado
  - UI principal con header descriptivo y botones de navegación.
  - Sección de tarjetas DataCard para MRR, ingresos del mes, suscripciones recurrentes y servicios únicos.
  - Sección de reservas pendientes y resumen operativo (tres tarjetas en un grid).
  - DashboardCharts recibe monthlyIncomeSeries y serviceMixSeries.
  - RealtimeRefresher refresca tablas específicas: ["subscriptions", "transactions", "reservations"].

Notas sobre diseño:
- MRR se calcula únicamente para servicios de tipo "manejo_redes".
- Normalización de servicios admite estructura tanto como objeto único como arreglo, priorizando el primer elemento si es arreglo.
- Formato de moneda usa locale es-EC con USD como moneda.

---

## Ejemplos de uso

- Ruta de la página:
  - Al desplegar la aplicación, navegar a la URL /dashboard mostrará este dashboard. Es una página de la App Router de Next.js y se ejecuta en el servidor para generar la UI con los datos más recientes.

- Ejemplo de uso de utilidades internas (en contexto local de desarrollo):
  - formatCurrency(1500) -> "$1,500.00" (según locale es-EC con USD)
  - getMonthKey(new Date()) -> "YYYY-MM" del mes actual
  - formatMonthLabel(new Date()) -> etiqueta de mes corto en español (p. ej., "ene")

Notas de uso:
- Este archivo no está destinado a ser importado como componente independiente por otras partes del código; es una página de ruta que Next.js renderiza en respuesta a una petición.

---

## Notas técnicas

- Este es un server component (export default async function DashboardPage()).
  - Las consultas a Supabase se realizan en el servidor y los datos se envían ya renderizados al cliente.
  - El código realiza tres consultas separadas en secuencia. En teoría, podrían ejecutarse en paralelo (Promise.all) para optimizar latencias, pero actualmente se ejecutan de forma secuencial.
- Tipos locales
  - ServiceJoin: { type: string; price: number }
  - ActiveSubscriptionRow: { id: string; auto_renew: boolean; services: ServiceJoin | ServiceJoin[] | null }
  - CompletedTransactionRow: { amount: number | null; created_at: string }
- Consideraciones de rendimiento
  - Al depender de consultas a la base de datos, la experiencia depende de la latencia de Supabase.
  - El uso de RealtimeRefresher sugiere que la página recibe actualizaciones en vivo para mantener los datos relevantes sin recargar toda la página.
- Consistencia de datos
  - Los cálculos de ingresos y MRR asumen que los datos de las tablas (subscriptions, transactions, reservations) están normalizados y que el campo services puede ser un objeto o un arreglo, por lo que se emplea normalizeService para robustez.
- Seguridad y permisos
  - Las consultas a Supabase se realizan desde el servidor; la protección de datos depende de las políticas de RLS (Row-Level Security) y de las claves de servicio utilizadas por createClient().

---

## Última actualización

12/5/2026

---

Si necesitas que añada más ejemplos de uso, o que expanda alguna sección con diagramas/representaciones de datos, dime y lo incorporo.