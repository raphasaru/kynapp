'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccounts } from '@/lib/queries/accounts'
import { useCards } from '@/lib/queries/cards'
import { AccountCard } from '@/components/accounts/account-card'
import { AccountForm } from '@/components/accounts/account-form'
import { CardDisplay } from '@/components/cards/card-display'
import { CardForm } from '@/components/cards/card-form'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { Database } from '@/types/database'

type BankAccount = Database['public']['Tables']['bank_accounts']['Row']
type CreditCard = Database['public']['Tables']['credit_cards']['Row']

// Decrypted account type for UI
type DecryptedAccount = Omit<BankAccount, 'balance'> & {
  balance: number
}

// Decrypted card type for UI
type DecryptedCard = Omit<CreditCard, 'credit_limit' | 'current_bill'> & {
  credit_limit: number
  current_bill: number
}

export default function CarteirasPage() {
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [cardFormOpen, setCardFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<DecryptedAccount | null>(null)
  const [editingCard, setEditingCard] = useState<DecryptedCard | null>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: cards, isLoading: cardsLoading } = useCards()

  // Get default account ID from profile (would need useProfile hook, for now just check first)
  const defaultAccountId = accounts?.[0]?.id

  const handleEditAccount = (account: BankAccount) => {
    // Convert encrypted string balance to number for form
    const decryptedAccount: DecryptedAccount = {
      ...account,
      balance: typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance as number,
    }
    setEditingAccount(decryptedAccount)
    setAccountFormOpen(true)
  }

  const handleEditCard = (card: CreditCard) => {
    // Convert encrypted string values to numbers for form
    const decryptedCard: DecryptedCard = {
      ...card,
      credit_limit: typeof card.credit_limit === 'string' ? parseFloat(card.credit_limit) : card.credit_limit as number,
      current_bill: typeof card.current_bill === 'string' ? parseFloat(card.current_bill) : card.current_bill as number,
    }
    setEditingCard(decryptedCard)
    setCardFormOpen(true)
  }

  const handleCloseAccountForm = () => {
    setAccountFormOpen(false)
    setEditingAccount(null)
  }

  const handleCloseCardForm = () => {
    setCardFormOpen(false)
    setEditingCard(null)
  }

  const handleAccountSuccess = () => {
    handleCloseAccountForm()
  }

  const handleCardSuccess = () => {
    handleCloseCardForm()
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
      </div>

      {/* Bank Accounts Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Contas bancárias</h2>
          <Button onClick={() => setAccountFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova conta
          </Button>
        </div>

        {accountsLoading ? (
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
                onEdit={handleEditAccount}
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

      {/* Credit Cards Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Cartões de crédito</h2>
          <Button onClick={() => setCardFormOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Novo cartão
          </Button>
        </div>

        {cardsLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-3">
            <Skeleton className="h-48 min-w-[300px]" />
            <Skeleton className="h-48 min-w-[300px]" />
          </div>
        ) : cards && cards.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:overflow-visible snap-x snap-mandatory">
            {cards.map((card) => (
              <CardDisplay
                key={card.id}
                card={card}
                onEdit={handleEditCard}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum cartão cadastrado</p>
            <p className="text-sm mt-1">Clique em "Novo cartão" para adicionar seu primeiro cartão</p>
          </div>
        )}
      </section>

      {/* Account Form Modal/Sheet */}
      <FormWrapper open={accountFormOpen} onOpenChange={handleCloseAccountForm}>
        <ContentWrapper className={isDesktop ? '' : 'max-h-[90vh] overflow-y-auto'}>
          <HeaderWrapper>
            <TitleWrapper>
              {editingAccount ? 'Editar conta' : 'Nova conta'}
            </TitleWrapper>
          </HeaderWrapper>
          <div className={isDesktop ? 'mt-4' : 'mt-6'}>
            <AccountForm
              account={editingAccount as any}
              onSuccess={handleAccountSuccess}
            />
          </div>
        </ContentWrapper>
      </FormWrapper>

      {/* Card Form Modal/Sheet */}
      <FormWrapper open={cardFormOpen} onOpenChange={handleCloseCardForm}>
        <ContentWrapper className={isDesktop ? '' : 'max-h-[90vh] overflow-y-auto'}>
          <HeaderWrapper>
            <TitleWrapper>
              {editingCard ? 'Editar cartão' : 'Novo cartão'}
            </TitleWrapper>
          </HeaderWrapper>
          <div className={isDesktop ? 'mt-4' : 'mt-6'}>
            <CardForm
              card={editingCard as any}
              onSuccess={handleCardSuccess}
            />
          </div>
        </ContentWrapper>
      </FormWrapper>
    </div>
  )
}
