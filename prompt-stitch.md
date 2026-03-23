# Prompt para Google Stitch — RNG-Vantage

> Copiar todo el contenido debajo de la linea y pegarlo en Google Stitch.

---

Diseña una aplicacion web completa llamada **RNG-Vantage** — una plataforma de automatizacion de ventas, reservas y control financiero para una agencia de marketing digital en Ecuador. La aplicacion debe ser moderna, profesional, limpia y con estilo SaaS. Mobile-first. El idioma de toda la interfaz es español.

## Paginas a diseñar

### 1. Landing Page (pagina principal publica)

- **Hero section**: Titulo grande "RNG-Vantage", subtitulo "Automatizacion de ventas, reservas y control financiero para tu emprendimiento de marketing digital". Dos botones CTA: "Ver Servicios" (primario, redondeado) y "Reservar Capacitacion" (secundario, outline).
- **Seccion "Nuestros Servicios"**: 3 cards en grid mostrando los servicios destacados. Cada card tiene: icono, nombre del servicio, descripcion corta, precio (ej: "$150/mes"), duracion, y un boton "Contratar". Servicios de ejemplo: "Manejo de Redes Sociales", "Auditoria Digital", "Capacitacion en Marketing".
- **Seccion "Como Funciona"**: 3 pasos ilustrados con iconos numerados: 1) "Reserva una cita" 2) "Elige tu paquete" 3) "Comienza a crecer".
- **Seccion CTA final**: Fondo sutil, texto "Empieza a transformar tu negocio hoy" con boton "Comenzar Ahora".
- **Navbar sticky** en la parte superior: Logo "RNG-Vantage" a la izquierda, links de navegacion "Servicios", "Reservar" al centro, boton "Iniciar Sesion" a la derecha. En mobile: menu hamburguesa que abre un panel lateral.
- **Footer**: Links a "Politica de Privacidad", "Contacto", copyright "© 2026 RNG-Vantage".

### 2. Catalogo de Servicios (/catalogo)

- Titulo "Catalogo de Servicios".
- **Tabs de filtro** en la parte superior: "Todos", "Manejo de Redes", "Auditoria", "Capacitacion".
- **Grid de cards de servicio** responsive (1 columna en mobile, 2 en tablet, 3 en desktop). Cada card muestra:
  - Nombre del servicio
  - Badge con el tipo (ej: "Redes Sociales", "Auditoria")
  - Descripcion de 2 lineas
  - Precio destacado (ej: "$400.00")
  - Duracion (ej: "3 meses")
  - Boton "Contratar" primario
- Algunos servicios de ejemplo: "Manejo de Redes - Mensual $150", "Manejo de Redes - Trimestral $400", "Manejo de Redes - Anual $1,400", "Auditoria de Redes Sociales $80", "Auditoria + Estrategia Digital $200", "Capacitacion en Marketing Digital - Gratis".

### 3. Formulario de Reserva (/reservar)

- Titulo "Reservar Capacitacion Gratuita".
- Subtitulo "Completa el formulario y nos pondremos en contacto contigo para agendar tu sesion".
- **Formulario** con los campos:
  - Nombre completo (input text, requerido)
  - Correo electronico (input email, requerido)
  - Telefono (input tel, opcional)
  - Fecha preferida (date picker / calendar, requerido)
  - Notas adicionales (textarea, opcional)
  - Checkbox obligatorio: "Acepto el tratamiento de mis datos personales segun la Politica de Privacidad (LOPDP Ecuador)"
  - Boton "Enviar Reserva" (primario, full width en mobile)
- Mostrar mensajes de validacion inline debajo de cada campo con errores.
- Incluir un estado de exito: un toast o card verde que diga "¡Reserva enviada exitosamente! Nos comunicaremos pronto."

### 4. Checkout (/checkout)

- Titulo "Confirmar Contratacion".
- **Card de resumen** del servicio seleccionado:
  - Nombre del servicio
  - Descripcion
  - Precio
  - Duracion
  - Separador
  - Checkbox "Activar renovacion automatica"
  - Total a pagar (destacado, grande)
- Boton "Confirmar Contratacion" (primario, grande).
- Nota al pie: "El pago se coordinara con nuestro equipo. Metodos: efectivo, transferencia o tarjeta."
- Estado de exito: card con icono check verde, "¡Suscripcion creada exitosamente!", numero de suscripcion, y boton "Ver mis suscripciones".

### 5. Login (/login)

- Centrado vertical y horizontalmente en la pantalla.
- Card con:
  - Logo o nombre "RNG-Vantage" arriba
  - Titulo "Iniciar Sesion"
  - Campo "Correo electronico"
  - Campo "Contraseña" (con toggle para mostrar/ocultar)
  - Boton "Iniciar Sesion" (primario, full width)
  - Link abajo: "¿No tienes cuenta? Registrate"
- Diseño minimalista, mucho espacio en blanco.

### 6. Register (/register)

- Misma estructura centrada que Login.
- Card con:
  - Logo o nombre "RNG-Vantage" arriba
  - Titulo "Crear Cuenta"
  - Campo "Nombre completo"
  - Campo "Correo electronico"
  - Campo "Contraseña"
  - Campo "Confirmar contraseña"
  - Checkbox: "Acepto el tratamiento de mis datos personales (LOPDP)"
  - Boton "Crear Cuenta" (primario, full width)
  - Link abajo: "¿Ya tienes cuenta? Inicia sesion"

### 7. Dashboard Administrativo (/dashboard)

