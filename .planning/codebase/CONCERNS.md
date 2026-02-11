# Codebase Concerns

**Analysis Date:** 2026-02-11

## Tech Debt

**Encryption Implementation Not Started:**
- Issue: Project specifies AES-256-GCM encryption for sensitive fields but no actual encryption code exists. Only `reference/encryption-schemas.ts` lists which fields need encryption.
- Files: `reference/encryption-schemas.ts`, database schema `supabase/001_schema.sql` (lines 44, 61-62, 97, 114, 124, 143, 153-156, 169-171, 183-184)
- Impact: Financial data (amounts, descriptions, balances) stored in plaintext in Postgres. LGPD/data protection commitments cannot be fulfilled. Compliance risk extremely high.
- Fix approach: Implement client-side AES-256-GCM encryption before MVP launch. Library recommendations: `TweetNaCl.js` or Node.js `crypto` module. Encrypt on write, decrypt on read at API layer. Store cipher + IV as TEXT. Requires key management strategy (user-derived or session-based).

**WhatsApp Integration Incomplete:**
- Issue: Database schema and triggers support WhatsApp transactions but actual n8n integration not in codebase. `create_whatsapp_transaction()` function exists but n8n workflow not provided.
- Files: `supabase/003_functions_and_triggers.sql` (lines 86-148), `supabase/002_rls_policies.sql` (lines 104-113, 226-249)
- Impact: Core differentiator (register transactions via WhatsApp) cannot be validated or tested. MVP cannot launch without this.
- Fix approach: Create n8n workflow that: accepts WhatsApp message, extracts amount/category/description via AI (Claude API or similar), calls `create_whatsapp_transaction()` via Supabase RPC, returns confirmation message. Workflow must handle image recognition for receipts.

**Frontend Code Missing:**
- Issue: Project is Next.js 15 app but no `app/` directory, components, pages, or client code found. Only reference configs and database schema exist.
- Files: No TypeScript components found (only in `reference/` directory)
- Impact: 95% of MVP cannot be implemented or tested. Team must build entire UI/UX from scratch.
- Fix approach: Create directory structure: `app/` for Next.js pages, `components/` for Shadcn/ui components, `lib/` for utilities, `hooks/` for React hooks. Use Shadcn/ui CLI to bootstrap (config at `reference/shadcn-config.json`). Reference design system at `design-system.html`.

## Known Bugs

**WhatsApp Verification Policy Overly Permissive:**
- Symptoms: Any unauthenticated user can read verification codes and LIDs via public RLS policies on `user_whatsapp_links`.
- Files: `supabase/002_rls_policies.sql` (lines 226-249)
- Trigger: Anyone knowing valid verification code format can enumerate user phone numbers and verified status.
- Workaround: None currently. Policies allow SELECT on verification codes without auth.
- Impact: Privacy leak. Phone numbers + WhatsApp LIDs exposed. Violates LGPD.

**Recurring Transaction Logic Not Implemented:**
- Symptoms: Database schema supports `is_recurring`, `recurring_day`, `recurring_group_id`, `recurring_end_date` but no function/trigger generates monthly instances automatically.
- Files: `supabase/001_schema.sql` (lines 93-96), `supabase/003_functions_and_triggers.sql` (no recurring generation function)
- Trigger: User creates recurring transaction → only one row inserted, no future instances generated
- Workaround: Manual monthly transaction creation
- Impact: Core feature (recurring expenses like rent/salary) non-functional. Dashboard calculations broken.

**Parcelamento (Installment) Logic Not Implemented:**
- Symptoms: Schema supports `installment_number`, `total_installments`, `parent_transaction_id` but no function calculates installment dates or tracks relationships.
- Files: `supabase/001_schema.sql` (lines 102-104)
- Trigger: User creates 12x parcelized transaction → only one row with parcel=1/12, no other 11 rows created
- Workaround: Manual parcel creation
- Impact: Credit card purchases cannot be split across months. FUNCIONALIDADES.md specifies this as MVP feature (section 5).

## Security Considerations

**RLS Policy: Insufficient Protection on `user_whatsapp_links`:**
- Risk: Public policies (lines 226-249 in 002_rls_policies.sql) allow anyone to read and update verification codes. Attacker can read a valid code, guess user ID, and verify their own phone as someone else's WhatsApp.
- Files: `supabase/002_rls_policies.sql` (lines 226-249), `supabase/001_schema.sql` (lines 204-213)
- Current mitigation: Database indexes none, rate limiting none, verification_expires_at set to 1 hour (weak).
- Recommendations: (1) Remove public SELECT/UPDATE policies. (2) Use service_role function to generate codes only. (3) Add rate limiting: max 3 code generation attempts per phone per 24h. (4) Add database-level rate limit or flag suspicious attempts.

