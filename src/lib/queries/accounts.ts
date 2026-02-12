'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'
import type { AccountInput } from '@/lib/validators/account'
import type { Database } from '@/types/database'

type BankAccount = Database['public']['Tables']['bank_accounts']['Row']

/**
 * Fetch all bank accounts for current user (decrypted)
 */
export function useAccounts() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Decrypt all accounts
      const decrypted = await Promise.all(
        (data || []).map(row => decryptFields('bank_accounts', row))
      )

      return decrypted as BankAccount[]
    },
  })
}

/**
 * Create a new bank account (with free tier enforcement)
 */
export function useCreateAccount() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: AccountInput) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Free tier enforcement: check existing account count
      const { count, error: countError } = await supabase
        .from('bank_accounts')
        .select('id', { count: 'exact', head: true })

      if (countError) throw countError

      // Check user's subscription plan
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user.id)
        .single()

      const plan = subscription?.plan || 'free'

      if (plan === 'free' && (count || 0) >= 2) {
        throw new Error('Limite de 2 contas no plano gratuito')
      }

      // Encrypt fields before insert
      const encrypted = await encryptFields('bank_accounts', {
        ...values,
        user_id: user.id,
      }) as unknown as Database['public']['Tables']['bank_accounts']['Insert']

      const { data, error } = await supabase
        .from('bank_accounts')
        .insert(encrypted)
        .select()
        .single()

      if (error) throw error

      // Decrypt response
      return decryptFields('bank_accounts', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

/**
 * Update an existing bank account
 */
export function useUpdateAccount() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...values }: AccountInput & { id: string }) => {
      // Encrypt changed fields
      const encrypted = await encryptFields('bank_accounts', values) as unknown as Database['public']['Tables']['bank_accounts']['Update']

      const { data, error } = await supabase
        .from('bank_accounts')
        .update(encrypted)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Decrypt response
      return decryptFields('bank_accounts', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

/**
 * Delete a bank account
 */
export function useDeleteAccount() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

/**
 * Set an account as the default
 */
export function useSetDefaultAccount() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountId: string) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({ default_bank_account_id: accountId })
        .eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
