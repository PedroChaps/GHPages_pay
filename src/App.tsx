import { useEffect, useMemo, useState } from 'react'
import type { Config, Region } from './types'
import { parseParams } from './params'
import { fetchRate, type Rate } from './fx'
import { loadConfig } from './loadConfig'
import { t } from './i18n'
import Header from './components/Header'
import ProviderCard from './components/ProviderCard'

const GITHUB_URL = 'https://github.com/PedroChaps/GHPages_pay'

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function detectRegion(): Region {
  const nav = navigator.language?.toLowerCase() ?? ''
  return nav.startsWith('pt') ? 'pt' : 'uk'
}

export default function App() {
  const params = useMemo(() => parseParams(window.location.search), [])
  const [config, setConfig] = useState<Config | null>(null)
  const [error, setError] = useState(false)
  const [region, setRegion] = useState<Region>(params.region ?? detectRegion())
  const [liveRate, setLiveRate] = useState<Rate | null>(null)

  useEffect(() => {
    loadConfig()
      .then(setConfig)
      .catch((e) => {
        console.error('Error loading config:', e)
        setError(true)
      })
  }, [])

  // Fetch today's EUR/GBP rate from the live source chain (best-effort).
  useEffect(() => {
    fetchRate().then(setLiveRate)
  }, [])

  const providers = useMemo(
    () => config?.providers.filter((p) => p.regions.includes(region)) ?? [],
    [config, region],
  )

  // Live rate wins; otherwise fall back to the fixed rate in config, if any.
  const rate: Rate | null =
    liveRate ??
    (config?.fx?.gbp_eur
      ? {
          gbpEur: config.fx.gbp_eur,
          source: region === 'pt' ? 'taxa fixa (config)' : 'fixed rate (config)',
        }
      : null)

  return (
    <div className="min-h-screen">
      <div className="aurora" aria-hidden="true" />

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:py-16">
        {error ? (
          <p className="glass rounded-2xl p-6 text-center text-slate-300">
            Couldn't load payment options. Please try again later.
          </p>
        ) : !config ? (
          <p className="mt-10 text-center text-slate-400">Loading…</p>
        ) : (
          <>
            <Header
              ui={config.ui}
              region={region}
              onRegionChange={setRegion}
              amount={params.amount}
              currency={params.currency}
              display={params.display}
              rate={rate}
            />

            <section className="flex flex-col gap-4">
              {providers.length === 0 ? (
                <p className="text-center text-slate-400">
                  No payment methods available for this region yet.
                </p>
              ) : (
                providers.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    region={region}
                    amount={params.amount}
                    currency={params.currency}
                    copyLabel={t(config.ui.copy, region)}
                    copiedLabel={t(config.ui.copied, region)}
                  />
                ))
              )}
            </section>

            <footer className="flex flex-col items-center gap-2 pt-2 text-center text-sm text-slate-400">
              <div>{t(config.ui.footer, region)}</div>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-slate-300"
              >
                <GitHubIcon />
                {t(config.ui.openSource, region) ||
                  (region === 'pt' ? 'Código aberto no GitHub' : 'Open source on GitHub')}
              </a>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}
