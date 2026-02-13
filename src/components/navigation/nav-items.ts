import { Home, PiggyBank, Wallet, BarChart3, User } from 'lucide-react'

export const navItems = [
  { label: 'Início', href: '/app', icon: Home },
  { label: 'Orçamento', href: '/app/orcamento', icon: PiggyBank },
  { label: 'Carteira', href: '/app/carteira', icon: Wallet },
  { label: 'Relatórios', href: '/app/relatorios', icon: BarChart3 },
  { label: 'Perfil', href: '/app/perfil', icon: User },
] as const

// Mobile bottom nav: 4 items (Perfil moves to mobile header avatar)
export const mobileNavItems = [
  { label: 'Início', href: '/app', icon: Home },
  { label: 'Orçamento', href: '/app/orcamento', icon: PiggyBank },
  { label: 'Carteira', href: '/app/carteira', icon: Wallet },
  { label: 'Relatórios', href: '/app/relatorios', icon: BarChart3 },
] as const
