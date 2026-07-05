import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  /** Localized "Copy" label (also used for aria-label). */
  copyLabel: string
  /** Localized "Copied!" confirmation label. */
  copiedLabel: string
}

/** Robust clipboard write with a legacy fallback for non-secure contexts. */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'absolute'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}

export default function CopyButton({ value, copyLabel, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onClick = useCallback(async () => {
    const ok = await writeClipboard(value)
    if (!ok) return
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1500)
  }, [value])

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? copiedLabel : `${copyLabel}: ${value}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition
        ${
          copied
            ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
            : 'border-white/15 bg-white/5 text-slate-200 hover:border-white/30 hover:bg-white/10 active:scale-95'
        }`}
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <CopyIcon />
          <span>{copyLabel}</span>
        </>
      )}
    </button>
  )
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5 15V6a2 2 0 0 1 2-2h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
