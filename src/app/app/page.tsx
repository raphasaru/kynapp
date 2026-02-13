'use client'

import { useState } from 'react'
import { useMonthSelector } from '@/hooks/use-month-selector'
import { useTransactions } from '@/lib/queries/transactions'
import { useProfile } from '@/lib/queries/profile'
import { useMediaQuery } from '@/hooks/use-media-query'
import { MonthSelector } from '@/components/dashboard/month-selector'
import { BalanceCards } from '@/components/dashboard/balance-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { TransactionList } from '@/components/dashboard/transaction-list'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

export default function DashboardPage() {
  const { data: profile } = useProfile()
  const { month, prevMonth, nextMonth, monthLabel } = useMonthSelector()
  const { data: transactions = [], isLoading } = useTransactions(month)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTransaction, setEditTransaction] = useState<DecryptedTransaction | undefined>()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // Get first name from profile
  const firstName = profile?.full_name?.split(' ')[0] || ''

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

  const formTitle = editTransaction ? 'Editar transação' : 'Nova transação'

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header — hidden on mobile (shown in MobileHeader) */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold font-heading">
          Olá{firstName ? `, ${firstName}` : ''}!
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

      {/* Transaction form — Sheet (bottom) on mobile, Dialog on desktop */}
      {isDesktop ? (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formTitle}</DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={editTransaction}
              defaultMonth={month}
              defaultAccountId={profile?.default_bank_account_id}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>{formTitle}</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto flex-1 px-4 pb-4">
              <TransactionForm
                transaction={editTransaction}
                defaultMonth={month}
                defaultAccountId={profile?.default_bank_account_id}
                onSuccess={handleFormSuccess}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
