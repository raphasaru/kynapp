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
          payment_method: string | null
          bank_account_id: string | null
          credit_card_id: string | null
          notes: string | null
          completed_date: string | null
          source: string | null
          is_recurring: boolean
          recurring_day: number | null
          recurring_group_id: string | null
          recurring_end_date: string | null
          custom_category_id: string | null
          installment_number: number | null
          total_installments: number | null
          parent_transaction_id: string | null
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
          payment_method?: string | null
          bank_account_id?: string | null
          credit_card_id?: string | null
          notes?: string | null
          completed_date?: string | null
          source?: string | null
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_group_id?: string | null
          recurring_end_date?: string | null
          custom_category_id?: string | null
          installment_number?: number | null
          total_installments?: number | null
          parent_transaction_id?: string | null
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
          payment_method?: string | null
          bank_account_id?: string | null
          credit_card_id?: string | null
          notes?: string | null
          completed_date?: string | null
          source?: string | null
          is_recurring?: boolean
          recurring_day?: number | null
          recurring_group_id?: string | null
          recurring_end_date?: string | null
          custom_category_id?: string | null
          installment_number?: number | null
          total_installments?: number | null
          parent_transaction_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          credit_limit: string
          current_bill: string
          due_day: number
          closing_day: number
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          credit_limit: string
          current_bill?: string
          due_day: number
          closing_day: number
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          credit_limit?: string
          current_bill?: string
          due_day?: number
          closing_day?: number
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_card_bills: {
        Row: {
          id: string
          user_id: string
          credit_card_id: string
          month: string
          status: 'open' | 'paid'
          paid_date: string | null
          total_amount: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          credit_card_id: string
          month: string
          status?: 'open' | 'paid'
          paid_date?: string | null
          total_amount?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          credit_card_id?: string
          month?: string
          status?: 'open' | 'paid'
          paid_date?: string | null
          total_amount?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_end: string | null
          whatsapp_messages_used: number
          whatsapp_messages_reset_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          whatsapp_messages_used?: number
          whatsapp_messages_reset_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          whatsapp_messages_used?: number
          whatsapp_messages_reset_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      category_budgets: {
        Row: {
          id: string
          user_id: string
          category: string | null
          custom_category_id: string | null
          monthly_budget: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category?: string | null
          custom_category_id?: string | null
          monthly_budget: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string | null
          custom_category_id?: string | null
          monthly_budget?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      recurring_templates: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: string
          type: 'income' | 'expense'
          category: string | null
          custom_category_id: string | null
          day_of_month: number
          end_date: string | null
          is_active: boolean
          payment_method: string | null
          bank_account_id: string | null
          credit_card_id: string | null
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
          custom_category_id?: string | null
          day_of_month: number
          end_date?: string | null
          is_active?: boolean
          payment_method?: string | null
          bank_account_id?: string | null
          credit_card_id?: string | null
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
          custom_category_id?: string | null
          day_of_month?: number
          end_date?: string | null
          is_active?: boolean
          payment_method?: string | null
          bank_account_id?: string | null
          credit_card_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_whatsapp_links: {
        Row: {
          id: string
          user_id: string
          phone_number: string
          whatsapp_lid: string | null
          verification_code: string | null
          verification_expires_at: string | null
          verified_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          phone_number: string
          whatsapp_lid?: string | null
          verification_code?: string | null
          verification_expires_at?: string | null
          verified_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          phone_number?: string
          whatsapp_lid?: string | null
          verification_code?: string | null
          verification_expires_at?: string | null
          verified_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      transaction_type: 'income' | 'expense'
      transaction_status: 'planned' | 'completed'
      bill_status: 'open' | 'paid'
    }
  }
}
