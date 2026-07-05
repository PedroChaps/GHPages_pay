import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CopyButton from './CopyButton'

describe('CopyButton', () => {
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
    writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  })

  it('copies the exact value and shows the copied label', async () => {
    render(<CopyButton value="PT50001800035272782302049" copyLabel="Copy" copiedLabel="Copied!" />)

    expect(screen.getByText('Copy')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button'))

    expect(await screen.findByText('Copied!')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith('PT50001800035272782302049')
  })

  it('exposes the value in the aria-label before copying', () => {
    render(<CopyButton value="202598" copyLabel="Copy" copiedLabel="Copied!" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy: 202598')
  })
})
