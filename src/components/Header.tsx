import type { Region, UiStrings } from '../types'
import type { Currency } from '../params'
import type { Rate } from '../fx'
import { formatAmount, formatMoney, CURRENCY_SYMBOL } from '../params'
import { convert } from '../fx'
import { t, REGION_LABELS } from '../i18n'

interface Props {
  ui: UiStrings
  region: Region
  onRegionChange: (r: Region) => void
  amount: string | null
  /** Currency the amount is owed in (?c=). */
  currency: Currency
  /** Default/preferred display currency (?d=). */
  display: Currency
  /** Live (or fallback) EUR/GBP rate, or null while loading / unavailable. */
  rate: Rate | null
}

const REGIONS: Region[] = ['pt', 'uk']

export default function Header({
  ui,
  region,
  onRegionChange,
  amount,
  currency,
  display,
  rate,
}: Props) {
  const rateLabel = t(ui.rateLabel, region) || (region === 'pt' ? 'Câmbio de hoje' : "Today's rate")

  // Converted equivalent, shown only when the amount's currency differs from
  // the preferred display currency.
  const converted =
    amount && rate && currency !== display
      ? convert(Number(amount), currency, display, rate.gbpEur)
      : null

  return (
    <header className="flex flex-col items-center gap-5 text-center">
      {/* Region toggle */}
      <div role="group" aria-label="Region" className="glass inline-flex gap-1 rounded-full p-1">
        {REGIONS.map((r) => {
          const active = r === region
          return (
            <button
              key={r}
              type="button"
              aria-pressed={active}
              onClick={() => onRegionChange(r)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              {REGION_LABELS[r]}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <img
          src="/pfp.jpg"
          alt={t(ui.title, region)}
          className="h-24 w-24 rounded-full object-cover shadow-lg ring-2 ring-white/25 ring-offset-2 ring-offset-transparent"
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t(ui.title, region)}
          </h1>
          <p className="text-base text-slate-300">{t(ui.subtitle, region)}</p>
        </div>
      </div>

      {/* Amount headline (only when ?a= is present) */}
      {amount && (
        <div className="glass rounded-2xl px-6 py-3" aria-live="polite">
          <div className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-400">
            {t(ui.amountDue, region)}
          </div>
          <div className="mt-0.5 text-3xl font-bold text-white">
            {formatAmount(amount, currency)}
          </div>
          {converted != null && (
            <div className="mt-1 text-2xl font-semibold text-sky-200">
              ≈ {formatMoney(converted, display)}
            </div>
          )}
        </div>
      )}

      {/* Today's exchange-rate box — only shown when a conversion is happening */}
      {converted != null && rate && (
        <div className="glass flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-xl px-4 py-2 text-xs text-slate-300">
          <span className="font-medium text-slate-200">
            {CURRENCY_SYMBOL.gbp}1 = {CURRENCY_SYMBOL.eur}
            {rate.gbpEur.toFixed(4)}
          </span>
          <span className="text-slate-500">·</span>
          <span>
            {rateLabel}
            {rate.date ? ` (${rate.date})` : ''}
          </span>
          <span className="text-slate-500">·</span>
          <span>
            {rate.url ? (
              <a
                href={rate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-500 underline-offset-2 hover:text-slate-100"
              >
                {rate.source}
              </a>
            ) : (
              rate.source
            )}
          </span>
        </div>
      )}
    </header>
  )
}
