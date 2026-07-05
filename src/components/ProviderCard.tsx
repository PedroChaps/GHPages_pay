import { useState } from 'react'
import type { Provider, Region } from '../types'
import { CURRENCY_SYMBOL, type Currency } from '../params'
import Field from './Field'

interface Props {
  provider: Provider
  region: Region
  amount: string | null
  currency: Currency
  copyLabel: string
  copiedLabel: string
}

export default function ProviderCard({
  provider,
  region,
  amount,
  currency,
  copyLabel,
  copiedLabel,
}: Props) {
  const [imgOk, setImgOk] = useState(true)
  const accent = provider.accent ?? '#38bdf8'

  return (
    <article className="glass animate-float-in flex flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-16px_rgba(2,6,23,0.85)]">
      {/* Header: logo + name, tinted with the provider accent. */}
      <header
        className="flex items-center gap-3 border-b border-white/10 px-5 py-4"
        style={{
          background: `linear-gradient(120deg, ${accent}22, transparent 70%)`,
        }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/90 shadow-sm">
          {imgOk ? (
            <img
              src={provider.image}
              alt={`${provider.name} logo`}
              className="h-full w-full object-contain p-1.5"
              onError={() => setImgOk(false)}
            />
          ) : (
            <span
              className="text-lg font-bold"
              style={{ color: accent }}
              aria-hidden="true"
            >
              {provider.name.charAt(0)}
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-white">{provider.name}</h2>

        {provider.currencies && provider.currencies.length > 0 && (
          <div className="ml-auto flex shrink-0 gap-1">
            {provider.currencies.map((c) => (
              <span
                key={c}
                aria-label={`Accepts ${c.toUpperCase()}`}
                className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-xs font-medium text-slate-200"
              >
                {CURRENCY_SYMBOL[c]} {c.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Generic field list. */}
      <div className="flex flex-col gap-2.5 p-4">
        {provider.fields.map((field, i) => (
          <Field
            key={i}
            field={field}
            region={region}
            amount={amount}
            currency={currency}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
        ))}
      </div>
    </article>
  )
}