**Missing CORS/API Security Headers:**
- Risk: No evidence of CORS, CSP, HSTS, or X-Frame-Options headers in codebase. Frontend not yet built but must implement security headers at Next.js middleware level.
- Files: No middleware found (frontend not built yet)
- Current mitigation: None detected
- Recommendations: Add Next.js middleware in `app/middleware.ts` to set security headers. Configure CORS to allow only `NEXT_PUBLIC_APP_URL`.

**Encryption Key Management Not Defined:**
- Risk: `.env.example` shows `ENCRYPTION_KEY` placeholder but no documentation on: (1) how to generate, (2) where to store in production, (3) how to rotate, (4) what happens on key loss (unrecoverable data).
- Files: `.env.example` (line 18), `reference/encryption-schemas.ts`
- Current mitigation: None. Key hardcoded in env file.
- Recommendations: Use Supabase Vault for key storage. Document key rotation strategy (archive old key, double-encrypt during migration). Implement key versioning in ciphertext.

**Stripe Webhook Signature Not Validated in Code:**
- Risk: Database supports service_role override (line 203-206 of 002_rls_policies.sql) but no API endpoint shown that validates webhook signature before processing. If webhook endpoint doesn't verify `stripe-signature` header, attacker can forge subscription updates.
- Files: No webhook endpoint found (frontend not built), `supabase/002_rls_policies.sql` (line 203-206)
- Current mitigation: None detected
- Recommendations: Implement Next.js API route `app/api/webhooks/stripe.ts` that: (1) validates `stripe-signature` header using Stripe SDK, (2) parses JSON body, (3) updates subscription via Supabase service role. Never trust unauthenticated webhook data.

**No Rate Limiting on WhatsApp Message Counter:**
- Risk: `increment_whatsapp_message()` and `increment_whatsapp_on_transaction()` (lines 151-179, 219-258 in 003_functions_and_triggers.sql) can be called repeatedly in same second by malicious client. No database-level rate limit prevents counter overflow or free plan abuse.
- Files: `supabase/003_functions_and_triggers.sql` (lines 151-179, 219-258)
- Current mitigation: None. Function doesn't check timestamp of last increment.
- Recommendations: Add `last_whatsapp_increment_at` TIMESTAMPTZ column to subscriptions table. Function checks: `IF EXTRACT(EPOCH FROM (NOW() - last_whatsapp_increment_at)) < 1 THEN RAISE EXCEPTION...`. Prevents bulk counter manipulation.

## Performance Bottlenecks

**No Database Indexes on High-Query Columns:**
- Problem: Transactions table searched by `user_id`, `due_date`, `category` but schema defines no indexes. Each dashboard load scans all rows.
- Files: `supabase/001_schema.sql` (no CREATE INDEX statements)
- Cause: Schema incomplete. Production queries will table-scan. With 10k+ users × 100+ transactions = 1M rows, queries timeout.
- Improvement path: Add indexes: `CREATE INDEX idx_transactions_user_id_due_date ON transactions(user_id, due_date DESC)`, `CREATE INDEX idx_transactions_user_id_category ON transactions(user_id, category)`, `CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id)`, `CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id)`. Benchmark with `EXPLAIN ANALYZE` on Supabase.

**RLS Policy Nested Subqueries:**
- Problem: `transaction_items` and `investment_history` RLS policies use EXISTS subqueries (lines 118-131, 171-177 of 002_rls_policies.sql). Each row filter triggers a subquery. With 100 items in a transaction, policy executes 100 JOINs.
- Files: `supabase/002_rls_policies.sql` (lines 118-131, 171-177)
- Cause: RLS design. Necessary for security but expensive.
- Improvement path: Add denormalized `user_id` column to `transaction_items` and `investment_history`. Change policy to `user_id = auth.uid()` (direct check, no subquery). Backfill existing rows with transaction's user_id via trigger.

**No Query Caching Strategy:**
- Problem: TanStack Query configured but no cache keys or stale-time defined (frontend not built). Dashboard will refetch all transactions on every focus. Network traffic = 1MB+ per page load.
- Files: Frontend not built
- Cause: Frontend missing
- Improvement path: In frontend React hooks, set TanStack Query options: `staleTime: 5*60*1000` (5 min), `cacheTime: 10*60*1000` (10 min), background refetch only on window focus after stale time.

## Fragile Areas

