'use client'

import { getBudgetProgress } from '@/lib/aggregations/budget-calc'
import { formatCurrency } from '@/lib/formatters/currency'

interface BudgetProgressProps {
  spent: number
  limit: number
  showLabel?: boolean
}

export function BudgetProgress({ spent, limit, showLabel = true }: BudgetProgressProps) {
  const { percent, color, actualPercent } = getBudgetProgress(spent, limit)

  const colorClasses = {
    green: 'bg-[#10b77f]',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
  }

  const textColorClasses = {
    green: 'text-[#10b77f]',
    yellow: 'text-amber-500',
    red: 'text-red-500',
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(spent)} de {formatCurrency(limit)}
          </span>
          <span className={textColorClasses[color]}>
            {Math.round(actualPercent)}%
          </span>
        </div>
      )}
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
