'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface PrivacyContextValue {
  valuesHidden: boolean
  toggleValues: () => void
}

const PrivacyContext = createContext<PrivacyContextValue>({
  valuesHidden: false,
  toggleValues: () => {},
})

const STORAGE_KEY = 'kyn-values-hidden'

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [valuesHidden, setValuesHidden] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setValuesHidden(true)
  }, [])

  const toggleValues = useCallback(() => {
    setValuesHidden((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  return (
    <PrivacyContext.Provider value={{ valuesHidden, toggleValues }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  return useContext(PrivacyContext)
}
