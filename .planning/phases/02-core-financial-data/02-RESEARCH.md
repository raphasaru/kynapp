# Phase 2: Core Financial Data - Research

**Researched:** 2026-02-11
**Domain:** Financial data management with encryption, forms, and dashboards
**Confidence:** HIGH

## Summary

Phase 2 implements financial data CRUD operations (transactions, bank accounts, credit cards) with encrypted values, dashboard views with filtering, and budget tracking. Core technical challenge: balancing client-side encryption requirements with form UX and query caching.

**Key insight:** Must encrypt/decrypt on client before/after Supabase operations. TanStack Query cache holds decrypted data. Forms encrypt before mutation. All financial values stored as TEXT in DB.

**Primary recommendation:** Use Server Components for layout/fetching, Client Components for forms/interactivity. Encrypt in mutation callbacks before DB write. Decrypt after fetch. Keep TanStack Query queryFn on client for encryption access.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TanStack Query | ^5.90.21 | Server state + cache | Industry standard for React server state, mutation handling, optimistic updates |
| React Hook Form | ^7.71.1 | Form state management | Minimal re-renders, excellent DX, integrates with Zod |
| Zod | ^4.3.6 | Schema validation | Type-safe validation, transforms, error messages |
| Recharts | Latest | Charts/graphs | React-native charting, composable components, works with shadcn/ui |
| date-fns | Latest | Date manipulation | Lightweight, tree-shakable, locale support (pt-BR) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-currency-input-field | Latest | Currency input | Masked input for BRL, handles formatting |
| @radix-ui/react-popover | Via shadcn | Combobox/Select | Category picker, account selector |
| @radix-ui/react-select | Via shadcn | Simple dropdowns | Payment method, transaction type |
| @radix-ui/react-dialog | Via shadcn | Desktop modals | Transaction form on desktop |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Query | SWR | Less feature-rich, no devtools |
| Recharts | Victory Charts | More complex API, larger bundle |
| react-currency-input-field | react-number-format | More general, less currency-focused |

**Installation:**
```bash
npm install recharts date-fns react-currency-input-field
npx shadcn@latest add select dialog popover command calendar
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(app)/
│   ├── dashboard/page.tsx          # Dashboard (Server Component)
│   ├── transactions/page.tsx       # Transaction list
│   ├── accounts/page.tsx           # Bank accounts
│   └── cards/page.tsx              # Credit cards
├── components/
│   ├── dashboard/
│   │   ├── month-selector.tsx      # Client: month navigation
│   │   ├── balance-card.tsx        # Server: displays balance
│   │   ├── transaction-list.tsx    # Client: filtering, search
│   │   └── quick-actions.tsx       # Client: buttons
│   ├── transactions/
│   │   ├── transaction-form.tsx    # Client: create/edit form
│   │   ├── transaction-item.tsx    # Server: display item
│   │   └── category-select.tsx     # Client: category picker
│   ├── accounts/
│   │   ├── account-form.tsx        # Client: bank account form
│   │   └── account-card.tsx        # Server: display account
│   └── cards/
│       ├── card-form.tsx           # Client: credit card form
│       └── card-display.tsx        # Server: display card
├── lib/
│   ├── queries/
│   │   ├── transactions.ts         # TanStack Query hooks
│   │   ├── accounts.ts             # Account queries/mutations
│   │   └── cards.ts                # Card queries/mutations
│   ├── crypto/
│   │   ├── encrypt.ts              # Already exists
│   │   └── fields.ts               # Already exists
│   ├── formatters/
│   │   ├── currency.ts             # formatCurrency(n) → "R$ 1.234,56"
│   │   └── date.ts                 # pt-BR date formatting
│   └── validators/
│       ├── transaction.ts          # Zod schemas
│       ├── account.ts              # Zod schemas
│       └── card.ts                 # Zod schemas
├── hooks/
│   ├── use-month-selector.ts      # useState for month navigation
│   └── use-media-query.ts         # Desktop vs mobile detection
└── types/
    └── database.ts                 # Already exists (extend as needed)
```

