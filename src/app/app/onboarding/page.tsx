'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOnboardingProgress } from '@/lib/queries/onboarding'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { WelcomeStep } from '@/components/onboarding/welcome-step'
import { AccountsStep } from '@/components/onboarding/accounts-step'
import { DefaultAccountStep } from '@/components/onboarding/default-account-step'
import { CardsStep } from '@/components/onboarding/cards-step'
import { BudgetStep } from '@/components/onboarding/budget-step'
import { WhatsAppStep } from '@/components/onboarding/whatsapp-step'
import { ProStep } from '@/components/onboarding/pro-step'

const STEP_COMPONENTS = [
  WelcomeStep,
  AccountsStep,
  DefaultAccountStep,
  CardsStep,
  BudgetStep,
  WhatsAppStep,
  ProStep,
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: progress, isLoading } = useOnboardingProgress()
  const [currentStep, setCurrentStep] = useState(0)

  // Initialize step from URL or DB
  useEffect(() => {
    if (progress) {
      // If already completed, redirect to app
      if (progress.onboarding_completed) {
        router.push('/app')
        return
      }

      // Get step from URL or use saved progress
      const urlStep = searchParams.get('step')
      if (urlStep) {
        setCurrentStep(parseInt(urlStep, 10))
      } else {
        setCurrentStep(progress.onboarding_step || 0)
      }
    }
  }, [progress, searchParams, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const StepComponent = STEP_COMPONENTS[currentStep] || WelcomeStep

  return (
    <OnboardingWizard currentStep={currentStep}>
      <StepComponent />
    </OnboardingWizard>
  )
}
