# Architecture Research

**Domain:** Personal Finance PWA
**Researched:** 2026-02-11
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Landing  │  │Dashboard │  │ Budget   │  │ Reports  │     │
│  │  Page    │  │  (app)   │  │ (app)    │  │  (app)   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │              │              │           │
├───────┴─────────────┴──────────────┴──────────────┴───────────┤
│                    Business Logic Layer                       │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ TanStack Query (Client State + Cache)                │      │
│  │  - Server state management                           │      │
│  │  - Optimistic updates                                │      │
│  │  - Automatic refetching                              │      │
│  └────────────────────┬────────────────────────────────┘      │
│                       │                                        │
│  ┌────────────────────┴─────────────────────────────┐         │
│  │ Supabase Client Utilities                         │         │
│  │  - Server Component Client (RSC)                  │         │
│  │  - Client Component Client (Browser)              │         │
│  │  - Middleware Proxy (Token Refresh)               │         │
│  └────────────────────┬──────────────────────────────┘        │
│                       │                                        │
├───────────────────────┴────────────────────────────────────────┤
│                   Encryption Layer                             │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ AES-256-GCM Utilities (Web Crypto API)              │       │
│  │  - Encrypt before write                             │       │
│  │  - Decrypt after read                               │       │
│  │  - Shared key (MVP) → Per-user key (Phase 4)        │       │
│  └────────────────────┬─────────────────────────────────┘      │
│                       │                                         │
├───────────────────────┴─────────────────────────────────────────┤
│                    Data Layer (Supabase)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │PostgreSQL│  │   Auth   │  │Realtime  │  │ Storage  │       │
│  │   +RLS   │  │          │  │(future)  │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
├──────────────────────────────────────────────────────────────────┤
│              External Integrations Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Stripe   │  │   n8n    │  │ Service  │                      │
│  │(Billing) │  │(WhatsApp)│  │  Worker  │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Landing Page | Marketing, public routes (/, /pricing, /privacy) | App Router public routes, no auth |
| Dashboard App | Authenticated app interface | App Router protected routes with layouts |
| TanStack Query | Server state, cache, optimistic updates | React Query hooks + queryClient |
| Supabase Clients | Database access, auth, RLS enforcement | Utility functions per execution context |
| Middleware | Token refresh, cookie management | Next.js middleware.ts |
| Encryption Utils | Encrypt/decrypt financial data | Web Crypto API (browser + edge) |
| PostgreSQL + RLS | Data persistence, row-level security | Supabase managed Postgres |
| Stripe | Subscription billing, webhooks | Stripe SDK + webhook handlers |
| n8n | WhatsApp bot integration | External service, webhook endpoint |
| Service Worker | PWA offline capability, caching | Serwist (Webpack required) |

## Recommended Project Structure

