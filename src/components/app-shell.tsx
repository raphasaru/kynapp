'use client'

import { useState } from 'react'
import { FAB } from '@/components/ui/fab'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { TransactionForm } from '@/components/transactions/transaction-form'

export function AppShell() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* Mobile-only FAB */}
      <div className="md:hidden">
        <FAB onClick={() => setSheetOpen(true)} />
      </div>

      {/* Transaction sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>Nova transação</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto h-[calc(85vh-80px)]">
            <TransactionForm onSuccess={() => setSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
