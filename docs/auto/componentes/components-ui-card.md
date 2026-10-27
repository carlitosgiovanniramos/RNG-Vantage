# RNG Vantage - Card UI Components (components/ui/card.tsx)

La carpeta components/ui contiene componentes de UI reutilizables. Este archivo define un conjunto de componentes para construir tarjetas (cards) consistentes, con apoyo para cabeceras, títulos, descripciones, contenido, acciones y pie de página. Se diseñaron para ser combinados fácilmente con otros elementos de la UI del proyecto RNG Vantage.

## Descripción general

El archivo exporta un conjunto de componentes de tarjeta:

- Card: contenedor principal de la tarjeta.
- CardHeader: cabecera de la tarjeta.
- CardTitle: título dentro de la cabecera.
- CardDescription: descripción breve dentro de la cabecera.
- CardContent: área principal de contenido de la tarjeta.
- CardAction: área para acciones (botones, enlaces) dentro de la tarjeta.
- CardFooter: pie de página de la tarjeta.

El diseño utiliza un sistema de slots basado en data-slot y clases utilitarias (parecidas a Tailwind) para permitir estilos dependientes de la presencia de ciertos slots y tamaños. El componente Card soporta un tamaño opcional ("default" o "sm") que ajusta espaciados y alineación dentro de la tarjeta.

## Responsabilidades

- Proporcionar una estructura consistente para tarjetas con separación clara entre header, content y footer.
- Facilitar la composición mediante slots etiquetados con data-slot (card, card-header, card-title, card-description, card-content, card-action, card-footer).
- Soportar un modo compacto (size="sm") que reduce paddings y gaps para tarjetas más pequeñas.
- Exponer props flexibles (propagación de props de div) para permitir atributos HTML adicionales y estilos personalizados.

## Props / Parámetros

A continuación se detallan las props de cada componente exportado.

- Card
  - Tipo: React.ComponentProps<"div"> & { size?: "default" | "sm" }
  - Requerido: No (size tiene valor por defecto)
  - Descripción:
    - className: cadenas de CSS opcionales para estilo adicional.
    - size: tamaño de la tarjeta. Puede ser "default" (valor por defecto) o "sm" para un modo más compacto.
    - Otros props de div: se propagan al elemento raíz.

- CardHeader
  - Tipo: React.ComponentProps<"div">
  - Requerido: No
  - Descripción:
    - className: clases CSS opcionales para estilo adicional.
    - Otros props de div: se propagan al elemento raíz.
  - Notas: el slot data-slot="card-header" facilita la selección y estilos derivados.

- CardTitle
  - Tipo: React.ComponentProps<"div">
  - Requerido: No
  - Descripción:
    - className: clases CSS opcionales para estilo adicional.
    - Otros props de div: se propagan al elemento raíz.
  - Notas: el slot data-slot="card-title" facilita su identificación.

- CardDescription
  - Tipo: React.ComponentProps<"div">
  - Requerido: No
  - Descripción:
    - className: clases CSS opcionales para estilo adicional.
    - Otros props de div: se propagan al elemento raíz.
  - Notas: el slot data-slot="card-description" facilita su identificación.

- CardContent
  - Tipo: React.ComponentProps<"div">
  - Requerido: No
  - Descripción:
    - className: clases CSS opcionales para estilo adicional.
    - Otros props de div: se propagan al elemento raíz.
  - Notas: el slot data-slot="card-content" facilita su identificación.

- CardAction
  - Tipo: React.ComponentProps<"div">
  - Requerido: No
  - Descripción:
    - className: clases CSS opcionales para estilo adicional.
    - Otros props de div: se propagan al elemento raíz.
  - Notas: el slot data-slot="card-action" facilita su identificación y posición dentro de la grid de la cabecera.

- CardFooter
  - Tipo: React.ComponentProps<"div">
  - Requerido: No
  - Descripción:
    - className: clases CSS opcionales para estilo adicional.
    - Otros props de div: se propagan al elemento raíz.
  - Notas: el slot data-slot="card-footer" facilita su identificación y permite estilos condicionados cuando está presente gracias a selectores como has-data-[slot=card-footer].

