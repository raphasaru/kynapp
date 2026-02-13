'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOnboardingProgress } from '@/lib/queries/onboarding'

interface OnboardingGateProps {
  children: React.ReactNode
}

/**
 * OnboardingGate redirects non-onboarded users to /app/onboarding
 * Wraps all /app/* routes in layout to enforce completion globally
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: onboardingProgress, isLoading, error } = useOnboardingProgress()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (error || isLoading) return

    if (
      onboardingProgress &&
      !onboardingProgress.onboarding_completed &&
      !pathname?.startsWith('/app/onboarding') &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true
      router.replace('/app/onboarding')
    }

    // Reset redirect flag when onboarding is completed
    if (onboardingProgress?.onboarding_completed) {
      hasRedirected.current = false
    }
  }, [onboardingProgress, pathname, router, isLoading, error])

  return <>{children}</>
}
