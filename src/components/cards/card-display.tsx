'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { formatCurrency } from '@/lib/formatters/currency'
import { useDeleteCard } from '@/lib/queries/cards'
import type { Database } from '@/types/database'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

interface CardDisplayProps {
  card: CreditCard
  onEdit?: (card: CreditCard) => void
  nextBillAmount?: number
}

export function CardDisplay({ card, onEdit, nextBillAmount }: CardDisplayProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteCard = useDeleteCard()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteCard.mutateAsync(card.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete card:', error)
    }
  }

  // Parse encrypted values (they're numbers after decryption)
  const creditLimit = typeof card.credit_limit === 'string'
    ? parseFloat(card.credit_limit)
    : card.credit_limit

  const billAmount = nextBillAmount ?? 0

  // Create gradient background
  const backgroundColor = card.color || '#8b5cf6'
  const gradientStyle = {
    background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`,
  }

  return (
    <>
      <div
        className="relative rounded-xl p-6 text-white shadow-lg min-w-[300px] flex-shrink-0 cursor-pointer transition-transform hover:scale-[1.02]"
        style={{
          aspectRatio: '1.6 / 1',
          ...gradientStyle,
        }}
        onClick={() => router.push(`/app/carteira/${card.id}`)}
      >
        {/* Card name */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-lg">{card.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(card)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Limit */}
        <div className="mb-3">
          <p className="text-xs opacity-80">Limite</p>
          <p className="text-xl font-semibold">{formatCurrency(creditLimit)}</p>
        </div>

        {/* Current bill + Available */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs opacity-80">Fatura atual</p>
            <p className="text-xl font-semibold">{formatCurrency(billAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Disponível</p>
            <p className="text-lg font-semibold">{formatCurrency(creditLimit - billAmount)}</p>
          </div>
        </div>

        {/* Bottom row - due and closing days */}
        <div className="flex items-center justify-between text-xs opacity-90 mt-auto">
          <span>Fecha: dia {card.closing_day}</span>
          <span>Vence: dia {card.due_day}</span>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartão "{card.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
