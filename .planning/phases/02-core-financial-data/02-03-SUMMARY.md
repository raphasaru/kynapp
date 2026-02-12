---
phase: 02-core-financial-data
plan: 03
subsystem: credit-cards
tags:
  - crud
  - encryption
  - tanstack-query
  - ui-components
dependency_graph:
  requires:
    - 02-01 (formatters, validators, hooks, QueryProvider)
  provides:
    - Credit cards CRUD with encrypted limit/bill
    - Visual credit card display with color customization
    - useCards, useCreateCard, useUpdateCard, useDeleteCard
    - CardForm, CardDisplay components
  affects:
    - 02-04 (transactions will link to credit cards)
tech_stack:
  added: []
  patterns:
    - TanStack Query mutations with cache invalidation
    - Client-side AES-256-GCM encryption via encryptFields/decryptFields
    - Responsive Sheet (mobile) / Dialog (desktop) pattern
    - Free tier enforcement (1 card max)
    - Visual credit card design with gradient backgrounds
key_files:
  created:
    - src/lib/queries/cards.ts
    - src/components/cards/card-form.tsx
    - src/components/cards/card-display.tsx
  modified:
    - src/app/(app)/carteira/page.tsx
decisions:
  - Free tier check via subscriptions table (1 card max for 'free' plan)
  - Limit and bill encrypted TEXT → number for UI
  - 8 preset card colors (purple, teal, orange, blue, red, pink, gray, black)
  - Visual credit card design with gradient (1.6:1 aspect ratio)
  - Horizontal scroll on mobile, grid on desktop for card display
  - Separate forms for accounts vs cards (cleaner UX)
metrics:
  duration: 2
  completed_at: "2026-02-12T00:37:27Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
  commits: 2
---

# Phase 2 Plan 03: Credit Cards CRUD Summary

**One-liner:** Credit cards management with encrypted limit/bill, visual card display with color gradients, free tier enforcement

## What Was Built

Complete credit cards CRUD system integrated into wallet page:

**TanStack Query Hooks (src/lib/queries/cards.ts):**
- `useCards()` — fetch all user cards, decrypt limit/bill
- `useCreateCard()` — create card with encryption + free tier check (1 max)
- `useUpdateCard()` — update card with field encryption
- `useDeleteCard()` — delete card
- current_bill defaults to 0 on create

**Components:**
- `CardForm` — Create/edit form with name, credit limit (currency input pt-BR), closing day (1-31), due day (1-31), color picker (8 preset colors)
- `CardDisplay` — Visual credit card with gradient background, card name, limit/bill (formatted currency), closing/due days, kebab menu (edit/delete)
- Updated wallet page (`/app/carteira`) — Added cards section alongside existing accounts section

**Features:**
- Limit and bill encrypted (AES-256-GCM) before storage, decrypted for display
- Free tier enforcement: max 1 card for 'free' plan users
- Currency input with pt-BR format (R$ 1.234,56)
- Visual credit card design with colored gradients (aspect ratio 1.6:1)
- Responsive: horizontal scroll (snap-x) on mobile, grid on desktop
- Delete confirmation via AlertDialog
- Form prevents Enter key submission

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | TanStack Query hooks for credit cards | 6f1d548 | cards.ts |
| 2 | Card components + integrate into wallet page | 7e3ddb4 | card-form.tsx, card-display.tsx, carteira/page.tsx |

## Verification Results

- `npx tsc --noEmit` — PASSED (no type errors)
- All 4 hooks exported from cards.ts ✓
- useCards, CardForm, CardDisplay used in wallet page ✓
- Wallet page has both "Contas bancárias" and "Cartões de crédito" sections ✓
- Free tier enforcement logic in useCreateCard ✓
- Visual card display with gradient and colored backgrounds ✓

## Deviations from Plan

None — plan executed exactly as written.

## Key Decisions

1. **Free tier check via subscriptions table** — Query subscriptions.plan to enforce 1-card limit for 'free' users (consistent with accounts pattern)
2. **Limit/bill as encrypted TEXT → number for UI** — Database stores encrypted string, decrypt to number for forms/display
3. **8 preset card colors** — Purple, teal, orange, blue, red, pink, gray, black — visual differentiation, banking app aesthetic
4. **Visual credit card design** — Gradient backgrounds, 1.6:1 aspect ratio, mimics physical credit cards
5. **Horizontal scroll on mobile** — Cards displayed in scrollable row with snap-x for native feel
6. **Separate account/card forms** — Cleaner UX with dedicated modals instead of combined form

## Impact on Codebase

**Enables:**
- Users can manage credit cards (CARD-01 through CARD-05)
- Transactions can link to credit_card_id (Plan 02-04)
- Current bill calculation will be implemented in Plan 02-04 (currently shows R$ 0,00)

**Breaking changes:** None

**Dependencies added:** None (all UI components already installed)

## Next Steps

Plan 02-04 (Transactions CRUD) will:
- Link transactions to bank_account_id or credit_card_id
- Calculate current_bill for credit cards based on credit transactions
- Show transactions in filtered views

## Self-Check

Verifying all claimed files and commits exist:

**Files created:**
- ✓ src/lib/queries/cards.ts
- ✓ src/components/cards/card-form.tsx
- ✓ src/components/cards/card-display.tsx

**Files modified:**
- ✓ src/app/(app)/carteira/page.tsx (has both accounts and cards sections)

**Commits:**
- ✓ 6f1d548: feat(02-03): create TanStack Query hooks for credit cards
- ✓ 7e3ddb4: feat(02-03): create card components and integrate into wallet page

## Self-Check: PASSED

All files created and commits verified.
