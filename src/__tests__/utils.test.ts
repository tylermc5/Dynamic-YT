import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatNumber, formatDate, PLATFORM_FEE_RATE } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra')
  })
})

describe('formatCurrency', () => {
  it('formats whole dollars', () => {
    expect(formatCurrency(100)).toBe('$100.00')
  })

  it('formats cents', () => {
    expect(formatCurrency(9.5)).toBe('$9.50')
  })

  it('formats large amounts with commas', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567.00')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })
})

describe('formatNumber', () => {
  it('formats millions', () => {
    expect(formatNumber(1_500_000)).toBe('1.5M')
  })

  it('formats thousands', () => {
    expect(formatNumber(45_000)).toBe('45.0K')
  })

  it('formats small numbers as-is', () => {
    expect(formatNumber(999)).toBe('999')
  })

  it('formats exactly 1000 as K', () => {
    expect(formatNumber(1000)).toBe('1.0K')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2025-06-15'))
    expect(result).toContain('Jun')
    expect(result).toContain('2025')
  })

  it('formats an ISO string', () => {
    const result = formatDate('2025-01-01T00:00:00Z')
    expect(result).toContain('2025')
  })
})

describe('PLATFORM_FEE_RATE', () => {
  it('is 15%', () => {
    expect(PLATFORM_FEE_RATE).toBe(0.15)
  })
})
