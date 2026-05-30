# Documentación técnica — dashboard-charts.tsx

Nombre del archivo: components/dashboard-charts.tsx

Ruta: components/dashboard-charts.tsx

Última actualización: 29/5/2026

Descripción general
-------------------

dashboard-charts.tsx define un componente React de cliente (client component) llamado DashboardCharts. Este componente es responsable de renderizar dos visualizaciones dentro de un módulo de panel de control (dashboard): un gráfico de barras de ingresos mensuales y un gráfico de pastel (pie) del mix de servicios. Los datos se suministran mediante dos props: monthlyIncome y serviceMix. Ambos gráficos son responsivos y muestran un mensaje cuando no hay datos disponibles.

Propósito dentro del proyecto
- Proveer una representación visual de dos métricas clave: ingresos mensuales y distribución de ingresos por tipo de servicio.
- Integrarse con el sistema de diseño (tokens de color) a través de CHART_COLORS y PIE_COLORS para mantener consistencia visual.
- Mantener un comportamiento robusto ante la ausencia de datos (mostrar mensaje informativo).

Responsabilidades
-----------------

- Definir tipos de datos internos para las props:
  - MonthlyIncomePoint: { label: string; value: number }
  - ServiceMixPoint: { name: string; value: number }
- Establecer colores de pie mediante una secuencia de colores basada en CHART_COLORS.
- Formatear valores monetarios a la moneda USD con formato español (ES-EC) sin decimales.
- Renderizar dos secciones con gráficos:
  - Ingresos Mensuales: gráfico de barras con ejes, tooltips y formato de moneda.
  - Mix de servicios: gráfico de pastel con celdas coloreadas y tooltip.
- Manejar estados sin datos para cada gráfico; mostrar un mensaje amigable cuando no haya datos suficientes.
- Asegurar que el componente sea responsive y estéticamente consistente con el diseño del proyecto.

Props / Parámetros
------------------

Este componente es un React component funcional que recibe dos props obligatorios:

- monthlyIncome
  - Type: MonthlyIncomePoint[]
  - Requerido: Sí
  - Descripción: Serie de puntos para el gráfico de barras de ingresos mensuales. Cada punto debe contener:
    - label: etiqueta del eje X (p. ej., mes)
    - value: valor numérico del ingreso correspondiente

- serviceMix
  - Type: ServiceMixPoint[]
  - Requerido: Sí
  - Descripción: Serie de puntos para el gráfico de pastel del mix de servicios. Cada punto debe contener:
    - name: nombre del servicio
    - value: valor numérico asociado al servicio

Notas sobre tipos internos
- MonthlyIncomePoint y ServiceMixPoint están definidos dentro del archivo y no son exportados. Son tipos de datos utilizados para tipar las props del componente.

Retorna
-------

- Un elemento React JSX que representa una sección con dos artículos:
  - Un artículo para Ingresos Mensuales (gráfico de barras) con título, subtítulos y gráfico o mensaje de ausencia de datos.
  - Un artículo para Mix de servicios (gráfico de pastel) con título, gráfico, y una lista/tabla simple de leyenda con nombres y valores cuando hay datos.
- Comportamiento condicional:
  - Si monthlyIncome contiene al menos un item con value > 0, se renderiza el BarChart; de lo contrario, se muestra un mensaje: "Sin datos suficientes para el grafico."
  - Si serviceMix contiene al menos un item con value > 0, se renderiza el PieChart; de lo contrario, se muestra un mensaje similar.
- Formatos y visualización:
  - Ejes y tooltips configurados para una experiencia legible.
  - Los colores de barras y porciones del pastel se gestionan con tokens de color del proyecto (CHART_COLORS y PIE_COLORS).

Dependencias
------------

- React / Next.js (cliente): "use client" indica que es un componente de cliente.
- Recharts: librería de gráficos utilizada para BarChart, PieChart, ResponsiveContainer, Tooltip, XAxis, Bar, Pie, Cell.
- CHART_COLORS: conjunto de tokens de color importado desde "@/lib/design-tokens".
- Internationalization (Intl): para formatear moneda en formatCurrency.
- Estilo CSS/utility classes: usa clases de Tailwind (p. ej., grid, border, bg-card, text-foreground) para el layout y estilos.

Notas técnicas
------------

- Rendimiento y UX:
  - Se utiliza ResponsiveContainer para adaptar los gráficos al tamaño del contenedor.
  - Se evita renderizar gráficos cuando no hay datos relevantes (hasIncome y hasServiceMix) para evitar renderizado innecesario.
  - El tooltip tiene estilo personalizado para integrar con el tema.
- Formato monetario:
  - formatCurrency usa Intl.NumberFormat con locale "es-EC" y currency "USD", con maximumFractionDigits: 0, para mostrar valores como USD sin decimales según configuración regional.
- Accesibilidad:
  - Elementos decorativos utilizan aria-hidden para no interferir con lectores de pantalla.
- Estabilidad de colores:
  - Los colores de las porciones del gráfico de pastel se asignan de forma estable mediante la lista PIE_COLORS y el índice del item (index % PIE_COLORS.length).
- Tipado:
  - El componente está tipado con DashboardChartsProps, y los tipos de datos de las entradas son explícitos para mayor seguridad de tipos.
- Extensibilidad:
  - El diseño permite añadir más gráficos o métricas en el mismo layout si fuera necesario, manteniendo la separación de responsabilidades entre ingresos y mix de servicios.

Ejemplos de uso
---------------

Ejemplo mínimo de uso del componente DashboardCharts dentro de otra vista o componente:

```tsx
import { DashboardCharts } from "@/components/dashboard-charts";

const ingresosMensuales = [
  { label: "Ene", value: 12000 },
  { label: "Feb", value: 15000 },
  { label: "Mar", value: 0 },
  // ...
];

const mixServicios = [
  { name: "Suscripciones", value: 4000 },
  { name: "Reservas", value: 6000 },
  { name: "Crecimiento", value: 2000 },
  // ...
];

function DashboardPage() {
  return (
    <DashboardCharts
      monthlyIncome={ingresosMensuales}
      serviceMix={mixServicios}
    />
  );
}
```

Notas de implementación relevantes
- Este archivo exporta DashboardCharts como una función React que recibe monthlyIncome y serviceMix. No exporta los tipos internos; están destinados solo para el uso dentro del archivo.
- Las URLs y rutas de diseño de tokens (CHART_COLORS) deben resolverse en tiempo de compilación según la configuración de tsconfig/paths del proyecto.
- El componente asume que los datos ya están agregados y formateados adecuadamente por la capa de datos (por ejemplo, API o hooks de datos). No realiza cálculos de agregación.

Última actualización
-------------------

29/5/2026

Observaciones finales
---------------------

La implementación es directa y se adhiere a las convenciones del proyecto RNG Vantage. Si se requieren cambios en el estilo visual o en la lógica de datos (por ejemplo, añadir tooltip personalizado adicional o soportar fechas en lugar de labels simples), se pueden extender las props y ajustar la configuración de Recharts sin alterar la API pública del componente.