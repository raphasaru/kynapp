/**
 * Category Labels & Icons Reference
 * Maps expense_category enum to Portuguese labels and Lucide icon names
 */

export const categoryLabels: Record<string, string> = {
  fixed_housing: "Moradia",
  fixed_utilities: "Contas",
  fixed_subscriptions: "Assinaturas",
  fixed_personal: "Pessoal",
  fixed_taxes: "Impostos",
  variable_credit: "Cartão",
  variable_food: "Alimentação",
  variable_transport: "Transporte",
  variable_other: "Outros",
};

export const categoryIcons: Record<string, string> = {
  fixed_housing: "Home",
  fixed_utilities: "Zap",
  fixed_subscriptions: "CreditCard",
  fixed_personal: "User",
  fixed_taxes: "FileText",
  variable_credit: "CreditCard",
  variable_food: "UtensilsCrossed",
  variable_transport: "Car",
  variable_other: "MoreHorizontal",
};
