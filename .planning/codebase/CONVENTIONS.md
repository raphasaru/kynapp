# Coding Conventions

**Analysis Date:** 2026-02-11

## Language & Framework

**Primary:** TypeScript (Next.js 15, App Router)
**Secondary:** SQL (Supabase/PostgreSQL)
**Build Tool:** npm, Next.js CLI

## Naming Patterns

### Files

- **Components:** PascalCase with .tsx extension
  - Example: `UserProfile.tsx`, `TransactionForm.tsx`
  - Location: `src/components/` or nested by feature

- **Hooks:** camelCase with .ts extension, prefixed with `use`
  - Example: `useTransactions.ts`, `useUserProfile.ts`
  - Location: `src/hooks/`

- **Utilities & Helpers:** camelCase with .ts extension
  - Example: `formatCurrency.ts`, `encryptValue.ts`
  - Location: `src/lib/utils.ts` or `src/lib/`

- **Server Actions:** camelCase with .ts extension, suffixed with `Action`
  - Example: `createTransactionAction.ts`, `updateBudgetAction.ts`
  - Location: `src/actions/` (Next.js convention)

- **Routes/Pages:** kebab-case directories in App Router
  - Example: `app/dashboard/page.tsx`, `app/auth/login/page.tsx`

- **API Routes:** kebab-case in `app/api/`
  - Example: `app/api/transactions/route.ts`, `app/api/stripe/webhooks/route.ts`

- **Database Tables:** snake_case (PostgreSQL convention)
  - Example: `bank_accounts`, `credit_cards`, `transaction_items`
  - Enums: lowercase with underscores (e.g., `expense_category`, `transaction_type`)

- **Configuration Files:** kebab-case or .config extension
  - Example: `next.config.js`, `.eslintrc.json`, `tsconfig.json`

### Functions

- **Naming:** camelCase, descriptive verb-noun pattern
  - Example: `formatCurrency()`, `calculateMonthlyBalance()`, `validateTransactionAmount()`
  - Async functions: same pattern, no special prefix
  - Example: `fetchUserTransactions()`, `createBankAccount()`

- **Handler Functions:** camelCase with `handle` prefix or explicit names
  - Example: `handleDeleteTransaction()`, `onSubmit()`, `onClick()`

- **Getters/Checkers:** camelCase with `get` or `is`/`has` prefix
  - Example: `getMonthlyTotal()`, `isUserPremium()`, `hasValidPaymentMethod()`

### Variables

- **Constants:** UPPER_SNAKE_CASE for module-level constants
  - Example: `FREE_WHATSAPP_LIMIT`, `STRIPE_PRO_MONTHLY_PRICE_ID`
  - Location: typically in `reference/` or top of file with JSDoc

- **Variables:** camelCase
  - Example: `userBalance`, `transactionList`, `selectedMonth`

- **Boolean variables:** `is`, `has`, `should`, `can` prefix
  - Example: `isLoading`, `hasError`, `shouldValidate`, `canDelete`

- **Enums/Types:** PascalCase
  - Example: `TransactionType`, `ExpenseCategory`, `PaymentMethod`

### Types & Interfaces

- **Naming:** PascalCase, descriptive names
  - Example: `Transaction`, `BankAccount`, `UserProfile`

- **Type suffix convention:** Types prefixed or use `Type` suffix if needed
  - Example: `type SubscriptionPlan = 'free' | 'pro' | 'pro_annual'`
  - Interfaces: no suffix (e.g., `interface Plan { ... }`)

- **Database types:** Reflect database tables
  - Example: `BankAccount`, `CreditCard`, `TransactionItem`

## Code Style

### Formatting

- **Tool:** Prettier (standard Next.js/React ecosystem)
- **Line Length:** 100 characters (common TypeScript standard)
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings (unless template literals needed)
- **Semicolons:** Always included

### Linting

- **Tool:** ESLint with Next.js recommended config
- **Key Rules:**
  - No unused variables or imports
  - Consistent naming conventions
  - React Hook Rules enforced (dependencies, etc.)
  - Type safety for React components

