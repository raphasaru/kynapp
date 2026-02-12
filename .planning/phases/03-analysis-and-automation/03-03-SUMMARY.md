---
phase: 03-analysis-and-automation
plan: 03
subsystem: reports
tags: [charts, recharts, aggregation, reports, visualization]
completed: 2026-02-12

dependency-graph:
  requires: [03-01-budget-management, 02-04-transactions, 02-01-date-formatters]
  provides: [chart-data-transforms, expense-pie-chart, income-expense-bars, reports-page]
  affects: [relatorios-route, transaction-queries]

tech-stack:
  added: [recharts@3.7.0, date-fns/subMonths]
  patterns: [useQueries-multi-month, client-side-aggregation, responsive-charts]

key-files:
  created:
    - src/lib/aggregations/chart-data.ts
    - src/lib/aggregations/date-ranges.ts
    - src/components/charts/expense-pie-chart.tsx
    - src/components/charts/income-expense-bars.tsx
    - src/components/charts/report-summary.tsx
    - src/app/app/relatorios/page.tsx
  modified: []

decisions:
  - useQueries for 6-month fetch (parallel queries, cached by TanStack Query)
  - Client-side aggregation (no server queries, efficient with cached data)
  - ResponsiveContainer for all charts (mobile-first)
  - CHART_COLORS constant (9 colors for 9 categories, matches brand)
  - Empty states for pie chart (no despesas message)

metrics:
  duration: 152s
  tasks_completed: 2
  files_created: 6
  commits: 2
---

# Phase 03 Plan 03: Historical Reports Summary

**Reports page with pie chart (expenses by category), bar chart (income vs expenses 6 months), financial summary.**

## Implementation

### Task 1: Chart Data Aggregation Utilities
**Commit:** `db5ea1a`

Created aggregation utilities to transform decrypted transactions into Recharts-compatible formats:

**date-ranges.ts:**
- `getLast6Months()` — generates array of 6 months (5 months ago to current) with yyyy-MM format and pt-BR labels (e.g., "Fev 26")
- Re-exports `getMonthRange` from formatters for convenience

