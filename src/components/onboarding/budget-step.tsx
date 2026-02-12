'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInputField } from '@/components/ui/currency-input'
import { categoryLabels } from '@/lib/constants/categories'
import { useUpsertBudgets } from '@/lib/queries/budgets'
import { toast } from 'sonner'

const EXPENSE_CATEGORIES = [
  'fixed_housing',
  'fixed_utilities',
  'fixed_subscriptions',
  'fixed_personal',
  'fixed_taxes',
  'variable_credit',
  'variable_food',
  'variable_transport',
  'variable_other',
]

export function BudgetStep() {
  const [budgets, setBudgets] = useState<Record<string, number>>(
    EXPENSE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
  )
  const upsertBudgets = useUpsertBudgets()

  const handleSave = async () => {
    // Filter out zero budgets
    const nonZeroBudgets = Object.entries(budgets)
      .filter(([_, amount]) => amount > 0)
      .map(([category, monthly_budget]) => ({ category, monthly_budget }))

    if (nonZeroBudgets.length === 0) {
      return // Skip if no budgets set
    }

    try {
      await upsertBudgets.mutateAsync(nonZeroBudgets)
      toast.success('Orçamentos salvos')
    } catch (error) {
      console.error('Failed to save budgets:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Defina seu orçamento</h2>
        <p className="text-muted-foreground">
          Quanto quer gastar por categoria este mês?
        </p>
      </div>

      <div className="space-y-4">
        {EXPENSE_CATEGORIES.map((category) => (
          <div key={category} className="space-y-2">
            <Label htmlFor={category}>{categoryLabels[category]}</Label>
            <CurrencyInputField
              id={category}
              value={budgets[category]}
              onValueChange={(value) => {
                setBudgets((prev) => ({ ...prev, [category]: value }))
              }}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        disabled={upsertBudgets.isPending}
        className="w-full"
        variant="outline"
      >
        {upsertBudgets.isPending ? 'Salvando...' : 'Salvar orçamentos'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Você pode pular esta etapa e definir orçamentos depois
      </p>
    </div>
  )
}
