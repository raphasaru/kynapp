'use client'

import { useMemo } from 'react'
import { useMonthSelector } from '@/hooks/use-month-selector'
import { useTransactions } from '@/lib/queries/transactions'
import { useBudgets } from '@/lib/queries/budgets'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { BudgetSummary } from '@/components/budgets/budget-summary'
import { BudgetCard } from '@/components/budgets/budget-card'
import { BudgetForm } from '@/components/budgets/budget-form'
import { calculateCategorySpending, calculateBudgetSummary } from '@/lib/aggregations/budget-calc'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function BudgetPage() {
  const { month, prevMonth, nextMonth, monthLabel } = useMonthSelector()
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(month)
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets()

  // Calculate spending per category and summary
  const budgetData = useMemo(() => {
    // Filter budgets that have non-zero limits
    const activeBudgets = budgets.filter(b => b.monthly_budget > 0 && b.category)

    // Calculate spending for each budget
    const budgetsWithSpending = activeBudgets.map(budget => ({
      category: budget.category!,
      limit: budget.monthly_budget,
      spent: calculateCategorySpending(transactions, budget.category!),
    }))

    // Calculate overall summary
    const summary = calculateBudgetSummary(transactions, budgets)

    return { budgetsWithSpending, summary }
  }, [transactions, budgets])

  const isLoading = transactionsLoading || budgetsLoading
  const hasBudgets = budgetData.budgetsWithSpending.length > 0

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Orçamento</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus limites de gastos</p>
        </div>
        {hasBudgets && (
          <BudgetForm budgets={budgets} />
        )}
      </div>

      {/* Month selector */}
      <MonthSelector
        monthLabel={monthLabel}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      {isLoading ? (
        // Loading state
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      ) : hasBudgets ? (
        // Has budgets - show summary + cards
        <div className="space-y-6">
          {/* Summary */}
          <BudgetSummary
            totalBudgeted={budgetData.summary.totalBudgeted}
            totalSpent={budgetData.summary.totalSpent}
            remaining={budgetData.summary.remaining}
          />

          {/* Budget cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetData.budgetsWithSpending.map(({ category, limit, spent }) => (
              <BudgetCard
                key={category}
                category={category}
                spent={spent}
                limit={limit}
              />
            ))}
          </div>
        </div>
      ) : (
        // Empty state - no budgets set
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum orçamento definido</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Defina seus limites de gastos por categoria para acompanhar melhor suas finanças.
          </p>
          <BudgetForm
            budgets={budgets}
            trigger={
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Definir Limites
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
