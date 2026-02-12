'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { budgetFormSchema, type BudgetFormInput } from '@/lib/validators/budget'
import { useUpsertBudgets, type DecryptedBudget } from '@/lib/queries/budgets'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CurrencyInputField } from '@/components/ui/currency-input'
import { useMediaQuery } from '@/hooks/use-media-query'
import { categoryLabels } from '@/lib/constants/categories'
import { useState } from 'react'

interface BudgetFormProps {
  budgets: DecryptedBudget[]
  trigger?: React.ReactNode
}

// Expense categories only (budget doesn't apply to income)
const expenseCategories = [
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

function BudgetFormContent({ budgets, onSuccess }: { budgets: DecryptedBudget[]; onSuccess: () => void }) {
  const mutation = useUpsertBudgets()

  const { register, control, handleSubmit, formState: { errors } } = useForm<BudgetFormInput>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      budgets: expenseCategories.map(category => {
        const existing = budgets.find(b => b.category === category)
        return {
          category,
          monthly_budget: existing?.monthly_budget || 0,
        }
      }),
    },
  })

  const onSubmit = async (data: BudgetFormInput) => {
    try {
      // Only send non-zero budgets
      const nonZeroBudgets = data.budgets.filter(b => b.monthly_budget > 0)
      await mutation.mutateAsync(nonZeroBudgets)
      onSuccess()
    } catch (error) {
      console.error('Budget error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {expenseCategories.map((category, index) => (
          <div key={category} className="space-y-2">
            <Label htmlFor={`budgets.${index}.monthly_budget`}>
              {categoryLabels[category]}
            </Label>
            <Controller
              control={control}
              name={`budgets.${index}.monthly_budget`}
              render={({ field }) => (
                <CurrencyInputField
                  id={`budgets.${index}.monthly_budget`}
                  value={field.value}
                  onValueChange={(floatValue) => {
                    field.onChange(floatValue)
                  }}
                  placeholder="R$ 0,00"
                />
              )}
            />
            {/* Hidden field for category */}
            <input
              type="hidden"
              {...register(`budgets.${index}.category`)}
            />
          </div>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Salvando...' : 'Salvar Orçamento'}
      </Button>
    </form>
  )
}

export function BudgetForm({ budgets, trigger }: BudgetFormProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const defaultTrigger = (
    <Button variant="default">Editar Limites</Button>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Orçamento</DialogTitle>
          </DialogHeader>
          <BudgetFormContent budgets={budgets} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Editar Orçamento</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <BudgetFormContent budgets={budgets} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
