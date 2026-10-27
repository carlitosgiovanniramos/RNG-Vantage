# Pagos con PayPhone

## Configuración

Define `PAYPHONE_TOKEN`, `PAYPHONE_STORE_ID`, `NEXT_PUBLIC_SITE_URL` y las variables de Supabase en el servidor. La clave de servicio de Supabase y el token de PayPhone no deben exponerse al navegador ni guardarse en Git.

## Tarjeta

1. El cliente autenticado selecciona un servicio activo.
2. `initPayphonePayment` obtiene el precio de la base de datos y crea una suscripción y transacción pendientes.
3. Se guarda un identificador propio en `gateway_reference` y se prepara el pago mediante el cliente servidor de `lib/payphone`.
4. El navegador se dirige al portal de PayPhone para ingresar la tarjeta.
5. PayPhone devuelve el navegador a `/pago-respuesta`. El servidor confirma el resultado y actualiza los registros.

Los importes enviados al proveedor se expresan en centavos USD. El gateway de la transacción es `payphone`. No hay tokenización de tarjetas ni suscripciones recurrentes del proveedor en esta implementación.

## Transferencia

Se crea una transacción con gateway `manual` y método `transfer`. El cliente transfiere a la cuenta indicada y sube el comprobante. La revisión y aprobación se realizan desde administración.

## Renovaciones

`auto_renew` solo aplica a servicios de manejo de redes. El cron puede extender la suscripción y crear un recibo pendiente; PayPhone no cobra automáticamente la tarjeta. Las columnas heredadas de Kushki se conservan para los registros históricos.

## Despliegue y alcance de las comprobaciones

Aplica `20260603000000_payphone_gateway.sql` antes de habilitar el checkout. Compilación y pruebas locales no acreditan un pago real: el flujo completo requiere el entorno de Supabase, las credenciales del comercio y una prueba controlada del retorno del proveedor.

La documentación de Kushki y los documentos automáticos anteriores se conservan en [archive](archive/auto-2026-05/README.md) como referencia histórica.
