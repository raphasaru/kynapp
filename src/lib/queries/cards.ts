'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'
import type { CardInput } from '@/lib/validators/card'
import type { Database } from '@/types/database'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

/**
 * Fetch all credit cards for current user (decrypted)
 */
export function useCards() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Decrypt all cards
      const decrypted = await Promise.all(
        (data || []).map(row => decryptFields('credit_cards', row))
      )

      return decrypted as CreditCard[]
    },
  })
}

/**
 * Create a new credit card (with free tier enforcement)
 */
export function useCreateCard() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CardInput) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Free tier enforcement: check existing card count
      const { count, error: countError } = await supabase
        .from('credit_cards')
        .select('id', { count: 'exact', head: true })

      if (countError) throw countError

      // Check user's subscription plan
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single()

      const plan = subscription?.plan || 'free'

      if (plan === 'free' && (count || 0) >= 1) {
        throw new Error('Limite de 1 cartão no plano gratuito')
      }

      // Encrypt fields before insert (current_bill defaults to 0)
      const encrypted = await encryptFields('credit_cards', {
        ...values,
        user_id: user.id,
        current_bill: 0,
      }) as unknown as Database['public']['Tables']['credit_cards']['Insert']

      const { data, error } = await supabase
        .from('credit_cards')
        .insert(encrypted)
        .select()
        .single()

      if (error) throw error

      // Decrypt response
      return decryptFields('credit_cards', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Update an existing credit card
 */
export function useUpdateCard() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...values }: CardInput & { id: string }) => {
      // Encrypt changed fields
      const encrypted = await encryptFields('credit_cards', values) as unknown as Database['public']['Tables']['credit_cards']['Update']

      const { data, error } = await supabase
        .from('credit_cards')
        .update(encrypted)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Decrypt response
      return decryptFields('credit_cards', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Delete a credit card
 */
export function useDeleteCard() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
