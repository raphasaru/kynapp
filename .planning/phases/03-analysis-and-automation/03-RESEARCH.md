# Phase 3: Analysis & Automation - Research

**Researched:** 2026-02-11
**Domain:** Budget tracking, recurring transactions, financial reporting with charts
**Confidence:** HIGH

## Summary

Phase 3 adds budget management per category with visual progress bars, recurring transaction templates with auto-generation via Supabase Cron, and historical analysis through Recharts visualizations. Core technical challenges: (1) aggregating encrypted financial data client-side for charts/budgets, (2) handling recurring transaction edge cases (31st day, February), (3) cron-based auto-generation of monthly transactions from templates.

**Key insight:** Budget calculations and chart data aggregation MUST happen client-side after decryption. Can't aggregate encrypted TEXT values in SQL. TanStack Query holds decrypted transactions; derive budget spent/remaining via useMemo. Recharts renders after aggregation.

**Primary recommendation:** Use Supabase pg_cron for monthly recurring generation (runs SQL function at 00:01 on 1st of month). Store recurring templates separate from transactions. Budget progress thresholds: green (0-75%), yellow (75-90%), red (90%+). Recharts ResponsiveContainer + PieChart/BarChart with custom labels for pt-BR.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | ^3.7.0 | Pie/bar charts | Already installed, React-native API, composable, works with shadcn |
| date-fns | ^4.1.0 | Month navigation, date ranges | Already installed, pt-BR locale, lightweight |
| TanStack Query | ^5.90.21 | Derived budget state | Already installed, select option for data transforms |
| React Hook Form + Zod | Already installed | Budget/recurring forms | Consistent with Phase 2 patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase pg_cron | Built-in extension | Recurring transaction auto-generation | Monthly scheduled jobs |
| Lucide icons | ^0.563.0 | Chart legends, budget icons | Already installed |
| tailwindcss | ^4 | Progress bar colors (green/yellow/red) | Already installed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Victory Charts | Heavier bundle, more complex API |
| pg_cron | Edge Functions + external cron | Network latency, extra infra cost |
| Client aggregation | Postgres SUM | Can't aggregate encrypted TEXT values |

**Installation:**
```bash
# All dependencies already installed
# Just enable pg_cron extension in Supabase Dashboard
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(app)/
│   ├── orcamento/page.tsx          # Budget management page
│   ├── recorrentes/page.tsx        # Recurring transactions list
│   └── historico/page.tsx          # Historical charts/reports
├── components/
│   ├── budgets/
│   │   ├── budget-form.tsx         # Edit all category limits at once
│   │   ├── budget-card.tsx         # Single category: progress bar + spent/limit
│   │   ├── budget-summary.tsx      # Total budgeted/spent/remaining
│   │   └── budget-progress.tsx     # Reusable progress bar component
│   ├── recurrents/
│   │   ├── recurring-form.tsx      # Create recurring template
│   │   ├── recurring-list.tsx      # Income/expense groups separately
│   │   └── recurring-item.tsx      # Single recurring group display
│   └── charts/
│       ├── expense-pie-chart.tsx   # Category breakdown (pie)
│       ├── income-expense-bars.tsx # 6-month evolution (bar)
│       ├── period-selector.tsx     # Month picker for charts
│       └── chart-legend.tsx        # Custom legend with pt-BR labels
├── lib/
│   ├── queries/
│   │   ├── budgets.ts              # TanStack Query hooks
│   │   ├── recurring.ts            # Recurring templates CRUD
│   │   └── analytics.ts            # Derived queries for chart data
│   ├── aggregations/
│   │   ├── budget-calc.ts          # Calculate spent per category
│   │   ├── chart-data.ts           # Transform transactions → chart format
│   │   └── date-ranges.ts          # Last 6 months, custom periods
│   └── validators/
│       ├── budget.ts               # Zod schema for budget limits
│       └── recurring.ts            # Zod schema for templates
└── supabase/
    └── 004_recurring_cron.sql      # pg_cron job setup
```

### Pattern 1: Client-Side Budget Aggregation
**What:** Decrypt transactions, group by category, sum amounts, calculate % of budget
**When to use:** Budget page, budget cards
**Example:**
```typescript
// lib/aggregations/budget-calc.ts
import type { DecryptedTransaction } from '@/lib/queries/transactions'
import type { Budget } from '@/lib/queries/budgets'

export function calculateCategorySpending(
  transactions: DecryptedTransaction[],
  category: string,
  status: 'completed' | 'all' = 'completed'
): number {
  return transactions
    .filter(t =>
      t.type === 'expense' &&
      t.category === category &&
      (status === 'all' || t.status === status)
    )
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getBudgetProgress(
  spent: number,
  limit: number
): { percent: number; color: 'green' | 'yellow' | 'red' } {
  const percent = limit > 0 ? (spent / limit) * 100 : 0

  // Thresholds: green 0-75%, yellow 75-90%, red 90%+
  let color: 'green' | 'yellow' | 'red' = 'green'
  if (percent >= 90) color = 'red'
  else if (percent >= 75) color = 'yellow'

  return { percent: Math.min(percent, 100), color }
}
```