```
kynapp/
├── app/                          # Next.js 15 App Router
│   ├── (marketing)/              # Route group: public pages
│   │   ├── layout.tsx            # Landing layout (no sidebar)
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── pricing/
│   │   │   └── page.tsx          # /pricing
│   │   └── privacy/
│   │       └── page.tsx          # /privacy, /terms
│   ├── (auth)/                   # Route group: auth pages
│   │   ├── login/
│   │   │   └── page.tsx          # /login
│   │   ├── signup/
│   │   │   └── page.tsx          # /signup
│   │   └── reset-password/
│   │       └── page.tsx          # /reset-password
│   ├── (app)/                    # Route group: authenticated app
│   │   ├── layout.tsx            # App layout (sidebar/bottom nav)
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # /dashboard
│   │   │   └── _components/      # Private folder (dashboard-specific)
│   │   ├── budget/
│   │   │   └── page.tsx          # /budget
│   │   ├── wallet/
│   │   │   └── page.tsx          # /wallet
│   │   ├── reports/
│   │   │   └── page.tsx          # /reports
│   │   ├── settings/
│   │   │   ├── page.tsx          # /settings
│   │   │   ├── subscription/
│   │   │   ├── whatsapp/
│   │   │   └── categories/
│   │   └── onboarding/
│   │       └── page.tsx          # /onboarding (wizard)
│   ├── api/                      # API Routes
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   │   └── route.ts      # POST /api/webhooks/stripe
│   │   │   └── n8n/
│   │   │       └── route.ts      # POST /api/webhooks/n8n
│   │   └── cron/
│   │       └── generate-recurring/
│   │           └── route.ts      # Cron job for recurring transactions
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   └── global-error.tsx          # Global error boundary
├── components/                   # Shared React components
│   ├── ui/                       # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── sheet.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── bottom-nav.tsx
│   │   └── header.tsx
│   └── features/                 # Feature-specific shared components
│       ├── transaction-form.tsx
│       ├── category-badge.tsx
│       └── month-selector.tsx
├── lib/                          # Core utilities
│   ├── supabase/
│   │   ├── client.ts             # Client Component client
│   │   ├── server.ts             # Server Component client
│   │   └── middleware.ts         # Middleware client (token refresh)
│   ├── encryption/
│   │   ├── crypto.ts             # AES-GCM encrypt/decrypt
│   │   └── field-mapper.ts       # Maps encrypted fields to tables
│   ├── queries/                  # TanStack Query hooks
│   │   ├── use-transactions.ts
│   │   ├── use-bank-accounts.ts
│   │   ├── use-budget.ts
│   │   └── ...
│   ├── actions/                  # Server Actions
│   │   ├── transactions.ts
│   │   ├── bank-accounts.ts
│   │   └── ...
│   ├── stripe/
│   │   ├── client.ts             # Stripe SDK setup
│   │   └── webhook.ts            # Webhook signature verification
│   ├── validations/              # Zod schemas
│   │   ├── transaction.ts
│   │   ├── bank-account.ts
│   │   └── ...
│   └── utils/                    # General utilities
│       ├── format-currency.ts
│       ├── date-helpers.ts
│       └── ...
├── reference/                    # Reference data (no imports from app code)
│   ├── categories.ts             # Category labels & icons
│   ├── encryption-schemas.ts     # Fields to encrypt
│   └── stripe-plans.ts           # Stripe price IDs
├── types/                        # TypeScript types
│   ├── database.ts               # Supabase generated types
│   ├── transactions.ts
│   └── ...
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── icons/                    # PWA icons
│   └── sw.js                     # Service worker (generated by Serwist)
├── supabase/                     # Database schema (migrations)
│   ├── 001_schema.sql
│   ├── 002_rls_policies.sql
│   └── 003_functions_and_triggers.sql
├── middleware.ts                 # Next.js middleware (token refresh)
├── next.config.ts                # Next.js config (PWA, Webpack for Serwist)
└── package.json
```

### Structure Rationale

- **Route groups (marketing), (auth), (app):** Organize routes by context without affecting URLs. Enables different layouts (landing vs app).
- **Private folders `_components/`:** Route-specific components that don't need global sharing. Prevents routing conflicts.
- **lib/ vs components/:** lib/ = logic/utilities, components/ = UI. Clear separation of concerns.
- **lib/queries/ vs lib/actions/:** queries/ = TanStack Query hooks (read), actions/ = Server Actions (write). Follows Next.js 15 data fetching patterns.
- **reference/:** Static reference data. Separate from application logic to prevent circular dependencies.
- **Supabase clients split by context:** Different clients for Server Components (RSC), Client Components (browser), Middleware (cookie management).

## Architectural Patterns

### Pattern 1: Server Component First, Client When Needed

**What:** Default to Server Components for data fetching. Use Client Components only for interactivity (forms, clicks, state).

**When to use:** Every new page/component. Start with Server Component, add "use client" only when you need browser APIs or React hooks.

**Trade-offs:**
- Pros: Smaller bundles, faster initial load, direct database access, no client state complexity
- Cons: Can't use useState, useEffect, or browser APIs

**Example:**
```typescript
// app/(app)/dashboard/page.tsx - Server Component (default)
import { createClient } from '@/lib/supabase/server'
import { MonthSelector } from '@/components/features/month-selector'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('due_date', { ascending: false })

  return (
    <div>
      <MonthSelector /> {/* Client Component for state */}
      <TransactionList transactions={transactions} /> {/* Server Component */}
    </div>
  )
}

// components/features/month-selector.tsx - Client Component
'use client'
import { useState } from 'react'

export function MonthSelector() {
  const [month, setMonth] = useState(new Date())
  // ... interactive logic
}
```

