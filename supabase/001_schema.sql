-- ============================================================
-- KYN App - Database Schema
-- Supabase project: vonfsyszaxtbxeowelqu
-- ============================================================

-- ==================== ENUMS ====================

CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE transaction_status AS ENUM ('planned', 'completed');
CREATE TYPE expense_category AS ENUM (
  'fixed_housing',
  'fixed_utilities',
  'fixed_subscriptions',
  'fixed_personal',
  'fixed_taxes',
  'variable_credit',
  'variable_food',
  'variable_transport',
  'variable_other'
);
CREATE TYPE payment_method AS ENUM ('pix', 'cash', 'debit', 'credit', 'transfer', 'boleto');

-- ==================== TABLES ====================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'BRL',
  default_bank_account_id UUID,  -- FK added after bank_accounts creation
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Accounts
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment')),
  balance TEXT DEFAULT '0',  -- encrypted: stored as text
  bank_name TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from profiles to bank_accounts
ALTER TABLE profiles
  ADD CONSTRAINT profiles_default_bank_account_id_fkey
  FOREIGN KEY (default_bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Credit Cards
CREATE TABLE credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  credit_limit TEXT NOT NULL DEFAULT '0',  -- encrypted
  current_bill TEXT NOT NULL DEFAULT '0',  -- encrypted
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Custom Categories
CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#6366f1',
  is_fixed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,              -- encrypted
  amount TEXT NOT NULL,                   -- encrypted
  type transaction_type NOT NULL,
  category expense_category,
  custom_category_id UUID REFERENCES custom_categories(id) ON DELETE SET NULL,
  status transaction_status DEFAULT 'planned',
  due_date DATE NOT NULL,
  completed_date DATE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_day INTEGER CHECK (recurring_day >= 1 AND recurring_day <= 31),
  recurring_group_id UUID,
  recurring_end_date DATE,
  notes TEXT,                             -- encrypted
  source TEXT DEFAULT 'app' CHECK (source IN ('app', 'whatsapp')),
  payment_method payment_method,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  installment_number INTEGER,
  total_installments INTEGER,
  parent_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction Items (sub-items of a transaction)
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,              -- encrypted
  amount TEXT NOT NULL,                   -- encrypted
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Templates
CREATE TABLE recurring_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  type transaction_type NOT NULL,
  category expense_category,
  custom_category_id UUID REFERENCES custom_categories(id) ON DELETE SET NULL,
  day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active BOOLEAN DEFAULT TRUE,
  payment_method payment_method,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category Budgets
CREATE TABLE category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category expense_category,
  custom_category_id UUID REFERENCES custom_categories(id) ON DELETE SET NULL,
  monthly_budget TEXT NOT NULL DEFAULT '0',  -- encrypted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Goals (monthly)
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  savings_goal TEXT DEFAULT '0',        -- encrypted
  invested_amount TEXT DEFAULT '0',     -- encrypted
  total_debts TEXT DEFAULT '0',         -- encrypted
  dollar_rate TEXT,                     -- encrypted
  notes TEXT,                           -- encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ticker TEXT,
  type TEXT NOT NULL,
  quantity TEXT,        -- encrypted
  average_price TEXT,   -- encrypted
  current_price TEXT,   -- encrypted
  currency TEXT DEFAULT 'BRL',
  notes TEXT,           -- encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment History
CREATE TABLE investment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  recorded_at DATE NOT NULL,
  price TEXT NOT NULL,       -- encrypted
  total_value TEXT NOT NULL, -- encrypted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (Stripe integration + WhatsApp usage)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'pro_annual')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  whatsapp_messages_used INTEGER DEFAULT 0,
  whatsapp_messages_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Links
CREATE TABLE user_whatsapp_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL UNIQUE,
  whatsapp_lid TEXT,
  verification_code TEXT,
  verification_expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
