'use client'

import { useState } from 'react'
import { AccountForm } from '@/components/accounts/account-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAccounts } from '@/lib/queries/accounts'
import { AccountCard } from '@/components/accounts/account-card'

export function AccountsStep() {
  const [showForm, setShowForm] = useState(false)
  const { data: accounts } = useAccounts()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Suas contas bancárias</h2>
        <p className="text-muted-foreground">
          Adicione pelo menos uma conta para começar
        </p>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-background">
          <AccountForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar conta
        </Button>
      )}

      {/* List of added accounts */}
      {accounts && accounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Contas adicionadas:</p>
          <div className="space-y-2">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}

      {accounts?.length === 0 && !showForm && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Nenhuma conta adicionada ainda. Você pode pular esta etapa e adicionar depois.
        </p>
      )}
    </div>
  )
}
