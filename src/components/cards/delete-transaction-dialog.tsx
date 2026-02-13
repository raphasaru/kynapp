'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/formatters/currency'
import { useDeleteCardTransaction } from '@/lib/queries/transactions'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

interface DeleteTransactionDialogProps {
  transaction: DecryptedTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: DeleteTransactionDialogProps) {
  const [mode, setMode] = useState<'single' | 'all'>('all')
  const deleteMutation = useDeleteCardTransaction()

  if (!transaction) return null

  const isInstallment = (transaction.total_installments ?? 0) > 1
  const totalInstallments = transaction.total_installments ?? 1
  const installmentNumber = transaction.installment_number ?? 1

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ transaction, mode: isInstallment ? mode : 'single' })
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isInstallment ? 'Excluir compra parcelada?' : 'Excluir compra?'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {transaction.description} — {formatCurrency(transaction.amount)}
              </p>

              {isInstallment && (
                <div className="space-y-2 pt-1">
                  <p className="text-sm">
                    Esta compra possui {totalInstallments} parcelas no total.
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteMode"
                        checked={mode === 'single'}
                        onChange={() => setMode('single')}
                        className="accent-primary"
                      />
                      <span className="text-sm">
                        Excluir apenas esta parcela ({installmentNumber}/{totalInstallments})
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteMode"
                        checked={mode === 'all'}
                        onChange={() => setMode('all')}
                        className="accent-primary"
                      />
                      <span className="text-sm">
                        Excluir todas as {totalInstallments} parcelas desta compra
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {!isInstallment && (
                <p className="text-sm">Esta ação não pode ser desfeita.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