### Pattern 2: Encrypt-Before-Write, Decrypt-After-Read

**What:** All financial values (amounts, descriptions, notes) are encrypted client-side before being sent to Supabase. Decrypted after retrieval.

**When to use:** Every read/write operation on encrypted fields (see reference/encryption-schemas.ts).

**Trade-offs:**
- Pros: Zero-knowledge architecture, Supabase never sees plaintext, LGPD compliance
- Cons: Can't query/filter by encrypted fields (amount, description) server-side, adds complexity

**Example:**
```typescript
// lib/encryption/crypto.ts
export async function encryptValue(value: string | number): Promise<string> {
  const key = await getEncryptionKey() // Shared key MVP, per-user Phase 4
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(String(value))

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  )

  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  })
}

export async function decryptValue(encrypted: string): Promise<string> {
  const { iv, data } = JSON.parse(encrypted)
  const key = await getEncryptionKey()

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    new Uint8Array(data)
  )

  return new TextDecoder().decode(decrypted)
}

// Usage in Server Action
// lib/actions/transactions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { encryptValue } from '@/lib/encryption/crypto'

export async function createTransaction(data: TransactionInput) {
  const supabase = await createClient()

  const encrypted = {
    ...data,
    amount: await encryptValue(data.amount),
    description: await encryptValue(data.description)
  }

  return supabase.from('transactions').insert(encrypted)
}
```

### Pattern 3: TanStack Query for All Client State

**What:** Use TanStack Query hooks for all server data (transactions, accounts, budgets). Optimistic updates for writes.

**When to use:** Every client-side data fetch, mutation, or cache invalidation. Avoid manual useState for server data.

**Trade-offs:**
- Pros: Automatic caching, background refetching, optimistic updates, loading states
- Cons: Learning curve, requires queryClient setup

**Example:**
```typescript
// lib/queries/use-transactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createTransaction } from '@/lib/actions/transactions'

export function useTransactions(userId: string, month: Date) {
  return useQuery({
    queryKey: ['transactions', userId, month.toISOString()],
    queryFn: async () => {
      // Fetch from Supabase via Server Action or API
      const supabase = createClient()
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('due_date', startOfMonth(month))
        .lte('due_date', endOfMonth(month))

      // Decrypt amounts/descriptions here
      return data
    }
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTransaction) => {
      // Optimistic update: add to cache immediately
      await queryClient.cancelQueries({ queryKey: ['transactions'] })
      const previous = queryClient.getQueryData(['transactions'])

      queryClient.setQueryData(['transactions'], (old: any[]) =>
        [...old, { ...newTransaction, id: 'temp-id' }]
      )

      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['transactions'], context?.previous)
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}
```

### Pattern 4: RLS as Primary Security Boundary

**What:** Every table has RLS policies filtering by `auth.uid() = user_id`. No application-level user filtering needed.

**When to use:** Every Supabase query. Trust RLS to enforce user isolation.

**Trade-offs:**
- Pros: Security at database level, can't bypass with client code, less prone to bugs
- Cons: Debugging RLS policies can be tricky, policy performance matters at scale

**Example:**
```sql
-- supabase/002_rls_policies.sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Pattern 5: Service Worker for Offline-First PWA

**What:** Use Serwist (Webpack-based) to generate service worker for offline caching. Cache static assets + runtime API responses.

**When to use:** MVP (PWA is core feature). Configure once, extends to all routes.

**Trade-offs:**
- Pros: Works offline, fast repeat visits, native-like experience
- Cons: Requires Webpack (Turbopack not supported), stale cache issues if not managed

**Example:**
```typescript
// next.config.ts
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true
})

export default withSerwist({
  webpack: (config) => {
    // Serwist requires Webpack, not Turbopack
    return config
  }
})

// app/sw.ts
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry } from '@serwist/precaching'
import { installSerwist } from '@serwist/sw'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[]
}

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: { maxEntries: 50, maxAgeSeconds: 300 }
      }
    }
  ]
})
```

## Data Flow

### Request Flow (Read)

```
User Action (Click "Dashboard")
    ↓
