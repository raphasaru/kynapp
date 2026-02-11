# Technology Stack Research

**Project:** KYN App (Personal Finance PWA - Brazilian Market)
**Researched:** 2026-02-11
**Confidence:** HIGH

## Executive Summary

Next.js 15 + Supabase + Tailwind + Shadcn/ui is validated as the optimal 2025/2026 stack for a Brazilian market personal finance PWA. This research fills gaps for state management, forms, charts, encryption, PWA setup, and supporting libraries. All recommendations use current stable versions verified against official sources.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 15.x (stable) | React framework with App Router | Stable as of Oct 2024. React 19 support, Turbopack dev (76.7% faster startup), improved caching semantics, server actions security. Production-ready for PWAs. |
| **React** | 19.x (RC/stable) | UI library | Next.js 15 uses React 19 RC. Extensive testing confirms stability. App Router requires React 19; Pages Router backward compatible with 18. |
| **TypeScript** | 5.x | Type safety | Full Next.js integration including `next.config.ts` support. Critical for financial data accuracy. |

**Confidence:** HIGH - [Next.js 15 official release](https://nextjs.org/blog/next-15) confirms stability.

### Database & Backend

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Supabase** | Latest | PostgreSQL + Auth + RLS | Standard for Next.js apps. Built-in RLS for row-level security. Native PostgreSQL with ACID compliance critical for financial transactions. Auth with bcrypt password hashing, HaveIBeenPwned integration. |
| **PostgreSQL** | 15+ | Relational database | Via Supabase. ACID transactions essential for financial data integrity. Native ENUM types, triggers, functions. |

**Confidence:** HIGH - Supabase is de facto standard for Next.js serverless apps.

### UI & Styling

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Tailwind CSS** | 4.x | Utility-first CSS | v4 released with @theme directive. Shadcn/ui fully compatible. Mobile-first approach ideal for PWA. |
| **Shadcn/ui** | Latest | Component library | All components updated for Tailwind v4 and React 19. Non-breaking compatibility with v3. New-york style matches design system. Native dark mode support. |
| **Lucide React** | Latest | Icon system | Default for Shadcn/ui. Tree-shakeable, consistent design language. |

**Confidence:** HIGH - [Shadcn/ui Tailwind v4 announcement](https://ui.shadcn.com/docs/tailwind-v4) confirms compatibility.

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **TanStack Query** | 5.x (v5.90.20+) | Server state management | Industry standard for server state (API fetches, caching). Handles 80% of state needs. Auto-caching, invalidation, background refetch, optimistic updates. DevTools integration. Perfect for financial data that needs fresh sync. |
| **React Hook Form** | 7.x (v7.71.1+) | Form state | Minimal re-renders (critical for performance). Isolated component updates. Native Zod integration via `@hookform/resolvers`. Standard for complex forms (transactions, budgets). |
| **Zustand** *(optional)* | 4.x | Client state | Use only if needed for cross-component UI state (e.g., sheet open/closed, selected filters). Most apps don't need this with TanStack Query + React state. |

**Rationale:**
- **TanStack Query** handles ALL server data (transactions, accounts, budgets) with automatic caching and revalidation.
- **React Hook Form** isolates form state from component tree, preventing re-renders.
- **Local useState/useReducer** sufficient for UI state in most cases.
- **Zustand** only if state shared across many unrelated components (rare in well-architected apps).

**Confidence:** HIGH - [State management patterns 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) confirms TanStack Query + minimal client state is 2026 standard.

### Form Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Zod** | 4.x (v4.3.6+) | Schema validation | TypeScript-first. v4 has 14x faster parsing, 57% smaller core. `z.infer<>` provides automatic types. `refine()` and `superRefine()` for custom financial validation (e.g., expense <= income). Standard pairing with React Hook Form. |
| **@hookform/resolvers** | Latest | RHF + Zod bridge | Official adapter. Pass `zodResolver(schema)` to `useForm()`. Type-safe form state. |

**Best Practices:**
- Define schemas outside components (reusable, testable)
- Use `z.preprocess()` for file uploads
- Use `superRefine()` for multi-field validation (e.g., budget total vs category sum)
- Client + server validation (never trust client)

**Confidence:** HIGH - [Zod v4 release](https://www.infoq.com/news/2025/08/zod-v4-available/), [RHF + Zod guide](https://www.contentful.com/blog/react-hook-form-validation-zod/).

### Data Visualization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Recharts** | 2.x | Charts for financial data | React-native. Composable components. Better for large datasets (67.6% faster than Chart.js at 1M points). Declarative API fits React mental model. Supports responsive design for mobile PWA. |

**Alternatives Considered:**
- **Chart.js**: Faster for <10K points, but imperative API. Not React-idiomatic.
- **ApexCharts**: Better for stock/candlestick charts. Overkill for personal finance.

**Use Case:** Expense trends, budget vs actual, category breakdown pie charts.

**Confidence:** MEDIUM - [Recharts vs Chart.js comparison](https://www.oreateai.com/blog/recharts-vs-chartjs-navigating-the-performance-maze-for-big-data-visualizations/4aff3db4085050dc635fd25267846922). Recharts recommended for React apps with moderate data volumes.

### Encryption

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Web Crypto API** | Native | AES-256-GCM encryption | Browser-native. Zero dependencies. AES-GCM provides authenticated encryption (integrity + confidentiality). 96-bit IV standard. Use for client-side encryption before Supabase storage. |
| **PBKDF2** *(if needed)* | Native (SubtleCrypto) | Key derivation | For deriving encryption keys from user passwords (if encrypting with user passphrase). Use 100K+ iterations. |

**Implementation:**
```typescript
// SubtleCrypto.encrypt() with AES-GCM
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
  key,
  data
);
```

**Critical:**
- NEVER reuse IV with same key
- Store IV with ciphertext (IV is not secret)
- Use `crypto.getRandomValues()` for IV generation

**Security Note:** Supabase encrypts data at rest, but client-side encryption adds defense-in-depth for sensitive financial values.

**Confidence:** HIGH - [Web Crypto API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), [AES-GCM guide](https://gist.github.com/junderw/1d41158403978ba0363e5868d4f434d9).

### PWA Setup

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **@serwist/next** | Latest | Service worker + PWA | Official successor to next-pwa. Workbox-based. Better Next.js 15 compatibility. Active maintenance. Supports Turbopack (next-pwa doesn't). |
| **next/manifest** | Native (Next.js 15) | Web app manifest | Next.js 15 native support via `app/manifest.ts` (dynamic) or `app/manifest.json` (static). No external deps needed. |

**Setup:**
1. Create `app/manifest.ts` for dynamic manifest
2. Install `@serwist/next` for service worker
3. Configure `next.config.js` with Serwist plugin
4. Add offline fallback pages

**Avoid:**
- `@ducanh2912/next-pwa` (maintenance mode, recommends Serwist)
- `shadowwalker/next-pwa` (original, unmaintained)

**Confidence:** HIGH - [Next.js PWA docs](https://nextjs.org/docs/app/guides/progressive-web-apps), [Serwist migration guide](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7).

### Internationalization (i18n)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **date-fns** | 4.x | Date formatting | Functional, tree-shakeable. Native pt-BR locale. Works with native Date objects (no custom API). 60+ locales. |
| **Intl.NumberFormat** | Native | Currency/number formatting | Browser-native. Zero dependencies. Handles Brazilian Real (`pt-BR`, `BRL`) correctly: "R$ 1.234,56". Auto-handles fractional digits per currency. Reusable formatter instances. |

**Brazilian Real Formatting:**
```typescript
const formatCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format;

formatCurrency(1234.56); // "R$ 1.234,56"
```

**Alternatives Avoided:**
- **currency.js**: Manual config needed. Intl.NumberFormat is native and standard.
- **dayjs**: Plugin-based. date-fns is more functional and tree-shakeable.
- **Moment.js**: Deprecated (2020). No longer recommended.

**Confidence:** HIGH - [Intl.NumberFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat), [date-fns pt-BR locale](https://github.com/date-fns/date-fns/tree/main/src/locale/pt-BR).

### Payments

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Stripe** | Latest SDK | Subscription billing | Standard for SaaS. Brazilian Real support. Webhook-based sync. Official Next.js integration. PCI-compliant. |
| **@stripe/stripe-js** | Latest | Client SDK | Official Stripe client. Elements for card input. |

**Confidence:** HIGH - Stripe is industry standard for SaaS billing.

### Automation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **n8n** | Self-hosted | WhatsApp integration | Self-hostable (vs Zapier). WhatsApp Business API integration. Workflow automation for financial notifications. |

**Confidence:** MEDIUM - Specified in project context. WhatsApp Business API has strict approval process.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **clsx** | Latest | Conditional classNames | Shadcn/ui dependency. Merge Tailwind classes. |
| **tailwind-merge** | Latest | Merge Tailwind classes | Prevent class conflicts. Used with clsx. |
| **sonner** | Latest | Toast notifications | Shadcn/ui recommendation. Beautiful, accessible toasts. |
| **vaul** | Latest | Bottom sheets | Mobile sheet component. Critical for mobile-first PWA. |
| **@radix-ui/\*** | Latest | Unstyled primitives | Shadcn/ui foundation. Accessible, keyboard navigation. |
| **cmdk** | Latest | Command palette | Search/command UI (optional). |

---

## Development Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | Linting | ESLint 9 supported (Next.js 15). Use `next lint`. Flat config recommended. |
| **Prettier** | Code formatting | Standard config. Integrate with ESLint. |
| **TypeScript** | Type checking | `npx tsc --noEmit` in CI. Strict mode enabled. |
| **Turbopack** | Dev server | Stable in Next.js 15. Use `next dev --turbo`. 76.7% faster startup. |

---

## Installation

```bash
# Core framework
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/node

# Database & Auth
npm install @supabase/supabase-js @supabase/ssr

# UI & Styling
npm install tailwindcss@next postcss autoprefixer
npm install lucide-react
# Shadcn/ui components installed via CLI: npx shadcn@latest add

# State management
npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers

# Data visualization
npm install recharts

# PWA
npm install @serwist/next

# Internationalization
npm install date-fns

# Payments
npm install stripe @stripe/stripe-js

# Supporting libraries (installed with Shadcn/ui)
npm install clsx tailwind-merge sonner vaul

# Dev dependencies
npm install -D eslint eslint-config-next prettier
npm install -D @tanstack/react-query-devtools
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| **State (server)** | TanStack Query | SWR | TanStack Query has broader feature set (mutations, invalidation, DevTools). SWR simpler but less powerful. |
| **State (client)** | Zustand (if needed) | Jotai, Redux Toolkit | Jotai atomic model overkill for most cases. Redux too much boilerplate. Zustand simplest when needed. |
| **Forms** | React Hook Form | Formik | RHF has better performance (fewer re-renders). Formik abandoned (last release 2021). |
| **Validation** | Zod | Yup, Joi | Zod TypeScript-first. Yup JavaScript-first. Joi server-only. Zod v4 performance beats all. |
| **Charts** | Recharts | Chart.js, ApexCharts | Chart.js imperative. ApexCharts overkill. Recharts best React integration. |
| **PWA** | @serwist/next | next-pwa, @ducanh2912/next-pwa | Original next-pwa unmaintained. Serwist official successor, active development. |
| **Dates** | date-fns | dayjs, Moment.js | Moment deprecated. dayjs plugin-based. date-fns functional, tree-shakeable. |
| **Currency** | Intl.NumberFormat | currency.js, numeral.js | Native API better than library. Zero dependencies. Auto-handles locale. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Moment.js** | Deprecated 2020. Large bundle size. Mutable API. | date-fns, Intl.DateTimeFormat |
| **Redux** (without specific need) | Boilerplate overhead. TanStack Query handles server state better. | TanStack Query + Zustand |
| **Formik** | Abandoned (no updates since 2021). Worse performance than RHF. | React Hook Form |
| **next-pwa** (original) | Unmaintained. Doesn't support Turbopack. | @serwist/next |
| **Context API** (for server state) | Manual cache management. No background refetch. | TanStack Query |
| **localStorage** (for auth tokens) | XSS vulnerable. Server can't read. | Cookies (Supabase SSR handles this) |
| **Custom encryption** | High risk of implementation errors. | Web Crypto API (audited, standard) |
| **Client-side only routing** | Bad for SEO. Slow initial load. No SSR. | Next.js App Router (RSC + SSR) |

---

## Stack Patterns by Use Case

### If building mobile-first PWA (this project):
- Use **Vaul** for bottom sheets (not modals)
- Use **TanStack Query** with `staleTime` for offline tolerance
- Use **@serwist/next** for offline support
- Use **Intl.NumberFormat** for Brazilian currency
- Use **date-fns/locale/pt-BR** for dates

### If handling sensitive financial data:
- Use **Web Crypto API** for client-side encryption
- Use **Supabase RLS** for row-level security
- Use **Zod** for input validation (client + server)
- Use **bcrypt** (via Supabase Auth) for passwords
- NEVER trust client input

### If optimizing performance:
- Use **React Hook Form** (isolated re-renders)
- Use **TanStack Query** (automatic caching)
- Use **Turbopack** dev mode (76.7% faster)
- Use **next/image** (automatic optimization)
- Use **Recharts** for large datasets (>100K points)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 15 | React 19, Node.js 18.18+ | App Router requires React 19. Pages Router supports React 18. |
| TanStack Query 5 | React 18+, React 19 | Full React 19 support as of v5. |
| React Hook Form 7 | React 18+, React 19 | v8 in beta. Stick with v7 for stability. |
| Shadcn/ui | Tailwind v3 or v4, React 19 | Non-breaking. Can mix Tailwind versions during migration. |
| Zod 4 | TypeScript 5+ | v4 has breaking changes from v3. Use latest. |
| Recharts 2 | React 18+ | No known React 19 issues. |
| @serwist/next | Next.js 14+, 15+ | Designed for modern Next.js. Supports Turbopack. |
| date-fns 4 | - | v4 ESM-first. Use v3 if CommonJS needed. |

**Critical:** Next.js 15 minimum Node.js version is **18.18.0**. Verify before deployment.

---

## Sources

**HIGH Confidence:**
- [Next.js 15 Release](https://nextjs.org/blog/next-15) - Official stability confirmation
- [TanStack Query v5](https://tanstack.com/query/latest) - Official docs
- [Zod v4 Release](https://www.infoq.com/news/2025/08/zod-v4-available/) - Performance improvements
- [Shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) - Compatibility confirmation
- [Web Crypto API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Encryption standard
- [Intl.NumberFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - Currency formatting

**MEDIUM Confidence:**
- [State Management 2026 Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - Industry trends
- [Recharts vs Chart.js Performance](https://www.oreateai.com/blog/recharts-vs-chartjs-navigating-the-performance-maze-for-big-data-visualizations/4aff3db4085050dc635fd25267846922) - Benchmark comparison
- [React Hook Form + Zod Guide](https://www.contentful.com/blog/react-hook-form-validation-zod/) - Integration patterns
- [Serwist Migration Guide](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7) - PWA setup

**Package Versions:**
- [@tanstack/react-query npm](https://www.npmjs.com/package/@tanstack/react-query) - v5.90.20+
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) - v7.71.1+
- [zod npm](https://www.npmjs.com/package/zod) - v4.3.6+

---

**Stack Research for:** Personal Finance PWA - Brazilian Market
**Researched:** 2026-02-11
**Overall Confidence:** HIGH (core stack), MEDIUM (supporting libraries)
