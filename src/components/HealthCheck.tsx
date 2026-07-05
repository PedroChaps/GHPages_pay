import { useCallback, useEffect, useState } from 'react'
import { checkSources, type SourceStatus } from '../fx'
import { loadConfig } from '../loadConfig'
import { CURRENCY_SYMBOL } from '../params'

function rateText(gbpEur: number): string {
  return `${CURRENCY_SYMBOL.gbp}1 = ${CURRENCY_SYMBOL.eur}${gbpEur.toFixed(4)}`
}

interface Row {
  key: string
  label: string
  url?: string
  priority: string
  ok: boolean
  gbpEur?: number
  date?: string
  active: boolean
  fallback?: boolean
}

export default function HealthCheck() {
  const [statuses, setStatuses] = useState<SourceStatus[] | null>(null)
  const [fallback, setFallback] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const run = useCallback(() => {
    setLoading(true)
    setStatuses(null)
    Promise.all([
      checkSources(),
      loadConfig()
        .then((c) => c.fx?.gbp_eur ?? null)
        .catch(() => null),
    ])
      .then(([s, f]) => {
        setStatuses(s)
        setFallback(f)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    run()
  }, [run])

  // Determine which source is actually in use (first ok, else the config rate).
  const activeIdx = statuses ? statuses.findIndex((s) => s.ok) : -1
  const usingFallback = statuses != null && activeIdx === -1

  const rows: Row[] = statuses
    ? [
        ...statuses.map((s, i) => ({
          key: s.label,
          label: s.label,
          url: s.url,
          priority: String(s.priority),
          ok: s.ok,
          gbpEur: s.gbpEur,
          date: s.date,
          active: i === activeIdx,
        })),
        {
          key: 'fallback',
          label: 'Fixed rate (config.yaml)',
          priority: '—',
          ok: fallback != null,
          gbpEur: fallback ?? undefined,
          active: usingFallback && fallback != null,
          fallback: true,
        },
      ]
    : []

  const active = rows.find((r) => r.active)

  return (
    <section className="glass flex flex-col gap-3 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
          FX healthcheck
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span>
          {loading ? 'Checking…' : 'Refresh'}
        </button>
      </div>

      {/* Current effective rate */}
      <div className="rounded-lg border border-white/10 bg-black/20 px-3.5 py-3">
        <div className="text-[0.68rem] font-medium uppercase tracking-wide text-slate-400">
          Currently in use
        </div>
        {loading || !statuses ? (
          <div className="mt-0.5 text-sm text-slate-400">Checking sources…</div>
        ) : active?.gbpEur != null ? (
          <div className="mt-0.5">
            <span className="text-lg font-bold text-white">{rateText(active.gbpEur)}</span>
            <span className="ml-2 text-sm text-slate-400">via {active.label}</span>
          </div>
        ) : (
          <div className="mt-0.5 text-sm text-amber-300">
            No source available — the page would show no rate.
          </div>
        )}
      </div>

      {/* Per-source breakdown, in priority order */}
      <ul className="flex flex-col divide-y divide-white/5">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center gap-3 py-2">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                loading || !statuses
                  ? 'bg-slate-500'
                  : r.ok
                    ? 'bg-emerald-400'
                    : 'bg-rose-500'
              }`}
            />
            <span className="w-5 shrink-0 text-center text-xs text-slate-500">{r.priority}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-sm text-slate-200">
                  {r.url ? (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-slate-600 underline-offset-2 hover:text-white"
                    >
                      {r.label}
                    </a>
                  ) : (
                    r.label
                  )}
                </span>
                {r.active && (
                  <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-emerald-300">
                    in use
                  </span>
                )}
                {r.fallback && (
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-slate-400">
                    backup
                  </span>
                )}
              </div>
              {r.date && <div className="text-xs text-slate-500">as of {r.date}</div>}
            </div>
            <span className="shrink-0 text-right font-mono text-sm">
              {loading || !statuses ? (
                <span className="text-slate-500">…</span>
              ) : r.gbpEur != null ? (
                <span className="text-slate-100">{rateText(r.gbpEur)}</span>
              ) : (
                <span className="text-rose-400">unreachable</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
