'use client'

import { usePrivacy } from '@/providers/privacy-provider'

interface PrivateValueProps {
  children: React.ReactNode
}

export function PrivateValue({ children }: PrivateValueProps) {
  const { valuesHidden } = usePrivacy()

  if (valuesHidden) {
    return <span className="select-none">•••••</span>
  }

  return <>{children}</>
}
