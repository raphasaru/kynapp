/**
 * Date formatters for Brazilian Portuguese (pt-BR)
 */

import { format, parse, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Format date to pt-BR format
 * @param date - Date object or string (yyyy-MM-dd)
 * @param pattern - Format pattern (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  pattern: string = 'dd/MM/yyyy'
): string {
  const dateObj = typeof date === 'string'
    ? parse(date, 'yyyy-MM-dd', new Date())
    : date

  return format(dateObj, pattern, { locale: ptBR })
}

/**
 * Format month string to Portuguese month name
 * @param month - Month string in 'yyyy-MM' format
 * @returns Formatted month name (e.g., "Fevereiro 2026")
 */
export function formatMonthYear(month: string): string {
  const [year, monthNum] = month.split('-')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
    .replace(/^\w/, (c) => c.toUpperCase()) // Capitalize first letter
}

/**
 * Get first and last day of month
 * @param month - Month string in 'yyyy-MM' format
 * @returns Object with start and end dates in 'yyyy-MM-dd' format
 */
export function getMonthRange(month: string): { start: string; end: string } {
  const [year, monthNum] = month.split('-')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1)

  const start = format(startOfMonth(date), 'yyyy-MM-dd')
  const end = format(endOfMonth(date), 'yyyy-MM-dd')

  return { start, end }
}
