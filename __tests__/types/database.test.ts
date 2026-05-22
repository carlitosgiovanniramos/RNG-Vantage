import { describe, it, expectTypeOf } from 'vitest'
import type { Tables, UserRole, ServiceType, TransactionStatus } from '@/types/database'

describe('Database types', () => {
  it('Tables<profiles> tiene los campos esperados', () => {
    expectTypeOf<Tables<'profiles'>>().toHaveProperty('id')
    expectTypeOf<Tables<'profiles'>>().toHaveProperty('role')
  })

  it('UserRole acepta los valores definidos', () => {
    expectTypeOf<UserRole>().toEqualTypeOf<'admin' | 'client'>()
  })

  it('ServiceType acepta los valores definidos', () => {
    expectTypeOf<ServiceType>().toEqualTypeOf<'manejo_redes' | 'auditoria' | 'capacitacion' | 'otro'>()
  })

  it('TransactionStatus acepta los valores definidos', () => {
    expectTypeOf<TransactionStatus>().toEqualTypeOf<'pending' | 'completed' | 'failed' | 'refunded'>()
  })
})
