-- ============================================================
-- 004_recurring_cron.sql
-- Recurring Transaction Auto-generation
-- ============================================================
-- This migration adds:
-- 1. end_date column to recurring_templates (missing from 001_schema.sql)
-- 2. pg_cron extension for scheduled jobs
-- 3. Function to generate recurring transactions
-- 4. Cron job to run monthly on 1st at 00:01
-- ============================================================

-- Add end_date column to recurring_templates
-- (This field was in the plan but missing from original schema)
ALTER TABLE recurring_templates
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to generate recurring transactions
-- Runs on 1st of every month via cron job
-- Copies encrypted description+amount directly (no decrypt/re-encrypt)
CREATE OR REPLACE FUNCTION generate_recurring_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_record RECORD;
  target_date DATE;
  days_in_month INTEGER;
  already_exists BOOLEAN;
BEGIN
  -- Loop through all active recurring templates
  FOR template_record IN
    SELECT *
    FROM recurring_templates
    WHERE is_active = true
  LOOP
    -- Check if end_date has passed (if set)
    IF template_record.end_date IS NOT NULL AND template_record.end_date < DATE_TRUNC('month', CURRENT_DATE)::DATE THEN
      CONTINUE; -- Skip expired templates
    END IF;

    -- Calculate target date using LEAST(day_of_month, last_day_of_month)
    -- This handles Feb (28/29 days) and 30-day months
    days_in_month := EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE);
    target_date := DATE_TRUNC('month', CURRENT_DATE)::DATE + (LEAST(template_record.day_of_month, days_in_month) - 1);

    -- Check if transaction already exists for this month
    SELECT EXISTS(
      SELECT 1
      FROM transactions
      WHERE recurring_group_id = template_record.id
        AND due_date >= DATE_TRUNC('month', CURRENT_DATE)::DATE
        AND due_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::DATE
    ) INTO already_exists;

    -- Only insert if doesn't exist
    IF NOT already_exists THEN
      INSERT INTO transactions (
        user_id,
        description,
        amount,
        type,
        category,
        custom_category_id,
        status,
        due_date,
        is_recurring,
        recurring_day,
        recurring_group_id,
        payment_method,
        bank_account_id,
        credit_card_id
      ) VALUES (
        template_record.user_id,
        template_record.description, -- Already encrypted TEXT
        template_record.amount, -- Already encrypted TEXT
        template_record.type,
        template_record.category,
        template_record.custom_category_id,
        'planned',
        target_date,
        true,
        template_record.day_of_month,
        template_record.id,
        template_record.payment_method,
        template_record.bank_account_id,
        template_record.credit_card_id
      );
    END IF;
  END LOOP;
END;
$$;

-- Schedule cron job to run at 00:01 on the 1st of every month
-- Cron format: minute hour day month weekday
-- '1 0 1 * *' = 00:01 on day 1 of every month
SELECT cron.schedule(
  'generate-recurring-transactions',
  '1 0 1 * *',
  $$SELECT generate_recurring_transactions();$$
);

-- Add comment explaining the cron job
COMMENT ON FUNCTION generate_recurring_transactions() IS 'Auto-generates monthly transactions from recurring templates. Runs via pg_cron on 1st of each month at 00:01. Copies encrypted description+amount directly (no decrypt/re-encrypt needed since both tables use same encryption key).';
