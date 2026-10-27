# Despliegue

## Variables de entorno

Usa [.env.example](../.env.example) como plantilla. Configura en el entorno de despliegue:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY`: solo servidor, para operaciones administrativas.
- `NEXT_PUBLIC_SITE_URL`: URL pública real, sin barra final.
- `PAYPHONE_TOKEN` y `PAYPHONE_STORE_ID`: credenciales del comercio, solo servidor.
- `RESEND_API_KEY` y `EMAIL_FROM`: envío de correo desde un dominio verificado.

No se requieren variables de Kushki para el checkout actual. Si una credencial se ha publicado en Git, revócala y emite una nueva en el proveedor: quitarla del archivo actual no la elimina del historial.

## Base de datos

Revisa el proyecto Supabase de destino y las migraciones pendientes antes de ejecutar:

```bash
npx supabase db push
```

Conserva todas las migraciones existentes. La migración `20260603000000_payphone_gateway.sql` habilita `gateway = 'payphone'` y debe estar aplicada antes de usar el checkout actualizado. Conserva `kushki` como valor histórico para no invalidar registros previos. Este cambio de repositorio no aplica automáticamente migraciones ni configura secretos.

Verifica RLS, el bucket privado `comprobantes`, los permisos de subida y las políticas de las tablas. No ejecutes `db reset` contra producción.

## Edge Functions

```bash
npx supabase functions deploy dashboard-metrics
npx supabase functions deploy subscription-renewal
```

Verifica el cron `daily-subscription-renewal` y el secreto de autenticación en Vault conforme a las migraciones. El cron genera recibos pendientes para renovaciones elegibles; no realiza cargos con PayPhone. Los registros históricos con `gateway_subscription_id` conservan el tratamiento anterior.

## Aplicación

Usa Node.js 22, instala con `npm ci` y ejecuta lint, TypeScript, pruebas unitarias y build antes de publicar. En Vercel, configura `main` como rama de producción y las variables anteriores.

El service worker se genera durante el build de producción. En desarrollo está deshabilitado.

## Verificación en el entorno de destino

Comprueba el catálogo, login, restricciones de administración, creación/edición/activación de servicios y exportación CSV. En un entorno de pagos de prueba, verifica el retorno de PayPhone, el estado de la transacción y la suscripción, la transferencia manual con comprobante y los correos. No hay webhook de Kushki en el código actual.
