import { z } from 'zod'

export const accountSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  type: z.enum(['checking', 'savings', 'investment']),
  balance: z.number(),
  bank_name: z.string().optional(),
  color: z.string().optional(),
})

export type AccountInput = z.infer<typeof accountSchema>
