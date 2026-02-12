'use client'

import { useState } from 'react'
import { CardForm } from '@/components/cards/card-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCards } from '@/lib/queries/cards'
import { CardDisplay } from '@/components/cards/card-display'
import type { Database } from '@/types/database'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

export function CardsStep() {
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const { data: cards } = useCards()

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingCard(null)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Cartões de crédito</h2>
        <p className="text-muted-foreground">
          Adicione seus cartões para acompanhar faturas
        </p>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-background">
          <CardForm
            card={editingCard ? {
              id: editingCard.id,
              name: editingCard.name,
              credit_limit: typeof editingCard.credit_limit === 'string' ? parseFloat(editingCard.credit_limit) : editingCard.credit_limit,
              due_day: editingCard.due_day,
              closing_day: editingCard.closing_day,
              color: editingCard.color || '#8b5cf6',
            } : undefined}
            onSuccess={handleFormClose}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={handleFormClose}
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <Button
          onClick={() => { setEditingCard(null); setShowForm(true) }}
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar cartão
        </Button>
      )}

      {/* List of added cards */}
      {cards && cards.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Cartões adicionados:</p>
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <CardDisplay key={card.id} card={card} onEdit={handleEdit} />
            ))}
          </div>
        </div>
      )}

      {cards?.length === 0 && !showForm && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Nenhum cartão adicionado ainda. Você pode pular esta etapa e adicionar depois.
        </p>
      )}
    </div>
  )
}
