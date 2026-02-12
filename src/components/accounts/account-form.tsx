'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, type AccountInput } from '@/lib/validators/account'
import { useCreateAccount, useUpdateAccount } from '@/lib/queries/accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BankSelect } from './bank-select'
import { CurrencyInputField } from '@/components/ui/currency-input'
import { useEffect } from 'react'

// Extended AccountInput with id for editing
type AccountFormData = AccountInput & { id?: string }

interface AccountFormProps {
  account?: AccountFormData
  onSuccess?: () => void
}

const ACCOUNT_COLORS = [
  '#10b77f', // emerald (primary)
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ef4444', // red
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
]

export function AccountForm({ account, onSuccess }: AccountFormProps) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'checking',
      balance: account?.balance || 0,
      bank_name: account?.bank_name || '',
      color: account?.color || ACCOUNT_COLORS[0],
    },
  })

  const selectedType = watch('type')
  const selectedBankName = watch('bank_name')
  const selectedColor = watch('color')
  const balanceValue = watch('balance')

  // Set initial values for edit mode
  useEffect(() => {
    if (account) {
      setValue('name', account.name)
      setValue('type', account.type)
      setValue('balance', account.balance)
      setValue('bank_name', account.bank_name)
      setValue('color', account.color || ACCOUNT_COLORS[0])
    }
  }, [account, setValue])

  const onSubmit = async (data: AccountInput) => {
    try {
      if (account?.id) {
        await updateAccount.mutateAsync({ ...data, id: account.id })
      } else {
        await createAccount.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error: any) {
      // Error will be shown via mutation error state
      console.error('Failed to save account:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const mutation = account ? updateAccount : createAccount

  return (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da conta</Label>
        <Input
          id="name"
          placeholder="Ex: Conta Corrente Principal"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue('type', value as AccountInput['type'])}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Conta Corrente</SelectItem>
            <SelectItem value="savings">Poupança</SelectItem>
            <SelectItem value="investment">Investimento</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank_name">Banco</Label>
        <BankSelect
          value={selectedBankName}
          onChange={(value) => setValue('bank_name', value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="balance">Saldo atual</Label>
        <CurrencyInputField
          id="balance"
          value={balanceValue}
          onValueChange={(floatValue) => {
            setValue('balance', floatValue)
          }}
        />
        {errors.balance && (
          <p className="text-sm text-red-500">{errors.balance.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex gap-2">
          {ACCOUNT_COLORS.map((color) => (
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
            : account
            ? 'Atualizar'
            : 'Criar conta'}
        </Button>
      </div>
    </form>
  )
}
