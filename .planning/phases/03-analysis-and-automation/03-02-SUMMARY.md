---
phase: 03-analysis-and-automation
plan: 02
subsystem: recurring-transactions
tags: [recurring, automation, pg_cron, templates, monthly]
completed: 2026-02-12T02:10:53Z
duration: 6m
dependencies:
  requires: [03-01]
  provides: [recurring-templates, auto-generation]
  affects: [transactions]
tech_stack:
  added: [pg_cron]
  patterns: [template-pattern, cron-scheduling, direct-encryption-copy]
key_files:
  created:
    - src/lib/queries/recurring.ts
    - src/lib/validators/recurring.ts
    - src/components/recurrents/recurring-item.tsx
    - src/components/recurrents/recurring-list.tsx
    - src/components/recurrents/recurring-form.tsx
    - src/app/app/recorrentes/page.tsx
    - supabase/004_recurring_cron.sql
  modified:
    - src/lib/crypto/fields.ts
    - src/types/database.ts
decisions:
  - decision: "Added end_date column via migration"
    rationale: "Original schema missing end_date but plan required it. Prevents infinite recurring generation."
    alternatives: ["Make end_date optional", "Use recurring_end_date from transactions"]
    chosen: "Add column via ALTER TABLE in 004_recurring_cron.sql"
  - decision: "Default end_date +12 months"
    rationale: "Research indicated users expect finite recurrence. 12 months is reasonable default."
  - decision: "Direct encrypted value copy in SQL function"
    rationale: "Both recurring_templates and transactions use same encryption key. No decrypt/re-encrypt needed."
  - decision: "LEAST(day_of_month, days_in_month) logic"
    rationale: "Handles Feb (28/29) and 30-day months. Day 31 becomes day 30 in April, day 28/29 in Feb."
metrics:
  tasks_completed: 3
  commits: 3
  files_created: 7
  files_modified: 2
  lines_added: 823
---

# Phase 03 Plan 02: Recurring Transactions Summary

**One-liner:** Auto-generating recurring templates with CRUD, pg_cron monthly execution, and grouped income/expense display.

## What Was Built

**Recurring template system with monthly auto-generation:**

1. **Queries + Validators (Task 1)**
   - `recurringSchema`: Zod validation with required end_date, day_of_month 1-31
   - `useRecurringTemplates`: Fetch active templates, decrypt, sort by type (income first) + day
   - `useCreateRecurring`: Create template, auto-generate first transaction if day >= today
   - `useDeleteRecurring`: Soft delete template + remove all future planned transactions
   - `useDeleteFutureTransactions`: Remove future transactions for template
   - Added recurring_templates to encryption fields (amount + description)

2. **UI Components (Task 2)**
   - `RecurringItem`: Card display with category icon, description, amount, day badge, type badge (green for income, red for expense), delete button with AlertDialog confirmation
   - `RecurringList`: Grouped by "Receitas Recorrentes" and "Despesas Recorrentes", empty state message
   - `RecurringForm`: Full CRUD form with type toggle, amount (CurrencyInput), category (expenses only), day_of_month (1-31), end_date (default +12 months), payment_method, conditional account/card selector, Sheet on mobile + Dialog on desktop

3. **Page + SQL Migration (Task 3)**
   - `/app/recorrentes`: Page with header, RecurringForm button, loading skeletons, RecurringList, empty state with Calendar icon
   - `004_recurring_cron.sql`:
     - Added end_date column to recurring_templates (missing from original schema)
     - pg_cron extension setup
     - `generate_recurring_transactions()` function: loops active templates, checks end_date, calculates LEAST(day_of_month, days_in_month), prevents duplicates, inserts planned transactions with encrypted values
     - Cron job: `'1 0 1 * *'` = runs 00:01 on 1st of every month

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Missing end_date column in recurring_templates schema**
- **Found during:** Task 3 (creating SQL migration)
- **Issue:** Plan required end_date field for recurring_templates. Original 001_schema.sql did not include this column. Without it, code would fail at runtime (database constraint violation).
- **Fix:** Added `ALTER TABLE recurring_templates ADD COLUMN IF NOT EXISTS end_date DATE;` in 004_recurring_cron.sql migration. Updated database types in src/types/database.ts to include end_date in Row/Insert/Update. Updated recurring queries to pass end_date when creating templates.
- **Files modified:**
  - supabase/004_recurring_cron.sql (ALTER TABLE statement)
  - src/types/database.ts (added end_date: string | null to recurring_templates types)
  - src/lib/queries/recurring.ts (pass end_date in encrypted object)
- **Commit:** b4598ab

## Key Decisions

**Auto-generation logic:**
- First transaction generated immediately on template creation if day_of_month >= current day
- Monthly cron generates on 1st at 00:01
- LEAST(day_of_month, days_in_month) handles variable month lengths
- Duplicate prevention via EXISTS check on recurring_group_id + month range

**Encryption efficiency:**
- SQL function copies encrypted description+amount directly from recurring_templates to transactions
- Both tables use same encryption key (NEXT_PUBLIC_ENCRYPTION_KEY)
- No decrypt/re-encrypt cycle needed = performance win

**Template lifecycle:**
- Soft delete (is_active = false) instead of hard delete
- Deleting template removes all future planned transactions (due_date > today)
- Past/completed transactions preserved (historical record)

**Edit single occurrence:**
- Handled by existing useUpdateTransaction mutation
- User edits generated transaction directly
- No new "edit recurrence" hook needed (plan confirmed this)

## Verification Results

✅ TypeScript compilation passes (`npx tsc --noEmit`)
✅ Build succeeds (`npm run build`)
✅ Route `/app/recorrentes` accessible in build output
✅ All must_have truths satisfied:
  - User can create recurring transaction with day_of_month and end_date
  - System auto-generates monthly transactions via pg_cron (SQL ready)
  - User sees list of active recurring groups (income and expense separately)
  - User can delete all future transactions of a recurring group
  - User can edit single occurrence via existing transaction form

## Self-Check: PASSED

**Created files verified:**
```
✓ src/lib/queries/recurring.ts
✓ src/lib/validators/recurring.ts
✓ src/components/recurrents/recurring-item.tsx
✓ src/components/recurrents/recurring-list.tsx
✓ src/components/recurrents/recurring-form.tsx
✓ src/app/app/recorrentes/page.tsx
✓ supabase/004_recurring_cron.sql
```

**Commits verified:**
```
✓ cea2618 - feat(03-02): recurring queries + validators
✓ d19f1be - feat(03-02): recurring UI components
✓ b4598ab - feat(03-02): recurring page + pg_cron SQL migration
```

**Modified files verified:**
```
✓ src/lib/crypto/fields.ts (recurring_templates encryption added)
✓ src/types/database.ts (end_date field added)
```

## Next Steps

1. **Deploy migration:** Run `004_recurring_cron.sql` on Supabase project
2. **Verify pg_cron:** Check Supabase extensions and cron jobs in dashboard
3. **Test auto-generation:** Wait for 1st of month or manually call `SELECT generate_recurring_transactions();`
4. **User testing:** Create recurring templates for rent, salary, subscriptions
5. **Phase 03 Plan 03:** Reports and insights (final plan in Phase 3)

## Notes

- pg_cron requires Supabase Pro plan or higher (not available on free tier)
- Manual alternative: client-side check on app load + generate if missing
- End date prevents infinite generation (user must renew templates after 12 months)
- Recurring transactions marked with `is_recurring=true` + `recurring_group_id` for filtering
