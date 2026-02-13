'use client'

import { use } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCards } from '@/lib/queries/cards'
import { useCardTransactions } from '@/lib/queries/transactions'
import { useCardBills } from '@/lib/queries/bills'
import { getNextBillMonth } from '@/lib/installments'
import { formatCurrency } from '@/lib/formatters/currency'
import { CardTransactions } from '@/components/cards/card-transactions'

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ cardId: string }>
}) {
  const { cardId } = use(params)
  const router = useRouter()

  const { data: cards, isLoading: cardsLoading } = useCards()
  const { data: transactions, isLoading: txLoading } = useCardTransactions(cardId)
  const { data: bills, isLoading: billsLoading } = useCardBills(cardId)

  const card = cards?.find((c) => c.id === cardId)

  const creditLimit = card
    ? typeof card.credit_limit === 'string'
      ? parseFloat(card.credit_limit)
      : (card.credit_limit as number)
    : 0

  // Compute next bill amount from transactions (not from stored current_bill)
  const nextBillAmount = (() => {
    if (!card || !transactions) return 0
    const billMonth = getNextBillMonth(card.due_day)
    return transactions
      .filter((tx) => tx.due_date.startsWith(billMonth))
      .reduce((sum, tx) => sum + tx.amount, 0)
  })()

  const backgroundColor = card?.color || '#8b5cf6'

  const isLoading = cardsLoading || txLoading || billsLoading

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/app/carteira')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {cardsLoading ? <Skeleton className="h-8 w-40" /> : card?.name || 'Cartão'}
        </h1>
      </div>

      {/* Card summary */}
      {cardsLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : card ? (
        <div
          className="rounded-xl p-5 text-white"
          style={{
            background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`,
          }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs opacity-80">Fatura atual</p>
              <p className="text-2xl font-bold">{formatCurrency(nextBillAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Limite</p>
              <p className="text-lg font-semibold">{formatCurrency(creditLimit)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Disponível</p>
              <p className="text-lg font-semibold">{formatCurrency(creditLimit - nextBillAmount)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs opacity-90 mt-3">
            <span>Fecha: dia {card.closing_day}</span>
            <span>Vence: dia {card.due_day}</span>
          </div>
        </div>
      ) : null}

      {/* Transactions grouped by bill */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Compras</h2>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <CardTransactions
            transactions={transactions || []}
            bills={bills || []}
            cardId={cardId}
          />
        )}
      </section>
    </div>
  )
}