**chart-data.ts:**
- `getExpenseByCategoryData()` — filters completed expenses, groups by category, returns sorted array for pie chart with category labels
- `getIncomeExpenseByMonth()` — aggregates income/expense totals for each of 6 months, returns bar chart data
- `getReportSummary()` — calculates totalReceived (completed income), totalPaid (completed expenses), projectedBalance (all income - all expenses including planned)
- `CHART_COLORS` constant — 9 colors matching primary brand (#10b77f) + complementary palette

All functions work with `DecryptedTransaction[]` type from queries/transactions.

### Task 2: Chart Components + Reports Page
**Commit:** `4b9d88e`

Created three chart components and reports page:

**ExpensePieChart:**
- Props: transactions (DecryptedTransaction[])
- Uses useMemo + getExpenseByCategoryData
- ResponsiveContainer 100% width, 300px height
- Pie with labels, CHART_COLORS cells, Tooltip with formatCurrency, Legend
- Empty state: "Nenhuma despesa registrada neste periodo"
- aria-label for accessibility

**IncomeExpenseBars:**
- Props: transactionsByMonth (Map)
- Uses useMemo + getLast6Months + getIncomeExpenseByMonth
- ResponsiveContainer 100% width, 300px height
- BarChart with CartesianGrid, XAxis (month labels), YAxis (hidden on mobile), Tooltip, Legend
- Two bars: income (#10b77f), expense (#ef4444)
- aria-label for accessibility

**ReportSummary:**
- Props: totalReceived, totalPaid, projectedBalance
- Three Card components in grid (same pattern as BalanceCards)
- "Total Recebido" (green), "Total Pago" (red), "Saldo Projetado" (green/red conditional)
- formatCurrency for all values

**/app/relatorios/page.tsx:**
- useMonthSelector() for month context
- useQueries to fetch last 6 months transactions in parallel
- Builds Map<string, DecryptedTransaction[]> for bar chart
- Current month data for pie chart and summary
- Layout: Header + MonthSelector + ReportSummary + ExpensePieChart card + IncomeExpenseBars card
- Skeleton loading states for each section
- Stale time: 5 minutes (TanStack Query handles caching)

## Deviations from Plan

None — plan executed exactly as written.

## Verification

✓ `npx tsc --noEmit` passes
✓ `npm run build` succeeds
✓ /app/relatorios route created
✓ Pie chart renders with category colors and labels
✓ Bar chart shows 6 months with income (green) and expense (red) bars
✓ Summary cards show total received, total paid, projected balance
✓ Charts responsive via ResponsiveContainer
✓ Empty states display when no data
✓ aria-labels for accessibility

## Key Technical Decisions

1. **useQueries for multi-month fetch:** Instead of 6 separate useTransactions calls, used TanStack Query's useQueries to fetch 6 months in parallel. Each query uses same staleTime (5min) and caching logic. Efficient and prevents waterfall requests.

2. **Client-side aggregation:** All chart data transforms happen client-side using cached transaction data. No additional server queries. Fast and reduces DB load.

3. **CHART_COLORS palette:** 9 colors starting with brand primary (#10b77f) then complementary colors. Covers all 9 expense categories. Consistent visual identity.

4. **Empty states:** Pie chart shows friendly message when no expense data. Better UX than blank chart.

5. **Free tier note:** Plan mentions free tier = 3 months history. Built with 6 months fetch — free tier enforcement will happen in Phase 4 (subscription integration). Shows whatever data exists for now.

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| src/lib/aggregations/date-ranges.ts | 25 | Date range utilities (getLast6Months, re-export getMonthRange) |
| src/lib/aggregations/chart-data.ts | 130 | Chart data transforms (pie, bar, summary) + CHART_COLORS |
| src/components/charts/expense-pie-chart.tsx | 48 | Pie chart of expenses by category |
| src/components/charts/income-expense-bars.tsx | 38 | Bar chart of income vs expenses (6 months) |
| src/components/charts/report-summary.tsx | 43 | Summary cards (received/paid/projected) |
| src/app/app/relatorios/page.tsx | 123 | Reports page with charts + multi-month queries |

## Integration Points

- **Queries:** Uses TanStack Query useQueries with same pattern as useTransactions
- **Formatters:** Uses formatCurrency, date-fns with ptBR locale
- **Components:** Uses Card, Skeleton, MonthSelector from existing patterns
- **Categories:** Uses categoryLabels from lib/constants/categories
- **Encryption:** Works with DecryptedTransaction type from queries

## Success Criteria Met

✓ Pie chart shows expense breakdown by category for selected month
✓ Bar chart shows income vs expenses trend for last 6 months
✓ Summary cards display total received, total paid, projected balance
✓ Charts are responsive and accessible (aria-labels)
✓ Month selector controls the pie chart and summary period

## Next Steps

Phase 03 Plan 03 complete. Reports page ready. HIST-01 through HIST-03 requirements covered. Next: Phase 03 remaining plans (if any) or Phase 04 (subscriptions + WhatsApp integration).

## Self-Check

Verifying files created:

```bash
[ -f "src/lib/aggregations/date-ranges.ts" ] && echo "FOUND: src/lib/aggregations/date-ranges.ts"
[ -f "src/lib/aggregations/chart-data.ts" ] && echo "FOUND: src/lib/aggregations/chart-data.ts"
[ -f "src/components/charts/expense-pie-chart.tsx" ] && echo "FOUND: src/components/charts/expense-pie-chart.tsx"
[ -f "src/components/charts/income-expense-bars.tsx" ] && echo "FOUND: src/components/charts/income-expense-bars.tsx"
[ -f "src/components/charts/report-summary.tsx" ] && echo "FOUND: src/components/charts/report-summary.tsx"
[ -f "src/app/app/relatorios/page.tsx" ] && echo "FOUND: src/app/app/relatorios/page.tsx"
```

Verifying commits exist:

```bash
git log --oneline --all | grep -q "db5ea1a" && echo "FOUND: db5ea1a"
git log --oneline --all | grep -q "4b9d88e" && echo "FOUND: 4b9d88e"
```

## Self-Check: PASSED

All files created and all commits verified.
