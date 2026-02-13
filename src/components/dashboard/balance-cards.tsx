'use client'

import { Card } from '@/components/ui/card'
import { PrivateValue } from '@/components/ui/private-value'
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
      <Card className="p-3 md:p-6">
        <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Saldo do Mês</p>
        <p className={cn(
          'text-xl md:text-3xl font-bold font-heading truncate',
          balance >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          <PrivateValue>{formatCurrency(balance)}</PrivateValue>
        </p>
        <p className="text-xs text-muted-foreground mt-1 md:mt-2">
          {completedCount} realizadas · {plannedCount} planejadas
        </p>
      </Card>

      {/* Income card */}
      <Card className="p-3 md:p-6">
        <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Receitas</p>
        <p className="text-xl md:text-3xl font-bold font-heading text-green-600 truncate">
          <PrivateValue>{formatCurrency(totalIncome)}</PrivateValue>
        </p>
        <p className="text-xs text-muted-foreground mt-1 md:mt-2">
          {transactions.filter(t => t.type === 'income' && t.status === 'completed').length} realizadas · {transactions.filter(t => t.type === 'income' && t.status === 'planned').length} planejadas
        </p>
      </Card>

      {/* Expenses card */}
      <Card className="p-3 md:p-6">
        <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Despesas</p>
        <p className="text-xl md:text-3xl font-bold font-heading text-red-600 truncate">
          <PrivateValue>{formatCurrency(totalExpense)}</PrivateValue>
        </p>
        <p className="text-xs text-muted-foreground mt-1 md:mt-2">
          {transactions.filter(t => t.type === 'expense' && t.status === 'completed').length} realizadas · {transactions.filter(t => t.type === 'expense' && t.status === 'planned').length} planejadas
        </p>
      </Card>
    </div>
  )
}
