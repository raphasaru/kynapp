'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMonthSelector } from '@/hooks/use-month-selector'
import { useTransactions } from '@/lib/queries/transactions'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useOnboardingProgress } from '@/lib/queries/onboarding'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { BalanceCards } from '@/components/dashboard/balance-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { TransactionList } from '@/components/dashboard/transaction-list'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DecryptedTransaction } from '@/lib/queries/transactions'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const { data: onboardingProgress } = useOnboardingProgress()
  const { month, prevMonth, nextMonth, monthLabel } = useMonthSelector()
  const { data: transactions = [], isLoading } = useTransactions(month)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTransaction, setEditTransaction] = useState<DecryptedTransaction | undefined>()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (onboardingProgress && !onboardingProgress.onboarding_completed) {
      router.push('/app/onboarding')
    }
  }, [onboardingProgress, router])

  // Get user name
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserName(user.email.split('@')[0])
      }
    })
  }, [])

  const handleNewTransaction = () => {
    setEditTransaction(undefined)
    setIsFormOpen(true)
  }

  const handleEditTransaction = (transaction: DecryptedTransaction) => {
    setEditTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditTransaction(undefined)
  }

  const FormComponent = isDesktop ? Dialog : Sheet
  const ContentComponent = isDesktop ? DialogContent : SheetContent
  const HeaderComponent = isDesktop ? DialogHeader : SheetHeader
  const TitleComponent = isDesktop ? DialogTitle : SheetTitle

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-heading">
          Olá{userName ? `, ${userName}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">Seu resumo financeiro</p>
      </div>

      {/* Month selector */}
      <MonthSelector
        monthLabel={monthLabel}
        onPrev={prevMonth}
        onNext={nextMonth}
      />

      {/* Balance cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <BalanceCards transactions={transactions} />
      )}

      {/* Quick actions */}
      <QuickActions onNewTransaction={handleNewTransaction} />

      {/* Transaction list */}
      <div>
        <h2 className="text-xl font-semibold font-heading mb-4">Transações</h2>
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          onEdit={handleEditTransaction}
        />
      </div>

      {/* Transaction form (Sheet on mobile, Dialog on desktop) */}
      <FormComponent open={isFormOpen} onOpenChange={setIsFormOpen}>
        <ContentComponent className={isDesktop ? '' : 'h-[90vh]'}>
          <HeaderComponent>
            <TitleComponent>
              {editTransaction ? 'Editar transação' : 'Nova transação'}
            </TitleComponent>
          </HeaderComponent>
          <TransactionForm
            transaction={editTransaction}
            defaultMonth={month}
            onSuccess={handleFormSuccess}
          />
        </ContentComponent>
      </FormComponent>
    </div>
  )
}
