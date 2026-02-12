'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

/**
 * Fetch onboarding progress for current user
 */
export function useOnboardingProgress() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['profile', 'onboarding'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('[useOnboardingProgress] No user found')
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_step, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('[useOnboardingProgress] Supabase error:', error)
        throw error
      }

      // If no profile exists, return default (onboarding not completed)
      return data || { onboarding_step: 0, onboarding_completed: false }
    },
    staleTime: 30 * 1000, // 30s
    retry: false, // Don't retry auth errors
  })
}

/**
 * Update current onboarding step
 */
export function useUpdateOnboardingStep() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (step: number) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_step: step,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
      return step
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'onboarding'] })
    },
  })
}

/**
 * Mark onboarding as complete
 */
export function useCompleteOnboarding() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: 6,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      // Optimistic: set cache immediately so OnboardingGate sees true before refetch
      queryClient.setQueryData(['profile', 'onboarding'], {
        onboarding_step: 6,
        onboarding_completed: true,
      })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Bem-vindo ao KYN!')
    },
  })
}
