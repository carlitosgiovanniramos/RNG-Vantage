import { describe, it, expect } from 'vitest'
import { createServiceSchema, updateServiceSchema } from '@/lib/validators/service'

describe('createServiceSchema', () => {
  it('acepta datos de servicio válidos', () => {
    const result = createServiceSchema.safeParse({
      name: 'Manejo de Redes Sociales',
      description: 'Gestión mensual',
      type: 'manejo_redes',
      price: 250.00,
      duration_months: 1,
      is_active: true,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza precio negativo', () => {
    const result = createServiceSchema.safeParse({
      name: 'Manejo de Redes',
      type: 'manejo_redes',
      price: -50,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El precio no puede ser negativo")
    }
  })

  it('rechaza tipo de servicio no válido', () => {
    const result = createServiceSchema.safeParse({
      name: 'Servicio Raro',
      type: 'magia',
      price: 100,
    })
    expect(result.success).toBe(false)
  })

  it('completa valores por defecto', () => {
    const result = createServiceSchema.safeParse({
      name: 'Auditoría',
      type: 'auditoria',
      price: 50,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.is_active).toBe(true)
      expect(result.data.duration_months).toBe(1)
    }
  })
})

describe('updateServiceSchema', () => {
  it('acepta un update parcial', () => {
    const result = updateServiceSchema.safeParse({
      price: 300,
    })
    expect(result.success).toBe(true)
  })
})
