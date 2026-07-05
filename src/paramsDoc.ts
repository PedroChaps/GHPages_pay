// Single source of truth for the URL query parameters. Consumed by the /gen
// builder page (docs + form). Keep this in sync with parseParams() in params.ts.

export interface ParamOption {
  /** Empty string means "omit the param / use the default". */
  value: string
  label: string
}

export interface ParamDoc {
  /** Short (1-letter) query key. */
  key: string
  /** Verbose query key (alias). Both are accepted by the parser. */
  long: string
  label: string
  description: string
  kind: 'text' | 'enum'
  /** For enum params: selectable options (first is the default/omit). */
  options?: ParamOption[]
  /** For text params: input placeholder. */
  placeholder?: string
  /** Human-readable default, shown in the docs. */
  defaultLabel: string
}

export const PARAMS: ParamDoc[] = [
  {
    key: 'a',
    long: 'amount',
    label: 'Amount',
    description: 'The amount to request. Leave blank to show no amount.',
    kind: 'text',
    placeholder: 'e.g. 50 or 12.50',
    defaultLabel: 'none',
  },
  {
    key: 'c',
    long: 'currency',
    label: 'Owed in',
    description: 'The currency the amount is actually owed in (the headline figure).',
    kind: 'enum',
    options: [
      { value: '', label: 'Default (GBP)' },
      { value: 'gbp', label: '£ GBP' },
      { value: 'eur', label: '€ EUR' },
    ],
    defaultLabel: 'gbp',
  },
  {
    key: 'd',
    long: 'display',
    label: 'Also show in',
    description:
      'The default currency to also show the amount converted into, at today’s rate. If it equals "Owed in", no conversion is shown.',
    kind: 'enum',
    options: [
      { value: '', label: 'Default (GBP)' },
      { value: 'gbp', label: '£ GBP' },
      { value: 'eur', label: '€ EUR' },
    ],
    defaultLabel: 'gbp',
  },
  {
    key: 'r',
    long: 'region',
    label: 'Open tab',
    description: 'Which region tab to open on. Auto picks it from the visitor’s browser language.',
    kind: 'enum',
    options: [
      { value: '', label: 'Auto' },
      { value: 'pt', label: '🇵🇹 Português' },
      { value: 'uk', label: '🇬🇧 English' },
    ],
    defaultLabel: 'auto (browser language)',
  },
]
