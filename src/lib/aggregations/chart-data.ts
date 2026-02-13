/**
 * Chart data transformation utilities
 * Converts decrypted transactions into Recharts-compatible formats
 */

import type { DecryptedTransaction } from '@/lib/queries/transactions'
import { categoryLabels } from '@/lib/constants/categories'

// Chart colors for pie chart (9 categories)
export const CHART_COLORS = [
  '#10b77f', // primary green
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#2cedac', // light green
  '#64748b', // slate
]

/**
 * Aggregate expenses by category for pie chart
 * @param transactions - Decrypted transactions array
 * @returns Recharts-compatible data: [{ name: string, value: number, category: string }]
 */
export function getExpenseByCategoryData(
  transactions: DecryptedTransaction[]
): { name: string; value: number; category: string }[] {
  // Filter completed expenses only
  const expenses = transactions.filter(
    t => t.type === 'expense' && t.status === 'completed'
  )

  // Group by category and sum amounts
  const categoryTotals = new Map<string, number>()

  for (const transaction of expenses) {
    if (!transaction.category) continue
    const current = categoryTotals.get(transaction.category) || 0
    categoryTotals.set(transaction.category, current + transaction.amount)
  }

  // Convert to array format for Recharts
  const data = Array.from(categoryTotals.entries())
    .map(([category, value]) => ({
      name: categoryLabels[category] || category,
      value,
      category,
    }))
    .filter(item => item.value > 0) // Exclude zero spending
    .sort((a, b) => b.value - a.value) // Sort descending

  return data
}

/**
 * Aggregate income and expense by month for bar chart
 * @param transactionsByMonth - Map of month string to transactions array
 * @param months - Array of { month: string, label: string } for 6 months
 * @returns Recharts-compatible data: [{ month: string, income: number, expense: number }]
 */
export function getIncomeExpenseByMonth(
  transactionsByMonth: Map<string, DecryptedTransaction[]>,
  months: { month: string; label: string }[]
): { month: string; income: number; expense: number; balance: number }[] {
  return months.map(({ month, label }) => {
    const transactions = transactionsByMonth.get(month) || []

    // Sum completed income and expenses
    const completed = transactions.filter(t => t.status === 'completed')
    const income = completed
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = completed
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return { month: label, income, expense, balance: income - expense }
  })
}

/**
 * Calculate report summary for current month
 * @param transactions - All transactions for the month (including planned)
 * @returns { totalReceived, totalPaid, projectedBalance }
 */
export function getReportSummary(transactions: DecryptedTransaction[]): {
  totalReceived: number
  totalPaid: number
  projectedBalance: number
} {
  const completed = transactions.filter(t => t.status === 'completed')

  const totalReceived = completed
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalPaid = completed
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Projected balance = all income - all expenses (including planned)
  const allIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const allExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const projectedBalance = allIncome - allExpenses

  return { totalReceived, totalPaid, projectedBalance }
}

