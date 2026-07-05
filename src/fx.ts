import type { Currency } from './params'

export interface Rate {
  /** EUR per 1 GBP (e.g. 1.1666). */
  gbpEur: number
  /** Human-readable source label, shown in the UI. */
  source: string
  /** Optional link to the source. */
  url?: string
  /** ISO date (YYYY-MM-DD) the rate is from, if the source provides it. */
  date?: string
}

interface Source {
  label: string
  site: string
  fetchUrl: string
  parse: (json: any) => { gbpEur: number; date?: string } | null
}

// Tried in order; the first that succeeds wins. All are free, keyless, and
// send permissive CORS headers (verified). The fixed config rate is the final
// fallback, handled in App (not here).
const SOURCES: Source[] = [
  {
    label: 'frankfurter.dev (ECB)',
    site: 'https://frankfurter.dev',
    fetchUrl: 'https://api.frankfurter.dev/v1/latest?base=GBP&symbols=EUR',
    parse: (j) =>
      j?.rates?.EUR ? { gbpEur: Number(j.rates.EUR), date: j.date } : null,
  },
  {
    label: 'exchangerate-api.com',
    site: 'https://www.exchangerate-api.com',
    fetchUrl: 'https://open.er-api.com/v6/latest/GBP',
    parse: (j) =>
      j?.rates?.EUR ? { gbpEur: Number(j.rates.EUR) } : null,
  },
  {
    label: 'currency-api (jsDelivr)',
    site: 'https://github.com/fawazahmed0/exchange-api',
    fetchUrl:
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/gbp.json',
    parse: (j) =>
      j?.gbp?.eur ? { gbpEur: Number(j.gbp.eur), date: j.date } : null,
  },
]

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

async function tryFetch(src: Source, timeoutMs = 4000): Promise<Rate | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(src.fetchUrl, { signal: ctrl.signal })
    if (!res.ok) return null
    const parsed = src.parse(await res.json())
    if (!parsed || !Number.isFinite(parsed.gbpEur) || parsed.gbpEur <= 0) return null
    return {
      gbpEur: parsed.gbpEur,
      source: src.label,
      url: src.site,
      date: parsed.date && ISO_DATE.test(parsed.date) ? parsed.date : undefined,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Try each live source in order; resolve to the first that works, else null. */
export async function fetchRate(): Promise<Rate | null> {
  for (const src of SOURCES) {
    const rate = await tryFetch(src)
    if (rate) return rate
  }
  return null
}

export interface SourceStatus {
  label: string
  url?: string
  /** 1-based priority (lower = tried first). */
  priority: number
  ok: boolean
  gbpEur?: number
  date?: string
}

/**
 * Query every live source in parallel and report each one's status — used by
 * the /gen healthcheck. The active source is the lowest-priority `ok` one; if
 * none are ok, the fixed config rate (handled by the caller) is used.
 */
export async function checkSources(): Promise<SourceStatus[]> {
  return Promise.all(
    SOURCES.map(async (src, i): Promise<SourceStatus> => {
      const rate = await tryFetch(src)
      return {
        label: src.label,
        url: src.site,
        priority: i + 1,
        ok: !!rate,
        gbpEur: rate?.gbpEur,
        date: rate?.date,
      }
    }),
  )
}

/** Convert `amount` between eur/gbp given EUR-per-GBP. */
export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  gbpEur: number,
): number {
  if (from === to) return amount
  if (from === 'gbp' && to === 'eur') return amount * gbpEur
  return amount / gbpEur // eur -> gbp
}
