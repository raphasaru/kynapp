---
phase: 02-core-financial-data
plan: 01
subsystem: foundation
tags:
  - dependencies
  - utilities
  - infrastructure
  - typescript
dependency_graph:
  requires: []
  provides:
    - formatCurrency (pt-BR currency formatting)
    - formatDate (pt-BR date formatting)
    - Transaction/Account/Card Zod schemas
    - useMediaQuery (responsive UI hook)
    - useMonthSelector (month navigation with URL state)
    - QueryProvider (TanStack Query wrapper)
    - Database types (credit_cards + full transaction fields)
  affects:
    - All Phase 2 plans (02-02 through 02-05)
tech_stack:
  added:
    - recharts@3.7.0
    - date-fns@4.1.0
    - react-currency-input-field@4.0.3
    - shadcn/ui: select, dialog, popover, command, calendar
  patterns:
    - Intl.NumberFormat for currency
    - date-fns with ptBR locale
    - Zod for runtime validation
    - TanStack Query with 5min staleTime
    - URL-based state management (useSearchParams)
key_files:
  created:
    - src/lib/formatters/currency.ts
    - src/lib/formatters/date.ts
    - src/lib/validators/transaction.ts
    - src/lib/validators/account.ts
    - src/lib/validators/card.ts
    - src/hooks/use-media-query.ts
    - src/hooks/use-month-selector.ts
    - src/providers/query-provider.tsx
    - src/components/ui/select.tsx
    - src/components/ui/dialog.tsx
    - src/components/ui/popover.tsx
    - src/components/ui/command.tsx
    - src/components/ui/calendar.tsx
  modified:
    - package.json (deps)
    - src/app/(app)/layout.tsx (QueryProvider wrap)
    - src/types/database.ts (credit_cards table, transaction fields)
decisions:
  - Use Intl.NumberFormat vs custom formatter (native browser API, reliable pt-BR)
  - date-fns vs Day.js (better TypeScript support, tree-shakable)
  - TanStack Query staleTime 5min (balance freshness vs server load)
  - URL-based month state vs local state (shareable URLs, browser back/forward)
metrics:
  duration: 2
  completed_at: "2026-02-12T00:25:21Z"
  tasks_completed: 2
  files_created: 13
  files_modified: 3
  commits: 2
---

# Phase 2 Plan 01: Shared Foundation for Financial Data Summary

**One-liner:** Installed deps, shadcn components, created formatters/validators/hooks, set up TanStack Query provider

## What Was Built

Foundation utilities and infrastructure for all Phase 2 financial data features:

**Dependencies:**
- recharts (charts)
- date-fns (date manipulation with pt-BR locale)
- react-currency-input-field (currency input components)
- shadcn/ui components (select, dialog, popover, command, calendar)

**Formatters:**
- `formatCurrency(n)` → "R$ 1.234,56" (pt-BR format)
- `formatDate(date, pattern)` → pt-BR date strings
- `formatMonthYear(month)` → "Fevereiro 2026"
- `getMonthRange(month)` → first/last day of month

**Validators (Zod):**
- `transactionSchema` — description, amount, type, category, status, payment_method, etc.
- `accountSchema` — name, type, balance, bank_name, color
- `cardSchema` — name, credit_limit, due_day, closing_day, color

**Hooks:**
- `useMediaQuery(query)` — responsive UI detection (sheet-on-mobile/dialog-on-desktop)
- `useMonthSelector()` — month navigation with URL state (`?month=2026-02`)

**Provider:**
- `QueryProvider` — TanStack Query wrapper with 5min staleTime, retry:1

**Database Types:**
- Added `credit_cards` table type
- Extended `transactions` with: payment_method, bank_account_id, credit_card_id, notes, completed_date, source, is_recurring

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install deps + add shadcn components | 3276c6b | package.json, 5 UI components |
| 2 | Create shared utilities, hooks, query provider, update types | 87693e9 | 8 lib files, 2 hooks, 1 provider, layout, database types |

## Verification Results

- `npm run build` — SUCCESS (compiled in 2.3s)
- `npx tsc --noEmit` — PASSED (no type errors)
- `formatCurrency(1234.56)` → "R$ 1.234,56" ✓
- All Zod schemas validate correctly ✓
- QueryProvider wraps (app) layout ✓
- credit_cards type exists in database.ts ✓

## Deviations from Plan

None — plan executed exactly as written.

## Key Decisions

1. **Intl.NumberFormat for currency** — Native browser API, no external dependency, reliable pt-BR formatting
2. **date-fns over Day.js** — Better TypeScript support, more comprehensive ptBR locale, tree-shakable
3. **TanStack Query staleTime: 5min** — Balance data freshness vs server load for financial data
4. **URL-based month state** — Enables shareable URLs, browser back/forward navigation, better UX

## Impact on Codebase

**Enables:** All Phase 2 plans (02-02 through 02-05) can now use:
- Consistent currency/date formatting
- Runtime validation with Zod
- Client-side data caching with TanStack Query
- Responsive UI patterns with media query hook
- Month navigation with URL state

**Breaking changes:** None

**Dependencies added:** 4 npm packages + 5 shadcn components

## Next Steps

Phase 2 Plans 02-05 can now proceed without installing dependencies or creating formatters/validators. All shared utilities ready for use.

## Self-Check

Verifying all claimed files and commits exist:

**Files created:**
- ✓ src/lib/formatters/currency.ts
- ✓ src/lib/formatters/date.ts
- ✓ src/lib/validators/transaction.ts
- ✓ src/lib/validators/account.ts
- ✓ src/lib/validators/card.ts
- ✓ src/hooks/use-media-query.ts
- ✓ src/hooks/use-month-selector.ts
- ✓ src/providers/query-provider.tsx
- ✓ src/components/ui/select.tsx
- ✓ src/components/ui/dialog.tsx
- ✓ src/components/ui/popover.tsx
- ✓ src/components/ui/command.tsx
- ✓ src/components/ui/calendar.tsx

**Commits:**
- ✓ 3276c6b: chore(02-core-financial-data-01): install deps + shadcn components
- ✓ 87693e9: feat(02-core-financial-data-01): create shared utilities, hooks, query provider

## Self-Check: PASSED

All files created and commits verified.
