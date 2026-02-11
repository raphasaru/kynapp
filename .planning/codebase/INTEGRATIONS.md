# External Integrations

**Analysis Date:** 2026-02-11

## APIs & External Services

**Payment Processing:**
- Stripe - Payment and subscription management
  - SDK/Client: `stripe` npm package
  - Keys: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Webhook secret: `STRIPE_WEBHOOK_SECRET`
  - Purpose: Subscription billing (Pro monthly/annual), webhook event handling

**WhatsApp Messaging:**
- n8n - Low-code automation platform for WhatsApp integration
  - Purpose: Process WhatsApp messages, extract transaction data via AI, decrypt/encrypt with shared ENCRYPTION_KEY
  - Encryption key: `ENCRYPTION_KEY` (same base64 key used in app)
  - Webhook triggers: Incoming WhatsApp messages from verified user numbers
  - Output: Creates transactions in Supabase via API

## Data Storage

**Primary Database:**
- Supabase (PostgreSQL)
  - Project ID: `vonfsyszaxtbxeowelqu`
  - URL: `NEXT_PUBLIC_SUPABASE_URL=https://vonfsyszaxtbxeowelqu.supabase.co`
  - Client library: `@supabase/supabase-js`
  - Connection modes:
    - Anon key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-side, RLS-enforced queries)
    - Service key: `SUPABASE_SERVICE_ROLE_KEY` (server-side, for webhooks and internal endpoints)
  - Auth: Supabase Auth (magic links, email+password)
  - RLS: All tables filtered by `auth.uid() = user_id`

**File Storage:**
- Not detected (user avatars may be URLs stored as TEXT in profiles table)

**Caching:**
- Supabase real-time subscriptions via `@supabase/supabase-js`
- TanStack Query client-side caching

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Methods: Magic links (email), Email + password, Password recovery
  - Triggers: Auto-create profile + free subscription on signup via SQL trigger in `supabase/003_functions_and_triggers.sql`

**Sessions:**
- JWT tokens from Supabase
- Token storage: Browser local storage (via Supabase client SDK)
- Refresh: Automatic via Supabase client

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Not detected (console logging expected during development)

## CI/CD & Deployment

**Hosting:**
- Vercel (recommended for Next.js, not yet configured)
- Alternative: Other Node.js hosting (Railway, Render, AWS Amplify)

**CI Pipeline:**
- Not detected

**Deployment Secrets:**
- All env vars must be set in hosting platform
- Critical: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `ENCRYPTION_KEY` are server-only

## Environment Configuration

**Required env vars (from `.env.example`):**

**Public (safe to expose):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

**Private (must be kept secret):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ENCRYPTION_KEY`

**Stripe Price IDs:**
- `STRIPE_PRO_MONTHLY_PRICE_ID=price_1StGj0IYuOEaGzogx8HO8Hi1`
- `STRIPE_PRO_ANNUAL_PRICE_ID=price_1StGkmIYuOEaGzogcKuLfbqn`

**Secrets Location:**
- Development: `.env.local` (gitignored)
- Production: Hosting platform environment variables
- n8n WhatsApp: Separate n8n environment with `ENCRYPTION_KEY` shared value

## Webhooks & Callbacks

**Incoming Webhooks:**
- `STRIPE_WEBHOOK_SECRET` - Stripe event handler (subscription created, payment succeeded, payment failed, invoice paid, etc.)
  - Endpoint: Expected at `/api/webhooks/stripe` or similar
  - Events: Listen for `customer.subscription.created`, `customer.subscription.updated`, `invoice.payment_succeeded`, etc.

**Outgoing Webhooks:**
- Supabase auth triggers - Auto-create user profile on signup (internal SQL trigger, not HTTP webhook)

**n8n Integration (WhatsApp):**
- Incoming: WhatsApp messages to user's registered phone number
- Incoming trigger: n8n webhook from WhatsApp provider (e.g., Twilio)
- Outgoing: n8n makes API call to Supabase to create transaction
- Auth: Supabase service role key (or API key if separate endpoint)
- Payload: Encrypted transaction data (amount, description, category, etc.)

## Data Flow

**User Registration:**
1. User signs up via Supabase Auth (magic link or email+password)
2. Auth trigger creates `profiles` table entry
3. Auth trigger creates free-tier `subscriptions` entry
4. User redirected to onboarding flow

**Transaction via WhatsApp:**
1. User sends message to WhatsApp number (e.g., "200 comida" = expense 200 food category)
2. n8n webhook receives message
3. n8n parses message with AI, extracts transaction data
4. n8n encrypts sensitive fields (amount, description) with `ENCRYPTION_KEY` using AES-256-GCM
5. n8n calls Supabase API to insert transaction via service role key
6. App queries Supabase and decrypts fields for display

**Transaction via App:**
1. User creates transaction in Next.js form
2. React Hook Form validates with Zod
3. App encrypts sensitive fields with AES-256-GCM
4. Supabase client inserts via RLS-enforced anon key
5. App decrypts response for display
6. TanStack Query caches result

**Stripe Subscription:**
1. User clicks upgrade to Pro
2. App redirects to Stripe checkout (via Next.js API route)
3. User completes payment
4. Stripe sends webhook to app's `/api/webhooks/stripe`
5. Webhook handler verifies signature with `STRIPE_WEBHOOK_SECRET`
6. App updates `subscriptions` table to mark user as Pro
7. App may send confirmation email (service not detected)

## Integration Checklist

- [ ] Supabase project credentials configured
- [ ] Stripe test mode keys set up (development)
- [ ] Stripe live mode keys set up (production)
- [ ] Stripe webhook endpoint created and secret registered
- [ ] Encryption key generated: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- [ ] n8n instance deployed with WhatsApp integration
- [ ] n8n encryption key synced with app `ENCRYPTION_KEY`
- [ ] Supabase RLS policies applied (from `supabase/002_rls_policies.sql`)
- [ ] Database schema applied (from `supabase/001_schema.sql`)
- [ ] Triggers and functions applied (from `supabase/003_functions_and_triggers.sql`)
- [ ] Auth redirect URLs configured in Supabase dashboard
- [ ] Stripe redirect URLs configured in Supabase dashboard

---

*Integration audit: 2026-02-11*