## Import Organization

### Order

1. **React & Framework imports** (React, Next.js modules)
   ```typescript
   import React from 'react'
   import { useState } from 'react'
   import { useRouter } from 'next/navigation'
   ```

2. **External packages** (third-party libraries)
   ```typescript
   import { useQuery } from '@tanstack/react-query'
   import { useForm } from 'react-hook-form'
   import { Button } from 'shadcn/ui'
   ```

3. **Absolute imports** (path aliases)
   ```typescript
   import { formatCurrency } from '@/lib/utils'
   import { TransactionCard } from '@/components/TransactionCard'
   import { useTransactions } from '@/hooks/useTransactions'
   ```

4. **Relative imports** (current folder/sibling files)
   ```typescript
   import { helper } from './helper'
   ```

5. **Type imports** (grouped at end or with other imports using `type` keyword)
   ```typescript
   import type { Transaction } from '@/lib/types'
   ```

### Path Aliases

Based on `reference/shadcn-config.json`:
- `@/components` → component files
- `@/components/ui` → shadcn/ui components
- `@/lib` → utilities and helpers
- `@/lib/utils` → formatting, type guards, etc.
- `@/hooks` → custom React hooks
- `@/app` → pages/app directory
- `@/actions` → server actions

## Error Handling

### Patterns

- **Try-Catch Blocks:** Used for async operations and API calls
  ```typescript
  try {
    const response = await createTransaction(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Transaction creation failed:', message)
  }
  ```

- **Type Guards:** Check error type before accessing properties
  ```typescript
  if (error instanceof Error) {
    // Safe to access error.message
  }
  ```

- **Zod Validation:** Forms validated with React Hook Form + Zod
  - Errors exposed in form via `formState.errors`
  - User-facing error messages in Portuguese (pt-BR)

- **API Error Responses:** Return consistent error shape
  ```typescript
  { success: false, error: string, code?: string }
  ```

- **Component Error Boundaries:** Recommended for Next.js App Router
  - Catch React render errors and show fallback UI

## Logging

### Framework

- **Primary:** `console` object
- **Levels:** `console.log()`, `console.warn()`, `console.error()`

### Patterns

- **Development:** Log at function entry/exit for debugging
  ```typescript
  console.log('[useTransactions] Fetching transactions for month:', month)
  ```

- **Errors:** Always log with context
  ```typescript
  console.error('[createTransaction]', error)
  ```

- **Production:** Minimal logging (consider error tracking via Sentry/similar if needed)
  - Log user-facing errors
  - Do NOT log sensitive data (amounts, PII)

- **Format:** `[FunctionName]` prefix for context
  - Example: `[fetchUserBalance]`, `[validatePaymentMethod]`

## Comments

### When to Comment

- **Complex Logic:** Explain WHY, not WHAT (code shows what)
  ```typescript
  // Recurring transactions run on day 1 of month, unless invalid day for month
  const recurringDay = day <= daysInMonth ? day : daysInMonth
  ```

- **Non-Obvious Business Rules:** Especially around financial calculations
  ```typescript
  // Credit card installments must align with closing day, not billing day
  // See: FUNCIONALIDADES.md section 5 - Parcelamento
  ```

- **Workarounds/Hacks:** Mark with `// TODO:` or `// HACK:`
  ```typescript
  // TODO: Switch to server action once Supabase client updates
  // HACK: Workaround for Zod validation with encrypted fields
  ```

- **Configuration:** Reference where values come from
  ```typescript
  // From PLANS in reference/stripe-plans.ts
  ```

### JSDoc/TSDoc

- **Functions:** Brief description, parameters, return type
  ```typescript
  /**
   * Formats numeric value as Brazilian Real currency
   * @param value - Number to format
   * @returns Formatted string (e.g., "R$ 1.234,56")
   */
  export function formatCurrency(value: number): string
  ```

