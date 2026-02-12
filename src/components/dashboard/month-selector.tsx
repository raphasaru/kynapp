'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonthSelectorProps {
  monthLabel: string
  onPrev: () => void
  onNext: () => void
}

export function MonthSelector({ monthLabel, onPrev, onNext }: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <h2 className="font-heading text-lg font-semibold">
        {monthLabel}
      </h2>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="h-8 w-8"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