### Pattern 2: Recharts with Encrypted Data Flow
**What:** Fetch → decrypt → aggregate → transform to chart format → render
**When to use:** All chart components
**Example:**
```typescript
// components/charts/expense-pie-chart.tsx
'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useTransactions } from '@/lib/queries/transactions'
import { categoryLabels } from '@/reference/categories'

const COLORS = ['#10b77f', '#2cedac', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b']

export function ExpensePieChart({ month }: { month: string }) {
  const { data: transactions = [], isLoading } = useTransactions(month)

  // Aggregate client-side after decryption
  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {}

    transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .forEach(t => {
        const cat = t.category || 'variable_other'
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount
      })

    return Object.entries(categoryTotals).map(([category, value]) => ({
      name: categoryLabels[category] || category,
      value,
      category
    }))
  }, [transactions])

  if (isLoading) return <ChartSkeleton />
  if (chartData.length === 0) return <EmptyState />

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => `R$ ${entry.value.toFixed(2)}`}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

### Pattern 3: Recurring Transaction Auto-Generation with pg_cron
**What:** Monthly cron job generates transactions from active templates
**When to use:** Background automation for recurring expenses/income
**Example:**
```sql
-- supabase/004_recurring_cron.sql

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function to generate recurring transactions for current month
CREATE OR REPLACE FUNCTION generate_recurring_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template RECORD;
  target_date DATE;
BEGIN
  FOR template IN
    SELECT * FROM recurring_templates WHERE is_active = true
  LOOP
    -- Calculate target date for this month
    target_date := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::int,
      EXTRACT(MONTH FROM CURRENT_DATE)::int,
      LEAST(template.day_of_month, EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '1 month - 1 day'))::int)
    );

    -- Check if transaction already exists for this month
    IF NOT EXISTS (
      SELECT 1 FROM transactions
      WHERE user_id = template.user_id
        AND recurring_group_id = template.id::text
        AND due_date = target_date
    ) THEN
      -- Insert new transaction
      INSERT INTO transactions (
        user_id, description, amount, type, category, custom_category_id,
        status, due_date, is_recurring, recurring_day, recurring_group_id,
        payment_method, bank_account_id, credit_card_id
      ) VALUES (
        template.user_id, template.description, template.amount, template.type,
        template.category, template.custom_category_id, 'planned', target_date,
        true, template.day_of_month, template.id::text,
        template.payment_method, template.bank_account_id, template.credit_card_id
      );
    END IF;
  END LOOP;
END;
$$;

-- Schedule job: runs at 00:01 on 1st of every month
SELECT cron.schedule(
  'generate-recurring-transactions',
  '1 0 1 * *', -- cron syntax: minute hour day month weekday
  $$SELECT generate_recurring_transactions();$$
);
```

### Pattern 4: Month Navigation with date-fns
**What:** Add/subtract months, preserve day-of-month when possible
**When to use:** Month selector, period navigation
**Example:**
```typescript
// components/charts/period-selector.tsx
'use client'

