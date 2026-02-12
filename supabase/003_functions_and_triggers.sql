-- ============================================================
-- KYN App - Functions and Triggers
-- ============================================================

-- ==================== UTILITY FUNCTIONS ====================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ==================== AUTH TRIGGERS ====================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create free subscription on user signup
CREATE OR REPLACE FUNCTION create_subscription_for_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, whatsapp_messages_reset_at)
  VALUES (NEW.id, 'free', 'active', NOW());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_subscription_for_new_user();

-- ==================== UPDATED_AT TRIGGERS ====================

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER recurring_templates_updated_at
  BEFORE UPDATE ON recurring_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_category_budgets_updated_at
  BEFORE UPDATE ON category_budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== WHATSAPP FUNCTIONS ====================

-- Create transaction from WhatsApp message
CREATE OR REPLACE FUNCTION create_whatsapp_transaction(
  p_user_id UUID,
  p_type TEXT,
  p_amount TEXT,
  p_category TEXT,
  p_description TEXT,
  p_due_date DATE,
  p_status TEXT DEFAULT 'completed'
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_transaction_id UUID;
  v_whatsapp_verified BOOLEAN;
  v_category TEXT;
  v_cat_lower TEXT;
BEGIN
  -- Check if user has verified WhatsApp
  SELECT EXISTS (
    SELECT 1 FROM user_whatsapp_links
    WHERE user_id = p_user_id AND verified_at IS NOT NULL
  ) INTO v_whatsapp_verified;

  IF NOT v_whatsapp_verified THEN
    RETURN json_build_object('success', false, 'error', 'Usuario nao tem WhatsApp verificado');
  END IF;

  -- Normalize category
  v_cat_lower := lower(p_category);

  -- Map categories using LIKE for variations
  v_category := CASE
    WHEN v_cat_lower LIKE '%food%' OR v_cat_lower LIKE '%mercado%' OR v_cat_lower LIKE '%comida%' OR v_cat_lower LIKE '%alimenta%' THEN 'variable_food'
    WHEN v_cat_lower LIKE '%transport%' OR v_cat_lower LIKE '%uber%' OR v_cat_lower LIKE '%gas%' OR v_cat_lower LIKE '%combustivel%' THEN 'variable_transport'
    WHEN v_cat_lower LIKE '%hous%' OR v_cat_lower LIKE '%aluguel%' OR v_cat_lower LIKE '%moradia%' THEN 'fixed_housing'
    WHEN v_cat_lower LIKE '%util%' OR v_cat_lower LIKE '%luz%' OR v_cat_lower LIKE '%agua%' OR v_cat_lower LIKE '%energia%' THEN 'fixed_utilities'
    WHEN v_cat_lower LIKE '%subscri%' OR v_cat_lower LIKE '%assinatura%' OR v_cat_lower LIKE '%netflix%' OR v_cat_lower LIKE '%spotify%' THEN 'fixed_subscriptions'
    WHEN v_cat_lower LIKE '%personal%' OR v_cat_lower LIKE '%pessoal%' THEN 'fixed_personal'
    WHEN v_cat_lower LIKE '%tax%' OR v_cat_lower LIKE '%imposto%' THEN 'fixed_taxes'
    WHEN v_cat_lower LIKE '%credit%' OR v_cat_lower LIKE '%cartao%' THEN 'variable_credit'
    ELSE 'variable_other'
  END;

  INSERT INTO transactions (user_id, type, amount, category, description, due_date, status, source)
  VALUES (
    p_user_id,
    p_type::transaction_type,
    p_amount,
    v_category::expense_category,
    p_description,
    p_due_date,
    p_status::transaction_status,
    'whatsapp'
  )
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'message', 'Transacao criada com sucesso'
  );
END;
$$;

-- Increment WhatsApp message counter
CREATE OR REPLACE FUNCTION increment_whatsapp_message(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, messages_used INTEGER, messages_limit INTEGER)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_subscription RECORD;
  v_messages_limit INTEGER;
