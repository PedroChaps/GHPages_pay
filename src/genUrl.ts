import { PARAMS } from './paramsDoc'

export type Mode = 'short' | 'long'

/**
 * Build a payment URL from the generator's field values. Empty values (=
 * defaults) are omitted; `mode` selects the short (`a`) or long (`amount`)
 * query key. Parameters keep their documented order.
 */
export function buildGenUrl(
  values: Record<string, string>,
  mode: Mode,
  base: string,
): string {
  const q = new URLSearchParams()
  for (const p of PARAMS) {
    const raw = values[p.key]?.trim()
    if (raw) q.set(mode === 'long' ? p.long : p.key, raw)
  }
  const qs = q.toString()
  return base + (qs ? `?${qs}` : '')
}
