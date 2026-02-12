'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recurringSchema, type RecurringInput } from '@/lib/validators/recurring'
import { useCreateRecurring } from '@/lib/queries/recurring'
import { useAccounts } from '@/lib/queries/accounts'
import { useCards } from '@/lib/queries/cards'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AmountInput } from '@/components/transactions/amount-input'
import { CategorySelect } from '@/components/transactions/category-select'
import { format, addMonths } from 'date-fns'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

interface RecurringFormProps {
  onSuccess?: () => void
}

export function RecurringForm({ onSuccess }: RecurringFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

  const createMutation = useCreateRecurring()
  const { data: accounts } = useAccounts()
  const { data: cards } = useCards()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const isPending = createMutation.isPending

  // Default end_date to 12 months from today
  const defaultEndDate = format(addMonths(new Date(), 12), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecurringInput>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      day_of_month: 1,
      end_date: defaultEndDate,
    },
  })

  const watchedType = watch('type')
  const watchedPaymentMethod = watch('payment_method')

  // Update local state when form values change
  useEffect(() => {
    setType(watchedType)
  }, [watchedType])

  useEffect(() => {
    setPaymentMethod(watchedPaymentMethod || null)
  }, [watchedPaymentMethod])

  // Clear category when switching to income
  useEffect(() => {
    if (watchedType === 'income') {
      setValue('category', null)
    }
  }, [watchedType, setValue])

  // Clear credit_card_id when payment method is not credit
  useEffect(() => {
    if (watchedPaymentMethod !== 'credit') {
      setValue('credit_card_id', null)
    }
  }, [watchedPaymentMethod, setValue])

  // Clear bank_account_id when payment method is credit
  useEffect(() => {
    if (watchedPaymentMethod === 'credit') {
      setValue('bank_account_id', null)
    }
  }, [watchedPaymentMethod, setValue])

  const onSubmit = async (data: RecurringInput) => {
    try {
      await createMutation.mutateAsync(data)
      reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Recurring creation error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        full: error,
      })
      // Show user-friendly error
      alert(error?.message || 'Erro ao criar recorrência. Verifique o console.')
    }
  }

  // Prevent Enter key from submitting form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-4">
      {/* Type toggle */}
      <div className="space-y-2">
        <Label>Tipo</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === 'income' ? 'default' : 'outline'}
            className={type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={() => {
              setType('income')
              setValue('type', 'income')
            }}
          >
            Receita
          </Button>
          <Button
            type="button"
            variant={type === 'expense' ? 'default' : 'outline'}
            className={type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}
            onClick={() => {
              setType('expense')
              setValue('type', 'expense')
            }}
          >
            Despesa
          </Button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <AmountInput control={control} name="amount" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive">{String(errors.description.message)}</p>
        )}
      </div>

      {/* Category (only for expenses) */}
      {type === 'expense' && (
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <CategorySelect
            value={watch('category')}
            onChange={(value) => setValue('category', value as any)}
          />
          {errors.category && (
            <p className="text-sm text-destructive">{String(errors.category.message)}</p>
          )}
        </div>
      )}

      {/* Day of month */}
      <div className="space-y-2">
        <Label htmlFor="day_of_month">Dia do mês</Label>
        <Input
          id="day_of_month"
          type="number"
          min="1"
          max="31"
          {...register('day_of_month', { valueAsNumber: true })}
        />
        {errors.day_of_month && (
          <p className="text-sm text-destructive">{String(errors.day_of_month.message)}</p>
        )}
      </div>

      {/* End date */}
      <div className="space-y-2">
        <Label htmlFor="end_date">Data final</Label>
        <Input id="end_date" type="date" {...register('end_date')} />
        {errors.end_date && (
          <p className="text-sm text-destructive">{String(errors.end_date.message)}</p>
        )}
      </div>

      {/* Payment method */}
      <div className="space-y-2">
        <Label htmlFor="payment_method">Forma de pagamento</Label>
        <Select
          value={watch('payment_method') || undefined}
          onValueChange={(value) => setValue('payment_method', value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="debit">Débito</SelectItem>
            <SelectItem value="credit">Crédito</SelectItem>
            <SelectItem value="transfer">Transferência</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bank account (show when payment != credit) */}
      {paymentMethod !== 'credit' && (
        <div className="space-y-2">
          <Label htmlFor="bank_account_id">Conta bancária</Label>
          <Select
            value={watch('bank_account_id') || undefined}
            onValueChange={(value) => setValue('bank_account_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Credit card (show when payment == credit) */}
      {paymentMethod === 'credit' && (
        <div className="space-y-2">
          <Label htmlFor="credit_card_id">Cartão de crédito</Label>
          <Select
            value={watch('credit_card_id') || undefined}
            onValueChange={(value) => setValue('credit_card_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione cartão" />
            </SelectTrigger>
            <SelectContent>
              {cards?.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Criando...' : 'Criar Recorrente'}
      </Button>
    </form>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Recorrência</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Recorrência</SheetTitle>
        </SheetHeader>
        <div className="mt-4">{formContent}</div>
      </SheetContent>
    </Sheet>
  )
}
