import { describe, it, expect } from 'vitest'
import { createReservationSchema } from '@/lib/validators/reservation'

describe('createReservationSchema', () => {
  it('acepta reserva válida con fecha futura', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    
    const result = createReservationSchema.safeParse({
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      preferred_date: futureDate.toISOString(),
      data_consent: true,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza reserva con fecha pasada', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 1)
    
    const result = createReservationSchema.safeParse({
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      preferred_date: pastDate.toISOString(),
      data_consent: true,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza si no hay consentimiento', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    
    const result = createReservationSchema.safeParse({
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      preferred_date: futureDate.toISOString(),
      data_consent: false,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza email inválido', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    
    const result = createReservationSchema.safeParse({
      full_name: 'Juan Pérez',
      email: 'not-an-email',
      preferred_date: futureDate.toISOString(),
      data_consent: true,
    })
    expect(result.success).toBe(false)
  })
})
