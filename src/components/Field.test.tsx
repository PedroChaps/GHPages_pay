import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Field from './Field'
import type { Field as FieldType } from '../types'

function renderField(field: FieldType, over: Partial<Record<string, unknown>> = {}) {
  return render(
    <Field
      field={field}
      region="uk"
      amount={null}
      currency="gbp"
      copyLabel="Copy"
      copiedLabel="Copied!"
      {...over}
    />,
  )
}

describe('Field — text', () => {
  it('renders an IBAN grouped for display but copyable without spaces', () => {
    renderField({ label: 'IBAN', value: 'GB40BUKB20259840372617', format: 'iban', copy: true })
    expect(screen.getByText('GB40 BUKB 2025 9840 3726 17')).toBeInTheDocument()
    // The copy button carries the stripped value.
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy: GB40BUKB20259840372617')
  })

  it('renders a sort code as XX-XX-XX, copies digits only', () => {
    renderField({ label: 'Sort code', value: '202598', format: 'sortcode', copy: true })
    expect(screen.getByText('20-25-98')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy: 202598')
  })

  it('shows a note when provided', () => {
    renderField({ label: 'Number', value: '+351', note: { pt: 'olá', uk: 'hello' } })
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('omits the copy button when copy is not set', () => {
    renderField({ label: 'Number', value: '+351' })
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('Field — link', () => {
  const linkField: FieldType = {
    label: 'Pay link',
    value: 'https://revolut.me/pedrochaps',
    type: 'link',
    cta: 'Pay with Revolut',
    fillAmount: true,
  }

  it('prefills amount + currency when an amount is present', () => {
    renderField(linkField, { amount: '50', currency: 'eur' })
    const link = screen.getByRole('link', { name: 'Pay with Revolut' })
    expect(link).toHaveAttribute('href', 'https://revolut.me/pedrochaps?currency=EUR&amount=5000')
  })

  it('uses the plain link when there is no amount', () => {
    renderField(linkField, { amount: null, currency: 'gbp' })
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://revolut.me/pedrochaps')
  })

  it('does not prefill when fillAmount is false', () => {
    renderField({ ...linkField, fillAmount: false }, { amount: '50', currency: 'eur' })
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://revolut.me/pedrochaps')
  })
})
