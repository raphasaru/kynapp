'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { categoryLabels, categoryIcons } from '@/lib/constants/categories'
import { formatCurrency } from '@/lib/formatters/currency'
import * as Icons from 'lucide-react'
import type { DecryptedRecurring } from '@/lib/queries/recurring'
import { Trash2 } from 'lucide-react'

interface RecurringItemProps {
  recurring: DecryptedRecurring
  onDelete: (id: string) => void
}

export function RecurringItem({ recurring, onDelete }: RecurringItemProps) {
  const iconName = recurring.category ? categoryIcons[recurring.category] : 'Calendar'
  const IconComponent = (Icons as any)[iconName] as React.ComponentType<{ className?: string }>

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
          <div className="flex-1">
            <p className="font-medium">{recurring.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                Dia {recurring.day_of_month}
              </Badge>
              <Badge
                variant={recurring.type === 'income' ? 'default' : 'destructive'}
                className={
                  recurring.type === 'income'
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
                }
              >
                {recurring.type === 'income' ? 'Receita' : 'Despesa'}
              </Badge>
            </div>
          </div>
          <p className="font-semibold text-lg">{formatCurrency(recurring.amount)}</p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir recorrente?</AlertDialogTitle>
              <AlertDialogDescription>
                Todas as transações futuras deste recorrente serão removidas. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(recurring.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  )
}