### Pattern 1: Client-Side Encryption with TanStack Query
**What:** Encrypt before mutation, decrypt after query
**When to use:** All financial value operations (amount, balance, limit)
**Example:**
```typescript
// lib/queries/transactions.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { encryptFields, decryptFields } from '@/lib/crypto/encrypt'

export function useTransactions(month: string) {
  return useQuery({
    queryKey: ['transactions', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('due_date', `${month}-01`)
        .lt('due_date', getNextMonth(month))

      if (error) throw error

      // Decrypt on client after fetch
      return Promise.all(
        data.map(t => decryptFields('transactions', t))
      )
    }
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: TransactionInput) => {
      // Encrypt on client before insert
      const encrypted = await encryptFields('transactions', values)

      const { data, error } = await supabase
        .from('transactions')
        .insert(encrypted)
        .select()
        .single()

      if (error) throw error

      // Decrypt response before returning
      return decryptFields('transactions', data)
    },
    onSuccess: (data) => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}
```

### Pattern 2: Currency Input with React Hook Form + Zod
**What:** Masked BRL input that validates and stores as number
**When to use:** All amount/balance/limit fields
**Example:**
```typescript
// components/transactions/amount-input.tsx
'use client'

import { Controller } from 'react-hook-form'
import CurrencyInput from 'react-currency-input-field'

export function AmountInput({ control, name }: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <CurrencyInput
            intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
            decimalsLimit={2}
            decimalSeparator=","
            groupSeparator="."
            prefix="R$ "
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value ? parseFloat(value) : 0)
            }}
            className="input"
          />
          {fieldState.error && (
            <p className="text-sm text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

// lib/validators/transaction.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  type: z.enum(['income', 'expense']),
  category: z.string().optional(),
  due_date: z.date(),
  status: z.enum(['planned', 'completed']),
  payment_method: z.enum(['pix', 'cash', 'debit', 'credit', 'transfer', 'boleto']).optional(),
  bank_account_id: z.string().uuid().optional(),
  credit_card_id: z.string().uuid().optional()
})
```

### Pattern 3: Month Selector with URL State
**What:** Month navigation that syncs with URL params
**When to use:** Dashboard month filtering
**Example:**
```typescript
// components/dashboard/month-selector.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function MonthSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const month = searchParams.get('month') || format(new Date(), 'yyyy-MM')

  const handlePrevMonth = () => {
    const prev = format(subMonths(new Date(month + '-01'), 1), 'yyyy-MM')
    router.push(`/dashboard?month=${prev}`)
  }

  const handleNextMonth = () => {
    const next = format(addMonths(new Date(month + '-01'), 1), 'yyyy-MM')
    router.push(`/dashboard?month=${next}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handlePrevMonth}>←</button>
      <span className="font-medium">
        {format(new Date(month + '-01'), 'MMMM yyyy', { locale: ptBR })}
      </span>
      <button onClick={handleNextMonth}>→</button>
    </div>
  )
}
```

### Pattern 4: Responsive Form (Sheet on Mobile, Dialog on Desktop)
**What:** Form opens as bottom sheet on mobile, modal on desktop
**When to use:** Transaction creation, account/card forms
**Example:**
```typescript
// components/transactions/transaction-form-trigger.tsx
'use client'

import { useState } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { TransactionForm } from './transaction-form'

export function TransactionFormTrigger({ children }: Props) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <TransactionForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom">
        <TransactionForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
