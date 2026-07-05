import type { Field } from './types'

/**
 * The raw string copied to the clipboard. For `format: iban` we strip all
 * whitespace (and uppercase) so it pastes cleanly into apps that reject
 * spaced IBANs.
 */
export function copyValue(field: Field): string {
  if (field.format === 'iban') return field.value.replace(/\s+/g, '').toUpperCase()
  if (field.format === 'sortcode') return field.value.replace(/\D/g, '')
  return field.value
}

/**
 * The human-friendly string shown on the page. For `format: iban` we present
 * the value grouped in blocks of four for readability, regardless of how it
 * was written in the YAML.
 */
export function displayValue(field: Field): string {
  if (field.format === 'iban') {
    return field.value
      .replace(/\s+/g, '')
      .toUpperCase()
      .replace(/(.{4})/g, '$1 ')
      .trim()
  }
  if (field.format === 'sortcode') {
    // Digits only, grouped in pairs with dashes: "202598" -> "20-25-98".
    return field.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1-')
  }
  return field.value
}
