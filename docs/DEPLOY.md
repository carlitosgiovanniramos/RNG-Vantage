# Guía de Despliegue (Deploy)

Este documento contiene las instrucciones necesarias para desplegar la base de datos, las Edge Functions y la aplicación Next.js en entornos de staging o producción.

## 1. Variables de Entorno Requeridas

Para el frontend y backend en Next.js (ej. Vercel):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...          # Solo server-side

# URL pública del sitio (callbacks de pago)
NEXT_PUBLIC_SITE_URL=https://<tu-dominio>

# Kushki — pasarela de pagos
NEXT_PUBLIC_KUSHKI_ENV=production         # "sandbox" o "production"
NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID=... # tokenización en cliente
KUSHKI_PRIVATE_MERCHANT_ID=...            # cargos / suscripciones (server)
KUSHKI_WEBHOOK_SECRET=...                 # secreto del webhook

# Resend — correos transaccionales
RESEND_API_KEY=...
EMAIL_FROM=RGL Estudio <noreply@tu-dominio.com>
```

Las variables de Kushki y Resend son opcionales en desarrollo: si faltan, los pagos fallan de forma controlada y los correos se omiten, sin romper la app. En producción son obligatorias.

Para las Edge Functions en Supabase, `SUPABASE_URL` y `SUPABASE_ANON_KEY` se inyectan automáticamente; `SUPABASE_SERVICE_ROLE_KEY` debe estar disponible para las funciones.

## 2. Migraciones de Base de Datos

Las migraciones están en `supabase/migrations/` y deben ejecutarse en orden. Las 10 migraciones actuales:

1. `20260325120000_init.sql` — creación inicial de tablas, enums, triggers y RLS
2. `20260402000000_split_full_name.sql` — separación de nombre en first_name/last_name
3. `20260403010000_fix_profiles_admin_policy.sql` — corrección de políticas RLS de admin
4. `20260404000000_fix_security_and_business_logic.sql` — hardening de seguridad, índices y reglas de negocio
5. `20260520000000_create_views.sql` — vistas SQL optimizadas para el dashboard
6. `20260520100000_setup_cron_subscription_renewal.sql` — pg_cron + pg_net para renovación diaria
7. `20260521000000_add_profiles_is_active.sql` — campo `is_active` en `profiles`
8. `20260522000000_kushki_gateway_columns.sql` — columnas de conciliación de pasarela en `transactions`
9. `20260522120000_fix_subscription_renewal_cron.sql` — corrige la autenticación del cron (Vault)
10. `20260522140000_kushki_subscription_id.sql` — `gateway_subscription_id` en `subscriptions`

**Comando de despliegue de DB:**
```bash
supabase db push
# o, alternativamente:
supabase migration up
```

Tras regenerar el esquema, conviene regenerar los tipos de TypeScript (`types/database.ts`) si se usa la CLI de Supabase.

## 3. Seed Data (Opcional - Solo Desarrollo)

Para poblar el entorno local con servicios base, usuarios de prueba y transacciones falsas:
```bash
supabase db reset
```
*Nota: Nunca ejecutes esto en producción, borra y regenera todas las tablas.*

## 4. Deploy de Edge Functions

```bash
supabase functions deploy dashboard-metrics
supabase functions deploy subscription-renewal
```

## 5. Configuración de la pasarela de pagos (Kushki)

### Sandbox (desarrollo)
1. Crear cuenta en https://console.kushkipagos.com
2. Obtener **Public Merchant ID** y **Private Merchant ID** del ambiente sandbox.
3. Configurar variables de entorno:
   - `NEXT_PUBLIC_KUSHKI_ENV=sandbox`
   - `NEXT_PUBLIC_KUSHKI_PUBLIC_MERCHANT_ID=<public-id>`
   - `KUSHKI_PRIVATE_MERCHANT_ID=<private-id>`
   - `KUSHKI_WEBHOOK_SECRET=<un-secreto-aleatorio>`
4. Probar con tarjetas de prueba de la [documentación de Kushki](https://docs.kushki.com).

### Producción
1. **Cuenta Merchant aprobada** (RUC + cuenta bancaria ecuatoriana), con los métodos **tarjeta**, **transferencia** y el producto **suscripciones** habilitados.
2. Solicitar activación de Transferencias y Suscripciones en la cuenta Kushki.
3. Cambiar `NEXT_PUBLIC_KUSHKI_ENV=production`.
4. Usar credenciales de producción (Public y Private Merchant IDs del ambiente de producción).
5. **Registrar webhook** en la consola de Kushki:
   - **URL:** `https://tu-dominio.com/api/webhooks/kushki`
   - **Header personalizado:** `x-webhook-secret` con el valor de `KUSHKI_WEBHOOK_SECRET`

Detalle completo en [`kushki-integration.md`](kushki-integration.md).

## 6. Configuración del cron de renovación

El cron diario necesita el `service_role_key` almacenado en Supabase Vault. Ejecutar una sola vez:
```sql
select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
```

## 7. Configuración de correos (Resend)

1. Crear cuenta en https://resend.com
2. Verificar dominio de envío (DNS: registros MX y TXT que Resend indica).
3. Generar una API key desde el dashboard de Resend.
4. Configurar variables de entorno:
   - `RESEND_API_KEY=re_...`
   - `EMAIL_FROM=RGL Estudio <noreply@tu-dominio.com>`

> **Nota:** En desarrollo, si `RESEND_API_KEY` no está configurada los correos se omiten silenciosamente sin romper los flujos de pago.

## 8. Deploy de Next.js (Vercel)

1. Conecta el repositorio de GitHub al dashboard de Vercel.
2. Asegúrate de que el Framework Preset detectado sea **Next.js**.
3. En "Environment Variables", añade todas las variables de la sección 1.
4. Haz clic en "Deploy".

## 9. Post-Deploy Checklist

- [ ] **RLS**: confirmar en Supabase (Authentication > Policies) que las políticas están habilitadas en `profiles`, `services`, `subscriptions`, `transactions` y `reservations`.
- [ ] **Edge Functions**: llamar a `dashboard-metrics` con un JWT de admin para confirmar HTTP 200.
- [ ] **Usuario admin inicial**: en una BD fresca, registrarse por la UI y luego: `UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'tu_email@ejemplo.com');`
- [ ] **Realtime**: en Supabase (Database > Realtime), confirmar que `reservations`, `transactions` y `subscriptions` tienen realtime habilitado.
- [ ] **CRON de renovación**: `SELECT * FROM cron.job WHERE jobname = 'daily-subscription-renewal';` y, al día siguiente, revisar `cron.job_run_details`. Confirmar que el secreto existe en Vault.
- [ ] **Secreto en Vault**: `SELECT name FROM vault.decrypted_secrets WHERE name = 'service_role_key';`
- [ ] **Webhook de Kushki**: registrado en la consola del merchant con el header `x-webhook-secret`. Verificar que llega un evento de prueba.
- [ ] **Variables de entorno**: verificar que las variables `KUSHKI_*` y `RESEND_*` estén configuradas en el entorno de producción.
- [ ] **Correos**: dominio verificado en Resend; hacer un pago de prueba y confirmar la llegada del correo.
- [ ] **Pago de prueba**: en sandbox, completar un cargo con tarjeta, una transferencia y una suscripción recurrente de punta a punta.