```

### Pattern 5: Optimistic Updates for Status Toggle
**What:** Mark transaction as completed with instant UI feedback
**When to use:** Toggling planned → completed status
**Example:**
```typescript
// lib/queries/transactions.ts
export function useToggleTransactionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'planned' | 'completed' }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          status,
          completed_date: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] })

      // Snapshot previous value
      const previous = queryClient.getQueryData(['transactions'])

      // Optimistically update
      queryClient.setQueryData(['transactions'], (old: any) => {
        return old?.map((t: any) =>
          t.id === id
            ? { ...t, status, completed_date: status === 'completed' ? new Date() : null }
            : t
        )
      })

      return { previous }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['transactions'], context?.previous)
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }
  })
}
```

### Anti-Patterns to Avoid
- **Encrypting in Server Components:** Encryption key (`NEXT_PUBLIC_ENCRYPTION_KEY`) only available on client. Always encrypt/decrypt in Client Components or query hooks.
- **Storing decrypted values in DB:** Never store plaintext financial data. Encrypt before insert/update.
- **Over-fetching for month view:** Don't fetch all transactions then filter client-side. Use Supabase date range filters (`.gte()`, `.lt()`).
- **Manual balance calculation:** Use Supabase computed columns or aggregate queries. Don't fetch all transactions to sum client-side.
- **Invalidating all queries on every mutation:** Be specific with query keys. `invalidateQueries({ queryKey: ['transactions', month] })` not `['transactions']`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency formatting | Custom regex/replace | `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` | Handles edge cases (negative, decimals, locales) |
| Date manipulation | Manual string splitting | date-fns | Timezone safety, leap years, locale formatting |
| Month calculations | Custom date math | `addMonths()`, `subMonths()` from date-fns | Edge cases (Dec→Jan year rollover) |
| Form validation | Manual error state | React Hook Form + Zod | Async validation, touched state, error messages |
| Masked currency input | Custom onChange handler | react-currency-input-field | Cursor position, selection, delete/backspace handling |
| Category icons | if/else or switch | Category map object with dynamic import | Maintainable, type-safe |

**Key insight:** Financial UX has deceptively complex edge cases. Use battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Encryption Key Not Available in Server Components
**What goes wrong:** Server Components can't access `NEXT_PUBLIC_*` env vars at runtime (only build time). Encryption fails silently or throws.
**Why it happens:** Next.js 15 App Router separates server/client bundles. Public env vars only injected into client bundle.
**How to avoid:**
- Keep all encryption/decryption in Client Components
- Use TanStack Query queryFn (runs on client) for fetching + decryption
- Use mutation callbacks (run on client) for encryption before insert
**Warning signs:** "window is not defined" or "crypto.subtle is undefined" errors

### Pitfall 2: TanStack Query Cache Mismatch After Mutation
**What goes wrong:** After creating transaction, list shows old data until manual refresh.
**Why it happens:** Mutation doesn't invalidate correct query keys, or optimistic update doesn't match server response shape.
**How to avoid:**
- Use `queryClient.invalidateQueries({ queryKey: ['transactions', month] })` in onSuccess
- For optimistic updates, ensure shape matches decrypted server response
- Always decrypt mutation response before returning
**Warning signs:** Data appears on refresh but not immediately after create/update

### Pitfall 3: Date Handling Without Timezone Awareness
**What goes wrong:** Transaction due_date shows wrong day. User in São Paulo (UTC-3) creates transaction for "today" but DB stores yesterday.
**Why it happens:** Mixing Date objects, ISO strings, and YYYY-MM-DD strings without considering timezone.
**How to avoid:**
- Store dates as DATE type (YYYY-MM-DD) not TIMESTAMPTZ
- Use `format(date, 'yyyy-MM-dd')` before sending to DB
- Parse as local date: `new Date(dateString + 'T00:00:00')` to force local timezone
**Warning signs:** Off-by-one day errors, especially for users in negative UTC offsets

### Pitfall 4: Mobile Form Submit on Enter Key
**What goes wrong:** On mobile, pressing Enter in amount field submits form instead of moving to next field or opening number pad.
**Why it happens:** React Hook Form default behavior triggers submit on Enter.
**How to avoid:**
```typescript
<form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault()
  }
}}>
```
**Warning signs:** User complaints about "form submitting too early"

### Pitfall 5: Recharts Not Responsive
**What goes wrong:** Chart overflows container or doesn't resize on mobile.
**Why it happens:** Recharts ResponsiveContainer requires explicit height.
**How to avoid:**
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    {/* ... */}
  </BarChart>
</ResponsiveContainer>
```
**Warning signs:** Chart is tiny or doesn't fit screen on mobile

### Pitfall 6: Category Select Without Default Option
**What goes wrong:** User creates expense without category, validation fails, error message unclear.
**Why it happens:** Zod schema marks category as optional, but UI doesn't show "(Nenhuma)" option.
**How to avoid:**
- Add placeholder option: `<SelectItem value="">Nenhuma categoria</SelectItem>`
- Or require category in schema: `category: z.string().min(1)`
**Warning signs:** Form validation error on submit with no visible field error

