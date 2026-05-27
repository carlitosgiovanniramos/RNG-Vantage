import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils cn', () => {
  it('combina clases simples', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('resuelve conflictos de tailwind', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('maneja condicionales falsy', () => {
    expect(cn('px-2', false && 'px-4', undefined, null, '')).toBe('px-2')
  })
})
