'use client'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters/currency'
import { cn } from '@/lib/utils'

interface BudgetSummaryProps {
  totalBudgeted: number
  totalSpent: number
  remaining: number
}

export function BudgetSummary({ totalBudgeted, totalSpent, remaining }: BudgetSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Budgeted */}
      <Card className="p-6">
        <p className="text-sm text-muted-foreground mb-2">Total Orçado</p>
        <p className="text-3xl font-bold font-heading">
          {formatCurrency(totalBudgeted)}
        </p>
      </Card>

      {/* Total Spent */}
      <Card className="p-6">
        <p className="text-sm text-muted-foreground mb-2">Total Gasto</p>
        <p className="text-3xl font-bold font-heading text-amber-600">
          {formatCurrency(totalSpent)}
        </p>
      </Card>

      {/* Remaining */}
      <Card className="p-6">
        <p className="text-sm text-muted-foreground mb-2">Restante</p>
        <p className={cn(
          'text-3xl font-bold font-heading',
          remaining >= 0 ? 'text-[#10b77f]' : 'text-red-600'
        )}>
          {formatCurrency(remaining)}
        </p>
      </Card>
    </div>
  )
}