## Code Examples

Verified patterns from official sources and ecosystem best practices:

### Currency Formatter Utility
```typescript
// lib/formatters/currency.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Usage
formatCurrency(1234.56) // "R$ 1.234,56"
formatCurrency(-50.00)  // "-R$ 50,00"
```

### Date Formatter with pt-BR
```typescript
// lib/formatters/date.ts
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return format(d, pattern, { locale: ptBR })
}

// Usage
formatDate('2026-02-11') // "11/02/2026"
formatDate(new Date(), 'dd MMM yyyy') // "11 fev 2026"
```

### Transaction Form with Validation
```typescript
// components/transactions/transaction-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '@/lib/validators/transaction'
import { useCreateTransaction } from '@/lib/queries/transactions'

export function TransactionForm({ onSuccess }: Props) {
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      status: 'completed',
      due_date: new Date(),
      amount: 0
    }
  })

  const { mutate, isPending } = useCreateTransaction()

  const onSubmit = (values: TransactionInput) => {
    mutate(values, {
      onSuccess: () => {
        form.reset()
        onSuccess?.()
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

### Balance Calculation with Supabase RPC
```typescript
// Instead of fetching all transactions and summing client-side:
// ❌ BAD
const { data } = await supabase.from('transactions').select('*')
const balance = data.reduce((sum, t) => sum + decrypt(t.amount), 0)

// ✅ GOOD: Use Supabase RPC function
// supabase/003_functions_and_triggers.sql
CREATE OR REPLACE FUNCTION calculate_monthly_balance(
  p_user_id UUID,
  p_month TEXT
) RETURNS TABLE (
  income NUMERIC,
  expense NUMERIC,
  balance NUMERIC
) AS $$
BEGIN
  -- Still returns encrypted values, but aggregated server-side
  -- Client decrypts only 3 values instead of N transactions
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

// Client usage
const { data } = await supabase.rpc('calculate_monthly_balance', {
  p_user_id: user.id,
  p_month: '2026-02'
})

// Decrypt aggregated values
const income = await decryptNumber(data.income)
const expense = await decryptNumber(data.expense)
```

### Category Select with Icons
```typescript
// components/transactions/category-select.tsx
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { categoryLabels, categoryIcons } from '@/reference/categories'
import * as Icons from 'lucide-react'