Server Component (app/dashboard/page.tsx)
    ↓
Supabase Server Client (lib/supabase/server.ts)
    ↓ (with auth.uid() from cookie)
PostgreSQL + RLS (filters by user_id)
    ↓ (returns encrypted data)
Decrypt Utility (lib/encryption/crypto.ts)
    ↓ (decrypts amount, description)
Render Component (shows decrypted data)
```

### Request Flow (Write)

```
User Action (Submit "New Transaction")
    ↓
Client Component Form (components/features/transaction-form.tsx)
    ↓
TanStack Query Mutation (lib/queries/use-transactions.ts)
    ↓ (optimistic update: add to cache immediately)
Server Action (lib/actions/transactions.ts)
    ↓
Encrypt Utility (encrypts amount, description)
    ↓
Supabase Server Client (lib/supabase/server.ts)
    ↓ (with auth.uid() from cookie)
PostgreSQL + RLS (inserts with user_id from auth.uid())
    ↓
TanStack Query (invalidates cache, refetches)
    ↓
UI Updates (shows confirmed transaction)
```

### State Management

```
Server State (Transactions, Accounts, Budgets)
    ↓ (managed by TanStack Query)
Query Cache
    ↓ (subscribe)
Components ←→ Mutations → Server Actions → Database

Local State (Form inputs, UI toggles)
    ↓ (managed by useState/useReducer)
Component State (ephemeral, not persisted)
```

### Key Data Flows

1. **Authentication Flow:** User logs in → Supabase Auth → Cookie set → Middleware refreshes token on each request → Server Components access user via `auth.uid()`
2. **Transaction Creation Flow:** Form submit → Encrypt data → Server Action → Supabase insert → RLS enforces user_id → TanStack Query invalidates → UI refetches
3. **Recurring Generation Flow:** Cron job (daily) → Server Action → Finds recurring templates → Generates transactions for current month → Users see auto-generated transactions
4. **WhatsApp Flow:** User sends message → n8n webhook → IA parses message → POST /api/webhooks/n8n → Server Action creates transaction → User receives confirmation
5. **Subscription Flow:** User upgrades → Stripe checkout → Webhook → POST /api/webhooks/stripe → Update subscriptions table → App reflects new plan

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10k users | Current architecture is sufficient. Single Supabase instance, no CDN needed (Vercel Edge handles it). Monitor RLS policy performance. |
| 10k-100k users | Add Supabase connection pooler (Supavisor) for high concurrency. Enable Supabase read replicas for heavy dashboard queries. Consider IndexedDB for offline transaction cache (reduce API calls). |
| 100k+ users | Split read/write queries (replicas for reads). Move encryption to edge workers (reduce client-side crypto overhead). Consider database partitioning by user_id (Postgres partitions). Separate WhatsApp microservice to dedicated infrastructure. |

### Scaling Priorities

1. **First bottleneck: Database connections** - Supabase free tier has connection limits. Solution: Enable Supavisor (connection pooler) or upgrade to Pro plan. Symptom: "Too many connections" errors.
2. **Second bottleneck: RLS policy performance** - Complex RLS policies slow down at scale. Solution: Add indexes on user_id + due_date, simplify policies, use materialized views for reports. Symptom: Slow dashboard load (>2s).
3. **Third bottleneck: Client-side encryption overhead** - Encrypting/decrypting 1000+ transactions client-side is slow. Solution: Move encryption to edge workers (Cloudflare Workers, Vercel Edge), cache decrypted data in IndexedDB. Symptom: Laggy UI on month change.

## Anti-Patterns

### Anti-Pattern 1: Client-Side Filtering Instead of RLS

**What people do:** Fetch all transactions, filter by `user_id` in JavaScript.

**Why it's wrong:** Security vulnerability (client can bypass filter), performance issue (fetching unnecessary data), RLS is redundant.

**Do this instead:** Trust RLS to filter. Query without user_id filter. RLS automatically restricts to current user.

```typescript
// ❌ BAD: Client-side filtering
const { data } = await supabase.from('transactions').select('*')
const userTransactions = data.filter(t => t.user_id === userId)

