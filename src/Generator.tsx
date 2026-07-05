import { useEffect, useMemo, useState } from 'react'
import { PARAMS } from './paramsDoc'
import CopyButton from './components/CopyButton'
import HealthCheck from './components/HealthCheck'

type Mode = 'short' | 'long'

/** The main app lives at the site root; generated links point there. */
function appBase(): string {
  return `${window.location.origin}/`
}

function buildUrl(values: Record<string, string>, mode: Mode): string {
  const q = new URLSearchParams()
  // Preserve documented order; omit empty (= default) values.
  for (const p of PARAMS) {
    const raw = values[p.key]?.trim()
    if (raw) q.set(mode === 'long' ? p.long : p.key, raw)
  }
  const qs = q.toString()
  return appBase() + (qs ? `?${qs}` : '')
}

export default function Generator() {
  const [mode, setMode] = useState<Mode>('short')
  const [values, setValues] = useState<Record<string, string>>({
    a: '',
    c: '',
    d: '',
    r: '',
  })

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }))

  const url = useMemo(() => buildUrl(values, mode), [values, mode])

  // Debounce the live preview so it doesn't reload on every keystroke.
  const [previewUrl, setPreviewUrl] = useState(url)
  useEffect(() => {
    const id = setTimeout(() => setPreviewUrl(url), 500)
    return () => clearTimeout(id)
  }, [url])

  return (
    <div className="min-h-screen">
      <div className="aurora" aria-hidden="true" />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:py-16">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Link generator
          </h1>
          <p className="mt-2 text-slate-300">
            Build a payment link for{' '}
            <span className="font-mono text-slate-200">pay.chaparro.pt</span> and copy it.
          </p>
        </header>

        {/* Builder form */}
        <section className="glass flex flex-col gap-5 rounded-2xl p-5">
          {PARAMS.map((p) => (
            <div key={p.key} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <label className="text-sm font-semibold text-white" htmlFor={`f-${p.key}`}>
                  {p.label}
                </label>
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-sky-200">
                  {p.key} · {p.long}
                </code>
              </div>
              <p className="text-xs text-slate-400">{p.description}</p>

              {p.kind === 'text' ? (
                <input
                  id={`f-${p.key}`}
                  type="text"
                  inputMode="decimal"
                  value={values[p.key]}
                  placeholder={p.placeholder}
                  onChange={(e) => set(p.key, e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-white/10"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {p.options!.map((o) => {
                    const active = values[p.key] === o.value
                    return (
                      <button
                        key={o.value || 'default'}
                        type="button"
                        aria-pressed={active}
                        onClick={() => set(p.key, o.value)}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                          active
                            ? 'border-sky-300/60 bg-sky-400/20 text-white'
                            : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        {o.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Result */}
        <section className="glass flex flex-col gap-3 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
              Your link
            </div>
            {/* Short / long parameter-style toggle */}
            <div role="group" aria-label="Parameter style" className="inline-flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {(['short', 'long'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                    mode === m ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {m === 'short' ? 'Short (a)' : 'Long (amount)'}
                </button>
              ))}
            </div>
          </div>

          <div className="break-all rounded-lg border border-white/10 bg-black/20 px-3.5 py-3 font-mono text-sm text-sky-100">
            {url}
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={url} copyLabel="Copy link" copiedLabel="Copied!" />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10"
            >
              Open ↗
            </a>
          </div>
        </section>

        {/* Live preview of the actual payment page */}
        <section className="glass flex flex-col gap-3 rounded-2xl p-5">
          <div className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
            Live preview
          </div>
          <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-inner">
            <iframe
              key={previewUrl}
              src={previewUrl}
              title="Live preview of the payment page"
              className="h-[640px] w-full border-0"
            />
          </div>
          <p className="text-center text-xs text-slate-500">
            Exactly what the payer sees — including the converted amount when you set a different
            “Also show in”.
          </p>
        </section>

        {/* FX source healthcheck */}
        <HealthCheck />

        {/* Reference */}
        <section className="glass flex flex-col gap-3 rounded-2xl p-5">
          <div className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
            Parameters
          </div>
          <ul className="flex flex-col gap-3">
            {PARAMS.map((p) => (
              <li key={p.key} className="flex gap-3">
                <code className="mt-0.5 h-fit whitespace-nowrap rounded bg-white/10 px-1.5 py-0.5 text-xs text-sky-200">
                  {p.key} · {p.long}
                </code>
                <div className="text-sm">
                  <span className="font-semibold text-white">{p.label}</span>
                  <span className="text-slate-400"> — default: {p.defaultLabel}</span>
                  <p className="text-slate-300">{p.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <footer className="text-center text-sm text-slate-500">
          <a
            href={appBase()}
            className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300"
          >
            ← Back to the payment page
          </a>
        </footer>
      </main>
    </div>
  )
}
