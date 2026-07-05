import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProviderCard from './ProviderCard'
import type { Provider } from '../types'

const base: Provider = {
  id: 'revolut',
  name: 'Revolut',
  image: '/providers/revolut.svg',
  regions: ['uk'],
  fields: [{ label: 'Revtag', value: '@pedrochaps', copy: true }],
}

function renderCard(over: Partial<Provider> = {}) {
  return render(
    <ProviderCard
      provider={{ ...base, ...over }}
      region="uk"
      amount={null}
      currency="gbp"
      copyLabel="Copy"
      copiedLabel="Copied!"
    />,
  )
}

describe('ProviderCard', () => {
  it('renders the name and its fields', () => {
    renderCard()
    expect(screen.getByRole('heading', { name: 'Revolut' })).toBeInTheDocument()
    expect(screen.getByText('@pedrochaps')).toBeInTheDocument()
  })

  it('shows a currency badge per accepted currency', () => {
    renderCard({ currencies: ['eur', 'gbp'] })
    expect(screen.getByText('€ EUR')).toBeInTheDocument()
    expect(screen.getByText('£ GBP')).toBeInTheDocument()
  })

  it('shows no badges when currencies is absent', () => {
    renderCard()
    expect(screen.queryByText(/EUR|GBP/)).toBeNull()
  })

  it('falls back to a monogram when the logo fails to load', () => {
    renderCard()
    const img = screen.getByAltText('Revolut logo')
    fireEvent.error(img)
    expect(screen.queryByAltText('Revolut logo')).toBeNull()
    expect(screen.getByText('R')).toBeInTheDocument()
  })
})
