# Documentacion tecnica de API y backend

Fecha: 2026-05-25

## 1) API REST disponible

### GET /api/transactions

**Descripcion funcional**
Lista transacciones desde Supabase ordenadas por created_at descendente.

**Request (JSON)**
No aplica (sin body).

**Response 200 (JSON)**
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid|null",
      "subscription_id": "uuid|null",
      "amount": 150,
      "payment_method": "cash|transfer|card|pending",
      "status": "pending|completed|failed|refunded",
      "notes": "string|null",
      "created_at": "ISO-8601",
      "updated_at": "ISO-8601"
    }
  ]
}

**Errores**
- 400: { "error": "message" }
- 500: { "error": "Internal server error" }

**Autenticacion**
No hay validacion explicita en el handler. Depende de cookies de sesion de Supabase y politicas RLS.

---

### POST /api/transactions

**Descripcion funcional**
Inserta una transaccion en Supabase y devuelve el registro creado.

**Request (JSON)**
Se inserta el body directamente en la tabla. Debe coincidir con el esquema de transactions.
{
  "user_id": "uuid (opcional)",
  "subscription_id": "uuid (opcional)",
  "amount": 150,
  "payment_method": "cash|transfer|card|pending (opcional)",
  "status": "pending|completed|failed|refunded (opcional)",
  "notes": "string (opcional)"
}

**Response 201 (JSON)**
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid|null",
      "subscription_id": "uuid|null",
      "amount": 150,
      "payment_method": "cash|transfer|card|pending",
      "status": "pending|completed|failed|refunded",
      "notes": "string|null",
      "created_at": "ISO-8601",
      "updated_at": "ISO-8601"
    }
  ]
}

**Errores**
- 400: { "error": "message" }
- 500: { "error": "Internal server error" }

**Autenticacion**
No hay validacion explicita en el handler. Depende de cookies de sesion de Supabase y politicas RLS.


## 2) Backend real (no REST tradicional)

La mayoria de operaciones usan Server Actions de Next.js ("use server") con Supabase SDK. El frontend invoca funciones del servidor directamente en lugar de consumir endpoints REST.

### Autenticacion
- login(formData)
- signup(formData)
Fuente: app/(auth)/actions.ts

### Clientes (admin)
- getClients()
- updateClient(id, { first_name, last_name, is_active })
- toggleClientActive(id, isActive)
Fuente: app/(dashboard)/clientes/actions.ts

### Servicios
- getServices()
- createService(formData)
- updateService(id, formData)
- deleteService(id)
Fuente: app/(dashboard)/servicios/actions.tsx

### Reservas
- createReservation(data)
- getReservations()
- updateReservationStatus(id, status)
Fuente: app/(public)/reservar/actions.ts, app/(dashboard)/reservas/actions.tsx

### Transacciones (admin)
- markTransactionAsCompleted(data)
- getTransactions()
- markTransactionAsFailed(transaction_id)
- cleanExpiredTransactions()
Fuente: app/(dashboard)/transacciones/actions.ts

### Suscripciones / Checkout
- createSubscription({ service_id, auto_renew })
Fuente: app/(public)/checkout/actions.ts

### Dashboard
- getDashboardMetrics() (invoca Edge Function dashboard-metrics; fallback a vistas SQL)
Fuente: app/(dashboard)/dashboard/actions.ts
