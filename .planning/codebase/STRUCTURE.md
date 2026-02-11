# Codebase Structure

**Analysis Date:** 2026-02-11

## Directory Layout

```
kynapp/
├── .planning/
│   └── codebase/              # Planning & analysis documents
├── app/                       # Next.js 15 App Router (to be created)
│   ├── (auth)/                # Auth layout (login, signup, magic-link)
│   ├── (app)/                 # Authenticated user pages (dashboard, transactions, etc)
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── budget/
│   │   ├── recurring/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/                   # API route handlers
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── subscriptions/
│   │   ├── webhooks/
│   │   └── cron/
│   ├── layout.tsx             # Root layout (providers, PWA setup)
│   └── page.tsx               # Landing page (public)
├── components/                # Reusable React components
│   ├── ui/                    # Shadcn/ui base components (buttons, forms, etc)
│   ├── forms/                 # Form components (TransactionForm, etc)
│   ├── charts/                # Recharts wrapper components
│   └── navigation/            # Nav/sidebar, mobile bottom nav
├── lib/                       # Utility functions & helpers
│   ├── supabase.ts            # Supabase client initialization
│   ├── stripe.ts              # Stripe API client
│   ├── encryption.ts          # AES-256-GCM crypto utils
│   ├── validation.ts          # Zod schemas
│   ├── currency.ts            # formatCurrency() & pt-BR formatting
│   └── auth.ts                # Auth helpers (getUser, requireAuth)
├── hooks/                     # React custom hooks
│   ├── useTransactions.ts     # TanStack Query hook for transactions
│   ├── useAccounts.ts         # TanStack Query hook for accounts
│   ├── useSubscription.ts     # TanStack Query hook for subscription
│   └── useLocalStorage.ts     # Local storage helpers
├── types/                     # TypeScript types & interfaces
│   ├── database.ts            # Generated from Supabase schema
│   ├── api.ts                 # API request/response types
│   └── index.ts               # Common types (Page, LayoutProps, etc)
├── context/                   # React Context providers
│   ├── AuthContext.tsx        # Auth state (user, session)
│   └── UIContext.tsx          # UI state (selected month, filters, modals)
├── public/                    # Static assets
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons for iOS/Android
├── supabase/                  # Database schema & functions
│   ├── 001_schema.sql         # Tables (profiles, transactions, etc)
│   ├── 002_rls_policies.sql   # Row Level Security rules
│   └── 003_functions_and_triggers.sql # DB functions + triggers
├── reference/                 # Reference/config files (not imported)
│   ├── stripe-plans.ts        # Stripe plan definitions + price IDs
│   ├── encryption-schemas.ts  # Which fields need encryption
│   ├── categories.ts          # Category labels + icons mapping
│   └── shadcn-config.json     # Shadcn/ui setup (copy as components.json)
├── .env.example               # Template for env vars
├── .env.local                 # Actual secrets (git-ignored)
├── next.config.ts             # Next.js configuration (PWA plugin, etc)
├── tsconfig.json              # TypeScript config (path aliases, etc)
├── package.json               # Dependencies (to be created)
├── CLAUDE.md                  # Project conventions & tech stack
├── FUNCIONALIDADES.md         # Complete functional specification
└── design-system.html         # Visual design tokens & component specs
```

## Directory Purposes