export function CategorySelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione categoria" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = Icons[categoryIcons[key] as keyof typeof Icons]
          return (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fetch all, filter client | Supabase query filters | Always | Reduces payload, faster queries |
| Server Actions for CRUD | TanStack Query mutations | 2024-2025 | Better loading states, error handling, optimistic UI |
| Redux for server state | TanStack Query | 2020-2021 | Less boilerplate, automatic caching |
| Custom date pickers | Native input[type=date] + date-fns | 2023+ | Better mobile UX, smaller bundle |
| PropTypes | TypeScript + Zod | 2019+ | Runtime + compile-time safety |
| Context for forms | React Hook Form | 2020+ | Performance, validation, less re-renders |

**Deprecated/outdated:**
- ~~Formik~~ → Use React Hook Form (better performance, smaller bundle)
- ~~Yup~~ → Use Zod (TypeScript-first, better inference)
- ~~Moment.js~~ → Use date-fns (smaller, tree-shakable, immutable)
- ~~react-hook-form Controller~~ → Still current! Not deprecated.
- ~~Server Actions for mutations~~ → Still valid, but TanStack Query preferred for complex state

## Open Questions

1. **Search implementation**
   - What we know: TRNS-07 requires transaction search by description. Encrypted descriptions can't use Postgres full-text search or ILIKE.
   - What's unclear: Should we fetch all transactions for month then filter client-side (slow for 1000+ transactions), or decrypt server-side with RPC function (exposes encryption key to service role)?
   - Recommendation:
     - Phase 2: Client-side filter (fetch month's transactions, decrypt, filter by description). Acceptable for <500 transactions/month.
     - Phase 3: Consider indexing hash of description for searchability without exposing plaintext.

2. **Bank account balance calculation**
   - What we know: bank_accounts.balance is encrypted TEXT. Must update when transactions change.
   - What's unclear: Update balance client-side after every transaction mutation (risk of drift), or recalculate from transactions on every page load (slow)?
   - Recommendation:
     - Store balance as cached value, update optimistically on transaction create/delete
     - Add "Recalculate Balance" button in accounts page for manual sync
     - Phase 3: Add Postgres trigger to auto-update (requires server-side encryption key)

3. **Date range for "3 months history" (Free tier limit)**
   - What we know: Free users see only 3 months of history (FUNCIONALIDADES.md)
   - What's unclear: Is this "last 90 days" or "current month + 2 previous months"? How to enforce: hide in UI or RLS policy?
   - Recommendation:
     - Interpret as "current month + 2 previous complete months"
     - Enforce in UI (query filter), not RLS (allows future access if they upgrade)
     - Add helper: `getVisibleMonthRange(subscription.plan)` → `{ start: '2025-11-01', end: '2026-02-28' }`

4. **Recharts bundle size**
   - What we know: Recharts composable but large bundle
   - What's unclear: What's bundle impact for Phase 2? Worth optimizing?
   - Recommendation:
     - Accept Recharts for Phase 2 (2 charts: monthly balance bar, category pie)
     - Lazy load chart components: `const BarChart = dynamic(() => import('recharts').then(m => m.BarChart))`
     - If bundle >200KB, consider lightweight alternative (Chart.js wrapper) in Phase 3

## Sources

### Primary (HIGH confidence)
- [TanStack Query Official Docs](https://tanstack.com/query/v5/docs/react/guides/mutations) - Mutations, optimistic updates, cache invalidation
- [React Hook Form Official Docs](https://react-hook-form.com/advanced-usage) - Advanced patterns, Controller usage
- [Zod Official Docs](https://zod.dev) - Schema validation, transforms
- [shadcn/ui Components](https://ui.shadcn.com/docs/components) - Dialog, Sheet, Select, Form
- [Next.js 15 Docs](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Server/Client Components, App Router
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - RLS patterns, security
- [Recharts Examples](https://recharts.github.io/en-US/examples/) - Chart patterns

### Secondary (MEDIUM confidence)
- [Mastering Form Handling in Next.js 15 with Server Actions, React Hook Form, React Query, and ShadCN](https://medium.com/@sankalpa115/mastering-form-handling-in-next-js-15-with-server-actions-react-hook-form-react-query-and-shadcn-108f6863200f) - Form patterns 2026
- [Supabase RLS Best Practices: Production Patterns](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) - RLS performance optimization
- [TanStack Query Reusable Patterns & Optimistic UI](https://spin.atomicobject.com/tanstack-query-reusable-patterns/) - Mutation patterns
- [Currency Input with React Hook Form and Zod](https://arthurpedroti.com.br/currency-input-or-any-input-with-mask-integration-with-react-hook-form-and-zod/) - Masked input integration
- [How to Use Supabase with TanStack Query](https://makerkit.dev/blog/saas/supabase-react-query) - Integration patterns
- [Next.js 15 Advanced Patterns 2026](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7) - App Router patterns
- [shadcn/ui Form Patterns](https://www.shadcn.io/patterns/field-layouts-3) - Responsive layouts
- [The Top 5 React Chart Libraries 2026](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries) - Chart library comparison

### Tertiary (LOW confidence)
- None - all findings verified with official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries in package.json, official docs current
- Architecture: HIGH - Patterns verified with Next.js 15 + TanStack Query v5 official docs
- Pitfalls: MEDIUM-HIGH - Based on GitHub issues, Stack Overflow, and personal experience inference
- Encryption patterns: HIGH - Verified against existing codebase (src/lib/crypto/encrypt.ts)
- Currency/date formatting: HIGH - Intl API and date-fns official patterns

**Research date:** 2026-02-11
**Valid until:** 2026-03-15 (30 days - stable ecosystem)

**Notes:**
- No CONTEXT.md exists, no user constraints to honor
- Phase builds on existing auth + encryption foundation from Phase 1
- All database tables already exist, RLS policies active
- Focus: CRUD operations, not infrastructure
