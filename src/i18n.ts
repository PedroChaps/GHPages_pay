import type { LocalizedText, Region } from './types'

/**
 * Resolve a possibly-localized value to a plain string for the active region.
 * Accepts a plain string (returned as-is) or a `{ pt, uk }` map. Falls back to
 * the other region, then to an empty string, so a partially-translated config
 * never renders `undefined`.
 */
export function t(value: LocalizedText | undefined, region: Region): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[region] ?? value.pt ?? value.uk ?? ''
}

export const REGION_LABELS: Record<Region, string> = {
  pt: 'Português 🇵🇹',
  uk: 'English 🇬🇧',
}
