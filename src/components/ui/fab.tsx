'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './button'

interface FABProps {
  onClick: () => void
}

export function FAB({ onClick }: FABProps) {
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down, hide FAB
        setVisible(false)
      } else {
        // Scrolling up, show FAB
        setVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  return (
    <Button
      onClick={onClick}
      className={`fixed z-50 bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      aria-label="Adicionar transação"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
