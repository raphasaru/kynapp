import { z } from 'zod'

export const cardSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  credit_limit: z.number().positive('Limite deve ser positivo'),
  due_day: z.number().int().min(1, 'Dia entre 1 e 31').max(31, 'Dia entre 1 e 31'),
  closing_day: z.number().int().min(1, 'Dia entre 1 e 31').max(31, 'Dia entre 1 e 31'),
  color: z.string().optional(),
})

export type CardInput = z.infer<typeof cardSchema>
