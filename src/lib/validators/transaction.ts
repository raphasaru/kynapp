import { z } from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['income', 'expense']),
  category: z.enum([
    'fixed_housing',
    'fixed_utilities',
    'fixed_subscriptions',
    'fixed_personal',
    'fixed_taxes',
    'variable_credit',
    'variable_food',
    'variable_transport',
    'variable_other',
  ]).nullable().optional(),
  status: z.enum(['planned', 'completed']).optional().default('completed'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido'),
  payment_method: z.enum(['pix', 'cash', 'debit', 'credit', 'transfer', 'boleto']).nullable().optional(),
  bank_account_id: z.string().uuid().nullable().optional(),
  credit_card_id: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
