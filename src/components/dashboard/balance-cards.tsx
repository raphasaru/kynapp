'use client'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters/currency'
import { cn } from '@/lib/utils'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

interface BalanceCardsProps {
  transactions: DecryptedTransaction[]
}

export function BalanceCards({ transactions }: BalanceCardsProps) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const plannedCount = transactions.filter(t => t.status === 'planned').length
  const completedCount = transactions.filter(t => t.status === 'completed').length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Balance card */}
      <Card className="p-6">
        <p className="text-sm text-muted-foreground mb-2">Saldo do Mês</p>
        <p className={cn(
          'text-3xl font-bold font-heading truncate',
          balance >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {formatCurrency(balance)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount} realizadas · {plannedCount} planejadas
        </p>
      </Card>

      {/* Income card */}
      <Card className="p-6">
        <p className="text-sm text-muted-foreground mb-2">Receitas</p>
        <p className="text-3xl font-bold font-heading text-green-600 truncate">
          {formatCurrency(totalIncome)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {transactions.filter(t => t.type === 'income' && t.status === 'completed').length} realizadas · {transactions.filter(t => t.type === 'income' && t.status === 'planned').length} planejadas
        </p>
      </Card>

      {/* Expenses card */}
      <Card className="p-6">
        <p className="text-sm text-muted-foreground mb-2">Despesas</p>
        <p className="text-3xl font-bold font-heading text-red-600 truncate">
          {formatCurrency(totalExpense)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {transactions.filter(t => t.type === 'expense' && t.status === 'completed').length} realizadas · {transactions.filter(t => t.type === 'expense' && t.status === 'planned').length} planejadas
        </p>
      </Card>
    </div>
  )
}
