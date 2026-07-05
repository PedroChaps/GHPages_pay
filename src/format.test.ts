import { describe, it, expect } from 'vitest'
import { copyValue, displayValue } from './format'
import type { Field } from './types'

const f = (partial: Partial<Field>): Field => ({ label: 'x', value: '', ...partial })

describe('format — plain (no format)', () => {
  it('shows and copies the raw value', () => {
    const field = f({ value: '@pedrochaps' })
    expect(displayValue(field)).toBe('@pedrochaps')
    expect(copyValue(field)).toBe('@pedrochaps')
  })
})

describe('format — iban', () => {
  it('groups display in blocks of four', () => {
    const field = f({ value: 'PT50001800035272782302049', format: 'iban' })
    expect(displayValue(field)).toBe('PT50 0018 0003 5272 7823 0204 9')
  })
  it('copies without spaces, uppercased', () => {
    const field = f({ value: 'PT50001800035272782302049', format: 'iban' })
    expect(copyValue(field)).toBe('PT50001800035272782302049')
  })
  it('normalises input written with spaces / lowercase', () => {
    const field = f({ value: 'gb40 bukb 2025 9840 3726 17', format: 'iban' })
    expect(displayValue(field)).toBe('GB40 BUKB 2025 9840 3726 17')
    expect(copyValue(field)).toBe('GB40BUKB20259840372617')
  })
  it('has no trailing space when length is a multiple of four', () => {
    const field = f({ value: 'ABCD1234', format: 'iban' })
    expect(displayValue(field)).toBe('ABCD 1234')
  })
  it('handles a short value', () => {
    expect(displayValue(f({ value: 'AB', format: 'iban' }))).toBe('AB')
  })
})

describe('format — sortcode', () => {
  it('shows XX-XX-XX, copies digits only', () => {
    const field = f({ value: '202598', format: 'sortcode' })
    expect(displayValue(field)).toBe('20-25-98')
    expect(copyValue(field)).toBe('202598')
  })
  it('normalises input already written with dashes', () => {
    const field = f({ value: '20-25-98', format: 'sortcode' })
    expect(displayValue(field)).toBe('20-25-98')
    expect(copyValue(field)).toBe('202598')
  })
  it('strips any non-digits', () => {
    const field = f({ value: 'ab20cd25ef', format: 'sortcode' })
    expect(displayValue(field)).toBe('20-25')
    expect(copyValue(field)).toBe('2025')
  })
  it('handles empty', () => {
    expect(displayValue(f({ value: '', format: 'sortcode' }))).toBe('')
    expect(copyValue(f({ value: '', format: 'sortcode' }))).toBe('')
  })
})
