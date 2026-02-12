'use client'

import { RecurringItem } from './recurring-item'
import type { DecryptedRecurring } from '@/lib/queries/recurring'

interface RecurringListProps {
  templates: DecryptedRecurring[]
  onDelete: (id: string) => void
}

export function RecurringList({ templates, onDelete }: RecurringListProps) {
  const incomeTemplates = templates.filter(t => t.type === 'income')
  const expenseTemplates = templates.filter(t => t.type === 'expense')

  const hasIncome = incomeTemplates.length > 0
  const hasExpense = expenseTemplates.length > 0
  const isEmpty = !hasIncome && !hasExpense

  if (isEmpty) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Crie templates para automatizar lançamentos mensais</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Income templates */}
      {hasIncome && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Receitas Recorrentes</h2>
          <div className="space-y-2">
            {incomeTemplates.map(template => (
              <RecurringItem key={template.id} recurring={template} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Expense templates */}
      {hasExpense && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Despesas Recorrentes</h2>
          <div className="space-y-2">
            {expenseTemplates.map(template => (
              <RecurringItem key={template.id} recurring={template} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
