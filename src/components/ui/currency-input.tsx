'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CurrencyInputFieldProps {
  /** Valor em reais (ex.: 850.32) */
  value?: number
  /** Chamado com valor em reais a cada digitação */
  onValueChange?: (floatValue: number) => void
  className?: string
  id?: string
  name?: string
  placeholder?: string
  disabled?: boolean
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatCents(cents: number): string {
  return currencyFormatter.format(cents / 100)
}

/**
 * Input de moeda estilo ATM (caixa registradora).
 * Os dois últimos dígitos são sempre centavos.
 *
 * Digitar 8 5 0 3 2 → R$ 850,32
 * Backspace remove o último dígito da direita.
 * Delete limpa tudo.
 */
export const CurrencyInputField = React.forwardRef<
  HTMLInputElement,
  CurrencyInputFieldProps
>(function CurrencyInputField(
  { value = 0, onValueChange, className, id, name, placeholder = 'R$ 0,00', disabled },
  ref
) {
  // Estado interno em centavos (inteiro)
  const valueToCents = (v: number | undefined) => {
    if (v === undefined || v === null || Number.isNaN(v)) return 0
    return Math.round(v * 100)
  }

  const [cents, setCents] = React.useState(() => valueToCents(value))
  const prevExternalRef = React.useRef(valueToCents(value))

  // Sincroniza quando o valor externo muda (ex.: editar transação, reset de form)
  React.useEffect(() => {
    const externalCents = valueToCents(value)
    if (externalCents !== prevExternalRef.current) {
      prevExternalRef.current = externalCents
      setCents(externalCents)
    }
  }, [value])

  const updateValue = React.useCallback(
    (newCents: number) => {
      setCents(newCents)
      prevExternalRef.current = newCents
      onValueChange?.(newCents / 100)
    },
    [onValueChange]
  )

  const hasSelection = (input: HTMLInputElement) => {
    const { selectionStart, selectionEnd } = input
    return (
      selectionStart !== null &&
      selectionEnd !== null &&
      selectionStart !== selectionEnd
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const allSelected = hasSelection(input)

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      // Se tudo (ou parte) selecionado, substitui pelo novo dígito
      const base = allSelected ? 0 : cents
      if (base > 99_999_999) return // Limite ~R$ 9.999.999,99
      updateValue(base * 10 + parseInt(e.key))
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      // Se tudo selecionado, limpa tudo; senão remove último dígito
      updateValue(allSelected ? 0 : Math.floor(cents / 10))
    } else if (e.key === 'Delete') {
      e.preventDefault()
      updateValue(0)
    }
    // Tab, Escape, setas, Ctrl+A etc. passam normalmente
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    // Extrai só dígitos: "R$ 850,32" → "85032" → 85032 centavos → R$ 850,32
    const digits = pasted.replace(/\D/g, '')
    if (digits) {
      const pastedCents = parseInt(digits, 10)
      if (pastedCents <= 999_999_999) {
        updateValue(pastedCents)
      }
    }
  }

  const displayValue = cents === 0 ? '' : formatCents(cents)

  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      disabled={disabled}
      value={displayValue}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={() => {}} // Controlado via onKeyDown
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    />
  )
})
