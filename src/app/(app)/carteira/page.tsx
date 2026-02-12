'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/lib/queries/accounts'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { Database } from '@/types/database'

type BankAccount = Database['public']['Tables']['bank_accounts']['Row']

// Decrypted account type for UI
type DecryptedAccount = Omit<BankAccount, 'balance'> & {
  balance: number
}

export default function CarteirasPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<DecryptedAccount | null>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const { data: accounts, isLoading } = useAccounts()

  // Get default account ID from profile (would need useProfile hook, for now just check first)
  const defaultAccountId = accounts?.[0]?.id

  const handleEdit = (account: BankAccount) => {
    // Convert encrypted string balance to number for form
    const decryptedAccount: DecryptedAccount = {
      ...account,
      balance: typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance as number,
    }
    setEditingAccount(decryptedAccount)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setEditingAccount(null)
  }

  const handleSuccess = () => {
    handleClose()
  }

  const FormWrapper = isDesktop ? Dialog : Sheet
  const ContentWrapper = isDesktop ? DialogContent : SheetContent
  const HeaderWrapper = isDesktop ? DialogHeader : SheetHeader
  const TitleWrapper = isDesktop ? DialogTitle : SheetTitle

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Carteira</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova conta
        </Button>
      </div>

      {/* Bank Accounts Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Contas bancárias</h2>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isDefault={account.id === defaultAccountId}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma conta cadastrada</p>
            <p className="text-sm mt-1">Clique em "Nova conta" para adicionar sua primeira conta</p>
          </div>
        )}
      </section>

      {/* Credit Cards Section (placeholder) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cartões de crédito</h2>
        <div className="text-center py-12 text-muted-foreground">
          <p>Em breve</p>
        </div>
      </section>

      {/* Account Form Modal/Sheet */}
      <FormWrapper open={formOpen} onOpenChange={handleClose}>
        <ContentWrapper className={isDesktop ? '' : 'max-h-[90vh] overflow-y-auto'}>
          <HeaderWrapper>
            <TitleWrapper>
              {editingAccount ? 'Editar conta' : 'Nova conta'}
            </TitleWrapper>
          </HeaderWrapper>
          <div className={isDesktop ? 'mt-4' : 'mt-6'}>
            <AccountForm
              account={editingAccount as any}
              onSuccess={handleSuccess}
            />
          </div>
        </ContentWrapper>
      </FormWrapper>
    </div>
  )
}