- **Layout con sidebar** a la izquierda (colapsable en mobile):
  - Logo "RNG-Vantage" arriba
  - Links de navegacion con iconos: "Dashboard", "Reservas", "Servicios", "Suscripciones", "Transacciones"
  - Separador
  - Nombre del usuario admin abajo con avatar y boton "Cerrar Sesion"
- **Contenido principal del Dashboard**:
  - **4 KPI cards** en fila (2x2 en mobile): "Ingresos del Mes" (con icono de dolar, valor ej: "$2,350.00"), "Suscripciones Activas" (ej: "23"), "Reservas Pendientes" (ej: "8"), "Transacciones del Mes" (ej: "31").
  - **Grafico de barras** (grande): "Ingresos Mensuales" — ultimos 6 meses con barras, labels en eje X (Oct, Nov, Dic, Ene, Feb, Mar), valores en eje Y.
  - **Grafico de pie/donut** (mediano): "Ingresos por Tipo de Servicio" — 3 segmentos: Manejo de Redes (mayor), Auditoria, Capacitacion.
  - **Tabla "Transacciones Recientes"** debajo: columnas Fecha, Cliente, Monto, Metodo de Pago, Estado. El estado debe ser un badge de color: "Completado" (verde), "Pendiente" (amarillo), "Fallido" (rojo). Mostrar 5-8 filas de ejemplo con datos realistas.

### 8. Gestion de Reservas — Admin (/reservas)

- Titulo "Gestion de Reservas".
- **Tabs de filtro** por estado: "Todas", "Pendientes", "Confirmadas", "Completadas", "Canceladas". Cada tab muestra el conteo (ej: "Pendientes (5)").
- **Tabla de datos** con columnas: Nombre, Email, Telefono, Fecha Preferida, Estado, Acciones.
  - Estado es un badge coloreado (Pendiente=amarillo, Confirmada=azul, Completada=verde, Cancelada=rojo).
  - Acciones: dropdown menu con opciones "Confirmar", "Completar", "Cancelar".
- Al hacer clic en una fila, se abre un **dialog/modal** con todos los detalles de la reserva.
- Datos de ejemplo: 6-8 reservas con nombres ecuatorianos realistas.

### 9. Gestion de Servicios — Admin (/servicios)

- Titulo "Gestion de Servicios".
- Boton "Nuevo Servicio" arriba a la derecha.
- **Tabla de datos** con columnas: Nombre, Tipo (badge), Precio, Duracion, Estado (Activo/Inactivo), Acciones.
  - Estado: badge verde "Activo" o gris "Inactivo".
  - Acciones: dropdown con "Editar" y "Desactivar/Activar".
- Al presionar "Nuevo Servicio" o "Editar", se abre un **dialog/modal** con formulario:
  - Nombre del servicio (input)
  - Descripcion (textarea)
  - Tipo (select: Manejo de Redes, Auditoria, Capacitacion, Otro)
  - Precio (input numerico con prefijo "$")
  - Duracion en meses (input numerico)
  - Boton "Guardar" y "Cancelar"

### 10. Gestion de Transacciones — Admin (/transacciones)

- Titulo "Registro de Transacciones".
- **Fila de filtros**: Select por estado (Todos, Pendiente, Completado, Fallido, Reembolsado) + Date range picker para rango de fechas.
- **Card de resumen** arriba: "Total filtrado: $X,XXX.XX" (suma de las transacciones visibles).
- Boton "Registrar Pago" arriba a la derecha.
- **Tabla de datos** con columnas: Fecha, Cliente, Monto, Metodo de Pago (badge: Efectivo, Transferencia, Tarjeta), Estado (badge coloreado), Acciones.
- Dialog "Registrar Pago" con formulario: Cliente (select), Monto, Metodo de Pago (select), Notas (textarea), Boton "Registrar".
- Datos de ejemplo: 8-10 transacciones con montos variados.

### 11. Politica de Privacidad (/politica-privacidad)

- Pagina de texto legal con titulo "Politica de Privacidad y Tratamiento de Datos Personales".
- Secciones con subtitulos: "Responsable del Tratamiento", "Datos Recopilados", "Finalidad del Tratamiento", "Base Legal", "Derechos del Titular", "Tiempo de Conservacion", "Medidas de Seguridad", "Contacto".
- Tipografia legible, parrafos bien espaciados, fondo limpio.
- Referencia a la LOPDP (Ley Organica de Proteccion de Datos Personales del Ecuador).

## Requisitos generales de diseño

- **Mobile-first**: Todas las paginas deben verse perfectas en 375px (movil), 768px (tablet) y 1280px (desktop).
- **Estilo SaaS moderno**: Bordes suaves (border-radius), sombras sutiles, mucho espacio en blanco, tipografia limpia sans-serif.
- **Iconografia**: Usar iconos tipo Lucide (lineales, minimalistas) para navegacion, KPI cards y acciones.
- **Componentes UI**: Botones redondeados, inputs con labels flotantes o superiores, tablas con hover en filas, modales centrados con overlay, toasts de notificacion, badges coloreados para estados.
- **Tema claro por defecto** con tokens preparados para tema oscuro.
- **Navegacion**: Navbar para paginas publicas, Sidebar para el dashboard admin. Transicion suave entre ambos layouts.
- **Accesibilidad**: Contraste suficiente, focus rings visibles, labels en todos los inputs.
- Se creativo con la paleta de colores — elige una combinacion que transmita profesionalismo, confianza y modernidad para una agencia de marketing digital.
