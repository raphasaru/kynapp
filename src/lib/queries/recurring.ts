'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'
import { format, addMonths, getDaysInMonth } from 'date-fns'
import type { RecurringInput } from '@/lib/validators/recurring'
import type { Database } from '@/types/database'

type RecurringTemplate = Database['public']['Tables']['recurring_templates']['Row']

// Decrypted recurring template with proper types
export type DecryptedRecurring = Omit<RecurringTemplate, 'amount' | 'description'> & {
  amount: number
  description: string
}

/**
 * Fetch all active recurring templates for current user (decrypted)
 */
export function useRecurringTemplates() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['recurring-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_templates')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: false }) // income first
        .order('day_of_month', { ascending: true })

      if (error) throw error

      // Decrypt all templates
      const decrypted = await Promise.all(
        (data || []).map(row => decryptFields('recurring_templates', row))
      )

      return decrypted as DecryptedRecurring[]
    },
  })
}

/**
 * Create a new recurring template
 * Also generates the first transaction for current month if day_of_month >= today's day
 */
export function useCreateRecurring() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: RecurringInput) => {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Encrypt fields before insert (clean undefined → null)
      const encrypted = await encryptFields('recurring_templates', {
        description: values.description,
        amount: values.amount,
        type: values.type,
        category: values.category ?? null,
        day_of_month: values.day_of_month,
        end_date: values.end_date,
        payment_method: values.payment_method ?? null,
        bank_account_id: values.bank_account_id ?? null,
        credit_card_id: values.credit_card_id ?? null,
        user_id: user.id,
      }) as unknown as Database['public']['Tables']['recurring_templates']['Insert']

      const { data: template, error } = await supabase
        .from('recurring_templates')
        .insert(encrypted)
        .select()
        .single()

      if (error || !template) throw error || new Error('Failed to create template')

      const createdTemplate = template as RecurringTemplate

      // Generate transactions for ALL months from now to end_date
      const today = new Date()
      const currentDay = today.getDate()
      const endDate = new Date(values.end_date + 'T00:00:00')

      // Start month: current month if day >= today, else next month
      let cursor = new Date(today.getFullYear(), today.getMonth(), 1)
      if (values.day_of_month < currentDay) {
        cursor = addMonths(cursor, 1)
      }
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

      while (cursor <= endMonth) {
        const daysInMonth = getDaysInMonth(cursor)
        const targetDay = Math.min(values.day_of_month, daysInMonth)
        const targetDate = new Date(cursor.getFullYear(), cursor.getMonth(), targetDay)

        // Don't generate past end_date
        if (targetDate > endDate) break

        const transactionData = await encryptFields('transactions', {
          user_id: user.id,
          description: values.description,
          amount: values.amount,
          type: values.type,
          category: values.category ?? null,
          status: 'planned' as const,
          due_date: format(targetDate, 'yyyy-MM-dd'),
          is_recurring: true,
          recurring_day: values.day_of_month,
          recurring_group_id: createdTemplate.id,
          payment_method: values.payment_method ?? null,
          bank_account_id: values.bank_account_id ?? null,
          credit_card_id: values.credit_card_id ?? null,
        }) as unknown as Database['public']['Tables']['transactions']['Insert']

        const { error: txError } = await supabase.from('transactions').insert(transactionData)
        if (txError) {
          console.error('Failed to create recurring transaction:', txError)
        }

        cursor = addMonths(cursor, 1)
      }

      // Decrypt response
      return decryptFields('recurring_templates', createdTemplate) as unknown as DecryptedRecurring
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Update a recurring template + regenerate future planned transactions
 */
export function useUpdateRecurring() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: RecurringInput }) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Update template
      const encrypted = await encryptFields('recurring_templates', {
        description: values.description,
        amount: values.amount,
        type: values.type,
        category: values.category ?? null,
        day_of_month: values.day_of_month,
        end_date: values.end_date,
        payment_method: values.payment_method ?? null,
        bank_account_id: values.bank_account_id ?? null,
        credit_card_id: values.credit_card_id ?? null,
      }) as Record<string, unknown>

      const { error: updateError } = await supabase
        .from('recurring_templates')
        .update(encrypted)
        .eq('id', id)

      if (updateError) throw updateError

      // Delete all future planned transactions for this template
      const today = format(new Date(), 'yyyy-MM-dd')
      await supabase
        .from('transactions')
        .delete()
        .eq('recurring_group_id', id)
        .eq('status', 'planned')
        .gte('due_date', today)

      // Regenerate future transactions
      const currentDay = new Date().getDate()
      const endDate = new Date(values.end_date + 'T00:00:00')

      let cursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      if (values.day_of_month < currentDay) {
        cursor = addMonths(cursor, 1)
      }
      const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

      while (cursor <= endMonth) {
        const daysInMonth = getDaysInMonth(cursor)
        const targetDay = Math.min(values.day_of_month, daysInMonth)
        const targetDate = new Date(cursor.getFullYear(), cursor.getMonth(), targetDay)

        if (targetDate > endDate) break

        const transactionData = await encryptFields('transactions', {
          user_id: user.id,
          description: values.description,
          amount: values.amount,
          type: values.type,
          category: values.category ?? null,
          status: 'planned' as const,
          due_date: format(targetDate, 'yyyy-MM-dd'),
          is_recurring: true,
          recurring_day: values.day_of_month,
          recurring_group_id: id,
          payment_method: values.payment_method ?? null,
          bank_account_id: values.bank_account_id ?? null,
          credit_card_id: values.credit_card_id ?? null,
        }) as unknown as Database['public']['Tables']['transactions']['Insert']

        const { error: txError } = await supabase.from('transactions').insert(transactionData)
        if (txError) console.error('Failed to create recurring transaction:', txError)

        cursor = addMonths(cursor, 1)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Delete a recurring template (soft delete + remove all future transactions)
 */
export function useDeleteRecurring() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      // Soft delete template
      const { error: templateError } = await supabase
        .from('recurring_templates')
        .update({ is_active: false })
        .eq('id', templateId)

      if (templateError) throw templateError

      // Delete all future planned transactions
      const today = format(new Date(), 'yyyy-MM-dd')
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('recurring_group_id', templateId)
        .eq('status', 'planned')
        .gt('due_date', today)

      if (transactionsError) throw transactionsError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-templates'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

/**
 * Delete all future planned transactions for a recurring group
 */
export function useDeleteFutureTransactions() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (templateId: string) => {
      const today = format(new Date(), 'yyyy-MM-dd')

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('recurring_group_id', templateId)
        .eq('status', 'planned')
        .gt('due_date', today)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
