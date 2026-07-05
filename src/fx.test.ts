import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchRate, checkSources, convert } from './fx'

type Spec =
  | { kind: 'ok'; data: unknown }
  | { kind: 'err'; status: number }
  | { kind: 'reject' }

const ok = (data: unknown): Spec => ({ kind: 'ok', data })
const err = (status = 500): Spec => ({ kind: 'err', status })
const reject = (): Spec => ({ kind: 'reject' })

const FRANK = { rates: { EUR: 1.1666 }, date: '2026-07-03' }
const ERAPI = { rates: { EUR: 1.167 } }
const FAWAZ = { gbp: { eur: 1.168 }, date: '2026-07-04' }

function routeMock(routes: { frank?: Spec; er?: Spec; fawaz?: Spec }) {
  return vi.fn((url: string) => {
    const spec: Spec =
      (url.includes('frankfurter')
        ? routes.frank
        : url.includes('er-api')
          ? routes.er
          : url.includes('jsdelivr')
            ? routes.fawaz
            : undefined) ?? err(500)
    if (spec.kind === 'reject') return Promise.reject(new Error('network'))
    if (spec.kind === 'err')
      return Promise.resolve({ ok: false, status: spec.status, json: async () => ({}) })
    return Promise.resolve({ ok: true, json: async () => spec.data })
  })
}

afterEach(() => vi.unstubAllGlobals())

describe('convert', () => {
  it('returns amount unchanged for the same currency', () => {
    expect(convert(50, 'eur', 'eur', 1.1666)).toBe(50)
    expect(convert(50, 'gbp', 'gbp', 1.1666)).toBe(50)
  })
  it('gbp -> eur multiplies by the rate', () => {
    expect(convert(10, 'gbp', 'eur', 1.2)).toBeCloseTo(12)
  })
  it('eur -> gbp divides by the rate', () => {
    expect(convert(12, 'eur', 'gbp', 1.2)).toBeCloseTo(10)
  })
  it('handles zero', () => {
    expect(convert(0, 'gbp', 'eur', 1.2)).toBe(0)
  })
})

describe('fetchRate — fallback chain', () => {
  it('returns the first source when it succeeds', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: ok(FRANK), er: ok(ERAPI), fawaz: ok(FAWAZ) }))
    expect(await fetchRate()).toMatchObject({
      gbpEur: 1.1666,
      source: 'frankfurter.dev (ECB)',
      date: '2026-07-03',
    })
  })
  it('falls through when the first rejects', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: reject(), er: ok(ERAPI) }))
    expect(await fetchRate()).toMatchObject({ gbpEur: 1.167, source: 'exchangerate-api.com' })
  })
  it('falls through on a non-ok HTTP status', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: err(503), er: ok(ERAPI) }))
    expect((await fetchRate())?.source).toBe('exchangerate-api.com')
  })
  it('falls through on malformed JSON (missing rate)', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: ok({ rates: {} }), er: ok(ERAPI) }))
    expect((await fetchRate())?.gbpEur).toBe(1.167)
  })
  it('reaches the third source when the first two fail', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: err(), er: reject(), fawaz: ok(FAWAZ) }))
    expect((await fetchRate())?.source).toBe('currency-api (jsDelivr)')
  })
  it('returns null when every source fails', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: err(), er: err(), fawaz: err() }))
    expect(await fetchRate()).toBeNull()
  })
})

describe('checkSources — diagnostics', () => {
  it('reports every source in priority order', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: ok(FRANK), er: ok(ERAPI), fawaz: ok(FAWAZ) }))
    const s = await checkSources()
    expect(s.map((x) => x.priority)).toEqual([1, 2, 3])
    expect(s.map((x) => x.ok)).toEqual([true, true, true])
    expect(s[0]).toMatchObject({ label: 'frankfurter.dev (ECB)', gbpEur: 1.1666, date: '2026-07-03' })
    expect(s[2]).toMatchObject({ label: 'currency-api (jsDelivr)', gbpEur: 1.168 })
  })
  it('omits a date the source does not provide', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: ok(FRANK), er: ok(ERAPI), fawaz: ok(FAWAZ) }))
    const s = await checkSources()
    expect(s[1].date).toBeUndefined()
  })
  it('ignores a non-ISO date string', async () => {
    vi.stubGlobal(
      'fetch',
      routeMock({ frank: ok({ rates: { EUR: 1.1 }, date: '03/07/2026' }), er: ok(ERAPI), fawaz: ok(FAWAZ) }),
    )
    expect((await checkSources())[0].date).toBeUndefined()
  })
  it('marks failed sources ok:false with no rate', async () => {
    vi.stubGlobal('fetch', routeMock({ frank: err(), er: err(), fawaz: err() }))
    const s = await checkSources()
    expect(s.every((x) => x.ok === false && x.gbpEur === undefined)).toBe(true)
  })
})
