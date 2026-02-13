'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useAccounts, useSetDefaultAccount } from '@/lib/queries/accounts'
import { useProfile } from '@/lib/queries/profile'
import { formatCurrency } from '@/lib/formatters/currency'
import { cn } from '@/lib/utils'

export function DefaultAccountStep() {
  const { data: accounts } = useAccounts()
  const { data: profile } = useProfile()
  const setDefault = useSetDefaultAccount()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Auto-select if only 1 account or if already has default
  useEffect(() => {
    if (profile?.default_bank_account_id) {
      setSelectedId(profile.default_bank_account_id)
    } else if (accounts?.length === 1) {
      const id = accounts[0].id
      setSelectedId(id)
      setDefault.mutate(id)
    }
  }, [accounts, profile?.default_bank_account_id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setDefault.mutate(id)
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-3xl font-bold">Conta padrão</h2>
        <p className="text-muted-foreground">
          Nenhuma conta adicionada. Você poderá definir depois.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Conta padrão</h2>
        <p className="text-muted-foreground">
          Escolha a conta que será usada como padrão nas transações
        </p>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => {
          const balance = typeof account.balance === 'string'
            ? parseFloat(account.balance)
            : account.balance
          const isSelected = selectedId === account.id

          return (
            <button
              key={account.id}
              onClick={() => handleSelect(account.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors text-left',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div
                className="w-3 h-10 rounded-full shrink-0"
                style={{ backgroundColor: account.color || '#10b77f' }}
              />
              <div className="flex-1 min-w-0">
                {account.bank_name && (
                  <p className="text-sm text-muted-foreground">{account.bank_name}</p>
                )}
                <p className="font-medium truncate">{account.name}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(balance)}</p>
              </div>
              {isSelected && (
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {accounts.length === 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Conta selecionada automaticamente
        </p>
      )}
    </div>
  )
}
