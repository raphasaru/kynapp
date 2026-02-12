'use client'

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { CurrencyInputField } from '@/components/ui/currency-input'

interface AmountInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
}

export function AmountInput<T extends FieldValues>({ control, name }: AmountInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <CurrencyInputField
            id={String(name)}
            value={field.value}
            onValueChange={(floatValue) => {
              field.onChange(floatValue)
            }}
          />
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}
