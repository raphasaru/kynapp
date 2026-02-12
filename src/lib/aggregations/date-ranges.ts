/**
 * Date range utilities for reports and charts
 */

import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Re-export for convenience (single import point for aggregation code)
export { getMonthRange } from '@/lib/formatters/date'

/**
 * Get last 6 months array (from 5 months ago to current month)
 * @returns Array of { month: 'yyyy-MM', label: 'Mmm yy' }
 */
export function getLast6Months(): { month: string; label: string }[] {
  const months: { month: string; label: string }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i)
    const month = format(date, 'yyyy-MM')
    const label = format(date, 'MMM yy', { locale: ptBR })
    months.push({ month, label })
  }

  return months
}
