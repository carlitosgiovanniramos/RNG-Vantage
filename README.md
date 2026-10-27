# RGL Estudio — Plataforma de Gestión

Aplicación Next.js para gestionar servicios, reservas, suscripciones y pagos de RGL Estudio.

## Desarrollo local

Requiere Node.js 22 y npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

En PowerShell, usa `Copy-Item .env.example .env.local`. Completa las variables de Supabase antes de iniciar. Para pagos necesitas también `SUPABASE_SERVICE_ROLE_KEY`, `PAYPHONE_TOKEN`, `PAYPHONE_STORE_ID` y una `NEXT_PUBLIC_SITE_URL` accesible desde el navegador que vuelve del portal de pago. Los secretos se configuran en el entorno, nunca en Git.

## Stack y módulos

Next.js 16, React 19, TypeScript, Supabase Auth/PostgreSQL con RLS, Tailwind CSS 4, Base UI, TanStack Query, Zod, Recharts, Sonner y Serwist.

- Catálogo y capacitación públicos con regeneración periódica (ISR).
- Reservas públicas y gestión administrativa de reservas.
- Checkout autenticado: tarjeta mediante PayPhone o transferencia bancaria manual con comprobante.
- Perfil con suscripciones e historial de pagos.
- Panel administrativo de servicios, clientes, suscripciones, transacciones, métricas y exportación CSV.
- Servicios: crear, editar, activar/desactivar desde la tabla y eliminar con confirmación.
- Correos transaccionales mediante Resend; PWA con Serwist en producción.

La tarjeta se ingresa en el portal de PayPhone. La aplicación prepara el pago y lo confirma en `/pago-respuesta`. Esta integración realiza pagos únicos; no cobra automáticamente tarjetas en las renovaciones. El cron de suscripciones puede extender servicios de manejo de redes y generar recibos pendientes según `auto_renew`.

## Estructura

- `app/(auth)`: autenticación.
- `app/(public)`: catálogo, reservas, checkout, respuesta de pago y perfil.
- `app/(dashboard)`: administración con comprobación de rol y usuario activo.
- `app/api/admin/export-transactions`: exportación CSV para administradores activos.
- `lib/payphone`: cliente servidor, configuración y tipos de pagos.
- `supabase/migrations`: historial SQL; conservar y aplicar en orden.
- `supabase/functions`: métricas y renovación de suscripciones.

## Comprobaciones

```bash
npm run lint
npx tsc --noEmit
npm run test:run
npm run build
```

`npm run test:e2e` ejecuta Playwright; requiere sus navegadores y un entorno de prueba configurado. La PWA se prueba con `npm run build` y `npm start`.

## Documentación

- [Pagos con PayPhone](docs/payphone-integration.md)
- [Despliegue y migraciones](docs/DEPLOY.md)
- [API y Server Actions](docs/API.md)
- [Arquitectura histórica](docs/ARQUITECTURA.md)
- [Edge Functions](docs/EDGE_FUNCTIONS.md)
- [Pruebas responsivas](docs/RESPONSIVE_TESTING.md)
- [Documentación automática de mayo de 2026](docs/archive/auto-2026-05/README.md): referencia histórica de los PR #25 y #36. Se conserva la versión más reciente de documentos compartidos y los documentos exclusivos de ambas ramas.
- [Integración anterior de Kushki](docs/archive/kushki-integration.md): histórica; sus rutas y configuración ya no forman parte del checkout actual.

## Flujo de trabajo

`main` es la rama permanente y contiene el trabajo consolidado. Para cambios futuros, crear ramas temporales, abrir PR hacia `main`, ejecutar las comprobaciones y eliminar las ramas al fusionar.

## Equipo

| Integrante | Rol principal |
|---|---|
| Juan López | Frontend, UX, PWA, catálogo y capacitación |
| Carlos Ramos | Suscripciones y métricas |
| Christian Hurtado | Layouts y checkout |
| Alejandro Andrade | Transacciones y consultas |
