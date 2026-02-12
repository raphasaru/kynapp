import type { DecryptedTransaction } from '@/lib/queries/transactions'
import type { DecryptedBudget } from '@/lib/queries/budgets'

/**
 * Calculate total spending for a specific category
 * Only includes completed expenses
 */
export function calculateCategorySpending(
  transactions: DecryptedTransaction[],
  category: string
): number {
  return transactions
    .filter(t =>
      t.type === 'expense' &&
      t.status === 'completed' &&
      t.category === category
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Get budget progress with color threshold
 * @returns percent (capped at 100 for display) and color (green/yellow/red)
 */
export function getBudgetProgress(
  spent: number,
  limit: number
): { percent: number; color: 'green' | 'yellow' | 'red'; actualPercent: number } {
  if (limit === 0) {
    return { percent: 0, color: 'green', actualPercent: 0 }
  }

  const actualPercent = (spent / limit) * 100
  const percent = Math.min(actualPercent, 100)

  let color: 'green' | 'yellow' | 'red'
  if (actualPercent < 75) {
    color = 'green'
  } else if (actualPercent < 90) {
    color = 'yellow'
  } else {
    color = 'red'
  }

  return { percent, color, actualPercent }
}

/**
 * Calculate total budgeted, spent, and remaining across all categories
 */
export function calculateBudgetSummary(
  transactions: DecryptedTransaction[],
  budgets: DecryptedBudget[]
): { totalBudgeted: number; totalSpent: number; remaining: number } {
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthly_budget, 0)

  const totalSpent = budgets.reduce((sum, b) => {
    if (!b.category) return sum
    const categorySpent = calculateCategorySpending(transactions, b.category)
    return sum + categorySpent
  }, 0)

  const remaining = totalBudgeted - totalSpent

  return { totalBudgeted, totalSpent, remaining }
}
