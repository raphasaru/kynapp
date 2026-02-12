'use client'

import { useEffect } from 'react'
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
  const { data: onboardingProgress } = useOnboardingProgress()

  useEffect(() => {
    // Only redirect if onboarding NOT completed AND user NOT already on /app/onboarding
    if (
      onboardingProgress &&
      !onboardingProgress.onboarding_completed &&
      !pathname?.startsWith('/app/onboarding')
    ) {
      router.push('/app/onboarding')
    }
  }, [onboardingProgress, pathname, router])

  // Always render children (non-blocking redirect)
  return <>{children}</>
}
