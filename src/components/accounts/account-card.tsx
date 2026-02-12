'use client'

import { useState } from 'react'
import { MoreVertical, Star, StarOff, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { useDeleteAccount, useSetDefaultAccount } from '@/lib/queries/accounts'
import type { Database } from '@/types/database'

type BankAccount = Database['public']['Tables']['bank_accounts']['Row']

interface AccountCardProps {
  account: BankAccount
  isDefault?: boolean
  onEdit?: (account: BankAccount) => void
}

const ACCOUNT_TYPE_LABELS = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  investment: 'Investimento',
}

export function AccountCard({ account, isDefault, onEdit }: AccountCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteAccount = useDeleteAccount()
  const setDefaultAccount = useSetDefaultAccount()

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync(account.id)
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const handleSetDefault = async () => {
    try {
      await setDefaultAccount.mutateAsync(account.id)
    } catch (error) {
      console.error('Failed to set default account:', error)
    }
  }

  // Parse balance (encrypted, so it's a number after decryption)
  const balance = typeof account.balance === 'string'
    ? parseFloat(account.balance)
    : account.balance

  return (
    <>
      <Card
        className="p-4 relative"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: account.color || '#10b77f',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {account.bank_name && (
                <p className="text-sm text-muted-foreground">{account.bank_name}</p>
              )}
              {isDefault && (
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              )}
            </div>
            <h3 className="font-medium truncate">{account.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {ACCOUNT_TYPE_LABELS[account.type as keyof typeof ACCOUNT_TYPE_LABELS] || account.type}
              </Badge>
            </div>
            <p className="text-2xl font-semibold mt-3">
              {formatCurrency(balance)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(account)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {!isDefault && (
                <DropdownMenuItem onClick={handleSetDefault}>
                  <Star className="mr-2 h-4 w-4" />
                  Definir como padrão
                </DropdownMenuItem>
              )}
              {isDefault && (
                <DropdownMenuItem disabled>
                  <StarOff className="mr-2 h-4 w-4" />
                  Conta padrão
                </DropdownMenuItem>
              )}
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
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta "{account.name}"? Esta ação não pode ser desfeita.
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
