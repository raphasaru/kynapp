---
phase: 02-core-financial-data
plan: 02
subsystem: bank-accounts
tags:
  - crud
  - encryption
  - tanstack-query
  - ui-components
dependency_graph:
  requires:
    - 02-01 (formatters, validators, hooks, QueryProvider)
  provides:
    - Bank accounts CRUD with encrypted balance
    - Brazilian bank selector
    - Wallet page at /app/carteira
    - useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount, useSetDefaultAccount
  affects:
    - 02-04 (transactions will link to bank accounts)
tech_stack:
  added:
    - shadcn/ui: dropdown-menu, alert-dialog, skeleton
    - react-currency-input-field (already installed in 02-01)
  patterns:
    - TanStack Query mutations with cache invalidation
    - Client-side AES-256-GCM encryption via encryptFields/decryptFields
    - Responsive Sheet (mobile) / Dialog (desktop) pattern
    - Free tier enforcement (2 accounts max)
key_files:
  created:
    - src/lib/queries/accounts.ts
    - src/components/accounts/bank-select.tsx
    - src/components/accounts/account-form.tsx
    - src/components/accounts/account-card.tsx
    - src/app/(app)/carteira/page.tsx
    - src/components/ui/dropdown-menu.tsx
    - src/components/ui/alert-dialog.tsx
    - src/components/ui/skeleton.tsx
  modified:
    - src/types/database.ts (added subscriptions table)
    - src/lib/validators/account.ts (fixed balance field)
decisions:
  - Free tier check via subscriptions table (2 accounts max for 'free' plan)
  - Balance stored as encrypted TEXT, decrypted to number for UI
  - 15 major Brazilian banks + "Outro" option
  - Color picker with 8 preset colors (primary emerald + 7 others)
  - Kebab menu (MoreVertical) for edit/delete/set default actions
  - AlertDialog confirmation for delete (prevent accidental deletion)
metrics:
  duration: 5
  completed_at: "2026-02-12T00:33:18Z"
  tasks_completed: 2
  files_created: 8
  files_modified: 2
  commits: 2
---

# Phase 2 Plan 02: Bank Accounts CRUD Summary

**One-liner:** Bank accounts management with encrypted balance, Brazilian bank selector, free tier enforcement, and wallet page

## What Was Built

Complete bank accounts CRUD system for the wallet page:

**TanStack Query Hooks (src/lib/queries/accounts.ts):**
- `useAccounts()` — fetch all user accounts, decrypt balance
- `useCreateAccount()` — create account with encryption + free tier check (2 max)
- `useUpdateAccount()` — update account with field encryption
- `useDeleteAccount()` — delete account
- `useSetDefaultAccount()` — set default account in profile

**Components:**
- `BankSelect` — 15 major Brazilian banks dropdown (Banco do Brasil, Bradesco, Itaú, Caixa, Santander, Nubank, Inter, C6, BTG, Safra, Original, PagBank, Neon, Next, XP, Outro)
- `AccountForm` — Create/edit form with name, type (Corrente/Poupança/Investimento), bank selector, currency input (pt-BR format), color picker (8 colors)
- `AccountCard` — Display card with bank name, account name, type badge, formatted balance, color left border, star icon for default, kebab menu (edit/delete/set default)
- Wallet page (`/app/carteira`) — Lists accounts in grid, "Nova conta" button, loading skeletons, empty state, responsive Sheet/Dialog

**Features:**
- Balance encrypted (AES-256-GCM) before storage, decrypted for display
- Free tier enforcement: max 2 accounts for 'free' plan users
- Currency input with pt-BR format (R$ 1.234,56)
- Responsive: Sheet on mobile, Dialog on desktop
- Delete confirmation via AlertDialog
- Set default account (stores in profiles.default_bank_account_id)
- Form prevents Enter key submission

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | TanStack Query hooks for bank accounts | a51c138 | accounts.ts, database.ts (subscriptions table) |
| 2 | Account components + wallet page | bb45f82 | 3 account components, wallet page, 3 shadcn components, validator fix |

## Verification Results

- `npx tsc --noEmit` — PASSED (no type errors)
- All 5 hooks exported from accounts.ts ✓
- Wallet page exists at src/app/(app)/carteira/page.tsx ✓
- useAccounts, AccountForm, AccountCard used in page ✓
- Subscriptions table added to database types ✓
- Free tier enforcement logic in useCreateAccount ✓

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added subscriptions table to database types**
- **Found during:** Task 1 (useCreateAccount needs to check subscription plan)
- **Issue:** TypeScript error — subscriptions table not in Database type
- **Fix:** Added subscriptions Row/Insert/Update types to src/types/database.ts
- **Files modified:** src/types/database.ts
- **Commit:** a51c138

**2. [Rule 3 - Blocking] Fixed accountSchema balance field**
- **Found during:** Task 2 (AccountForm type errors)
- **Issue:** `z.number().default(0)` made balance optional in input but required in output, causing type mismatch
- **Fix:** Changed to `z.number()` (always required)
- **Files modified:** src/lib/validators/account.ts
- **Commit:** bb45f82

**3. [Rule 2 - Missing critical] Added shadcn components for UI**
- **Found during:** Task 2 (AccountCard needs dropdown menu and delete confirmation)
- **Issue:** dropdown-menu, alert-dialog, skeleton components missing
- **Fix:** Installed via `npx shadcn add dropdown-menu alert-dialog skeleton`
- **Files created:** 3 shadcn components
- **Commit:** bb45f82

## Key Decisions

1. **Free tier check via subscriptions table** — Query subscriptions.plan to enforce 2-account limit for 'free' users (not just client-side, server RLS also enforces)
2. **Balance as encrypted TEXT → number for UI** — Database stores encrypted string, decrypt to number for forms/display
3. **15 Brazilian banks + "Outro"** — Covers major banks users likely have (extensible via "Outro")
4. **8 preset color swatches** — Visual account differentiation without color picker complexity
5. **AlertDialog for delete** — Prevent accidental deletion (UX safety)
6. **Kebab menu (MoreVertical)** — Space-efficient action menu on cards

## Impact on Codebase

**Enables:**
- Users can manage bank accounts (BANK-01 through BANK-06)
- Transactions can link to bank_account_id (Plan 02-04)
- Default account selection for quick transaction entry

**Breaking changes:** None

**Dependencies added:** 3 shadcn components (dropdown-menu, alert-dialog, skeleton)

## Next Steps

Plan 02-03 (Credit Cards CRUD) will follow similar pattern. Plan 02-04 (Transactions) will link to these accounts via bank_account_id.

## Self-Check

Verifying all claimed files and commits exist:

**Files created:**
- ✓ src/lib/queries/accounts.ts
- ✓ src/components/accounts/bank-select.tsx
- ✓ src/components/accounts/account-form.tsx
- ✓ src/components/accounts/account-card.tsx
- ✓ src/app/(app)/carteira/page.tsx
- ✓ src/components/ui/dropdown-menu.tsx
- ✓ src/components/ui/alert-dialog.tsx
- ✓ src/components/ui/skeleton.tsx

**Files modified:**
- ✓ src/types/database.ts
- ✓ src/lib/validators/account.ts

**Commits:**
- ✓ a51c138: feat(02-02): create TanStack Query hooks for bank accounts
- ✓ bb45f82: feat(02-02): create account components and wallet page

## Self-Check: PASSED

All files created and commits verified.
