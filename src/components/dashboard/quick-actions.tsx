'use client'

import { Plus, PiggyBank, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface QuickActionsProps {
  onNewTransaction: () => void
}

export function QuickActions({ onNewTransaction }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <Button
        onClick={onNewTransaction}
        className="flex items-center gap-2 whitespace-nowrap shrink-0"
      >
        <Plus className="h-4 w-4" />
        Nova transação
      </Button>

      <Button
        variant="outline"
        asChild
        className="flex items-center gap-2 whitespace-nowrap shrink-0"
      >
        <Link href="/app/orcamento">
          <PiggyBank className="h-4 w-4" />
          Orçamento
        </Link>
      </Button>

      <Button
        variant="outline"
        asChild
        className="flex items-center gap-2 whitespace-nowrap shrink-0"
      >
        <Link href="/app/recorrentes">
          <Repeat className="h-4 w-4" />
          Recorrentes
        </Link>
      </Button>
    </div>
  )
}
