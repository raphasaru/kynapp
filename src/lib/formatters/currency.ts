/**
 * Currency formatter for Brazilian Real (BRL)
 * Outputs pt-BR format: R$ 1.234,56
 */

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }
  return formatter.format(value)
}
