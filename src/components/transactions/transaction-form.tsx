'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionInput } from '@/lib/validators/transaction'
import { useCreateTransaction, useUpdateTransaction } from '@/lib/queries/transactions'
import { useAccounts } from '@/lib/queries/accounts'
import { useCards } from '@/lib/queries/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AmountInput } from './amount-input'
import { CategorySelect } from './category-select'
import { formatCurrency } from '@/lib/formatters/currency'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

interface TransactionFormProps {
  transaction?: DecryptedTransaction
  onSuccess?: () => void
  defaultMonth?: string
  defaultAccountId?: string | null
}

export function TransactionForm({ transaction, onSuccess, defaultMonth, defaultAccountId }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(transaction?.payment_method || null)
  const [installmentCount, setInstallmentCount] = useState(1)
  const [isCreatingInstallments, setIsCreatingInstallments] = useState(false)

  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const { data: accounts } = useAccounts()
  const { data: cards } = useCards()

  const isEdit = !!transaction
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: transaction
      ? {
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category as any,
          status: transaction.status,
          due_date: transaction.due_date,
          payment_method: transaction.payment_method as any,
          bank_account_id: transaction.bank_account_id,
          credit_card_id: transaction.credit_card_id,
          notes: transaction.notes || '',
        }
      : {
          type: 'expense' as const,
          status: 'completed' as const,
          due_date: defaultMonth
            ? `${defaultMonth}-${String(new Date().getDate()).padStart(2, '0')}`
            : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
          amount: 0,
          description: '',
          bank_account_id: defaultAccountId || null,
        },
  })

  const watchedType = watch('type')
  const watchedStatus = watch('status')
  const watchedPaymentMethod = watch('payment_method')
  const watchedAmount = watch('amount')

  const showInstallments = !isEdit && watchedPaymentMethod === 'credit' && watchedType === 'expense'

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

  // Clear credit_card_id and installments when payment method is not credit
  useEffect(() => {
    if (watchedPaymentMethod !== 'credit') {
      setValue('credit_card_id', null)
      setInstallmentCount(1)
    }
  }, [watchedPaymentMethod, setValue])

  // Clear bank_account_id when payment method is credit
  useEffect(() => {
    if (watchedPaymentMethod === 'credit') {
      setValue('bank_account_id', null)
    }
  }, [watchedPaymentMethod, setValue])

  const onSubmit = async (data: any) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: transaction.id, ...data })
      } else {
        if (installmentCount > 1) {
          setIsCreatingInstallments(true)
        }
        await createMutation.mutateAsync({ ...data, installment_count: installmentCount } as TransactionInput)
      }
      onSuccess?.()
    } catch (error: any) {
      console.error('Transaction error:', error)
    } finally {
      setIsCreatingInstallments(false)
    }
  }

  // Prevent Enter key from submitting form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
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

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="due_date">Data</Label>
        <Input id="due_date" type="date" {...register('due_date')} />
        {errors.due_date && (
          <p className="text-sm text-destructive">{String(errors.due_date.message)}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={watchedStatus === 'planned' ? 'default' : 'outline'}
            onClick={() => setValue('status', 'planned')}
          >
            Planejada
          </Button>
          <Button
            type="button"
            variant={watchedStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setValue('status', 'completed')}
          >
            Realizada
          </Button>
        </div>
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

      {/* Credit card (show ONLY when payment = credit) */}
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

      {/* Installments (only for new credit card expenses) */}
      {showInstallments && (
        <div className="space-y-2">
          <Label>Parcelamento</Label>
          <Select
            value={String(installmentCount)}
            onValueChange={(value) => setInstallmentCount(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">À vista</SelectItem>
              {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {installmentCount > 1 && watchedAmount > 0 && (
            <p className="text-sm text-muted-foreground">
              {installmentCount}x de {formatCurrency(Math.floor((watchedAmount * 100) / installmentCount) / 100)}
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea id="notes" {...register('notes')} />
      </div>

      {/* Submit button */}
      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isPending || isCreatingInstallments}>
          {isCreatingInstallments
            ? `Gerando ${installmentCount} parcelas...`
            : isPending
            ? 'Salvando...'
            : 'Salvar'
          }
        </Button>
        {isCreatingInstallments && (
          <p className="text-sm text-center text-muted-foreground animate-pulse">
            Criando transações parceladas, aguarde...
          </p>
        )}
      </div>
    </form>
  )
}