- **Types/Interfaces:** Describe purpose
  ```typescript
  /**
   * Represents a user's bank account with balance (encrypted)
   */
  interface BankAccount {
    id: string
    // ...
  }
  ```

- **Not Required:** For simple getters or obvious code
  - Use sparingly; over-documentation harms readability

## Function Design

### Size

- **Target:** 30-50 lines max per function
- **Rule:** If > 100 lines, consider breaking into helpers

### Parameters

- **Limit:** 3-4 parameters max
- **If More Needed:** Use object destructuring
  ```typescript
  function createTransaction({
    amount,
    description,
    category,
    date,
  }: TransactionInput) { ... }
  ```

- **Optional Parameters:** Use `?` in type definition
  ```typescript
  interface Options {
    includeArchived?: boolean
  }
  ```

### Return Values

- **Explicit Types:** Always annotate return type for public functions
  ```typescript
  function getUserBalance(userId: string): Promise<number> { ... }
  ```

- **Null/Undefined:** Use optional types or Result pattern
  ```typescript
  function findTransaction(id: string): Transaction | null { ... }
  ```

- **Success/Error:** For complex operations, consider Promise-based errors or typed returns
  ```typescript
  type Result<T> = { success: true; data: T } | { success: false; error: string }
  ```

## Module Design

### Exports

- **Explicit Exports:** Export only what's needed
  ```typescript
  export const publicAPI = { ... }
  export function validateTransaction(t: Transaction): boolean { ... }
  ```

- **Avoid:** `export * from './file'` (use barrel files intentionally)

- **Internal:** Mark internal functions/types with `// internal` comment
  ```typescript
  // internal
  function calculateInstallmentSchedule() { ... }
  ```

### Barrel Files

- **Usage:** `index.ts` in directories for organized exports
  - `src/lib/index.ts` → exports all utilities
  - `src/components/ui/index.ts` → exports shadcn/ui components

- **Example:**
  ```typescript
  // src/lib/index.ts
  export { formatCurrency } from './formatCurrency'
  export { encryptValue } from './encryption'
  export type { Transaction } from './types'
  ```

## Database Naming

### Tables

- **Convention:** snake_case, plural or descriptive
  - Example: `bank_accounts`, `credit_cards`, `transactions`, `subscriptions`

- **IDs:** Always `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`

- **Timestamps:** `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`

- **User Reference:** `user_id UUID REFERENCES auth.users(id)`

### Columns

- **Convention:** snake_case
  - Example: `due_date`, `closing_day`, `monthly_budget`

- **Encrypted Fields:** Stored as TEXT (AES-256-GCM encryption before write)
  - Marked in comments: `-- encrypted`
  - See: `reference/encryption-schemas.ts` for full list

- **Enums:** Use PostgreSQL ENUM type, values lowercase with underscores
  - Example: `expense_category`, `transaction_type`, `payment_method`

## Localization (Pt-BR)

### Standards

- **Language:** All user-facing strings in Portuguese (pt-BR)
  - Comments can be in English or Portuguese
  - Code identifiers (variables, functions) in English

- **Numbers:** Brazilian format
  - Thousands separator: `.`
  - Decimal separator: `,`
  - Example: `1.234,56` not `1,234.56`

- **Dates:** dd/MM/yyyy or Month Year
  - January → janeiro, February → fevereiro, etc.

- **Currency:** Always `R$` with space
  - Example: `R$ 1.234,56`

- **Example Reference:**
  - `reference/stripe-plans.ts` uses Portuguese for labels and descriptions
  - `reference/categories.ts` uses Portuguese for category names

## Type Safety

### Strict Mode

- **TypeScript Config:** `strict: true` (Next.js default)
- **No `any`:** Except in rare cases with // @ts-ignore comment
- **Explicit Types:** Public functions must have return types

### Database Types

- Generate types from Supabase schema or use manual definitions
- Keep synchronized with schema in `supabase/001_schema.sql`

---

*Convention analysis: 2026-02-11*
