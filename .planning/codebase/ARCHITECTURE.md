# Architecture

**Analysis Date:** 2026-02-11

## Pattern Overview

**Overall:** Layered Next.js 15 App Router with Supabase backend + n8n integration

**Key Characteristics:**
- Client-server separation (Next.js frontend → Supabase backend + REST APIs)
- Row Level Security (RLS) enforced at database layer for multi-tenant isolation
- Encrypted-at-rest fields for sensitive financial data (AES-256-GCM)
- Webhook-driven subscription lifecycle (Stripe events)
- Separate n8n microservice for WhatsApp bot + IA transaction parsing
- Progressive Web App (PWA) with offline-first caching strategy

## Layers

**Presentation (Client):**
- Purpose: React components with Tailwind CSS + Shadcn/ui (new-york style)
- Location: `app/` directory (Next.js App Router)
- Contains: Pages, layouts, UI components, forms (React Hook Form + Zod validation)
- Depends on: Supabase client, TanStack Query for state sync, Recharts for visualizations
- Used by: Web browsers, mobile PWA installers (iOS/Android)

**Application Logic (API):**
- Purpose: Server-side handlers, business logic, webhooks, RPC functions
- Location: `app/api/` (Next.js API routes)
- Contains: Route handlers for CRUD, Stripe webhooks, WhatsApp callbacks, subscription management
- Depends on: Supabase JS client (server-side), node-cron for recurring transaction generation
- Used by: Frontend (fetch), webhooks (Stripe, n8n), scheduled tasks

**Database (Data):**
- Purpose: Single source of truth for financial data + authentication
- Location: Supabase PostgreSQL (project: `vonfsyszaxtbxeowelqu`)
- Contains: 13 tables (profiles, transactions, bank_accounts, credit_cards, etc.)
- Depends on: Auth service (Supabase Auth), encryption keys (stored in env)
- Used by: Frontend queries, API routes, scheduled functions

**Integration Layer (External):**
- Purpose: Manage payment processing, WhatsApp bot, external APIs
- Location: Stripe SDK, n8n webhooks, email service (Supabase Mail)
- Contains: Price configs (`reference/stripe-plans.ts`), n8n workflow definitions
- Depends on: Stripe API keys, n8n webhook URL, SMTP credentials
- Used by: Subscription flows, WhatsApp transaction creation, confirmation emails

## Data Flow

**User Signup & Onboarding:**

1. User visits landing page → Sign up (magic link or email/password)
2. Supabase `auth.users` created → triggers `handle_new_user()` function
3. Function auto-inserts `profiles` row + `subscriptions` row (plan='free')
4. User redirected to onboarding (4 steps: welcome, first transaction, bank account, WhatsApp)
5. `profiles.onboarding_completed = true` when wizard finishes

**Transaction Creation (In-App):**

1. User fills form (description, amount, category, date, account/card, status)
2. React Hook Form validates with Zod schema (amount format, required fields)
3. Client encrypts sensitive fields (amount, description) using `crypto-js` AES-256-GCM
4. POST to `/api/transactions` with encrypted payload
5. Server verifies `auth.uid()` matches transaction `user_id`
6. Row inserted into `transactions` table with RLS enforcing `user_id = auth.uid()`
7. TanStack Query refetches transaction list (invalidate cache)
8. Dashboard updates real-time with new balance

**Transaction Creation (WhatsApp):**

1. User sends message to WhatsApp bot (n8n service)
2. n8n IA parses message: "Gastei 50 no uber" → amount=50, type=expense, category=variable_transport
3. n8n calls Supabase function `create_whatsapp_transaction()` with extracted data
4. Function checks `user_whatsapp_links.verified_at IS NOT NULL` (auth guard)
5. Inserts transaction with `source='whatsapp'` and `status='planned'`
6. Increments `subscriptions.whatsapp_messages_used`
7. If limit exceeded (30 for Free, unlimited for Pro), sends upgrade suggestion back
8. User sees new transaction in app next refresh

**Recurring Transaction Generation:**

