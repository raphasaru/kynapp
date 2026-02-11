import { Home, PiggyBank, Wallet, BarChart3, User } from 'lucide-react'

export const navItems = [
  { label: 'Início', href: '/app', icon: Home },
  { label: 'Orçamento', href: '/app/orcamento', icon: PiggyBank },
  { label: 'Carteira', href: '/app/carteira', icon: Wallet },
  { label: 'Relatórios', href: '/app/relatorios', icon: BarChart3 },
  { label: 'Perfil', href: '/app/perfil', icon: User },
] as const
