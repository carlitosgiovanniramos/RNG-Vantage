# Documentación técnica — app/api/admin/export-transactions/route.ts

Archivo: route.ts  
Ruta API: /api/admin/export-transactions  
Propósito: Exportar todas las transacciones en formato CSV para contabilidad. Accesible únicamente para administradores activos.

Nota: Este archivo forma parte del módulo RNG Vantage, un sistema de automatización de ventas, reservas y control financiero construido con Next.js, TypeScript y Supabase.

---

## Descripción general

El archivo implementa una ruta API GET en Next.js que genera y devuelve un archivo CSV con todas las transacciones registradas. El flujo de ejecución es:

1. Verificar que quien llama a la ruta es un administrador activo.
2. Consultar todas las transacciones desde la base de datos.
3. Resolver los nombres de los clientes asociados a cada transacción.
4. Construir un CSV con los campos relevantes y retornar el archivo como respuesta descargable.
5. Incluir un BOM inicial para que Excel interprete correctamente UTF-8 y formatear la fecha en formato local hispano (es-EC).

La ruta está marcada para ejecutarse en Node.js (runtime: "nodejs"), lo que implica ejecución en un entorno de servidor Node, no en edge.

---

## Responsabilidades

- Autenticación y autorización:
  - Verificar presencia de usuario autenticado.
  - Comprobar que el usuario tiene rol "admin" y está activo.
  - De lo contrario, responder con 401 (Unauthorized) o 403 (Forbidden).
- Extracción de datos:
  - Leer todas las transacciones desde la tabla "transactions" usando un cliente admin.
  - Ordenarlas por fecha de creación de forma descendente.
- Enriquecimiento de datos:
  - Extraer IDs de usuarios asociados a las transacciones.
  - Obtener nombres de clientes desde la tabla "profiles" (id, first_name, last_name).
  - Construir un mapa de nombre completo por usuario.
- Generación de CSV:
  - Definir encabezado: Fecha, Cliente, Monto USD, Estado, Metodo, Pasarela, ID Kushki, ID Transaccion.
  - Formatear cada fila: fecha en formato es-EC, monto con dos decimales, estado traducido a español cuando aplica, manejo de cliente faltante ("Sin cliente").
  - Escapar correctamente los valores para CSV (comillas dobles y duplicación de comillas internas).
  - Incluir BOM UTF-8 y usar CRLF para finales de línea.
  - Devolver el CSV como respuesta con tipo text/csv y sugerencia de descarga de filename.
- Manejo de errores:
  - Registrar y devolver 500 con mensaje genérico "Export failed" si falla la consulta de transacciones.

---

## Props / Parámetros

- GET (sin cuerpo):
  - No recibe parámetros en la ruta.
  - Requiere cabecera de autorización válida (token de usuario) para autenticar al administrador.
- Dependencias de entrada:
  - El flujo utiliza dos clientes de Supabase:
    - createClient() para obtener el usuario actual (auth).
    - createAdminClient() para consultar las tablas "transactions" y "profiles".
- Salida:
  - Respuesta HTTP con código 200 y cuerpo CSV en caso de éxito.
  - En caso de error, códigos 401, 403 o 500 con mensajes de error relevantes.

---

## Retorna

- Tipo de retorno: NextResponse
- Contenido:
  - Cuerpo: texto CSV completo (incluido el BOM inicial para UTF-8).
  - Encabezados:
    - Content-Type: text/csv; charset=utf-8
    - Content-Disposition: attachment; filename="transacciones-YYYY-MM-DD.csv" (con fecha de hoy en formato ISO: YYYY-MM-DD)
- Formato CSV:
  - Encabezado (header): 
    - Fecha, Cliente, Monto USD, Estado, Metodo, Pasarela, ID Kushki, ID Transaccion
  - Filas: una por cada transacción, con:
    - Fecha: created_at formateado como locale es-EC
    - Cliente: nombre compuesto obtenido de profiles; "Sin cliente" si no se encuentra
    - Monto USD: amount con dos decimales
    - Estado: mapeado a etiquetas en español usando STATUS_LABELS
    - Metodo: payment_method
    - Pasarela: gateway
    - ID Kushki: gateway_transaction_id
    - ID Transaccion: id

---

## Dependencias

- Next.js
  - NextResponse desde "next/server" para construir la respuesta HTTP.
