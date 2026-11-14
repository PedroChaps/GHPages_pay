import type { LinkFill, Region } from './types'

export type Currency = 'eur' | 'gbp'

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  eur: '€',
  gbp: '£',
}

function toCurrency(raw: string | null, fallback: Currency): Currency {
  const v = (raw ?? '').toLowerCase()
  return v === 'eur' ? 'eur' : v === 'gbp' ? 'gbp' : fallback
}

export interface UrlParams {
  /** Cleaned numeric amount as a string (e.g. "50" or "12.5"), or null. */
  amount: string | null
  /** Currency the amount is owed in (?c=), default GBP. */
  currency: Currency
  /** Default/preferred display currency to also show it in (?d=), default GBP. */
  display: Currency
  /** Explicit region from ?r=, if valid. */
  region: Region | null
}

function cleanAmount(raw: string | null): string | null {
  if (!raw) return null
  // Accept "50", "50.00", "50,5"; normalise comma to dot, drop stray chars.
  const normalised = raw.trim().replace(',', '.').replace(/[^0-9.]/g, '')
  if (!normalised) return null
  const n = Number(normalised)
  if (!Number.isFinite(n) || n < 0) return null
  // Keep up to 2 decimals, trim trailing zeros/points for clean display.
  return String(Number(n.toFixed(2)))
}

/**
 * Parse the URL params. Each accepts a short (1-letter) or verbose key:
 *   a|amount, c|currency (owed), d|display, r|region.
 * If both are present the short key wins.
 */
export function parseParams(search: string): UrlParams {
  const q = new URLSearchParams(search)
  // Short key wins, but an empty value (e.g. "?a=") falls through to the long key.
  const get = (short: string, long: string) => {
    const s = q.get(short)
    return s !== null && s !== '' ? s : q.get(long)
  }
  const rRaw = (get('r', 'region') ?? '').toLowerCase()
  const region: Region | null = rRaw === 'pt' ? 'pt' : rRaw === 'uk' ? 'uk' : null
  return {
    amount: cleanAmount(get('a', 'amount')),
    currency: toCurrency(get('c', 'currency'), 'gbp'),
    display: toCurrency(get('d', 'display'), 'gbp'),
    region,
  }
}

/** Format an amount string as typed, e.g. ("50","eur") -> "€50". */
export function formatAmount(amount: string, currency: Currency): string {
  return `${CURRENCY_SYMBOL[currency]}${amount}`
}

// Revolut's payment links (like the rest of Revolut's APIs) take the amount in
// MINOR units — e.g. amount=2000 means 20.00. So we multiply by 100.
const REVOLUT_AMOUNT_IN_MINOR_UNITS = true

/**
 * Build a payment link, optionally prefilling the amount in the format the
 * provider expects:
 *   revolut (or `true`) — https://revolut.me/<tag>?currency=EUR&amount=5000
 *   monzo               — https://monzo.me/<name>/50.00
 * Returns the base link unchanged when there's no amount / fill isn't requested.
 */
export function buildLink(
  base: string,
  fillAmount: LinkFill | undefined,
  amount: string | null,
  currency: Currency,
): string {
  if (!fillAmount || !amount) return base
  try {
    const url = new URL(base)
    const n = Number(amount)
    if (fillAmount === 'monzo') {
      // monzo.me takes the amount as a path segment in POUNDS, and carries no
      // currency of its own — it always settles in GBP. So an amount owed in
      // another currency is left off rather than silently relabelled as GBP.
      if (currency !== 'gbp') return base
      url.pathname = `${url.pathname.replace(/\/+$/, '')}/${n.toFixed(2)}`
      return url.toString()
    }
    const value = REVOLUT_AMOUNT_IN_MINOR_UNITS ? Math.round(n * 100) : n
    url.searchParams.set('currency', currency.toUpperCase())
    url.searchParams.set('amount', String(value))
    return url.toString()
  } catch {
    return base
  }
}

/** Format a computed number with 2 decimals, e.g. (43.104,"gbp") -> "£43.10". */
export function formatMoney(value: number, currency: Currency): string {
  return `${CURRENCY_SYMBOL[currency]}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
