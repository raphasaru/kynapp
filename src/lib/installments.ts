import { format, addMonths } from 'date-fns'

/**
 * Calculate due dates for each installment based on credit card billing cycle.
 *
 * Rules:
 * - If purchase day <= closing_day → enters current billing cycle, due_date = same month, due_day
 * - If purchase day > closing_day → enters next billing cycle, due_date = next month, due_day
 * - Each subsequent installment: +1 month
 *
 * Example: purchase 12/feb, closes day 1, due day 8
 * → 12 > 1 → enters cycle closing 1/mar → due 8/mar
 */
export function calculateInstallmentDueDates(
  purchaseDate: Date,
  closingDay: number,
  dueDay: number,
  count: number
): string[] {
  const purchaseDay = purchaseDate.getDate()
  const purchaseMonth = purchaseDate.getMonth()
  const purchaseYear = purchaseDate.getFullYear()

  // Determine closing month: same month if purchase <= closing, else next month
  const closingMonthOffset = purchaseDay <= closingDay ? 0 : 1

  const dates: string[] = []
  for (let i = 0; i < count; i++) {
    // Each installment's due date = closing month + i, on due_day
    const targetMonth = purchaseMonth + closingMonthOffset + i
    const date = new Date(purchaseYear, targetMonth, 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    date.setDate(Math.min(dueDay, lastDay))
    dates.push(format(date, 'yyyy-MM-dd'))
  }

  return dates
}

/**
 * Get the month (yyyy-MM) of the next bill to pay.
 *
 * Logic: if today <= dueDay → bill is due this month (still open/upcoming)
 *        if today > dueDay → bill for this month already passed, next is next month
 *
 * Example: due day 8, today Feb 12 → 12 > 8 → next bill = March (2025-03)
 * Example: due day 8, today Feb 5 → 5 <= 8 → next bill = February (2025-02)
 */
export function getNextBillMonth(dueDay: number): string {
  const today = new Date()
  const base = today.getDate() > dueDay ? addMonths(today, 1) : today
  return format(base, 'yyyy-MM')
}

/**
 * Split total amount into N installments.
 * Last installment absorbs rounding difference.
 */
export function splitInstallmentAmounts(total: number, count: number): number[] {
  const perInstallment = Math.floor((total * 100) / count) / 100
  const amounts: number[] = []
  let accumulated = 0

  for (let i = 0; i < count - 1; i++) {
    amounts.push(perInstallment)
    accumulated += perInstallment
  }

  // Last installment absorbs rounding diff
  const last = Math.round((total - accumulated) * 100) / 100
  amounts.push(last)

  return amounts
}
