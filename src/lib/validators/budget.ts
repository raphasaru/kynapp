import { z } from 'zod'

export const budgetFormSchema = z.object({
  budgets: z.array(
    z.object({
      category: z.string(),
      monthly_budget: z.number().min(0),
    })
  ),
})

export type BudgetFormInput = z.infer<typeof budgetFormSchema>