import { addMonths, subMonths, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PeriodSelector({
  currentMonth,
  onChange
}: {
  currentMonth: string // "2026-02"
  onChange: (month: string) => void
}) {
  const date = new Date(currentMonth + '-01')

  const handlePrev = () => {
    const prev = subMonths(date, 1)
    onChange(format(prev, 'yyyy-MM'))
  }

  const handleNext = () => {
    const next = addMonths(date, 1)
    onChange(format(next, 'yyyy-MM'))
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={handlePrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-lg font-semibold min-w-[140px] text-center">
        {format(date, 'MMMM yyyy', { locale: ptBR })}
      </span>

      <Button variant="outline" size="icon" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### Pattern 5: Budget Progress Bar with Color Thresholds
**What:** Visual progress bar that changes color based on % spent
**When to use:** Budget cards, category spending display
**Example:**
```typescript
// components/budgets/budget-progress.tsx
'use client'

import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface BudgetProgressProps {
  spent: number
  limit: number
  showLabel?: boolean
}

export function BudgetProgress({ spent, limit, showLabel = true }: BudgetProgressProps) {
  const percent = limit > 0 ? (spent / limit) * 100 : 0
  const cappedPercent = Math.min(percent, 100)

  // Color thresholds
  const color = percent >= 90 ? 'red' : percent >= 75 ? 'yellow' : 'green'

  const colorClasses = {
    green: 'bg-[#10b77f]',
    yellow: 'bg-amber-500', // Better contrast than pure yellow
    red: 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full transition-all duration-500',
            colorClasses[color]
          )}
          style={{ width: `${cappedPercent}%` }}
        />
      </div>

      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            R$ {spent.toFixed(2)} de R$ {limit.toFixed(2)}
          </span>
          <span className={cn(
            'font-medium',
            color === 'red' && 'text-red-500',
            color === 'yellow' && 'text-amber-600',
            color === 'green' && 'text-[#10b77f]'
          )}>
            {cappedPercent.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Server-side aggregation of encrypted data:** Can't SUM(amount) when amount is encrypted TEXT. Always decrypt first, aggregate client-side.
- **Hard-coding 31st for recurring:** February has 28/29 days. Use LEAST() to cap at month's last day.
- **Recharts without ResponsiveContainer:** Charts won't resize properly. Always wrap in ResponsiveContainer with explicit height.
- **Calculating budgets on every render:** Use useMemo to cache aggregations when transaction array doesn't change.
- **Yellow progress bar on white:** Low contrast, accessibility fail. Use amber-500 or orange-500 instead of pure yellow.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron job scheduler | Node cron service in separate container | Supabase pg_cron | Zero network latency, built-in, runs inside Postgres, free |
| Chart library | Canvas + manual drawing | Recharts | Accessibility, tooltips, legends, responsive, tested |
| Progress bar colors | Manual RGB/HSL calculations | Tailwind classes with transition-all | Consistent with design system, theme support |
| Month math | Manual date arithmetic | date-fns addMonths/subMonths | Handles leap years, month-end edge cases, timezones |
| Budget aggregation query builder | Custom SQL with CASE WHEN | Client-side reduce after decrypt | Encryption prevents SQL aggregation |

**Key insight:** Encryption forces client-side aggregation. Can't optimize with Postgres SUM/GROUP BY. Accept this tradeoff for security. Use useMemo to cache.

## Common Pitfalls

### Pitfall 1: 31st Day Recurring Transactions in February
**What goes wrong:** Recurring template for 31st generates invalid date in February, crashes or skips month
**Why it happens:** make_date(2026, 2, 31) throws error, February only has 28/29 days
**How to avoid:** Use LEAST(day_of_month, last_day_of_month) in SQL generation function
**Warning signs:** Missing transactions in February for templates with day > 28

### Pitfall 2: Recharts Not Rendering (Height = 0)
**What goes wrong:** Chart area is invisible, no error thrown
**Why it happens:** ResponsiveContainer needs explicit height or parent with height
**How to avoid:** Set min-h-[300px] on container or height={300} on ResponsiveContainer
**Warning signs:** Empty white space where chart should be, no console errors

### Pitfall 3: Pure Yellow Progress Bar (Accessibility)
**What goes wrong:** Yellow on white is invisible to colorblind users, low contrast
**Why it happens:** Using bg-yellow-500 directly from Tailwind
**How to avoid:** Use amber-500 or orange-500 for warning state, always include text labels
**Warning signs:** WCAG contrast checker fails, users report can't see yellow bars

### Pitfall 4: Budget Calculations on Every Keystroke
**What goes wrong:** Typing in filter input causes full transaction aggregation loop, UI freezes
**Why it happens:** Not using useMemo for derived budget state, recalculates on every render
**How to avoid:** Wrap aggregation logic in useMemo with [transactions] dependency
**Warning signs:** Lag when typing in search, React DevTools shows expensive renders

### Pitfall 5: Recurring Template Without End Date
**What goes wrong:** Cron generates transactions forever, bloats database, confuses user
**Why it happens:** Allowing null recurring_end_date in template
**How to avoid:** Make recurring_end_date required in Zod schema, default to +12 months
**Warning signs:** Transactions appear in 2030, database size grows unexpectedly

### Pitfall 6: VoiceOver Can't Navigate Charts
**What goes wrong:** Screen reader users can't access chart data
**Why it happens:** Recharts needs accessibilityLayer and ARIA labels
**How to avoid:** Add aria-label to ResponsiveContainer, use accessibilityLayer prop, provide data table alternative
**Warning signs:** Keyboard navigation skips over charts, VoiceOver silent

## Code Examples

Verified patterns from official sources:

### Recharts Bar Chart (6-Month Evolution)
```typescript
// Source: https://recharts.github.io/en-US/examples/SimpleBarChart/
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthData {
  month: string // "Jan 26"
  income: number
  expense: number
}

export function IncomeExpenseBars({ transactions }: { transactions: DecryptedTransaction[] }) {
  const chartData: MonthData[] = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i)
      return {
        month: format(date, 'MMM yy', { locale: ptBR }),
        yearMonth: format(date, 'yyyy-MM'),
        income: 0,
        expense: 0
      }
    })

    transactions
      .filter(t => t.status === 'completed')
      .forEach(t => {
        const tMonth = t.due_date.substring(0, 7) // "2026-02"
        const monthData = last6Months.find(m => m.yearMonth === tMonth)
        if (monthData) {
          if (t.type === 'income') monthData.income += t.amount
          else monthData.expense += t.amount
        }
      })

    return last6Months
  }, [transactions])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Bar dataKey="income" fill="#10b77f" name="Receitas" />
        <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