**app/**
- Purpose: Next.js 15 App Router - all routes, layouts, API handlers
- Contains: Page components, layout wrappers, API route handlers
- Key files: `layout.tsx` (root), `page.tsx` (landing), `api/*/route.ts`

**(auth)/ subdirectory:**
- Purpose: Authentication flows isolated in separate layout
- Contains: Login, signup, magic-link verification, password reset pages
- Pattern: Uses layout to prevent authenticated users from accessing

**(app)/ subdirectory:**
- Purpose: Protected routes requiring authentication
- Contains: Dashboard, transactions, accounts, budget, reports, settings
- Pattern: Layout includes sidebar (desktop) + bottom nav (mobile), user menu

**api/**
- Purpose: Server-side API handlers for client requests + webhooks
- Contains: CRUD routes, webhook receivers, cron jobs
- Structure: One folder per domain (transactions, accounts, subscriptions, webhooks, cron)
- Naming: `app/api/[domain]/route.ts` (GET/POST), `app/api/[domain]/[id]/route.ts` (GET/PUT/DELETE)

**components/**
- Purpose: Reusable React components following Shadcn/ui (new-york style)
- Contains: Form inputs, buttons, cards, modals, charts, layouts
- Naming: `PascalCase.tsx` for component files
- UI subfolder: All Shadcn components auto-generated into `components/ui/`

**lib/**
- Purpose: Shared utilities & client initialization
- Contains: Database client, API clients, helpers, formatters
- Key exports:
  - `supabase.ts`: `createClient()` function for server & browser
  - `encryption.ts`: `encryptField()`, `decryptField()` functions
  - `currency.ts`: `formatCurrency(n)` → "R$ 1.234,56"
  - `validation.ts`: Zod schemas for all forms

**hooks/**
- Purpose: Custom React hooks for data fetching & state
- Contains: TanStack Query hooks, local storage hooks, auth hooks
- Naming: `use[Feature].ts` (e.g., `useTransactions.ts`)
- Pattern: Wrap TanStack Query with domain-specific logic

**types/**
- Purpose: TypeScript type definitions
- Contains: Database types (auto-generated from Supabase), API schemas
- Key files:
  - `database.ts`: Generated `Database` type from Supabase schema
  - `api.ts`: Request/response types for all routes

**context/**
- Purpose: React Context for global state
- Contains: Auth context (current user), UI context (filters, modal state)
- Naming: `[Feature]Context.tsx`
- Pattern: Provider component wraps entire app at root level

**public/**
- Purpose: Static assets served by Next.js
- Contains: PWA manifest, favicon, app icons for iOS/Android
- key files:
  - `manifest.json`: PWA metadata (app name, icon, start URL, display mode)
  - `icons/`: Apple touch icons, Android launcher icons

**supabase/**
- Purpose: Database schema & functions (versioned SQL files)
- Contains: Table definitions, RLS policies, triggers, PL/pgSQL functions
- Naming: `[###]_[description].sql` (numbered for ordering)
- How to apply: Run each file in sequence in Supabase dashboard or via CLI

**reference/**
- Purpose: Configuration & reference files (NOT imported by app code)
- Contains: Stripe plan configs, encryption field mappings, category lists
- Usage: Human reference only - actual configs loaded from database or env vars
- Key files:
  - `stripe-plans.ts`: Price IDs for all subscription plans
  - `encryption-schemas.ts`: List of which fields need AES-256-GCM encryption
  - `categories.ts`: 9 default categories + icon mappings

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Landing page (public, no auth required)
- `app/(auth)/login/page.tsx`: Login page (sign in + magic link)
- `app/(app)/dashboard/page.tsx`: Dashboard (authenticated, main app entry)
- `app/layout.tsx`: Root layout (providers, fonts, PWA meta tags)

**Configuration:**
- `.env.local`: Secrets (Supabase URL, Stripe API key, encryption key)
- `next.config.ts`: Next.js config (PWA plugin, image optimization)
- `tsconfig.json`: TypeScript paths (e.g., `@/*` → `./`)
- `tailwind.config.ts`: Tailwind CSS + design tokens (colors, fonts, spacing)

**Core Logic:**
- `lib/supabase.ts`: Supabase client (server & browser)
- `lib/encryption.ts`: AES-256-GCM encrypt/decrypt utilities
- `lib/validation.ts`: Zod schemas for forms
- `hooks/useTransactions.ts`: TanStack Query hook for transaction list/CRUD
- `app/api/transactions/route.ts`: POST/GET transactions

**Database:**
- `supabase/001_schema.sql`: 13 tables (profiles, transactions, bank_accounts, etc)
- `supabase/002_rls_policies.sql`: RLS rules (user can only see own data)
- `supabase/003_functions_and_triggers.sql`: Auto-create profile, recurring generation

**Testing:**
- `__tests__/` (to be created): Jest test files
- `*.test.ts`, `*.spec.ts` (to be created): Co-located test files

## Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `TransactionForm.tsx`, `DashboardCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `encryption.ts`, `validation.ts`)
- Pages: lowercase matching route (e.g., `dashboard/page.tsx`)
- API routes: `route.ts` (Next.js convention)

**Directories:**
- Features: lowercase (e.g., `app/transactions/`, `app/accounts/`)
- Group layouts: `(parentheses)` for Next.js layout grouping (e.g., `(auth)`, `(app)`)
- Components: `PascalCase` (e.g., `components/forms/`, `components/ui/`)

**Functions/Variables:**
- Components: `PascalCase` (e.g., `function TransactionForm()`)
- Functions: `camelCase` (e.g., `formatCurrency()`, `encryptField()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `FREE_WHATSAPP_LIMIT = 30`)
- Database IDs: UUIDs (PostgreSQL `gen_random_uuid()`)

**Types:**
- Interfaces: `PascalCase` prefixed with `I` or not (e.g., `Transaction`, `IUser`)
- Enums: `PascalCase` (e.g., `TransactionType`, `ExpenseCategory`)
- Zod: `PascalCase` + `Schema` suffix (e.g., `TransactionSchema`, `LoginSchema`)

## Where to Add New Code

**New Feature (e.g., "Metas de Economia"):**

1. Create table in Supabase: `supabase/001_schema.sql` → add `financial_goals` table
2. Add RLS policies: `supabase/002_rls_policies.sql`
3. Create types: `types/database.ts` (auto-generated, or manually add)
4. Create validation schema: `lib/validation.ts` → export `FinancialGoalSchema`
5. Create custom hook: `hooks/useFinancialGoals.ts` (TanStack Query)
6. Create API routes: `app/api/goals/route.ts` (GET/POST), `app/api/goals/[id]/route.ts` (PUT/DELETE)
7. Create form component: `components/forms/GoalForm.tsx`
8. Create page: `app/(app)/goals/page.tsx`
9. Add navigation: Update `components/navigation/Sidebar.tsx` + mobile nav

**New Component (e.g., "BudgetProgressBar"):**

1. Create in `components/[category]/[ComponentName].tsx`
2. Export from `components/index.ts` (optional barrel file)
3. Use in pages/other components via import

**New Utility Function (e.g., "calculateMonthlyTrend"):**

1. Create in `lib/[domain].ts` (or existing file if related)
2. Export function with JSDoc comments
3. Add TypeScript types for parameters and return
4. Import in components/hooks that need it

**Encrypted Field:**

1. Add to database column: `balance TEXT NOT NULL DEFAULT '0'  -- encrypted`
2. Add to `reference/encryption-schemas.ts` mapping
3. Create encryption utility: `lib/encryption.ts` → export `decryptTransaction()`
4. Use in API: decrypt after `supabase.from('table').select()`, encrypt before `.insert()`
5. Use in component: Display already-decrypted value from server

## Special Directories

**node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes (auto-created by `npm install`)
- Committed: No (git-ignored via `.gitignore`)

**.next/:**
- Purpose: Next.js build output
- Generated: Yes (created by `npm run build`)
- Committed: No (git-ignored)

**.env.local:**
- Purpose: Environment variables (secrets)
- Generated: No (manually created)
- Committed: No (git-ignored)
- Contains: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, encryption key

**supabase/:**
- Purpose: Database schema version control
- Generated: No (manually written SQL)
- Committed: Yes (tracked in git)
- How to apply: Run files in sequence using Supabase dashboard SQL editor or CLI

**reference/:**
- Purpose: Configuration reference (not live code)
- Generated: No (manual)
- Committed: Yes (tracked in git)
- Note: These files are read by developers, not imported by the app

---

*Structure analysis: 2026-02-11*
