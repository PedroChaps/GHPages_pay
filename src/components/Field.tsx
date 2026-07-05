import type { Field as FieldType, Region } from '../types'
import type { Currency } from '../params'
import { buildLink } from '../params'
import { copyValue, displayValue } from '../format'
import { t } from '../i18n'
import CopyButton from './CopyButton'

interface Props {
  field: FieldType
  region: Region
  amount: string | null
  currency: Currency
  copyLabel: string
  copiedLabel: string
}

export default function Field({
  field,
  region,
  amount,
  currency,
  copyLabel,
  copiedLabel,
}: Props) {
  const label = t(field.label, region)
  const note = t(field.note, region)

  // Link fields render as a call-to-action button.
  if (field.type === 'link') {
    const href = buildLink(field.value, field.fillAmount, amount, currency)
    const cta = t(field.cta ?? field.label, region)
    return (
      <div className="animate-float-in">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={cta}
          className="group flex items-center justify-center gap-2 rounded-xl border border-sky-300/30 bg-sky-400/15 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:border-sky-300/60 hover:bg-sky-400/25 active:scale-[0.98]"
        >
          <span>{cta}</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        {note && <p className="mt-1.5 px-1 text-xs text-slate-400">{note}</p>}
      </div>
    )
  }

  // Text fields: label + value, with an optional copy button.
  return (
    <div className="animate-float-in rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
      <div className="text-[0.68rem] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="break-all font-mono text-[0.95rem] text-slate-100">
          {displayValue(field)}
        </span>
        {field.copy && (
          <CopyButton
            value={copyValue(field)}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
        )}
      </div>
      {note && <p className="mt-1.5 text-xs text-slate-400">{note}</p>}
    </div>
  )
}
