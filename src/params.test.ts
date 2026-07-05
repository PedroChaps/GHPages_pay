import { describe, it, expect } from 'vitest'
import {
  parseParams,
  buildLink,
  formatAmount,
  formatMoney,
  CURRENCY_SYMBOL,
} from './params'

describe('parseParams — amount cleaning', () => {
  const amt = (s: string) => parseParams(s).amount
  it('passes through plain integers', () => expect(amt('?a=50')).toBe('50'))
  it('trims trailing zeros', () => expect(amt('?a=50.00')).toBe('50'))
  it('keeps one decimal', () => expect(amt('?a=50.5')).toBe('50.5'))
  it('normalises comma decimals', () => expect(amt('?a=12,50')).toBe('12.5'))
  it('trims surrounding whitespace', () => expect(amt('?a=%2050%20')).toBe('50'))
  it('rounds to 2 decimals', () => expect(amt('?a=50.999')).toBe('51'))
  it('rounds tiny values down to 0', () => expect(amt('?a=0.001')).toBe('0'))
  it('keeps zero', () => expect(amt('?a=0')).toBe('0'))
  it('returns null for missing', () => expect(amt('?c=eur')).toBeNull())
  it('returns null for empty', () => expect(amt('?a=')).toBeNull())
  it('returns null for non-numeric', () => expect(amt('?a=abc')).toBeNull())
  it('strips stray letters/symbols', () => expect(amt('?a=%C2%A350')).toBe('50')) // "£50"
  it('strips a leading minus (no negatives)', () => expect(amt('?a=-5')).toBe('5'))
})

describe('parseParams — currencies & region', () => {
  it('defaults currency and display to gbp', () => {
    const p = parseParams('?a=1')
    expect(p.currency).toBe('gbp')
    expect(p.display).toBe('gbp')
  })
  it('reads c and d', () => {
    const p = parseParams('?c=eur&d=eur')
    expect(p.currency).toBe('eur')
    expect(p.display).toBe('eur')
  })
  it('is case-insensitive for currency', () => {
    expect(parseParams('?c=EUR').currency).toBe('eur')
    expect(parseParams('?c=GbP').currency).toBe('gbp')
  })
  it('falls back to gbp for an unknown currency', () => {
    expect(parseParams('?c=usd').currency).toBe('gbp')
  })
  it('reads region pt/uk case-insensitively, else null', () => {
    expect(parseParams('?r=pt').region).toBe('pt')
    expect(parseParams('?r=UK').region).toBe('uk')
    expect(parseParams('?r=xx').region).toBeNull()
    expect(parseParams('').region).toBeNull()
  })
})

describe('parseParams — long aliases & precedence', () => {
  it('accepts long names', () => {
    const p = parseParams('?amount=50&currency=eur&display=eur&region=pt')
    expect(p).toEqual({ amount: '50', currency: 'eur', display: 'eur', region: 'pt' })
  })
  it('short key wins over long when both present', () => {
    expect(parseParams('?a=10&amount=99').amount).toBe('10')
    expect(parseParams('?c=eur&currency=gbp').currency).toBe('eur')
  })
  it('empty short value falls through to long', () => {
    expect(parseParams('?a=&amount=50').amount).toBe('50')
    expect(parseParams('?c=&currency=eur').currency).toBe('eur')
  })
})

describe('buildLink — Revolut amount prefill (minor units)', () => {
  const base = 'https://revolut.me/pedrochaps'
  it('appends currency + amount in minor units (EUR)', () => {
    expect(buildLink(base, true, '50', 'eur')).toBe(`${base}?currency=EUR&amount=5000`)
  })
  it('appends currency + amount in minor units (GBP)', () => {
    expect(buildLink(base, true, '50', 'gbp')).toBe(`${base}?currency=GBP&amount=5000`)
  })
  it('handles decimals -> pence', () => {
    expect(buildLink(base, true, '12.5', 'gbp')).toBe(`${base}?currency=GBP&amount=1250`)
  })
  it('rounds float artefacts correctly', () => {
    expect(buildLink(base, true, '12.35', 'eur')).toBe(`${base}?currency=EUR&amount=1235`)
  })
  it('returns base unchanged when fillAmount is false', () => {
    expect(buildLink(base, false, '50', 'eur')).toBe(base)
  })
  it('returns base unchanged when amount is null', () => {
    expect(buildLink(base, true, null, 'eur')).toBe(base)
  })
  it('preserves existing query params on the base', () => {
    const out = buildLink('https://x.test/p?ref=abc', true, '50', 'eur')
    expect(out).toContain('ref=abc')
    expect(out).toContain('currency=EUR')
    expect(out).toContain('amount=5000')
  })
  it('returns base unchanged for an invalid URL', () => {
    expect(buildLink('not a url', true, '50', 'eur')).toBe('not a url')
  })
  it('handles amount 0', () => {
    expect(buildLink(base, true, '0', 'eur')).toBe(`${base}?currency=EUR&amount=0`)
  })
})

describe('formatAmount / formatMoney', () => {
  it('formatAmount prefixes the symbol', () => {
    expect(formatAmount('50', 'eur')).toBe('€50')
    expect(formatAmount('50', 'gbp')).toBe('£50')
  })
  it('formatMoney always shows 2 decimals', () => {
    expect(formatMoney(42.857, 'gbp')).toBe('£42.86')
    expect(formatMoney(50, 'eur')).toBe('€50.00')
    expect(formatMoney(0, 'gbp')).toBe('£0.00')
  })
  it('exposes both symbols', () => {
    expect(CURRENCY_SYMBOL).toEqual({ eur: '€', gbp: '£' })
  })
})