1. System runs daily scheduled task (or on first access of day)
2. Query all `recurring_templates` where `is_active=true`
3. For each template, check if transaction for this month/day already exists
4. If not, insert new transaction copying template data (amount, category, payment method)
5. Seed transaction `due_date` based on template `day_of_month` (or last day if 31st doesn't exist)
6. Transaction created with `is_recurring=true`, `recurring_group_id`, `recurring_day`
7. User sees in Dashboard under current month

**Subscription Lifecycle (Stripe):**

1. User clicks "Upgrade to Pro" → Stripe checkout session
2. Stripe redirects to success URL after payment
3. Webhook event `charge.succeeded` → POST to `/api/webhooks/stripe`
4. Handler upserts `subscriptions` row: plan='pro', stripe_customer_id, stripe_subscription_id
5. User's subsequent queries now show Pro features enabled
6. Monthly renewal: Stripe sends renewal event, handler updates `current_period_end`
7. Cancellation: `customer.subscription.deleted` event → plan reverts to 'free'

**Reporting & Analysis:**

1. Dashboard loads transactions for selected month (from `due_date`)
2. Calculates: total income (type=income), total expenses (type=expense), balance
3. Filters by: status (planned vs completed), type, account, card
4. Charts (Recharts) render: expense by category (pie), monthly trend (bar), budget progress (stacked bar)
5. Uses `transactions.category` + `category_budgets.monthly_budget` to compute variance
6. All data filtered by RLS: only user's own transactions visible

**State Management:**

- TanStack Query manages server state (transactions, accounts, subscriptions)
- React Context for UI state (selected month, filter toggles, modal open/close)
- Local storage for onboarding progress, PWA install prompt
- Encrypted fields decrypted on client after fetch (transparent to components)

## Key Abstractions

**Transaction Domain:**
- Purpose: Represent any money movement (income/expense, recurring/one-time, planned/completed)
- Examples: `transactions` table, `/api/transactions` routes, `<TransactionForm />` component
- Pattern: CRUD operations with encryption middleware, RLS enforced at query level

**Account Domain:**
- Purpose: Represent user's bank accounts + credit cards
- Examples: `bank_accounts`, `credit_cards` tables, `/api/accounts` routes
- Pattern: Hierarchical (profile → multiple accounts → transactions linked to account)

**Subscription Domain:**
- Purpose: Track user's plan tier + WhatsApp usage limits
- Examples: `subscriptions` table, Stripe integration, `/api/webhooks/stripe`
- Pattern: Single subscription per user, updated via webhook events

**Recurring Domain:**
- Purpose: Template-based transaction generation
- Examples: `recurring_templates` table, scheduled job, `/api/recurring/generate`
- Pattern: Template stores rules, job instantiates transactions monthly

**Encryption:**
- Purpose: Protect PII (amounts, descriptions) from unauthorized access
- Examples: `transactions.amount`, `bank_accounts.balance`, `category_budgets.monthly_budget`
- Pattern: Encrypt before INSERT, decrypt after SELECT (via middleware)

## Entry Points

**Web App (User-facing):**
- Location: `app/page.tsx` (landing), `app/(auth)/login` (login), `app/(app)/dashboard` (main)
- Triggers: Browser navigation, Next.js routing
- Responsibilities: Render UI, validate forms, call APIs, manage user interactions

**API Routes (Server-side):**
- Location: `app/api/[feature]/route.ts` (e.g., `app/api/transactions/route.ts`)
- Triggers: Client fetch, webhooks (Stripe), cron jobs
- Responsibilities: Auth check, business logic, database writes, response formatting

**Webhook Handlers:**
- Location: `app/api/webhooks/stripe` (Stripe events), callback endpoints for n8n
- Triggers: External services (Stripe, n8n)
- Responsibilities: Validate webhook signature, update database, send notifications

**Scheduled Jobs:**
- Location: `/app/api/cron/generate-recurring` or similar
- Triggers: Daily (node-cron or Vercel Crons)
- Responsibilities: Generate recurring transactions, reset WhatsApp counters, cleanup old data

**n8n Workflows:**
- Location: Hosted on n8n cloud, triggered by WhatsApp incoming messages
- Triggers: WhatsApp message from verified user
- Responsibilities: Parse IA, extract transaction data, call Supabase function

## Error Handling

**Strategy:** Layered validation + graceful degradation

**Patterns:**

- **Client-side:** Zod schema validation on form submit → toast error to user
- **Server-side:**
  - Auth guard: `if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`
  - Business logic guard: `if (amount <= 0) return error('Invalid amount')`
  - DB constraint check: Foreign key violations caught, returned as 400 Bad Request
- **Database:**
  - RLS policies reject unauthorized access silently (Supabase returns 0 rows, not error)
  - Triggers validate enum values, date ranges, cascade deletions
- **API:**
  - Stripe webhook signature verification before processing
  - n8n sends error back to user via WhatsApp if transaction creation fails
  - TanStack Query automatic retry with exponential backoff

## Cross-Cutting Concerns

**Logging:** Console logs on dev, structured logs to Supabase `audit_logs` table on prod (future). Track: auth events, transaction creates, subscription changes, API errors.

**Validation:**
- Forms: Zod schema (client + server)
- Database: CHECK constraints on enums and ranges
- Auth: Supabase RLS policies (database-level)

**Authentication:**
- Supabase Auth (magic link or email/password)
- JWT token stored in httpOnly cookie
- All API routes check `auth.user()` before accessing private data

**Encryption:**
- Client-side: `crypto-js` AES-256-GCM encrypt before POST
- Server-side: Decrypt after SELECT using encryption key from env
- Fields: `reference/encryption-schemas.ts` lists all encrypted fields

**Rate Limiting:**
- WhatsApp: 30 msgs/month (Free) tracked in `subscriptions.whatsapp_messages_used`
- API: Future Vercel Rate Limit middleware to prevent abuse

---

*Architecture analysis: 2026-02-11*
