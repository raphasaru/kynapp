'use client'

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import CurrencyInput from 'react-currency-input-field'

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
          <CurrencyInput
            id={name}
            value={field.value}
            onValueChange={(value) => {
              const numValue = value ? parseFloat(value) : 0
              field.onChange(numValue)
            }}
            intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
            decimalsLimit={2}
            decimalSeparator=","
            groupSeparator="."
            prefix="R$ "
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="R$ 0,00"
          />
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}
