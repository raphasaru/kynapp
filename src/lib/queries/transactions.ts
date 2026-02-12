'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'
import { getMonthRange } from '@/lib/formatters/date'
import { format } from 'date-fns'
import type { TransactionInput } from '@/lib/validators/transaction'
import type { Database } from '@/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row']

// Decrypted transaction with proper types
export type DecryptedTransaction = Omit<Transaction, 'amount' | 'description' | 'notes'> & {
  amount: number
  description: string
  notes?: string | null
}

/**
 * Fetch transactions for a specific month (decrypted)
 */
export function useTransactions(month: string) {
  const supabase = createClient()
  const { start, end } = getMonthRange(month)

  return useQuery({
    queryKey: ['transactions', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('due_date', start)
        .lt('due_date', end)
        .order('due_date', { ascending: false })

      if (error) throw error

      // Decrypt all transactions
      const decrypted = await Promise.all(
        (data || []).map(row => decryptFields('transactions', row))
      )

      return decrypted as DecryptedTransaction[]
    },
  })
}

/**
 * Create a new transaction
 */
export function useCreateTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: TransactionInput) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Prepare insert object
      const insertData: any = {
        ...values,
        user_id: user.id,
        due_date: format(new Date(values.due_date), 'yyyy-MM-dd'),
      }

      // Clear credit_card_id if payment method is not credit
      if (values.payment_method !== 'credit') {
        insertData.credit_card_id = null
      }

      // Encrypt fields before insert
      const encrypted = await encryptFields('transactions', insertData) as unknown as Database['public']['Tables']['transactions']['Insert']

      const { data, error } = await supabase
        .from('transactions')
        .insert(encrypted)
        .select()
        .single()

      if (error) throw error

      // Decrypt response
      return decryptFields('transactions', data) as Promise<DecryptedTransaction>
    },
    onSuccess: () => {
      // Invalidate all transaction queries (all months)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Update an existing transaction
 */
export function useUpdateTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...values }: TransactionInput & { id: string }) => {
      // Prepare update object
      const updateData: any = {
        ...values,
        due_date: format(new Date(values.due_date), 'yyyy-MM-dd'),
      }

      // Clear credit_card_id if payment method is not credit
      if (values.payment_method !== 'credit') {
        updateData.credit_card_id = null
      }

      // Encrypt changed fields
      const encrypted = await encryptFields('transactions', updateData) as unknown as Database['public']['Tables']['transactions']['Update']

      const { data, error } = await supabase
        .from('transactions')
        .update(encrypted)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Decrypt response
      return decryptFields('transactions', data) as Promise<DecryptedTransaction>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Delete a transaction
 */
export function useDeleteTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Toggle transaction status (planned ↔ completed) with optimistic updates
 */
export function useToggleTransactionStatus() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: 'planned' | 'completed' }) => {
      const newStatus = currentStatus === 'planned' ? 'completed' : 'planned'
      const completed_date = newStatus === 'completed' ? format(new Date(), 'yyyy-MM-dd') : null

      const { data, error } = await supabase
        .from('transactions')
        .update({ status: newStatus, completed_date })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return decryptFields('transactions', data) as Promise<DecryptedTransaction>
    },
    onMutate: async ({ id, currentStatus }) => {
      // Cancel any outgoing queries for transactions
      await queryClient.cancelQueries({ queryKey: ['transactions'] })

      // Snapshot previous value
      const previousTransactions = queryClient.getQueriesData({ queryKey: ['transactions'] })

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: any) => {
        if (!old) return old

        return old.map((transaction: DecryptedTransaction) => {
          if (transaction.id === id) {
            const newStatus = currentStatus === 'planned' ? 'completed' : 'planned'
            return {
              ...transaction,
              status: newStatus,
              completed_date: newStatus === 'completed' ? format(new Date(), 'yyyy-MM-dd') : null,
            }
          }
          return transaction
        })
      })

      return { previousTransactions }
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Client-side search filter for transactions
 * @param transactions - Already-decrypted transactions
 * @param query - Search query (case-insensitive substring match on description)
 * @returns Filtered transactions
 */
export function filterTransactionsBySearch(
  transactions: DecryptedTransaction[],
  query: string
): DecryptedTransaction[] {
  if (!query.trim()) return transactions

  const lowerQuery = query.toLowerCase()
  return transactions.filter(t =>
    t.description.toLowerCase().includes(lowerQuery)
  )
}
