import { describe, it, expect } from 'vitest'
import { createTransactionSchema, markTransactionAsPaidSchema } from '@/lib/validators/transaction'

describe('createTransactionSchema', () => {
  it('acepta datos válidos', () => {
    const result = createTransactionSchema.safeParse({
      amount: 100,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('pending')
      expect(result.data.payment_method).toBe('pending')
    }
  })

  it('rechaza monto negativo', () => {
    const result = createTransactionSchema.safeParse({
      amount: -10,
    })
    expect(result.success).toBe(false)
  })
})

describe('markTransactionAsPaidSchema', () => {
  it('acepta método de pago válido', () => {
    const result = markTransactionAsPaidSchema.safeParse({
      transaction_id: '123e4567-e89b-12d3-a456-426614174000',
      payment_method: 'transfer',
      notes: 'Pago recibido',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza uuid inválido para la transacción', () => {
    const result = markTransactionAsPaidSchema.safeParse({
      transaction_id: 'invalid-id',
      payment_method: 'cash',
    })
    expect(result.success).toBe(false)
  })
})