**Onboarding Progress Not Persisted Transactionally:**
- Files: `supabase/001_schema.sql` (lines 32-33), database trigger `supabase/003_functions_and_triggers.sql` (no trigger for onboarding)
- Why fragile: `onboarding_step` INTEGER column in profiles table but no function/trigger enforces state transitions or rollback. User can: (1) complete step 3, (2) connection drops, (3) click back, (4) complete step 2 again. State can become invalid (step 2 run twice).
- Safe modification: Create function `update_onboarding_step(step INT)` that validates: `NEW.step >= OLD.step OR step <= 1` (can only progress forward or reset). Wrap form submissions in try/catch that rolls back if any step fails.
- Test coverage: None (frontend not built). Must add tests: (1) step cannot go backwards, (2) step resets to 0 on logout, (3) incomplete onboarding redirects to onboarding page.

**WhatsApp Category Mapping Uses LIKE Fuzzy Matching:**
- Files: `supabase/003_functions_and_triggers.sql` (lines 117-127)
- Why fragile: `create_whatsapp_transaction()` maps user input to category via LIKE patterns: `IF v_cat_lower LIKE '%food%'...`. User message "I bought furniture" matches "food" (contains 'ood'). Error classification rate will be high. Falls back to `variable_other` but that defeats categorization purpose.
- Safe modification: Replace LIKE matching with: (1) LLM-based classification (call Claude API for category prediction + confidence score), (2) fuzzy string matching library (Levenshtein distance), or (3) predefined keyword list per category with >90% precision patterns. Test with 100 real user messages to validate accuracy before launch.
- Test coverage: None (n8n workflow not found).

**Recurring Transaction Generation Interval Not Enforced:**
- Files: `supabase/001_schema.sql` (lines 93-96)
- Why fragile: Schema says `recurring_day` but no `recurring_interval` enum. Assumes all recurrences are monthly. If feature needs weekly/biweekly later, schema change required. Also, month edge cases: day 31 in February not handled by schema, only mentioned in FUNCIONALIDADES.md (section 5). Function doesn't exist yet.
- Safe modification: Add `recurring_interval TEXT DEFAULT 'monthly' CHECK (recurring_interval IN ('weekly', 'biweekly', 'monthly', 'yearly'))`. Function logic: if `day_of_month = 31` and next month has 28 days, use day 28 (stored in function, not at DB level for flexibility).
- Test coverage: None (function not implemented).

## Scaling Limits

**WhatsApp Message Counter Reset Once Monthly:**
- Current capacity: 30 messages/month free, 999999 (unlimited) pro
- Limit: No ability to track usage per day or adjust limits per user. Bulk WhatsApp campaigns (e.g., marketing blast) consume entire month quota instantly. No granular rate limiting.
- Scaling path: Add `whatsapp_messages_reset_frequency TEXT DEFAULT 'monthly'` + `whatsapp_messages_daily_limit INT`. Modify `reset_whatsapp_messages_if_needed()` to reset based on frequency. Add `last_message_at TIMESTAMPTZ` to track consecutive calls. Implement token bucket algorithm if per-second limiting needed.

**Encryption Not Key-Versioned:**
- Current capacity: Single encryption key for all data
- Limit: If key compromised, all historical data unencrypted. If key lost, all data permanently unrecoverable.
- Scaling path: Add `encryption_key_version INT` to each encrypted field's row. Store multiple keys in Supabase Vault with versions. On rotate, mark old key with end_of_life timestamp. Background job re-encrypts old rows to new key over time.

**No Batch Processing for Recurring Transaction Generation:**
- Current capacity: Assuming no trigger exists, recurring generation must happen manually or via scheduled job
- Limit: 1M users × 100 recurring transactions each = 100M inserts per month. Single job cannot process in reasonable time.
- Scaling path: Implement Supabase `pg_cron` extension to run generation in hourly batches: `SELECT generate_recurring_transactions_for_hour(CURRENT_DATE)`. Process 1000 user batches per job. Add monitoring: log job duration, rows inserted, errors.

## Dependencies at Risk

**Stripe Price IDs Hardcoded in Reference File:**
- Risk: `reference/stripe-plans.ts` lists real Stripe price IDs but as plain strings. If package is published or exposed, these IDs could be harvested. Also, if Stripe test mode prices deleted, app breaks without clear error.
- Files: `reference/stripe-plans.ts` (lines 52, 68)
- Impact: If price IDs become invalid, checkout fails silently. No validation that price exists on Stripe backend.
- Migration plan: (1) Move price IDs to environment variables only (remove from code). (2) On app startup, validate all price IDs exist in Stripe via API call. (3) Add error page if validation fails (e.g., "Contact support, payment unavailable").

