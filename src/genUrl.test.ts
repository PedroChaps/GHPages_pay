import { describe, it, expect } from 'vitest'
import { buildGenUrl } from './genUrl'

const BASE = 'https://pay.chaparro.pt/'
const empty = { a: '', c: '', d: '', r: '' }

describe('buildGenUrl', () => {
  it('returns the bare base when all fields are empty', () => {
    expect(buildGenUrl(empty, 'short', BASE)).toBe(BASE)
  })
  it('builds short-form params', () => {
    expect(buildGenUrl({ ...empty, a: '50', c: 'eur' }, 'short', BASE)).toBe(
      `${BASE}?a=50&c=eur`,
    )
  })
  it('builds long-form params', () => {
    expect(buildGenUrl({ ...empty, a: '50', c: 'eur' }, 'long', BASE)).toBe(
      `${BASE}?amount=50&currency=eur`,
    )
  })
  it('omits empty (default) values', () => {
    expect(buildGenUrl({ ...empty, a: '50' }, 'short', BASE)).toBe(`${BASE}?a=50`)
  })
  it('preserves documented order (a before c before d before r)', () => {
    const url = buildGenUrl({ a: '5', c: 'eur', d: 'gbp', r: 'uk' }, 'short', BASE)
    expect(url).toBe(`${BASE}?a=5&c=eur&d=gbp&r=uk`)
  })
  it('trims whitespace in values', () => {
    expect(buildGenUrl({ ...empty, a: '  50 ' }, 'short', BASE)).toBe(`${BASE}?a=50`)
  })
})