// ✅ GOOD: RLS handles it
const { data } = await supabase.from('transactions').select('*')
// RLS policy ensures only current user's transactions are returned
```

### Anti-Pattern 2: Storing Encryption Key in localStorage

**What people do:** Generate encryption key, store in localStorage for persistence.

**Why it's wrong:** localStorage is accessible to XSS attacks. Key exposed to any script on the domain. Not secure for financial data.

**Do this instead:** Derive key from user password (PBKDF2) or store in memory (session-only). For MVP, use shared key in environment variable (server-side only). Phase 4: per-user key derived from password.

```typescript
// ❌ BAD: Key in localStorage
const key = localStorage.getItem('encryption_key')

// ✅ GOOD: Key derived from password (Phase 4)
const key = await deriveKey(userPassword, salt)

// ✅ GOOD: Shared key in env (MVP)
const key = process.env.ENCRYPTION_KEY
```

### Anti-Pattern 3: Mixing Server and Client Supabase Clients

**What people do:** Use same Supabase client in Server Components and Client Components.

**Why it's wrong:** Server Components can't write cookies, Client Components don't have server-side auth context. Leads to auth bugs and stale tokens.

**Do this instead:** Use separate clients for each context. Server Components use `lib/supabase/server.ts`, Client Components use `lib/supabase/client.ts`, Middleware uses `lib/supabase/middleware.ts`.

```typescript
// ❌ BAD: Same client everywhere
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key) // Used everywhere

// ✅ GOOD: Context-specific clients
// Server Component
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // Cookies from request

// Client Component
'use client'
import { createClient } from '@/lib/supabase/client'
const supabase = createClient() // Browser cookies
```

### Anti-Pattern 4: Skipping Optimistic Updates

**What people do:** Submit form → wait for server response → update UI (slow, laggy).

**Why it's wrong:** Poor UX. User sees loading spinner for every action. Feels unresponsive.

**Do this instead:** Use TanStack Query's `onMutate` to update UI immediately, rollback on error.

```typescript
// ❌ BAD: Wait for server
const handleSubmit = async (data) => {
  setLoading(true)
  await createTransaction(data)
  await refetch() // Waits for server
  setLoading(false)
}

// ✅ GOOD: Optimistic update
const { mutate } = useCreateTransaction()
const handleSubmit = (data) => {
  mutate(data) // UI updates immediately, server syncs in background
}
```

### Anti-Pattern 5: Not Handling Service Worker Updates

**What people do:** Deploy new version, users keep using old cached version indefinitely.

**Why it's wrong:** Users don't see new features/fixes. Stale UI/API mismatches cause bugs.

**Do this instead:** Use `skipWaiting: true` in service worker config. Show toast notification prompting user to refresh when new version detected.

```typescript
// ✅ GOOD: Auto-update service worker
installSerwist({
  skipWaiting: true,       // New SW activates immediately
  clientsClaim: true,      // New SW controls clients immediately
  navigationPreload: true  // Faster navigation
})

// In app: Detect SW update, prompt refresh
navigator.serviceWorker.addEventListener('controllerchange', () => {
  toast.info('New version available. Refresh to update.')
})
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Stripe | Webhook + SDK | POST /api/webhooks/stripe verifies signature, updates subscriptions table. Use Stripe SDK for checkout session creation. Test with Stripe CLI locally. |
| n8n (WhatsApp) | Webhook + IA | POST /api/webhooks/n8n receives message, validates user, parses with IA, creates transaction. n8n handles WhatsApp Business API, IA (OpenAI GPT-4), and message routing. |
| Supabase Auth | Cookie-based SSR | Middleware refreshes tokens. Server Components get user from `auth.uid()`. No client-side auth checks needed (RLS handles it). |
| Service Worker | Serwist (Webpack) | Caches static assets + runtime API calls. NetworkFirst for Supabase API (fresh data, fallback to cache offline). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Component ↔ Client Component | Props (unidirectional) | Server Component fetches data, passes as props to Client Component. Client Component emits actions (form submit), Server Action handles write. |
| Client Component ↔ Server Action | TanStack Query mutation | Client calls Server Action via mutation. Server Action returns result, mutation handles optimistic update + cache invalidation. |
| Middleware ↔ Supabase | Cookie read/write | Middleware reads cookie, calls `supabase.auth.getClaims()` to refresh token, writes updated cookie. All requests pass through middleware. |
| App ↔ Database | Supabase Client + RLS | All queries filtered by RLS. No direct database access. Supabase Client abstracts connection pooling, retry logic. |
| Encryption Layer ↔ Database | Transparent (via actions) | Encrypt before insert/update, decrypt after select. Application code works with plaintext, encryption layer handles conversion. |

