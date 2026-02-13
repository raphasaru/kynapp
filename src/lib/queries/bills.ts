'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'
import { encryptNumber, decryptNumber } from '@/lib/crypto/encrypt'
import { getNextBillMonth } from '@/lib/installments'
import { format } from 'date-fns'
import type { Database } from '@/types/database'

type CreditCard = Database['public']['Tables']['credit_cards']['Row']

type CreditCardBill = Database['public']['Tables']['credit_card_bills']['Row']

export type DecryptedBill = Omit<CreditCardBill, 'total_amount'> & {
  total_amount: number
}

/**
 * Fetch all bills for a credit card (decrypted)
 */
export function useCardBills(cardId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['bills', cardId],
    enabled: !!cardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_card_bills')
        .select('*')
        .eq('credit_card_id', cardId!)
        .order('month', { ascending: false })

      if (error) throw error

      const decrypted = await Promise.all(
        (data || []).map(row => decryptFields('credit_card_bills', row))
      )

      return decrypted as DecryptedBill[]
    },
  })
}

/**
 * Mark a bill as paid — updates bill status + sets all transactions for that month to completed
 */
export function usePayBill() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ billId, cardId, month }: { billId: string; cardId: string; month: string }) => {
      // 1. Update bill status
      const { error: billError } = await supabase
        .from('credit_card_bills')
        .update({
          status: 'paid',
          paid_date: format(new Date(), 'yyyy-MM-dd'),
        })
        .eq('id', billId)

      if (billError) throw billError

      // 2. Get all open transactions for this card + month
      const [year, monthNum] = month.split('-')
      const startDate = `${year}-${monthNum}-01`
      const endMonth = parseInt(monthNum) === 12
        ? `${parseInt(year) + 1}-01-01`
        : `${year}-${String(parseInt(monthNum) + 1).padStart(2, '0')}-01`

      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('id')
        .eq('credit_card_id', cardId)
        .eq('status', 'planned')
        .gte('due_date', startDate)
        .lt('due_date', endMonth)

      if (txError) throw txError

      // 3. Mark all as completed
      if (transactions && transactions.length > 0) {
        const ids = transactions.map(t => t.id)
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            status: 'completed',
            completed_date: format(new Date(), 'yyyy-MM-dd'),
          })
          .in('id', ids)

        if (updateError) throw updateError
      }

      // 4. Reset current_bill on card (subtract paid amount)
      // We'll let cache invalidation handle the UI
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

/**
 * Get or create a bill for a given card + month
 */
export async function getOrCreateBill(
  cardId: string,
  userId: string,
  month: string
): Promise<string> {
  const supabase = createClient()

  // Try to find existing
  const { data: existing } = await supabase
    .from('credit_card_bills')
    .select('id')
    .eq('credit_card_id', cardId)
    .eq('month', month)
    .maybeSingle()

  if (existing) return existing.id

  // Create new
  const encrypted = await encryptFields('credit_card_bills', {
    user_id: userId,
    credit_card_id: cardId,
    month,
    total_amount: 0,
  })

  const { data, error } = await supabase
    .from('credit_card_bills')
    .insert(encrypted as any)
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

/**
 * Compute the next bill amount for each card.
 * Single query for all cards — groups by card + filters by each card's next bill month.
 */
export function useNextBillAmounts(cards: CreditCard[] | undefined) {
  const supabase = createClient()
  const cardIds = cards?.map(c => c.id)

  return useQuery({
    queryKey: ['next-bill-amounts', cardIds],
    enabled: !!cards && cards.length > 0,
    queryFn: async () => {
      // Fetch all planned credit card transactions
      const { data, error } = await supabase
        .from('transactions')
        .select('credit_card_id, amount, due_date')
        .in('credit_card_id', cards!.map(c => c.id))
        .order('due_date')

      if (error) throw error

      // Decrypt amounts individually (can't use decryptFields with partial select)
      const rows = await Promise.all(
        (data || []).map(async (row) => {
          let amount: number
          try {
            amount = await decryptNumber(row.amount)
          } catch {
            amount = parseFloat(row.amount) || 0
          }
          return { ...row, amount }
        })
      )

      // For each card, compute next bill month and sum matching transactions
      const result = new Map<string, number>()
      for (const card of cards!) {
        const billMonth = getNextBillMonth(card.due_day)
        const cardTxs = rows.filter(
          (tx) => tx.credit_card_id === card.id && tx.due_date.startsWith(billMonth)
        )
        result.set(card.id, cardTxs.reduce((sum, tx) => sum + tx.amount, 0))
      }

      return result
    },
  })
}

/**
 * Update total_amount on a bill by recalculating from transactions
 */
export async function recalculateBillTotal(cardId: string, month: string): Promise<void> {
  const supabase = createClient()

  const [year, monthNum] = month.split('-')
  const startDate = `${year}-${monthNum}-01`
  const endMonth = parseInt(monthNum) === 12
    ? `${parseInt(year) + 1}-01-01`
    : `${year}-${String(parseInt(monthNum) + 1).padStart(2, '0')}-01`

  // Get all transactions for this card + month
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount')
    .eq('credit_card_id', cardId)
    .gte('due_date', startDate)
    .lt('due_date', endMonth)

  if (!transactions) return

  // Decrypt amounts and sum
  const decryptedTxs = await Promise.all(
    transactions.map(t => decryptFields('transactions', t))
  )
  const total = decryptedTxs.reduce((sum, t: any) => sum + (t.amount || 0), 0)

  // Update bill total
  const encryptedTotal = await encryptNumber(total)
  await supabase
    .from('credit_card_bills')
    .update({ total_amount: encryptedTotal } as any)
    .eq('credit_card_id', cardId)
    .eq('month', month)
}
