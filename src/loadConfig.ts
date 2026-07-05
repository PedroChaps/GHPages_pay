import yaml from 'js-yaml'
import type { Config } from './types'

// Fetched at runtime (like GHPages_travel) so editing config.yaml on `main`
// goes live without a rebuild. Falls back to the bundled copy on failure
// (local dev, or before the file exists on the default branch).
export const RAW_CONFIG_URL =
  'https://raw.githubusercontent.com/PedroChaps/GHPages_pay/main/public/config.yaml'

export async function loadConfig(): Promise<Config> {
  const bust = Date.now() // cache-buster: browsers aggressively cache raw files
  try {
    const res = await fetch(`${RAW_CONFIG_URL}?${bust}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`raw fetch failed: ${res.status}`)
    return yaml.load(await res.text()) as Config
  } catch (err) {
    console.warn('Falling back to bundled config.yaml:', err)
    const res = await fetch(`${import.meta.env.BASE_URL}config.yaml?${bust}`, {
      cache: 'no-store',
    })
    return yaml.load(await res.text()) as Config
  }
}
