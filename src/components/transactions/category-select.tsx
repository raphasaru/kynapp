'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Home, Zap, CreditCard, User, FileText, UtensilsCrossed, Car, MoreHorizontal } from 'lucide-react'

const categoryLabels: Record<string, string> = {
  fixed_housing: "Moradia",
  fixed_utilities: "Contas",
  fixed_subscriptions: "Assinaturas",
  fixed_personal: "Pessoal",
  fixed_taxes: "Impostos",
  variable_credit: "Cartão",
  variable_food: "Alimentação",
  variable_transport: "Transporte",
  variable_other: "Outros",
}

const categoryIcons: Record<string, string> = {
  fixed_housing: "Home",
  fixed_utilities: "Zap",
  fixed_subscriptions: "CreditCard",
  fixed_personal: "User",
  fixed_taxes: "FileText",
  variable_credit: "CreditCard",
  variable_food: "UtensilsCrossed",
  variable_transport: "Car",
  variable_other: "MoreHorizontal",
}

const iconMap = {
  Home,
  Zap,
  CreditCard,
  User,
  FileText,
  UtensilsCrossed,
  Car,
  MoreHorizontal,
}

interface CategorySelectProps {
  value: string | null | undefined
  onChange: (value: string) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const fixedCategories = [
    'fixed_housing',
    'fixed_utilities',
    'fixed_subscriptions',
    'fixed_personal',
    'fixed_taxes',
  ]

  const variableCategories = [
    'variable_credit',
    'variable_food',
    'variable_transport',
    'variable_other',
  ]

  const getIcon = (categoryKey: string) => {
    const iconName = categoryIcons[categoryKey] as keyof typeof iconMap
    const Icon = iconMap[iconName]
    return Icon ? <Icon className="h-4 w-4 mr-2" /> : null
  }

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione categoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fixas</SelectLabel>
          {fixedCategories.map((key) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center">
                {getIcon(key)}
                {categoryLabels[key]}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Variáveis</SelectLabel>
          {variableCategories.map((key) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center">
                {getIcon(key)}
                {categoryLabels[key]}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