## Build Order Recommendations

### Phase 1: Foundation (Week 1)
**Why this order:** Auth is required for everything. Can't test app features without login. Layout establishes UI structure for all subsequent pages.

1. Next.js 15 setup + Tailwind + Shadcn/ui
2. Supabase client utilities (server, client, middleware)
3. Auth flow (login, signup, magic link)
4. Root layout + app layout (sidebar, bottom nav)
5. Middleware (token refresh)

### Phase 2: Core Data Layer (Week 1-2)
**Why this order:** Encryption must be in place before storing any data. Transactions are core entity, everything else references them. TanStack Query abstracts all data fetching for subsequent features.

6. Encryption utilities (AES-GCM, field mapper)
7. Database schema (transactions, bank_accounts, credit_cards)
8. TanStack Query setup (queryClient, provider)
9. Server Actions (transactions CRUD)
10. RLS policies (all tables)

### Phase 3: Essential Features (Week 2-3)
**Why this order:** Dashboard is first screen users see (must exist to test anything). Transaction CRUD is most-used feature. Month selector needed to filter dashboard. Bank accounts/cards needed before transactions (foreign keys).

11. Dashboard page (transaction list)
12. Transaction form (create, edit)
13. Month selector component
14. Bank accounts CRUD
15. Credit cards CRUD
16. Category badges + labels

### Phase 4: Budget & Reports (Week 3)
**Why this order:** Budget requires transactions to exist (calculates spent vs limit). Reports also require transaction history. These are analysis features, not creation features.

17. Budget page (category limits)
18. Budget calculation logic (spent vs limit)
19. Reports page (charts: pie, bar)
20. Recurring transactions setup

### Phase 5: PWA & Offline (Week 4)
**Why this order:** PWA requires complete app to test offline. Service worker must cache all routes. Manifest references all icons. Test offline after core features work online.

21. PWA manifest (icons, theme)
22. Service worker (Serwist config)
23. Offline fallback page
24. Install prompt

### Phase 6: Integrations (Week 4-5)
**Why this order:** App must be functional before adding external dependencies. Stripe requires working subscription UI. WhatsApp requires working transaction creation flow.

25. Stripe checkout + webhook
26. Subscription management UI
27. WhatsApp verification flow
28. n8n webhook handler (transaction creation)

### Phase 7: Polish (Week 5)
**Why this order:** Onboarding is last because it references all features (accounts, cards, budget, WhatsApp). Settings page needs all features to configure. Landing page can be built in parallel but references app features.

29. Onboarding wizard
30. Settings page (all tabs)
31. Landing page + pricing
32. Privacy policy + LGPD compliance text

## Sources

- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Vercel Supabase Template](https://vercel.com/templates/next.js/supabase)
- [SaaS Architecture Patterns with Next.js](https://vladimirsiedykh.com/blog/saas-architecture-patterns-nextjs)
- [Modern Full Stack Application Architecture Using Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)
- [Supabase with TanStack Query Guide](https://makerkit.dev/blog/saas/supabase-react-query)
- [Supabase RLS Best Practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)
- [Next.js 16 PWA with Offline Support](https://blog.logrocket.com/nextjs-16-pwa-offline-support/)
- [Building Offline Experience in Next.js PWAs](https://www.getfishtank.com/insights/building-native-like-offline-experience-in-nextjs-pwas)
- [AES-GCM Encryption in React](https://urchymanny.medium.com/aes-gcm-encryption-utilities-for-react-application-f0ad82944484)
- [PWA Architecture for Finance](https://www.nevinainfotech.com/blog/pwas-for-finance)

---
*Architecture research for: KYN App - Personal Finance PWA*
*Researched: 2026-02-11*
