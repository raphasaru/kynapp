'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'
import type { Database } from '@/types/database'

type CategoryBudget = Database['public']['Tables']['category_budgets']['Row']

// Decrypted budget with proper types
export type DecryptedBudget = Omit<CategoryBudget, 'monthly_budget'> & {
  monthly_budget: number
}

/**
 * Fetch all category budgets for current user (decrypted)
 */
export function useBudgets() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_budgets')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error

      // Decrypt all budgets
      const decrypted = await Promise.all(
        (data || []).map(row => decryptFields('category_budgets', row))
      )

      return decrypted as DecryptedBudget[]
    },
  })
}

/**
 * Upsert multiple category budgets at once
 */
export function useUpsertBudgets() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (budgets: Array<{ category: string; monthly_budget: number }>) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Process each budget
      const results = await Promise.all(
        budgets.map(async (budget) => {
          const insertData = {
            user_id: user.id,
            category: budget.category,
            monthly_budget: budget.monthly_budget,
          }

          // Encrypt fields before upsert
          const encrypted = await encryptFields('category_budgets', insertData) as unknown as Database['public']['Tables']['category_budgets']['Insert']

          // Upsert (match on user_id + category)
          const { data, error } = await supabase
            .from('category_budgets')
            .upsert(encrypted, {
              onConflict: 'user_id,category',
            })
            .select()
            .single()

          if (error) throw error
          return data
        })
      )

      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}
