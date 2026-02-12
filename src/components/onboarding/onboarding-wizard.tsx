'use client'

import { Button } from '@/components/ui/button'
import { useCompleteOnboarding, useUpdateOnboardingStep } from '@/lib/queries/onboarding'
import { useRouter } from 'next/navigation'
import { ChevronRight, X } from 'lucide-react'

const STEPS = [
  'Boas-vindas',
  'Contas',
  'Cartões',
  'Orçamento',
  'WhatsApp',
  'Pro',
]

interface OnboardingWizardProps {
  currentStep: number
  children: React.ReactNode
  onNext?: () => void
}

export function OnboardingWizard({ currentStep, children, onNext }: OnboardingWizardProps) {
  const router = useRouter()
  const updateStep = useUpdateOnboardingStep()
  const completeOnboarding = useCompleteOnboarding()

  const isLastStep = currentStep === STEPS.length - 1
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100

  const handleSkip = async () => {
    await completeOnboarding.mutateAsync()
    router.push('/app')
  }

  const handleNext = async () => {
    if (onNext) {
      onNext()
    }

    if (isLastStep) {
      await completeOnboarding.mutateAsync()
      router.push('/app')
    } else {
      const nextStep = currentStep + 1
      await updateStep.mutateAsync(nextStep)
      router.push(`/app/onboarding?step=${nextStep}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Etapa {currentStep + 1} de {STEPS.length}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={completeOnboarding.isPending}
        >
          Pular
          <X className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        {children}
      </div>

      {/* Footer navigation */}
      <div className="px-6 py-6 border-t bg-background/50 backdrop-blur">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleNext}
            disabled={updateStep.isPending || completeOnboarding.isPending}
            size="lg"
            className="w-full"
          >
            {updateStep.isPending || completeOnboarding.isPending
              ? 'Aguarde...'
              : isLastStep
              ? 'Começar a usar'
              : 'Próximo'}
            {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
