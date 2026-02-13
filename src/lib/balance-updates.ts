import { createClient } from '@/lib/supabase/client'
import { decryptNumber, encryptNumber } from '@/lib/crypto/encrypt'
import type { DecryptedTransaction } from '@/lib/queries/transactions'

type TxSnapshot = Pick<DecryptedTransaction, 'amount' | 'type' | 'status' | 'bank_account_id' | 'credit_card_id'>

/**
 * Delta for bank account balance.
 * Only completed transactions affect balance.
 * income += amount, expense -= amount
 */
function getAccountDelta(type: 'income' | 'expense', status: 'planned' | 'completed', amount: number): number {
  if (status !== 'completed') return 0
  return type === 'income' ? amount : -amount
}

/**
 * Delta for credit card current_bill.
 * planned = added to bill (pending charge), completed = paid (removed from bill).
 * So: planned += amount, completed has no bill effect (net 0: charged + paid).
 */
function getCardBillDelta(status: 'planned' | 'completed', amount: number): number {
  return status === 'planned' ? amount : 0
}

async function updateAccountBalance(accountId: string, delta: number): Promise<void> {
  if (delta === 0) return
  const supabase = createClient()

  const { data, error } = await supabase
    .from('bank_accounts')
    .select('balance')
    .eq('id', accountId)
    .single()

  if (error || !data) return

  let current: number
  try {
    current = await decryptNumber(data.balance as string)
  } catch {
    current = typeof data.balance === 'number' ? data.balance : parseFloat(data.balance as string) || 0
  }

  const newBalance = current + delta
  const encrypted = await encryptNumber(newBalance)

  await supabase
    .from('bank_accounts')
    .update({ balance: encrypted } as any)
    .eq('id', accountId)
}

async function updateCardBill(cardId: string, delta: number): Promise<void> {
  if (delta === 0) return
  const supabase = createClient()

  const { data, error } = await supabase
    .from('credit_cards')
    .select('current_bill')
    .eq('id', cardId)
    .single()

  if (error || !data) return

  let current: number
  try {
    current = await decryptNumber(data.current_bill as string)
  } catch {
    current = typeof data.current_bill === 'number' ? data.current_bill : parseFloat(data.current_bill as string) || 0
  }

  const newBill = Math.max(0, current + delta)
  const encrypted = await encryptNumber(newBill)

  await supabase
    .from('credit_cards')
    .update({ current_bill: encrypted } as any)
    .eq('id', cardId)
}

/**
 * Orchestrates balance updates given old and new transaction states.
 * oldTx = null → creation; newTx = null → deletion.
 */
export async function applyBalanceEffects(
  oldTx: TxSnapshot | null,
  newTx: TxSnapshot | null
): Promise<void> {
  // --- Bank account effects ---
  // Revert old effect
  if (oldTx?.bank_account_id) {
    const delta = getAccountDelta(oldTx.type, oldTx.status, oldTx.amount)
    if (delta !== 0) {
      await updateAccountBalance(oldTx.bank_account_id, -delta)
    }
  }
  // Apply new effect
  if (newTx?.bank_account_id) {
    const delta = getAccountDelta(newTx.type, newTx.status, newTx.amount)
    if (delta !== 0) {
      await updateAccountBalance(newTx.bank_account_id, delta)
    }
  }

  // --- Credit card effects ---
  // Revert old effect
  if (oldTx?.credit_card_id) {
    const delta = getCardBillDelta(oldTx.status, oldTx.amount)
    if (delta !== 0) {
      await updateCardBill(oldTx.credit_card_id, -delta)
    }
  }
  // Apply new effect
  if (newTx?.credit_card_id) {
    const delta = getCardBillDelta(newTx.status, newTx.amount)
    if (delta !== 0) {
      await updateCardBill(newTx.credit_card_id, delta)
    }
  }
}
