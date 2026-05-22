import { describe, it, expect } from 'vitest'
import { createSubscriptionSchema, updateSubscriptionSchema } from '@/lib/validators/subscription'

describe('createSubscriptionSchema', () => {
  it('acepta datos de suscripción válidos', () => {
    const result = createSubscriptionSchema.safeParse({
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      service_id: '123e4567-e89b-12d3-a456-426614174001',
      ends_at: new Date().toISOString(),
      auto_renew: true,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza user_id que no sea UUID', () => {
    const result = createSubscriptionSchema.safeParse({
      user_id: 'not-a-uuid',
      service_id: '123e4567-e89b-12d3-a456-426614174001',
      ends_at: new Date().toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('pone auto_renew a falso por defecto', () => {
    const result = createSubscriptionSchema.safeParse({
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      service_id: '123e4567-e89b-12d3-a456-426614174001',
      ends_at: new Date().toISOString(),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.auto_renew).toBe(false)
    }
  })
})

describe('updateSubscriptionSchema', () => {
  it('acepta un update con status', () => {
    const result = updateSubscriptionSchema.safeParse({
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza status inválido', () => {
    const result = updateSubscriptionSchema.safeParse({
      status: 'unknown_status',
    })
    expect(result.success).toBe(false)
  })
})
