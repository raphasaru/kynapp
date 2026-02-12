-- ============================================================
-- KYN App - Row Level Security Policies
-- All tables use RLS to ensure users can only access their own data
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_whatsapp_links ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES ====================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- ==================== BANK ACCOUNTS ====================
CREATE POLICY "Users can view own bank accounts"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bank accounts"
  ON bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== CREDIT CARDS ====================
CREATE POLICY "Users can view own credit cards"
  ON credit_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own credit cards"
  ON credit_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards"
  ON credit_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards"
  ON credit_cards FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== CUSTOM CATEGORIES ====================
CREATE POLICY "Users can view own custom categories"
  ON custom_categories FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own custom categories"
  ON custom_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own custom categories"
  ON custom_categories FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own custom categories"
  ON custom_categories FOR DELETE
  USING (user_id = auth.uid());

-- ==================== TRANSACTIONS ====================
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- WhatsApp: allow inserts from verified WhatsApp users (via service role / RPC)
CREATE POLICY "Allow WhatsApp transaction insert"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_whatsapp_links
      WHERE user_whatsapp_links.user_id = transactions.user_id
      AND user_whatsapp_links.verified_at IS NOT NULL
    )
  );

-- ==================== TRANSACTION ITEMS ====================
CREATE POLICY "Users can manage their transaction items"
  ON transaction_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
      AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_items.transaction_id
      AND t.user_id = auth.uid()
    )
  );

-- ==================== RECURRING TEMPLATES ====================
CREATE POLICY "Users can manage own templates"
  ON recurring_templates FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ==================== CATEGORY BUDGETS ====================
CREATE POLICY "Users can view own category budgets"
  ON category_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own category budgets"
  ON category_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category budgets"
  ON category_budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own category budgets"
  ON category_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ==================== FINANCIAL GOALS ====================
CREATE POLICY "Users can manage own goals"
  ON financial_goals FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ==================== INVESTMENTS ====================
CREATE POLICY "Users can manage own investments"
  ON investments FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- ==================== INVESTMENT HISTORY ====================
CREATE POLICY "Users can view own investment history"
  ON investment_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_history.investment_id
      AND investments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert own investment history"
  ON investment_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investments
      WHERE investments.id = investment_history.investment_id
      AND investments.user_id = (SELECT auth.uid())
    )
  );

-- ==================== SUBSCRIPTIONS ====================
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role (Stripe webhooks) can manage all
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- ==================== WHATSAPP LINKS ====================
CREATE POLICY "Users can view own links"
  ON user_whatsapp_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links"
  ON user_whatsapp_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links"
  ON user_whatsapp_links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON user_whatsapp_links FOR DELETE
  USING (auth.uid() = user_id);

-- Public policies for WhatsApp bot verification flow
CREATE POLICY "Allow verification code lookup"
  ON user_whatsapp_links FOR SELECT
  USING (
    verification_code IS NOT NULL
    AND verification_expires_at > NOW()
    AND verified_at IS NULL
  );

CREATE POLICY "Allow WhatsApp verification update"
  ON user_whatsapp_links FOR UPDATE
  USING (
    verification_code IS NOT NULL
    AND verification_expires_at > NOW()
    AND verified_at IS NULL
  )
  WITH CHECK (
    verified_at IS NOT NULL
    AND whatsapp_lid IS NOT NULL
  );

CREATE POLICY "Allow WhatsApp verification by LID"
  ON user_whatsapp_links FOR SELECT
  USING (whatsapp_lid IS NOT NULL AND verified_at IS NOT NULL);
