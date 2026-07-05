import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from './Header'
import type { UiStrings } from '../types'
import type { Rate } from '../fx'

const ui: UiStrings = {
  title: 'Pay Pedro',
  subtitle: 'sub',
  amountDue: 'Amount due',
  copy: 'Copy',
  copied: 'Copied!',
  footer: 'Thanks',
}
const rate: Rate = {
  gbpEur: 1.1666,
  source: 'frankfurter.dev (ECB)',
  url: 'https://frankfurter.dev',
  date: '2026-07-03',
}

function renderHeader(over: Partial<Record<string, unknown>> = {}) {
  return render(
    <Header
      ui={ui}
      region="uk"
      onRegionChange={() => {}}
      amount={null}
      currency="gbp"
      display="gbp"
      rate={null}
      {...over}
    />,
  )
}

describe('Header — amount & conversion', () => {
  it('shows the amount, converted equivalent, and rate box when c differs from d', () => {
    renderHeader({ amount: '50', currency: 'eur', display: 'gbp', rate })
    expect(screen.getByText('€50')).toBeInTheDocument()
    expect(screen.getByText(/£42\.86/)).toBeInTheDocument() // 50 / 1.1666
    expect(screen.getByText('frankfurter.dev (ECB)')).toBeInTheDocument()
  })

  it('shows no conversion or rate box when c equals d', () => {
    renderHeader({ amount: '50', currency: 'gbp', display: 'gbp', rate })
    expect(screen.getByText('£50')).toBeInTheDocument()
    expect(screen.queryByText(/≈/)).toBeNull()
    expect(screen.queryByText('frankfurter.dev (ECB)')).toBeNull()
  })

  it('shows no amount box or rate box when there is no amount', () => {
    renderHeader({ amount: null, currency: 'eur', display: 'gbp', rate })
    expect(screen.queryByText('Amount due')).toBeNull()
    expect(screen.queryByText('frankfurter.dev (ECB)')).toBeNull()
  })

  it('shows the amount but no conversion when the rate is unavailable', () => {
    renderHeader({ amount: '50', currency: 'eur', display: 'gbp', rate: null })
    expect(screen.getByText('€50')).toBeInTheDocument()
    expect(screen.queryByText(/≈/)).toBeNull()
    expect(screen.queryByText('frankfurter.dev (ECB)')).toBeNull()
  })
})
