import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useSubscription() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status, whatsapp_messages_used, whatsapp_messages_reset_at, current_period_end, stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpgrade() {
  return useMutation({
    mutationFn: async (priceId: string) => {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      return response.json() as Promise<{ url: string }>
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url
    },
  })
}

export function useManageSubscription() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      return response.json() as Promise<{ url: string }>
    },
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.url
    },
  })
}