**PostgreSQL LIKE Pattern Matching Not Reliable for Category Mapping:**
- Risk: `create_whatsapp_transaction()` function relies on PostgreSQL LIKE operator for category inference. Not portable to other databases. Pattern order matters: if "transport" checked before "sport", "sport" matches transport incorrectly.
- Files: `supabase/003_functions_and_triggers.sql` (lines 117-127)
- Impact: Category misclassification. User loses trust in WhatsApp feature.
- Migration plan: Extract category mapping to application layer (n8n workflow or Node.js function). Use LLM API call or curated keyword lists. Return category + confidence score. Allow user to correct if confidence < 70%.

**No Fallback for Missing Encryption Key:**
- Risk: If `ENCRYPTION_KEY` env var missing, app crashes or encrypts with undefined key. No validation.
- Files: Frontend not built (concern is in API/middleware layer)
- Impact: Unencrypted data written or app unavailable.
- Migration plan: On app startup, throw error if ENCRYPTION_KEY not set and NODE_ENV=production. Add unit test checking key presence.

## Missing Critical Features

**No Recurring Transaction Generation Function:**
- Problem: FUNCIONALIDADES.md section 5 specifies recurring transactions as MVP. Database schema supports it. But no SQL function generates monthly instances. Feature is 0% implemented.
- Blocks: Cannot test recurring transaction UI, cannot verify monthly calculations, MVP deadline at risk.

**No Parcelamento (Installment) Generation:**
- Problem: FUNCIONALIDADES.md section 5 specifies parcelamento (up to 48x). Database schema supports it. But no SQL function creates N installment rows. Feature is 0% implemented.
- Blocks: Cannot split credit card purchases. Dashboard calculations wrong (shows 1 transaction instead of 12 months of payments).

**No WhatsApp Integration (n8n Workflow):**
- Problem: FUNCIONALIDADES.md section 13 specifies WhatsApp registration as main differentiator. Database schema + RLS policies exist. But n8n workflow not in codebase. Feature is 0% implemented.
- Blocks: Cannot validate core value prop. User testing impossible. MVP cannot launch.

**No Frontend (React/Next.js):**
- Problem: Entire UI missing. No pages, components, hooks, or layout. CLAUDE.md specifies Next.js 15 + Shadcn/ui but codebase has 0 React code.
- Blocks: 95% of MVP unbuilt.

**No Encryption Implementation:**
- Problem: Project commits to AES-256-GCM encryption in FUNCIONALIDADES.md section 19 and design spec. CLAUDE.md lists "Segurança: Criptografia" as Phase 1. No code exists.
- Blocks: Cannot fulfill LGPD compliance. Data not secure. MVP cannot launch.

## Test Coverage Gaps

**Database Schema Not Tested for Data Integrity:**
- What's not tested: (1) Foreign key cascades work correctly, (2) Check constraints enforced (e.g., `due_day` 1-31), (3) Enums reject invalid values, (4) Triggers fire in correct order, (5) RLS policies block unauthorized access
- Files: `supabase/001_schema.sql`, `supabase/002_rls_policies.sql`, `supabase/003_functions_and_triggers.sql`
- Risk: Silent data corruption. RLS breach could expose user data to other users.
- Priority: **CRITICAL** - must test before any user data enters system

**RLS Policies Not Tested for Bypass:**
- What's not tested: (1) Authenticated user cannot read other users' data, (2) Service role override works (Stripe webhooks), (3) Public policies only expose what intended
- Files: `supabase/002_rls_policies.sql`
- Risk: Privacy violation. Users can access each other's financial data.
- Priority: **CRITICAL** - must test before MVP launch

**Encryption Functions Not Tested:**
- What's not tested: (1) Encrypt/decrypt round-trip preserves data, (2) Invalid keys throw error, (3) Decryption handles corrupted ciphertext, (4) Performance acceptable (encrypt 1000 amounts in <1s)
- Files: `reference/encryption-schemas.ts` (no implementation)
- Risk: Data loss. Silent decryption failures. Performance degradation.
- Priority: **CRITICAL** - required before MVP

**WhatsApp Category Mapping Not Validated:**
- What's not tested: Accuracy on real user messages. Current LIKE-based matching likely has <70% precision.
- Files: `supabase/003_functions_and_triggers.sql` (lines 117-127)
- Risk: User frustration. Category misclassification destroys dashboard insights.
- Priority: **HIGH** - must validate with 100+ test messages before launch

**No Integration Tests for Transaction Workflows:**
- What's not tested: (1) Create planned transaction → mark completed → verify saldo updated, (2) Create recurring transaction → verify monthly instances generated, (3) Create parcelized transaction → verify all 12 rows created, (4) WhatsApp transaction → verify category inference + message counter incremented
- Files: All database files (no tests found)
- Risk: Hidden bugs. Workflows fail in production.
- Priority: **HIGH** - critical workflows must be tested

---

*Concerns audit: 2026-02-11*
