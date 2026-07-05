// Data model for the single source-of-truth config.yaml.
//
// The schema is intentionally *loose*: a provider is a logo + a list of
// `regions` it applies to + an arbitrary list of `fields`, each rendered
// generically. Any text value (labels, notes, CTAs, and the top-level UI
// strings) may be either a plain string (same in every language) or a
// `{ pt, uk }` map for per-language copy.

export type Region = 'pt' | 'uk'

/** A string that is either language-agnostic or split per region. */
export type LocalizedText = string | Partial<Record<Region, string>>

export interface Field {
  /** Row label, e.g. "IBAN" or { pt: "Número", uk: "Number" }. */
  label: LocalizedText
  /** The value shown (and copied / linked). */
  value: string
  /** `link` renders the value as a CTA button instead of plain text. */
  type?: 'text' | 'link'
  /**
   * Display formatting, normalising the shown value vs. the copied value:
   *   `iban`     — shown grouped in blocks of four, copied without spaces.
   *   `sortcode` — shown as XX-XX-XX, copied as digits only.
   */
  format?: 'iban' | 'sortcode'
  /** Show a copy-to-clipboard button for this value. */
  copy?: boolean
  /** For links: the button label. Falls back to `label` if omitted. */
  cta?: LocalizedText
  /**
   * For links: prefill the amount into the URL as `?currency=..&amount=..`
   * (Revolut format) when the page has an `?a=` amount. Uses the owed currency.
   */
  fillAmount?: boolean
  /** Optional muted helper line under the field. */
  note?: LocalizedText
}

export interface Provider {
  id: string
  name: string
  /** Path to a local logo under public/, e.g. "/providers/revolut.png". */
  image: string
  /** Regions this provider is offered in; controls which tab shows it. */
  regions: Region[]
  /** Currencies this provider can receive, shown as badges on the card. */
  currencies?: ('eur' | 'gbp')[]
  /** Optional hex accent used to tint the card header. */
  accent?: string
  fields: Field[]
}

export interface UiStrings {
  title: LocalizedText
  subtitle: LocalizedText
  amountDue: LocalizedText
  copy: LocalizedText
  copied: LocalizedText
  footer: LocalizedText
  /** Optional label for the exchange-rate box (default "Today's rate"). */
  rateLabel?: LocalizedText
  /** Optional label for the GitHub link (default "Open source on GitHub"). */
  openSource?: LocalizedText
}

export interface Config {
  ui: UiStrings
  providers: Provider[]
  /** Last-resort FX fallback used only if every live rate source fails. */
  fx?: {
    /** EUR per 1 GBP, e.g. 1.16. */
    gbp_eur?: number
  }
}
