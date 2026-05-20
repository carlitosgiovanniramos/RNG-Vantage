# Guía de Despliegue (Deploy)

Este documento contiene las instrucciones necesarias para desplegar la base de datos, las Edge Functions y la aplicación Next.js en entornos de staging o producción.

## 1. Variables de Entorno Requeridas

Para el frontend y backend en Next.js (ej. Vercel):
```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...  # Solo requerido server-side
```

Para las Edge Functions en Supabase:
Las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` se inyectan automáticamente en el entorno de Deno en la nube, pero si tu función depende de la clave de servicio, debes asegurarte de enviarla si no lo hace automáticamente.

## 2. Migraciones de Base de Datos

Las migraciones de la base de datos están almacenadas en `supabase/migrations/` y deben ejecutarse en orden. Las 5 migraciones actuales son:
1. `20260325120000_init.sql` (Creación inicial de tablas y enums)
2. `20260402000000_split_full_name.sql`
3. `20260403010000_fix_profiles_admin_policy.sql`
4. `20260404000000_fix_security_and_business_logic.sql`
5. `20260520000000_create_views.sql` (Creación de vistas SQL optimizadas)

**Comando de Despliegue de DB:**
Para empujar las migraciones a un proyecto remoto de Supabase (producción):
```bash
supabase db push
```
Alternativamente:
```bash
supabase migration up
```

## 3. Seed Data (Opcional - Solo Desarrollo)

Para poblar el entorno de desarrollo local con servicios base, usuarios de prueba (un admin y un cliente), y transacciones falsas, ejecuta:
```bash
supabase db reset
```
*Nota: Nunca ejecutes esto en un entorno de producción ya que borrará y regenerará todas las tablas.*

## 4. Deploy de Edge Functions

Las Edge Functions deben ser desplegadas individualmente a la plataforma de Supabase.

```bash
# Desplegar la función de métricas del dashboard
supabase functions deploy dashboard-metrics

# Desplegar la función de renovación de suscripciones
supabase functions deploy subscription-renewal

# (Opcional) Desplegar el webhook placeholder
supabase functions deploy payment-webhook
```

Si tus Edge Functions requieren secretos (ej. integraciones externas en el webhook), utiliza:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=tu-secreto
```

## 5. Deploy de Next.js (Vercel)

1. Conecta el repositorio de GitHub al dashboard de Vercel.
2. Asegúrate de que el Framework Preset detectado sea **Next.js**.
3. En la sección "Environment Variables", añade `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Haz clic en "Deploy".

*Nota sobre Turbopack:* Si enfrentas problemas construyendo en Vercel por la coexistencia de configuraciones antiguas en Next.js 15, asegúrate de que Vercel ejecute el build estándar (`npx next build`).

## 6. Post-Deploy Checklist

Después de un despliegue exitoso en producción, verifica los siguientes puntos críticos:

- [ ] **Verificar RLS (Row Level Security)**: Confirma en el panel de Supabase (Authentication > Policies) que las políticas están habilitadas en las tablas `profiles`, `services`, `subscriptions`, `transactions` y `reservations`.
- [ ] **Verificar Edge Functions**: Llama a la URL de `dashboard-metrics` con un JWT de administrador para asegurar que retorna HTTP 200 y no hay errores de variables de entorno.
- [ ] **Crear usuario admin inicial**: Si es una base de datos fresca, regístrate a través de la UI y luego, directamente en Supabase SQL Editor, haz un `UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'tu_email@ejemplo.com');`.
- [ ] **Verificar Realtime**: En el dashboard de Supabase (Database > Replication o Realtime), asegúrate de que las tablas `reservations`, `transactions` y `subscriptions` tienen la replicación y realtime habilitados para que los sockets web envíen notificaciones al panel admin.
- [ ] **Verificar CRON de renovación**: Ejecutar `SELECT * FROM cron.job WHERE jobname = 'daily-subscription-renewal';` para confirmar que el job está programado. Revisar `cron.job_run_details` al día siguiente para validar que se ejecutó correctamente.
