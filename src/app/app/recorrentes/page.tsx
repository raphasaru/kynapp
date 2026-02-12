'use client'

import { useRecurringTemplates, useDeleteRecurring } from '@/lib/queries/recurring'
import { RecurringList } from '@/components/recurrents/recurring-list'
import { RecurringForm } from '@/components/recurrents/recurring-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from 'lucide-react'

export default function RecorrentesPage() {
  const { data: templates = [], isLoading } = useRecurringTemplates()
  const deleteMutation = useDeleteRecurring()

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      console.error('Delete recurring error:', error)
    }
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Recorrentes</h1>
          <p className="text-muted-foreground mt-1">
            Automatize lançamentos mensais
          </p>
        </div>
        <RecurringForm />
      </div>

      {isLoading ? (
        // Loading state
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : templates.length > 0 ? (
        // Has templates
        <RecurringList templates={templates} onDelete={handleDelete} />
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum recorrente cadastrado</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Crie templates para automatizar lançamentos mensais como aluguel, salário ou assinaturas.
          </p>
          <RecurringForm />
        </div>
      )}
    </div>
  )
}