### date-fns Month Range Calculation
```typescript
// Source: https://date-fns.org/docs/startOfMonth
import { startOfMonth, endOfMonth, format } from 'date-fns'

export function getMonthRange(month: string): { start: string; end: string } {
  const date = new Date(month + '-01')
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd')
  }
}

// Usage in query
const { start, end } = getMonthRange('2026-02')
// start: "2026-02-01"
// end: "2026-02-28"
```

### pg_cron Edge Case Handling
```sql
-- Source: https://github.com/citusdata/pg_cron
-- Handle 31st day recurring in months with <31 days

SELECT make_date(
  EXTRACT(YEAR FROM CURRENT_DATE)::int,
  EXTRACT(MONTH FROM CURRENT_DATE)::int,
  LEAST(
    template.day_of_month,
    EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'))::int
  )
);

-- Example: day_of_month = 31, current month = February 2026
-- Result: 2026-02-28 (not 2026-02-31 which would error)
```

### TanStack Query with Derived Budget State
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/derived-queries
import { useTransactions } from './transactions'
import { useBudgets } from './budgets'

export function useBudgetWithSpending(category: string, month: string) {
  const { data: transactions = [] } = useTransactions(month)
  const { data: budgets = [] } = useBudgets()

  // Use select to derive state without creating new query
  const budget = budgets.find(b => b.category === category)

  const spent = useMemo(() =>
    transactions
      .filter(t => t.type === 'expense' && t.category === category && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions, category]
  )

  return {
    budget,
    spent,
    remaining: (budget?.monthly_budget || 0) - spent,
    percent: budget?.monthly_budget ? (spent / budget.monthly_budget) * 100 : 0
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side cron (external service) | pg_cron inside Postgres | 2024 | Zero network latency, simpler infra, free tier friendly |
| Victory Charts | Recharts v3 | 2025 | Lighter bundle, better DX, shadcn/ui integration |
| date-fns v2 | date-fns v4 | 2026 | ESM-only, better tree-shaking, faster imports |
| Pure yellow warnings | Amber/orange warnings | 2024 | Better accessibility, WCAG 2.1 compliance |
| Recharts without accessibility | accessibilityLayer prop | 2024 | Screen reader support, keyboard navigation |

**Deprecated/outdated:**
- Recharts v2: Missing TypeScript types, no accessibility layer
- External cron services for Supabase: pg_cron is built-in and free since 2024
- date-fns v2: CommonJS, larger bundle, slower imports

## Open Questions

1. **Free tier cron limit?**
   - What we know: pg_cron is available on Supabase free tier
   - What's unclear: Any rate limits or max concurrent jobs?
   - Recommendation: Test with single job first, monitor Supabase logs

2. **Chart data for >3 months on free tier?**
   - What we know: Free tier shows 3 months history (FUNCIONALIDADES.md line 632)
   - What's unclear: Should 6-month bar chart show all 6 or just available 3?
   - Recommendation: Show what's available, "Upgrade Pro" watermark for missing months

3. **Recurring template activation/deactivation UX?**
   - What we know: recurring_templates has is_active boolean
   - What's unclear: Does user pause/resume templates or just delete?
   - Recommendation: Add toggle in recurring list, cron respects is_active flag

## Sources

### Primary (HIGH confidence)
- Recharts official examples - https://recharts.github.io/en-US/examples/
- Supabase pg_cron docs - https://supabase.com/docs/guides/cron
- date-fns v4 docs - https://date-fns.org/
- Existing codebase patterns (encryption, TanStack Query, component structure)

### Secondary (MEDIUM confidence)
- [Recharts accessibility discussion](https://github.com/recharts/recharts/discussions/4484)
- [TanStack derived queries](https://github.com/TanStack/query/discussions/2178)
- [Progress bar accessibility](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- [Recurring transaction edge cases](https://github.com/firefly-iii/firefly-iii/issues/5830)

### Tertiary (LOW confidence)
- Budget tracker React patterns (GitHub examples, no single authoritative source)
- Financial app color thresholds (industry convention, not standardized)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, verified versions
- Architecture: HIGH - Patterns follow Phase 2 established conventions
- Pitfalls: MEDIUM - Edge cases verified via official docs and GitHub issues
- Recharts usage: HIGH - Official examples and docs
- pg_cron: HIGH - Official Supabase docs
- Budget color thresholds: MEDIUM - Industry convention, not spec

**Research date:** 2026-02-11
**Valid until:** 2026-03-15 (30 days, stable libraries)
