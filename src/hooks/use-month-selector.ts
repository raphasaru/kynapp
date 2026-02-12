'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { formatMonthYear } from '@/lib/formatters/date'

/**
 * Hook for month selection with URL state
 * @returns Object with month state and navigation methods
 */
export function useMonthSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current month from URL or default to current month
  const getCurrentMonth = (): string => {
    const urlMonth = searchParams.get('month')
    if (urlMonth && /^\d{4}-\d{2}$/.test(urlMonth)) {
      return urlMonth
    }
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  const month = getCurrentMonth()

  const setMonth = (newMonth: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonth)
    router.push(`${pathname}?${params.toString()}`)
  }

  const prevMonth = () => {
    const [year, monthNum] = month.split('-').map(Number)
    const date = new Date(year, monthNum - 1, 1)
    date.setMonth(date.getMonth() - 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    setMonth(`${newYear}-${newMonth}`)
  }

  const nextMonth = () => {
    const [year, monthNum] = month.split('-').map(Number)
    const date = new Date(year, monthNum - 1, 1)
    date.setMonth(date.getMonth() + 1)
    const newYear = date.getFullYear()
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    setMonth(`${newYear}-${newMonth}`)
  }

  const monthLabel = formatMonthYear(month)

  return {
    month,
    setMonth,
    prevMonth,
    nextMonth,
    monthLabel,
  }
}
