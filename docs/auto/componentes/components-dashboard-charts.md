# Documentación técnica — components/dashboard-charts.tsx

Archivo: components/dashboard-charts.tsx

Longitud: 174 líneas

Última actualización: 12/5/2026

Descripción general
-------------------

dashboard-charts.tsx es un componente cliente (cliente de Next.js) que renderiza dos visualizaciones en el dashboard de RNG Vantage:

- Un gráfico de barras que muestra los ingresos mensuales.
- Un gráfico de pastel que muestra la distribución de ingresos por tipo de servicio (mix de servicios).

El componente está construido con Recharts y utiliza tokens de diseño definidos en CHART_COLORS para mantener la consistencia visual con el resto de la app. Ofrece mensajes de fallback cuando no hay datos suficientes para cualquiera de los gráficos.

Responsabilidades
---------------
- Definir tipos de datos para los puntos de ingreso mensual y el mix de servicios.
- Dibujar un gráfico de barras para ingresos mensuales con herramientas de ayuda (Tooltip, XAxis) y formateador de moneda.
- Dibujar un gráfico de pastel para el mix de servicios con colores determinados por una paleta constante y una leyenda simple basada en el array de datos.
- Manejar estados de “sin datos” con mensajes informativos.
- Asegurar que los gráficos sean responsivos mediante Recharts ResponsiveContainer.
- Exportar el componente DashboardCharts para uso en otras partes de la aplicación.

Props / Parámetros
-----------------

Tabla de props (React component)

- name: DashboardCharts
- tipo: React.FC (componente funcional)
- props: DashboardChartsProps
  - monthlyIncome: MonthlyIncomePoint[]
    - label: string
      Descripción: etiqueta/periodo para el eje X (p. ej., mes).
    - value: number
      Descripción: valor del ingreso para ese mes.
    - Requerido: sí
  - serviceMix: ServiceMixPoint[]
    - name: string
      Descripción: nombre de la categoría de servicio (p. ej., "Suscripciones").
    - value: number
      Descripción: valor asociado a esa categoría.
    - Requerido: sí

Notas sobre tipos
- MonthlyIncomePoint:
  - label: string
  - value: number
- ServiceMixPoint:
  - name: string
  - value: number

Retorna
-------

DashboardCharts devuelve un elemento JSX que representa dos paneles gráficos dispuestos en una cuadrícula:

- Panel 1: Gráfico de barras de ingresos mensuales dentro de un BarChart de Recharts, con:
  - Eje X: dataKey="label"
  - Tooltip con formato de moneda mediante formatCurrency
  - Bar con dataKey="value" y color CHART_COLORS.income
  - Manejo de datos insuficientes: muestra mensaje "Sin datos suficientes para el grafico."
- Panel 2: Gráfico de pastel (PieChart) para el mix de servicios dentro de un PieChart de Recharts, con:
  - Pie: data={serviceMix}, dataKey="value", nameKey="name"
  - innerRadius y outerRadius para darle aspecto de anillo
  - Colores por cada cell basados en PIE_COLORS
  - Tooltip estilizado
  - Leyenda/Detalle debajo del gráfico que lista cada servicio con su color y valor
  - Manejo de datos insuficientes: muestra mensaje "Sin datos suficientes para el grafico."

Dependencias
-----------

Librerías y recursos externos utilizados:

- React / Next.js (cliente): "use client" directive al inicio del archivo, indicando que es un componente del lado del cliente.
- Recharts: BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Pie, etc.
- CHART_COLORS desde "@/lib/design-tokens": proporciona colores consistentes para los gráficos.
- Intl.NumberFormat: formateo de moneda en formatCurrency, con locale "es-EC" y USD como moneda.
- Tailwind CSS: clases de utilidad para estilos y layout (p. ej., grid, border, p-6, etc.).

Notas técnicas importantes
-------------------------

- Formateo de moneda
  - La función formatCurrency usa Intl.NumberFormat con locale "es-EC" y currency "USD" y maximiza dígitos fraccionarios a 0. Esto imprime valores en formato USD según la convención de Ecuador (por ejemplo, "US$ 1,000" o "$1,000" según configuración regional del entorno). Se aplica al tooltip del gráfico de ingresos.
- Colores y consistencia visual
  - El gráfico de barras usa CHART_COLORS.income para el color de la barra.
  - El gráfico de pastel utiliza una secuencia de colores definida por PIE_COLORS:
    - subscriptions, reservations, growth, expense, income (tomados de CHART_COLORS).
  - Los colores se asignan a cada entrada mediante index modulo longitud de PIE_COLORS.
- Rendimiento y reactividad
  - El componente depende solo de las props: monthlyIncome y serviceMix. No realiza transformaciones complejas; el renderizado es directo y dependiente de la disponibilidad de datos.
  - Se emplea ResponsiveContainer para hacer que los gráficos se adapten al tamaño disponible del contenedor.
- Accesibilidad y fallbacks
  - Se proveen mensajes en español cuando no hay datos suficientes para alguno de los gráficos.
  - Un div decorativo usa aria-hidden para no confundir a lectores de pantalla.
- Tipografía y estilos
  - Se utilizan clases de Tailwind para estructura y estilo (paneles, bordes, fondo, tipografía) sin depender de estilos en línea para la mayor parte del diseño.

Ejemplos de uso
--------------

A continuación un ejemplo concreto de uso del componente DashboardCharts en una página o componente:

```tsx
import { DashboardCharts } from "@/components/dashboard-charts";

const monthlyIncomeSample = [
  { label: "Ene", value: 12000 },
  { label: "Feb", value: 15000 },
  { label: "Mar", value: 0 },
  { label: "Abr", value: 18000 },
  { label: "May", value: 21000 },
];

const serviceMixSample = [
  { name: "Suscripciones", value: 8000 },
  { name: "Reservas", value: 5000 },
  { name: "Crecimiento", value: 4000 },
  { name: "Gastos", value: 2000 },
  { name: "Ingresos", value: 10000 },
];

export default function DashboardPage() {
  return (
    <div>
      <DashboardCharts
        monthlyIncome={monthlyIncomeSample}
        serviceMix={serviceMixSample}
      />
    </div>
  );
}
```

Notas sobre el ejemplo:
- monthlyIncomeSample y serviceMixSample deben ser arrays que cumplan las interfaces MonthlyIncomePoint y ServiceMixPoint.
- Este ejemplo mostrará tanto el gráfico de barras de ingresos mensuales como el gráfico de pastel de mix de servicios, con datos de ejemplo.

Notas técnicas adicionales
-------------------------

- El componente hace render condicional:
  - hasIncome: true si al menos un item.value > 0 en monthlyIncome.
  - hasServiceMix: true si al menos un item.value > 0 en serviceMix.
  - Si alguna de estas condiciones es falsa, se renderiza un mensaje de fallback en lugar del gráfico correspondiente.
- Formato de fechas y labels:
  - Los labels del eje X provienen directamente de monthlyIncome.label.
- Tipografía y tamaño:
  - El dominio de tamaño y la estética dependen de las clases Tailwind presentes en el proyecto, por lo que el diseño podría ajustarse a temas globales de la aplicación.

Última actualización
-------------------

12/5/2026

Notas finales
------------

- Este archivo está diseñado para ser directo y fácil de reutilizar dentro de otros componentes/escenas del dashboard.
- Si en el futuro se agregan más tipos de servicio para el mix, se recomienda ampliar PIE_COLORS o adaptar la lógica de asignación de colores para evitar solapamientos o desajustes en la leyenda.