BEGIN
  PERFORM reset_whatsapp_messages_if_needed(p_user_id);

  SELECT * INTO v_subscription FROM subscriptions WHERE user_id = p_user_id;

  IF v_subscription.plan IN ('pro', 'pro_annual') THEN
    v_messages_limit := 999999;
  ELSE
    v_messages_limit := 30;
  END IF;

  IF v_subscription.whatsapp_messages_used >= v_messages_limit THEN
    RETURN QUERY SELECT FALSE, v_subscription.whatsapp_messages_used, v_messages_limit;
  ELSE
    UPDATE subscriptions
    SET whatsapp_messages_used = whatsapp_messages_used + 1
    WHERE user_id = p_user_id
    RETURNING whatsapp_messages_used INTO v_subscription.whatsapp_messages_used;

    RETURN QUERY SELECT TRUE, v_subscription.whatsapp_messages_used, v_messages_limit;
  END IF;
END;
$$;

-- Reset WhatsApp messages monthly
CREATE OR REPLACE FUNCTION reset_whatsapp_messages_if_needed(p_user_id UUID)
RETURNS TABLE(messages_used INTEGER, messages_limit INTEGER, needs_reset BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_subscription RECORD;
  v_messages_limit INTEGER;
BEGIN
  SELECT * INTO v_subscription FROM subscriptions WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan, status, whatsapp_messages_reset_at)
    VALUES (p_user_id, 'free', 'active', NOW())
    RETURNING * INTO v_subscription;
  END IF;

  IF v_subscription.plan IN ('pro', 'pro_annual') THEN
    v_messages_limit := 999999;
  ELSE
    v_messages_limit := 30;
  END IF;

  IF v_subscription.whatsapp_messages_reset_at < DATE_TRUNC('month', NOW()) THEN
    UPDATE subscriptions
    SET whatsapp_messages_used = 0, whatsapp_messages_reset_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_subscription;

    RETURN QUERY SELECT v_subscription.whatsapp_messages_used, v_messages_limit, TRUE;
  ELSE
    RETURN QUERY SELECT v_subscription.whatsapp_messages_used, v_messages_limit, FALSE;
  END IF;
END;
$$;

-- ==================== WHATSAPP TRANSACTION TRIGGERS ====================

-- Auto-increment WhatsApp counter on insert
CREATE OR REPLACE FUNCTION increment_whatsapp_on_transaction()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_plan TEXT;
  v_messages_used INTEGER;
  v_messages_limit INTEGER;
BEGIN
  IF NEW.source = 'whatsapp' THEN
    SELECT plan, whatsapp_messages_used,
      CASE WHEN plan IN ('pro', 'pro_annual') THEN 999999 ELSE 30 END
    INTO v_plan, v_messages_used, v_messages_limit
    FROM subscriptions WHERE user_id = NEW.user_id;

    IF v_plan = 'free' AND v_messages_used >= v_messages_limit THEN
      RAISE EXCEPTION 'WhatsApp message limit reached. Upgrade to Pro for unlimited messages.';
    END IF;

    UPDATE subscriptions SET
      whatsapp_messages_used = CASE
        WHEN whatsapp_messages_reset_at IS NULL OR
             DATE_TRUNC('month', whatsapp_messages_reset_at) < DATE_TRUNC('month', NOW())
        THEN 1
        ELSE whatsapp_messages_used + 1
      END,
      whatsapp_messages_reset_at = CASE
        WHEN whatsapp_messages_reset_at IS NULL OR
             DATE_TRUNC('month', whatsapp_messages_reset_at) < DATE_TRUNC('month', NOW())
        THEN NOW()
        ELSE whatsapp_messages_reset_at
      END
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_increment_whatsapp_on_transaction
  BEFORE INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION increment_whatsapp_on_transaction();

-- Auto-decrement WhatsApp counter on delete
CREATE OR REPLACE FUNCTION decrement_whatsapp_on_transaction_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.source = 'whatsapp' THEN
    UPDATE subscriptions
    SET whatsapp_messages_used = GREATEST(0, whatsapp_messages_used - 1)
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_decrement_whatsapp_on_transaction_delete
  BEFORE DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION decrement_whatsapp_on_transaction_delete();
