'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recurringSchema, type RecurringInput } from '@/lib/validators/recurring'
import { useCreateRecurring, useUpdateRecurring, type DecryptedRecurring } from '@/lib/queries/recurring'
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
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

interface RecurringFormProps {
  onSuccess?: () => void
  /** If provided, form opens in edit mode */
  editData?: DecryptedRecurring
  /** Controlled open state (for edit mode) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Custom trigger element (for edit mode) */
  trigger?: React.ReactNode
}

export function RecurringForm({ onSuccess, editData, open: controlledOpen, onOpenChange, trigger }: RecurringFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [type, setType] = useState<'income' | 'expense'>(editData?.type ?? 'expense')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(editData?.payment_method ?? null)

  const isEditMode = !!editData

  const createMutation = useCreateRecurring()
  const updateMutation = useUpdateRecurring()
  const { data: accounts } = useAccounts()
  const { data: cards } = useCards()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const isPending = createMutation.isPending || updateMutation.isPending

  // Default end_date to Dec 31 of current year
  const defaultEndDate = `${new Date().getFullYear()}-12-31`

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
    defaultValues: isEditMode
      ? {
          type: editData.type,
          amount: editData.amount,
          description: editData.description,
          day_of_month: editData.day_of_month,
          end_date: editData.end_date ?? defaultEndDate,
          category: editData.category as RecurringInput['category'] ?? null,
          payment_method: editData.payment_method as RecurringInput['payment_method'] ?? null,
          bank_account_id: editData.bank_account_id ?? null,
          credit_card_id: editData.credit_card_id ?? null,
        }
      : {
          type: 'expense',
          amount: 0,
          description: '',
          day_of_month: 1,
          end_date: defaultEndDate,
        },
  })

  const watchedType = watch('type')
  const watchedPaymentMethod = watch('payment_method')

  useEffect(() => {
    setType(watchedType)
  }, [watchedType])

  useEffect(() => {
    setPaymentMethod(watchedPaymentMethod || null)
  }, [watchedPaymentMethod])

  useEffect(() => {
    if (watchedType === 'income') {
      setValue('category', null)
    }
  }, [watchedType, setValue])

  useEffect(() => {
    if (watchedPaymentMethod !== 'credit') {
      setValue('credit_card_id', null)
    }
  }, [watchedPaymentMethod, setValue])

  useEffect(() => {
    if (watchedPaymentMethod === 'credit') {
      setValue('bank_account_id', null)
    }
  }, [watchedPaymentMethod, setValue])

  const onSubmit = async (data: RecurringInput) => {
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: editData.id, values: data })
      } else {
        await createMutation.mutateAsync(data)
        reset()
      }
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Recurring error:', error)
      alert(error?.message || `Erro ao ${isEditMode ? 'editar' : 'criar'} recorrência.`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') e.preventDefault()
  }

  const title = isEditMode ? 'Editar Recorrência' : 'Nova Recorrência'
  const submitLabel = isEditMode
    ? (isPending ? 'Salvando...' : 'Salvar')
    : (isPending ? 'Criando...' : 'Criar Recorrente')

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Novo
    </Button>
  )

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
        {submitLabel}
      </Button>
    </form>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger !== undefined ? (
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
        )}
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        <SheetTrigger asChild>{trigger}</SheetTrigger>
      ) : (
        <SheetTrigger asChild>{defaultTrigger}</SheetTrigger>
      )}
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">{formContent}</div>
      </SheetContent>
    </Sheet>
  )
}
