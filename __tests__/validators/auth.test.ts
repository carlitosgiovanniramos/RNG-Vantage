import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema } from '@/lib/validators/auth'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza email inválido', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Ingresa un correo electrónico válido")
    }
  })

  it('rechaza password vacío', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("La contraseña es obligatoria")
    }
  })
})

describe('registerSchema', () => {
  it('acepta datos de registro válidos', () => {
    const result = registerSchema.safeParse({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      password: 'Password123!',
      confirm_password: 'Password123!',
      data_consent: true,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza nombres muy cortos', () => {
    const result = registerSchema.safeParse({
      first_name: 'J',
      last_name: 'Pérez',
      email: 'juan@example.com',
      password: 'Password123!',
      confirm_password: 'Password123!',
      data_consent: true,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza si las contraseñas no coinciden', () => {
    const result = registerSchema.safeParse({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      password: 'Password123!',
      confirm_password: 'Password1234!',
      data_consent: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Las contraseñas no coinciden")
    }
  })

  it('rechaza si no hay consentimiento de datos', () => {
    const result = registerSchema.safeParse({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      password: 'Password123!',
      confirm_password: 'Password123!',
      data_consent: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Debes aceptar la política de tratamiento de datos (LOPDP)")
    }
  })
  
  it('rechaza contraseña débil', () => {
    const result = registerSchema.safeParse({
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      password: 'weak',
      confirm_password: 'weak',
      data_consent: true,
    })
    expect(result.success).toBe(false)
  })
})