- Supabase
  - createClient desde "@/lib/supabase/server" (cliente para autenticación y obtención de usuario).
  - createAdminClient desde "@/lib/supabase/admin" (cliente con permisos de administrador para consultar datos).
- Utilidades internas:
  - CSV escaping helper csvCell (escapa y envuelve en comillas dobles).
  - Mapeo de estados: STATUS_LABELS para traducir estados a etiquetas en español.

Notas sobre dependencias:
- No hay dependencias React en este archivo; es una ruta API.
- La lógica de permisos depende de registros en la tabla profiles (rol y is_active).

---

## Notas técnicas

- Autenticación y autorización:
  - Se obtiene el usuario actual mediante supabase.auth.getUser().
  - Si no hay usuario, se devuelve 401 Unauthorized.
  - Se consulta el perfil del usuario (rol y is_active). Solo si rol es "admin" y is_active no es false se continúa; de lo contrario, 403 Forbidden.
- Consulta de datos:
  - Se usa el cliente admin para leer la tabla transactions, seleccionando campos: id, user_id, amount, status, payment_method, gateway, gateway_transaction_id, created_at.
  - Las transacciones se ordenan por created_at en orden descendente.
  - En caso de error al consultar, se registra en la consola y se devuelve 500 Export failed.
- Enriquecimiento de datos:
  - Se extraen los user_id únicos y válidos (string).
  - Se consulta la tabla profiles para obtener id, first_name y last_name de los usuarios relevantes.
  - Se crea un mapa nameById para obtener el nombre completo ("First Last") por id. Si no existe, se usa vacío.
- Generación de CSV:
  - Encabezados definidos explícitamente en español para alinearse con el público contable.
  - Formato de fecha: new Date(t.created_at).toLocaleString("es-EC") para respetar el locale español de Ecuador.
  - Moneda: monto formateado con Number(t.amount).toFixed(2).
  - Estados: se mapea con STATUS_LABELS; si no existe el mapeo, se usa el valor original de t.status.
  - Cliente: se busca en nameById; si no se encuentra, se usa "Sin cliente".
  - Escape de CSV: cada celda pasa por csvCell, que:
    - Convierte null/undefined a "".
    - Convierte a string.
    - Reemplaza comillas dobles internas por """".
    - Envuelve todo en comillas dobles.
  - Separación de columnas: coma.
  - Saltos de línea: \r\n.
  - BOM: se añade un carácter BOM (U+FEFF) al inicio del CSV para que Excel lo reconozca como UTF-8.
- Rendimiento y escalabilidad:
  - El diseño carga todas las transacciones en memoria y luego genera el CSV. Si la cantidad de transacciones es muy grande, podría impactar en memoria y tiempo de respuesta. Considerar paginación/streaming para volúmenes muy grandes en futuras mejoras.
- Seguridad y manejo de errores:
  - Errores durante la consulta de transacciones se loguean y devuelven 500 con mensaje genérico.
  - No se exponen detalles de la consulta o de la base de datos al cliente.
- Internacionalización:
  - Fecha formateada con es-EC; textos del CSV en español (encabezados y etiquetas de estado).

---

## Ejemplos de uso

1) Uso desde curl (requiere token válido en Authorization header)

curl -X GET https://tu-dominio.com/api/admin/export-transactions \
  -H "Authorization: Bearer <token_admin_valido>" \
  -H "Accept: text/csv"

- Resultado: un archivo descargable llamado transacciones-YYYY-MM-DD.csv con el contenido CSV descrito.

2) Uso desde fetch en un cliente TypeScript/JS

fetch("/api/admin/export-transactions", {
  method: "GET",
  headers: {
    "Authorization": "Bearer <token_admin_valido>"
  }
})
  .then((r) => {
    if (!r.ok) throw new Error("Export failed");
    return r.blob();
  })
  .then((blob) => {
    // Crear enlace de descarga en el navegador
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transacciones.csv"; // nombre recomendado por el servidor (ZIP puede ser distinto)
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  })
  .catch((err) => console.error(err));

Notas: El nombre de archivo real es transacciones-YYYY-MM-DD.csv con fecha de hoy; el ejemplo de descarga puede variar según implementación de cliente.

---

## Última actualización

29/5/2026

---

Si necesitas que agregue más secciones o ejemplos (por ejemplo, pruebas unitarias/muertas simuladas o diagramas de flujo), dime y lo amplío.