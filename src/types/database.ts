export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          preferred_currency: string | null
          default_bank_account_id: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_currency?: string | null
          default_bank_account_id?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_currency?: string | null
          default_bank_account_id?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          balance: string
          bank_name: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          balance?: string
          bank_name?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          balance?: string
          bank_name?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: string
          type: 'income' | 'expense'
          category: string | null
          status: 'planned' | 'completed'
          due_date: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: string
          type: 'income' | 'expense'
          category?: string | null
          status?: 'planned' | 'completed'
          due_date: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: string
          type?: 'income' | 'expense'
          category?: string | null
          status?: 'planned' | 'completed'
          due_date?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      transaction_type: 'income' | 'expense'
      transaction_status: 'planned' | 'completed'
    }
  }
}
