# Technology Stack

**Analysis Date:** 2026-02-11

## Languages

**Primary:**
- TypeScript - App codebase, configuration, reference files
- SQL - Database schema, migrations, triggers, functions

**Secondary:**
- HTML/CSS - Design system tokens
- BASH - Development and setup scripts

## Runtime

**Environment:**
- Node.js (version TBD - install via `npm install`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (expected, not yet created)

## Frameworks

**Core:**
- Next.js 15 - Full-stack web framework (App Router)
- React 18+ - UI library (via Next.js)

**Styling:**
- Tailwind CSS - Utility-first CSS framework
- Shadcn/ui (new-york style) - Component library built on Radix UI
  - Config: `reference/shadcn-config.json` (copy as `components.json`)
  - Base colors: neutral
  - Icons: Lucide React

**State Management:**
- TanStack Query (React Query) - Server state management and caching
- React Hook Form - Form state and validation
- Zod - Schema validation library

**Data Visualization:**
- Recharts - React charting library for financial dashboards

**UI Icons:**
- Lucide React - SVG icon library

**Typography:**
- Space Grotesk - Heading font
- Inter - Body font

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` - Supabase client SDK (auth, database, real-time)
- `stripe` - Stripe API client for payments
- `crypto` (Node.js built-in) - AES-256-GCM encryption for sensitive financial data

**Infrastructure:**
- `zod` - TypeScript-first schema validation
- `react-hook-form` - Performant, flexible form validation
- `@tanstack/react-query` - Server state synchronization
- `tailwindcss` - CSS framework
- `@radix-ui/*` - Accessible component primitives (via shadcn/ui)
- `lucide-react` - Icon library

**Development:**
- TypeScript - Type checking (via `npx tsc --noEmit`)
- ESLint - Linting (config TBD)
- Prettier - Code formatting (config TBD)
- Vitest or Jest - Testing framework (config TBD)

## Configuration

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (private, for webhooks)
- `STRIPE_SECRET_KEY` - Stripe secret key (private)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PRO_MONTHLY_PRICE_ID` - `price_1StGj0IYuOEaGzogx8HO8Hi1`
- `STRIPE_PRO_ANNUAL_PRICE_ID` - `price_1StGkmIYuOEaGzogcKuLfbqn`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `NEXT_PUBLIC_APP_URL` - App deployment URL (for Stripe redirects)
- `ENCRYPTION_KEY` - AES-256-GCM key (base64, shared with n8n integration)

**Files:**
- `.env.local` - Local environment configuration (gitignored)
- `.env.example` - Template for required vars
- `tsconfig.json` - TypeScript configuration (expected)
- `next.config.js` - Next.js configuration (expected)
- `tailwind.config.js` - Tailwind CSS configuration (expected)
- `components.json` - Shadcn/ui configuration (copy from `reference/shadcn-config.json`)

## Build & Development Commands

**Expected:**
```bash
npm install              # Install dependencies
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run start            # Run production server
npx tsc --noEmit         # Type check without emit
npm run lint             # Run ESLint (if configured)
npm run format           # Format code with Prettier (if configured)
npm test                 # Run tests (if configured)
```

## Platform Requirements

**Development:**
- Node.js LTS or latest stable
- npm 10+
- macOS, Linux, or Windows with WSL2
- Git

**Production:**
- Deployment platform: Vercel (recommended for Next.js) or similar
- Supabase PostgreSQL database
- Stripe account (live mode)
- n8n instance or similar for WhatsApp automation

## Database

**Type:** PostgreSQL (via Supabase)

**Project:** `vonfsyszaxtbxeowelqu`

**Connection:**
- Public: `NEXT_PUBLIC_SUPABASE_URL`
- Auth: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (RLS-enforced)
- Service: `SUPABASE_SERVICE_ROLE_KEY` (for webhooks and backend)

**Features:**
- Row-Level Security (RLS) enabled on all tables
- Auth triggers auto-create user profile + free subscription on signup
- All financial values encrypted as TEXT with AES-256-GCM
- Enum types: `transaction_type`, `transaction_status`, `expense_category`, `payment_method`

**Schema Files:**
- `supabase/001_schema.sql` - Tables, enums, constraints
- `supabase/002_rls_policies.sql` - Row-level security policies
- `supabase/003_functions_and_triggers.sql` - Functions and triggers

## Encryption

**Algorithm:** AES-256-GCM

**Implementation:** Node.js `crypto` module

**Key:** Base64-encoded 32-byte key from `ENCRYPTION_KEY` env var

**Encrypted Fields:** See `reference/encryption-schemas.ts`
- Financial amounts (transactions, accounts, cards, investments)
- Descriptions and notes
- Goals and personal financial data

**Note:** Same encryption key must be used in n8n WhatsApp integration for decryption

---

*Stack analysis: 2026-02-11*
