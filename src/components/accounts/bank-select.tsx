'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BRAZILIAN_BANKS = [
  'Banco do Brasil',
  'Bradesco',
  'Itaú',
  'Caixa Econômica Federal',
  'Santander',
  'Nubank',
  'Inter',
  'C6 Bank',
  'BTG Pactual',
  'Safra',
  'Original',
  'PagBank',
  'Neon',
  'Next',
  'XP',
  'Outro',
] as const

interface BankSelectProps {
  value?: string
  onChange: (value: string) => void
}

export function BankSelect({ value, onChange }: BankSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um banco" />
      </SelectTrigger>
      <SelectContent>
        {BRAZILIAN_BANKS.map((bank) => (
          <SelectItem key={bank} value={bank}>
            {bank}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
