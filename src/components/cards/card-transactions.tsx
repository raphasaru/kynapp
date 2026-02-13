'use client'

import { useMemo, useState } from 'react'
import { Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatDate, formatMonthYear } from '@/lib/formatters/date'
import { usePayBill } from '@/lib/queries/bills'
import { DeleteTransactionDialog } from './delete-transaction-dialog'
import type { DecryptedTransaction } from '@/lib/queries/transactions'
import type { DecryptedBill } from '@/lib/queries/bills'

interface CardTransactionsProps {
  transactions: DecryptedTransaction[]
  bills: DecryptedBill[]
  cardId: string
}

type MonthGroup = {
  month: string
  label: string
  total: number
  bill: DecryptedBill | undefined
  transactions: DecryptedTransaction[]
}

export function CardTransactions({ transactions, bills, cardId }: CardTransactionsProps) {
  const [deletingTx, setDeletingTx] = useState<DecryptedTransaction | null>(null)
  const payBill = usePayBill()

  // Group transactions by month (yyyy-MM from due_date)
  const groups = useMemo(() => {
    const map = new Map<string, DecryptedTransaction[]>()

    for (const tx of transactions) {
      const month = tx.due_date.slice(0, 7) // 'yyyy-MM'
      if (!map.has(month)) map.set(month, [])
      map.get(month)!.push(tx)
    }

    // Convert to sorted array (newest first)
    const result: MonthGroup[] = []
    const sortedKeys = Array.from(map.keys()).sort()

    for (const month of sortedKeys) {
      const txs = map.get(month)!
      const total = txs.reduce((sum, tx) => sum + tx.amount, 0)
      const bill = bills.find(b => b.month === month)

      result.push({
        month,
        label: formatMonthYear(month),
        total,
        bill,
        transactions: txs.sort((a, b) => a.due_date.localeCompare(b.due_date)),
      })
    }

    return result
  }, [transactions, bills])

  const handlePayBill = async (bill: DecryptedBill) => {
    await payBill.mutateAsync({
      billId: bill.id,
      cardId,
      month: bill.month,
    })
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma compra neste cartão</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.month} className="space-y-2">
            {/* Month header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg capitalize">{group.label}</h3>
                {group.bill?.status === 'paid' ? (
                  <Badge variant="default" className="bg-green-600 text-xs">
                    Paga
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Aberta
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(group.total)}
                </span>
                {group.bill && group.bill.status === 'open' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePayBill(group.bill!)}
                    disabled={payBill.isPending}
                    className="text-xs"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {payBill.isPending ? 'Pagando...' : 'Pagar fatura'}
                  </Button>
                )}
              </div>
            </div>

            {/* Transaction list */}
            <div className="rounded-lg border divide-y">
              {group.transactions.map((tx) => {
                const isInstallment = (tx.total_installments ?? 0) > 1
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.due_date)}
                        {isInstallment && (
                          <span className="ml-1 text-primary">
                            {tx.installment_number}/{tx.total_installments}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {formatCurrency(tx.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => setDeletingTx(tx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <DeleteTransactionDialog
        transaction={deletingTx}
        open={!!deletingTx}
        onOpenChange={(open) => { if (!open) setDeletingTx(null) }}
      />
    </>
  )
}
