import { describe, it, expect } from 'vitest'
import { t, REGION_LABELS } from './i18n'

describe('t — localized text resolution', () => {
  it('returns a plain string as-is', () => {
    expect(t('Revtag', 'pt')).toBe('Revtag')
    expect(t('Revtag', 'uk')).toBe('Revtag')
  })
  it('picks the requested region from a map', () => {
    const v = { pt: 'Copiar', uk: 'Copy' }
    expect(t(v, 'pt')).toBe('Copiar')
    expect(t(v, 'uk')).toBe('Copy')
  })
  it('falls back to pt when the region key is missing', () => {
    expect(t({ pt: 'só-pt' }, 'uk')).toBe('só-pt')
  })
  it('falls back to uk when only uk is present', () => {
    expect(t({ uk: 'uk-only' }, 'pt')).toBe('uk-only')
  })
  it('returns empty string for undefined', () => {
    expect(t(undefined, 'pt')).toBe('')
  })
  it('returns empty string for an empty map', () => {
    expect(t({}, 'pt')).toBe('')
  })
  it('returns an empty plain string as-is', () => {
    expect(t('', 'uk')).toBe('')
  })
})

describe('REGION_LABELS', () => {
  it('has pt and uk labels with flags', () => {
    expect(REGION_LABELS.pt).toContain('Português')
    expect(REGION_LABELS.uk).toContain('English')
  })
})