## Retorna

- Card: JSX.Element que representa un div configurado como contenedor de la tarjeta. Incluye data-slot="card" y data-size={size}, así como una clase combinada con cn() y cualquier className adicional. Props adicionales se propagan al div.
- CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter: cada uno retorna un JSX.Element div con su correspondiente data-slot (card-header, card-title, card-description, card-content, card-action, card-footer) y las clases definidas. También aceptan className y props de div, propagándose al elemento raíz.

Ejemplos de retorno típicos:
- Card devuelve un div con estructura y slots para su composición.
- Los demás componentes devuelven divs anidados en el layout de la tarjeta con su slot correspondiente.

## Dependencias

- React
  - Utiliza React para la definición de componentes funcionales y tipos TypeScript.
- cn (helper de classNames)
  - Importado desde "@/lib/utils". Se usa para combinar clases CSS de forma condicional.
- Estilo/slots basado en data-slot
  - El diseño depende de un sistema de estilos que aprovecha data-slot y selectores de atributos (p. ej., has-data-[slot=card-footer]:pb-0) para adaptar el espaciado y el layout dependiendo de qué slots están presentes.
- No se observa uso directo de hooks, servicios o Stores dentro de este archivo.

## Ejemplos de uso

Ejemplo básico de composición de una Card con header, título y descripción, contenido y pie de página con una acción:

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction
} from "@/components/ui/card"

function ExampleCard() {
  return (
    <Card size="default" className="my-4">
      <CardHeader className="justify-between">
        <div>
          <CardTitle>Resumen de ventas</CardTitle>
          <CardDescription>Últimas 24 horas</CardDescription>
        </div>
        <CardAction>
          {/* Botones u otras acciones pueden ir aquí */}
        </CardAction>
      </CardHeader>

      <CardContent>
        {/* Contenido principal de la tarjeta */}
        <p>Ventas totales: 1,234</p>
      </CardContent>

      <CardFooter className="mt-2">
        <span>Fuente: sistema interno</span>
      </CardFooter>
    </Card>
  )
}
```

Notas sobre el ejemplo:
- CardHeader contiene CardTitle y CardDescription dentro de su estructura.
- CardAction se posiciona según el layout definido (grid/filas) gracias a las clases internas y slots.
- CardContent alberga el contenido principal; CardFooter se utiliza para notas o acciones finales.

## Notas técnicas

- Diseño basado en slots:
  - El uso de data-slot permite a la hoja de estilos aplicar reglas específicas en función de la presencia de cada slot. Esto facilita el mantenimiento y la coherencia visual entre tarjetas.
- Compatibilidad de tamaño:
  - Card acepta size="default" o "sm". Cuando size="sm" se aplican cambios mediante selectores tipo data-[size=sm] para reducir gaps y paddings, ajustando el diseño para pantallas o contextos donde se necesite un aspecto más compacto.
- Encapsulamiento de estilos:
  - Las clases en cada componente están construidas para trabajar en conjunto con una hoja de estilos/tema que define:
    - bg-card, text-card-foreground, border radii (rounded-xl, rounded-t-xl, rounded-b-xl)
    - espaciados (py-4, px-4, gap-4, etc.)
    - comportamiento del grid y del layout en card-header y card-action
- Rendimiento:
  - Los componentes son simples wrappers funcionales que no realizan lógica adicional ni efectos secundarios. Esto favorece la legibilidad y el rendimiento, ya que sólo gestionan props y clases.
- Mantenimiento:
  - El diseño facilita la sustitución de estilos a nivel de clase sin cambiar la estructura de los componentes.
  - Al depender de data-slot para estilos, es crucial que el sistema de CSS/tema mantenga estos selectores para evitar estilos desincronizados.

## Última actualización

12/5/2026

Notas finales:
- Esta documentación cubre la estructura y el uso de los componentes del archivo card.tsx sin asumir funcionalidades fuera del código presente.
- Si se agregan comportamientos adicionales en el futuro (p. ej., propagation de eventos o hooks de estado), se deberá actualizar esta documentación para reflejar las nuevas capacidades y limitaciones.