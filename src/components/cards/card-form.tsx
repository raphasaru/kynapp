'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cardSchema, type CardInput } from '@/lib/validators/card'
import { useCreateCard, useUpdateCard } from '@/lib/queries/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CurrencyInput from 'react-currency-input-field'
import { useEffect } from 'react'

// Extended CardInput with id for editing
type CardFormData = CardInput & { id?: string }

interface CardFormProps {
  card?: CardFormData
  onSuccess?: () => void
}

const CARD_COLORS = [
  '#8b5cf6', // purple
  '#14b8a6', // teal
  '#f59e0b', // orange
  '#3b82f6', // blue
  '#ef4444', // red
  '#ec4899', // pink
  '#6b7280', // gray
  '#1f2937', // black
]

export function CardForm({ card, onSuccess }: CardFormProps) {
  const createCard = useCreateCard()
  const updateCard = useUpdateCard()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CardInput>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: card?.name || '',
      credit_limit: card?.credit_limit || 0,
      due_day: card?.due_day || 10,
      closing_day: card?.closing_day || 5,
      color: card?.color || CARD_COLORS[0],
    },
  })

  const selectedColor = watch('color')
  const creditLimitValue = watch('credit_limit')

  // Set initial values for edit mode
  useEffect(() => {
    if (card) {
      setValue('name', card.name)
      setValue('credit_limit', card.credit_limit)
      setValue('due_day', card.due_day)
      setValue('closing_day', card.closing_day)
      setValue('color', card.color || CARD_COLORS[0])
    }
  }, [card, setValue])

  const onSubmit = async (data: CardInput) => {
    try {
      if (card?.id) {
        await updateCard.mutateAsync({ ...data, id: card.id })
      } else {
        await createCard.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error: any) {
      console.error('Failed to save card:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const mutation = card ? updateCard : createCard

  return (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do cartão</Label>
        <Input
          id="name"
          placeholder="Ex: Nubank Mastercard"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="credit_limit">Limite de crédito</Label>
        <CurrencyInput
          id="credit_limit"
          placeholder="R$ 0,00"
          defaultValue={creditLimitValue}
          decimalsLimit={2}
          decimalSeparator=","
          groupSeparator="."
          prefix="R$ "
          onValueChange={(value) => {
            setValue('credit_limit', value ? parseFloat(value) : 0)
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.credit_limit && (
          <p className="text-sm text-red-500">{errors.credit_limit.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="closing_day">Dia do fechamento</Label>
          <Input
            id="closing_day"
            type="number"
            min="1"
            max="31"
            placeholder="5"
            {...register('closing_day', { valueAsNumber: true })}
          />
          {errors.closing_day && (
            <p className="text-sm text-red-500">{errors.closing_day.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_day">Dia do vencimento</Label>
          <Input
            id="due_day"
            type="number"
            min="1"
            max="31"
            placeholder="10"
            {...register('due_day', { valueAsNumber: true })}
          />
          {errors.due_day && (
            <p className="text-sm text-red-500">{errors.due_day.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex gap-2">
          {CARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColor === color
                  ? 'border-foreground scale-110'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Selecionar cor ${color}`}
            />
          ))}
        </div>
      </div>

      {mutation.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {mutation.error.message}
        </div>
      )}

      <div className="flex gap-2 justify-end pt-4">
        <Button type="submit" disabled={isSubmitting || mutation.isPending}>
          {isSubmitting || mutation.isPending
            ? 'Salvando...'
            : card
            ? 'Atualizar'
            : 'Criar cartão'}
        </Button>
      </div>
    </form>
  )
}
