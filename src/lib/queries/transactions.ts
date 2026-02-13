'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'
import { getMonthRange } from '@/lib/formatters/date'
import { applyBalanceEffects } from '@/lib/balance-updates'
import { format, parseISO } from 'date-fns'
import { calculateInstallmentDueDates, splitInstallmentAmounts } from '@/lib/installments'
import type { TransactionInput } from '@/lib/validators/transaction'
import type { QueryClient } from '@tanstack/react-query'
import type { Database } from '@/types/database'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

type Transaction = Database['public']['Tables']['transactions']['Row']

// Decrypted transaction with proper types
export type DecryptedTransaction = Omit<Transaction, 'amount' | 'description' | 'notes'> & {
  amount: number
  description: string
  notes?: string | null
}

/** Find a decrypted transaction in the React Query cache by ID */
function findTxInCache(queryClient: QueryClient, id: string): DecryptedTransaction | null {
  const queries = queryClient.getQueriesData<DecryptedTransaction[]>({ queryKey: ['transactions'] })
  for (const [, data] of queries) {
    const found = data?.find(tx => tx.id === id)
    if (found) return found
  }
  return null
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

      const installmentCount = values.installment_count || 1
      // Strip installment_count from DB payload
      const { installment_count, ...dbValues } = values

      // Clear credit_card_id if payment method is not credit
      if (dbValues.payment_method !== 'credit') {
        dbValues.credit_card_id = null
      }

      // --- Single transaction (à vista) ---
      if (installmentCount <= 1) {
        const insertData: any = {
          ...dbValues,
          user_id: user.id,
          due_date: dbValues.due_date, // Already yyyy-MM-dd from form input
        }

        const encrypted = await encryptFields('transactions', insertData) as unknown as Database['public']['Tables']['transactions']['Insert']

        const { data, error } = await supabase
          .from('transactions')
          .insert(encrypted)
          .select()
          .single()

        if (error) throw error

        const decrypted = await decryptFields('transactions', data) as DecryptedTransaction

        await applyBalanceEffects(null, {
          amount: decrypted.amount,
          type: decrypted.type,
          status: decrypted.status,
          bank_account_id: decrypted.bank_account_id,
          credit_card_id: decrypted.credit_card_id,
        })

        return decrypted
      }

      // --- Installment transactions ---
      // Get card info for billing cycle dates
      const cards = queryClient.getQueryData<CreditCard[]>(['cards'])
      const card = cards?.find(c => c.id === dbValues.credit_card_id)
      if (!card) throw new Error('Cartão não encontrado')

      const purchaseDate = new Date(dbValues.due_date)
      const dueDates = calculateInstallmentDueDates(
        purchaseDate,
        card.closing_day,
        card.due_day,
        installmentCount
      )
      const amounts = splitInstallmentAmounts(dbValues.amount, installmentCount)

      let parentId: string | null = null

      for (let i = 0; i < installmentCount; i++) {
        const insertData: any = {
          ...dbValues,
          user_id: user.id,
          amount: amounts[i],
          description: `${dbValues.description} (${i + 1}/${installmentCount})`,
          due_date: dueDates[i],
          status: 'planned',
          installment_number: i + 1,
          total_installments: installmentCount,
          parent_transaction_id: parentId,
        }

        const encrypted = await encryptFields('transactions', insertData) as unknown as Database['public']['Tables']['transactions']['Insert']

        const { data, error } = await supabase
          .from('transactions')
          .insert(encrypted)
          .select()
          .single()

        if (error) throw error

        const decrypted = await decryptFields('transactions', data) as DecryptedTransaction

        // First installment becomes parent
        if (i === 0) {
          parentId = decrypted.id
        }

        await applyBalanceEffects(null, {
          amount: decrypted.amount,
          type: decrypted.type,
          status: decrypted.status,
          bank_account_id: decrypted.bank_account_id,
          credit_card_id: decrypted.credit_card_id,
        })
      }

      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
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
      // Strip installment_count (not a DB column)
      const { installment_count, ...dbValues } = values

      // Find old transaction from cache for balance reversal, fallback to DB
      let oldTx = findTxInCache(queryClient, id)
      if (!oldTx) {
        const { data: fetchedTx, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single()
        if (!fetchError && fetchedTx) {
          oldTx = await decryptFields('transactions', fetchedTx) as DecryptedTransaction
        }
      }

      // Prepare update object
      const updateData: any = {
        ...dbValues,
        due_date: dbValues.due_date, // Already yyyy-MM-dd from form input
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

      const decrypted = await decryptFields('transactions', data) as DecryptedTransaction

      // Update balances: revert old → apply new
      await applyBalanceEffects(
        oldTx ? {
          amount: oldTx.amount,
          type: oldTx.type,
          status: oldTx.status,
          bank_account_id: oldTx.bank_account_id,
          credit_card_id: oldTx.credit_card_id,
        } : null,
        {
          amount: decrypted.amount,
          type: decrypted.type,
          status: decrypted.status,
          bank_account_id: decrypted.bank_account_id,
          credit_card_id: decrypted.credit_card_id,
        }
      )

      return decrypted
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
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
      // Find transaction from cache before deleting, fallback to DB
      let oldTx = findTxInCache(queryClient, id)
      if (!oldTx) {
        const { data: fetchedTx, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single()
        if (!fetchError && fetchedTx) {
          oldTx = await decryptFields('transactions', fetchedTx) as DecryptedTransaction
        }
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Revert balance effects
      if (oldTx) {
        await applyBalanceEffects(
          {
            amount: oldTx.amount,
            type: oldTx.type,
            status: oldTx.status,
            bank_account_id: oldTx.bank_account_id,
            credit_card_id: oldTx.credit_card_id,
          },
          null
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
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
      // Use parseISO-safe local date for completed_date
      const now = new Date()
      const completed_date = newStatus === 'completed'
        ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        : null

      // Find transaction from cache for balance calculation
      const cachedTx = findTxInCache(queryClient, id)

      const { data, error } = await supabase
        .from('transactions')
        .update({ status: newStatus, completed_date })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const decrypted = await decryptFields('transactions', data) as DecryptedTransaction

      // Apply balance effects: old status → new status
      if (cachedTx) {
        await applyBalanceEffects(
          {
            amount: cachedTx.amount,
            type: cachedTx.type,
            status: currentStatus,
            bank_account_id: cachedTx.bank_account_id,
            credit_card_id: cachedTx.credit_card_id,
          },
          {
            amount: cachedTx.amount,
            type: cachedTx.type,
            status: newStatus,
            bank_account_id: cachedTx.bank_account_id,
            credit_card_id: cachedTx.credit_card_id,
          }
        )
      }

      return decrypted
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
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Fetch all transactions for a specific credit card (decrypted)
 */
export function useCardTransactions(cardId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transactions', 'card', cardId],
    enabled: !!cardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('credit_card_id', cardId!)
        .order('due_date', { ascending: false })

      if (error) throw error

      const decrypted = await Promise.all(
        (data || []).map(row => decryptFields('transactions', row))
      )

      return decrypted as DecryptedTransaction[]
    },
  })
}

/**
 * Delete a transaction or all installments of a purchase.
 * mode = 'single' → delete 1 transaction
 * mode = 'all' → delete all installments sharing the same parent
 */
export function useDeleteCardTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transaction,
      mode,
    }: {
      transaction: DecryptedTransaction
      mode: 'single' | 'all'
    }) => {
      if (mode === 'single') {
        // Delete single transaction
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transaction.id)

        if (error) throw error

        await applyBalanceEffects(
          {
            amount: transaction.amount,
            type: transaction.type,
            status: transaction.status,
            bank_account_id: transaction.bank_account_id,
            credit_card_id: transaction.credit_card_id,
          },
          null
        )
      } else {
        // Delete all installments of this purchase
        // Find the parent ID: either this is the parent, or it has a parent_transaction_id
        const parentId = transaction.parent_transaction_id || transaction.id

        // Get all sibling transactions (parent + children)
        const { data: siblings, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .or(`id.eq.${parentId},parent_transaction_id.eq.${parentId}`)

        if (fetchError) throw fetchError

        // Decrypt all for balance reversal
        const decryptedSiblings = await Promise.all(
          (siblings || []).map(row => decryptFields('transactions', row))
        ) as DecryptedTransaction[]

        // Delete all
        const ids = decryptedSiblings.map(t => t.id)
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .in('id', ids)

        if (deleteError) throw deleteError

        // Revert balance for each
        for (const tx of decryptedSiblings) {
          await applyBalanceEffects(
            {
              amount: tx.amount,
              type: tx.type,
              status: tx.status,
              bank_account_id: tx.bank_account_id,
              credit_card_id: tx.credit_card_id,
            },
            null
          )
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
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
