'use client'

import { Home, Zap, CreditCard, User, FileText, UtensilsCrossed, Car, MoreHorizontal, Circle, CheckCircle2, QrCode, Banknote, ArrowLeftRight, Barcode, Trash2 } from 'lucide-react'
import { PrivateValue } from '@/components/ui/private-value'
import { formatCurrency } from '@/lib/formatters/currency'
import { formatDate } from '@/lib/formatters/date'
import { useToggleTransactionStatus, useDeleteTransaction } from '@/lib/queries/transactions'
import { cn } from '@/lib/utils'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

const categoryLabels: Record<string, string> = {
  fixed_housing: "Moradia",
  fixed_utilities: "Contas",
  fixed_subscriptions: "Assinaturas",
  fixed_personal: "Pessoal",
  fixed_taxes: "Impostos",
  variable_credit: "Cartão",
  variable_food: "Alimentação",
  variable_transport: "Transporte",
  variable_other: "Outros",
}

const categoryIcons: Record<string, string> = {
  fixed_housing: "Home",
  fixed_utilities: "Zap",
  fixed_subscriptions: "CreditCard",
  fixed_personal: "User",
  fixed_taxes: "FileText",
  variable_credit: "CreditCard",
  variable_food: "UtensilsCrossed",
  variable_transport: "Car",
  variable_other: "MoreHorizontal",
}

// Ícones por forma de pagamento (receitas ou quando não há categoria)
const paymentMethodIcons: Record<string, string> = {
  pix: "QrCode",
  cash: "Banknote",
  debit: "CreditCard",
  credit: "CreditCard",
  transfer: "ArrowLeftRight",
  boleto: "Barcode",
}

const iconMap = {
  Home,
  Zap,
  CreditCard,
  User,
  FileText,
  UtensilsCrossed,
  Car,
  MoreHorizontal,
  QrCode,
  Banknote,
  ArrowLeftRight,
  Barcode,
}

interface TransactionItemProps {
  transaction: DecryptedTransaction
  onEdit?: () => void
}

export function TransactionItem({ transaction, onEdit }: TransactionItemProps) {
  const toggleStatus = useToggleTransactionStatus()
  const deleteTransaction = useDeleteTransaction()

  const isIncome = transaction.type === 'income'
  const isCompleted = transaction.status === 'completed'

  const getIcon = () => {
    // Receitas ou despesas sem categoria: ícone da forma de pagamento
    const usePaymentIcon = isIncome || !transaction.category
    const paymentMethod = transaction.payment_method as keyof typeof paymentMethodIcons | null
    if (usePaymentIcon && paymentMethod && paymentMethodIcons[paymentMethod]) {
      const iconName = paymentMethodIcons[paymentMethod] as keyof typeof iconMap
      const Icon = iconMap[iconName]
      if (Icon) return <Icon className="h-4 w-4" />
    }

    // Despesas: ícone da categoria
    const iconName = categoryIcons[transaction.category || 'variable_other'] as keyof typeof iconMap
    const Icon = iconMap[iconName] || MoreHorizontal
    return <Icon className="h-4 w-4" />
  }

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleStatus.mutate({
      id: transaction.id,
      currentStatus: transaction.status,
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Excluir esta transação?')) {
      deleteTransaction.mutate(transaction.id)
    }
  }

  return (
    <div
      onClick={onEdit}
      className="group flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors overflow-hidden"
    >
      {/* Left: Icon + Status indicator */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleStatus}
          className="focus:outline-none focus:ring-2 focus:ring-ring rounded-full"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full',
            isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          )}
        >
          {getIcon()}
        </div>
      </div>

      {/* Center: Description + Category + Date */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{transaction.description}</p>
        <p className="text-sm text-muted-foreground">
          {isIncome ? 'Receita' : categoryLabels[transaction.category || 'variable_other']} · {formatDate(transaction.due_date)}
        </p>
      </div>

      {/* Right: Delete + Amount */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-full text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Excluir transação"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <span className={cn('font-semibold whitespace-nowrap text-right', isIncome ? 'text-green-600' : 'text-red-600')}>
          <PrivateValue>{isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}</PrivateValue>
        </span>
      </div>
    </div>
  )
}
