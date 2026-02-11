# Testing Patterns

**Analysis Date:** 2026-02-11

## Test Framework

**Status:** Not yet implemented

The project currently has no test infrastructure configured. The following recommendations are based on Next.js 15 best practices and the tech stack described in CLAUDE.md.

### Recommended Setup

**Framework:** Vitest (modern, fast, ESM-native alternative to Jest)
- **Why:** Better performance than Jest, built for modern tooling, excellent TypeScript support

**Alternative:** Jest (if strong Jest preference exists)
- Note: Next.js works with both; Vitest has slight edge for Next.js 15

**Assertion Library:** Vitest's built-in assertion library or `chai`
- Vitest includes comprehensive assertion methods

**Testing Library:** `@testing-library/react` + `@testing-library/user-event`
- Standard for React component testing
- Encourages testing user interactions, not implementation details

**E2E Testing (Optional):** Playwright or Cypress
- Recommend Playwright for speed and Next.js integration
- Test critical user flows: auth, transactions, payments

## Test File Organization

### Location Pattern

- **Co-located with source:** Recommended pattern
  ```
  src/
  ├── components/
  │   ├── TransactionCard.tsx
  │   └── TransactionCard.test.tsx
  ├── lib/
  │   ├── formatCurrency.ts
  │   └── formatCurrency.test.ts
  ├── hooks/
  │   ├── useTransactions.ts
  │   └── useTransactions.test.ts
  └── actions/
      ├── createTransactionAction.ts
      └── createTransactionAction.test.ts
  ```

- **Why:** Easier to find tests, clear coupling between code and tests, easier to move files together

### Naming

- **Test files:** `[FileName].test.ts` or `[FileName].test.tsx`
  - Example: `formatCurrency.test.ts`, `TransactionCard.test.tsx`
  - **NOT** `.spec.ts` (Vitest convention is `.test.ts`)

- **Test directories (alternative):** `__tests__/` directory in project root
  - Only if company-wide preference or large test suite warrants centralization
  - Less recommended; prefer co-location

### Vitest Config File

**Location:** `vitest.config.ts` at project root

**Basic Template:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Setup File:** `src/test/setup.ts`
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

afterEach(() => {
  cleanup()
})
```

## Test Structure

### Basic Test Suite Format

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionCard } from './TransactionCard'

describe('TransactionCard', () => {
  // Setup
  const mockTransaction = {
    id: '123',
    description: 'Coffee',
    amount: '-15.50',
    date: new Date('2024-02-11'),
    status: 'completed',
  }

  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  // Tests
  it('renders transaction details correctly', () => {
    render(<TransactionCard transaction={mockTransaction} />)
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('R$ 15,50')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    render(<TransactionCard transaction={mockTransaction} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('123')
  })
})
```

### Pattern: Describe + It Structure

- **`describe()`** blocks group related tests (one per component/function)
- **`it()` or `test()`** blocks: one assertion focus per test
  - Descriptive names in plain English
  - Example: `it('renders transaction details correctly')`
  - Example: `it('calls onDelete when delete button clicked')`

- **Arrange-Act-Assert (AAA) Pattern:**
  ```typescript
  it('description', () => {
    // Arrange: Set up test data
    const props = { /* ... */ }

    // Act: Perform action
    render(<Component {...props} />)
    await user.click(screen.getByRole('button'))

    // Assert: Verify results
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
  ```

### Setup & Teardown

- **`beforeEach()`:** Runs before each test
  - Mock data setup
  - Render common components
  - Mock API calls

- **`afterEach()`:** Runs after each test
  - Cleanup registered in `vitest.config.ts` setup file
  - Manual cleanup: `cleanup()` from `@testing-library/react`

- **`beforeAll()` / `afterAll()`:** Rarely needed
  - Use for expensive operations (DB seeding, server setup)
  - Avoid if tests share state

## Mocking

### Framework

- **Mocking Library:** Vitest's `vi` object (similar to Jest's `jest`)
- **HTTP Mocking:** `msw` (Mock Service Worker) for API mocking
- **Database:** `@testing-library/react` mocks via providers/wrappers

### Patterns

#### Function Mocking

```typescript
import { vi, it, expect } from 'vitest'

it('calls saveTransaction with correct params', () => {
  const mockSave = vi.fn()
  callTransactionFlow(mockSave)

  expect(mockSave).toHaveBeenCalledWith({
    amount: 100,
    description: 'Test',
  })
  expect(mockSave).toHaveBeenCalledTimes(1)
})
```

#### Module Mocking

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/formatCurrency', () => ({
  formatCurrency: (val: number) => `R$ ${val}`,
}))
```

#### API Mocking with MSW

```typescript
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { describe, beforeAll, afterEach, afterAll } from 'vitest'

const handlers = [
  http.post('/api/transactions', () => {
    return HttpResponse.json({ id: '123', success: true })
  }),
]

const server = setupServer(...handlers)

describe('Transaction API', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('creates transaction via API', async () => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ amount: 100 }),
    })
    expect(response.ok).toBe(true)
  })
})
```

#### Component Mocking

```typescript
import { vi } from 'vitest'

vi.mock('@/components/TransactionForm', () => ({
  TransactionForm: () => <div>Mocked Form</div>,
}))
```

### What to Mock

**Mock External Dependencies:**
- Third-party APIs (Stripe, n8n, Supabase client calls)
- HTTP requests (use MSW)
- Time-based functions (`Date.now()`, `setTimeout`)
- Browser APIs (`localStorage`, `window.matchMedia`)

**What NOT to Mock:**
- Internal utility functions (`formatCurrency`, `validateAmount`)
- Pure functions (test directly)
- React Hook Form/Zod (test via user interactions)
- shadcn/ui components (test with them)

**Pattern for Supabase:**
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockTransaction })),
        })),
      })),
    })),
  },
}))
```

## Fixtures and Factories

### Test Data Pattern

**Location:** `src/test/fixtures.ts` or `src/test/factories/`

**Example Factory:**
```typescript
// src/test/factories/transactionFactory.ts
import type { Transaction } from '@/lib/types'

export function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'test-123',
    user_id: 'user-123',
    description: 'Test transaction',
    amount: '100.00',
    type: 'expense',
    category: 'variable_food',
    status: 'completed',
    due_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }
}

export function createBankAccount(overrides = {}) {
  return {
    id: 'account-123',
    user_id: 'user-123',
    name: 'Checking Account',
    type: 'checking',
    balance: '5000.00',
    ...overrides,
  }
}
```

**Usage in Tests:**
```typescript
import { createTransaction } from '@/test/factories/transactionFactory'

describe('TransactionCard', () => {
  it('displays transaction amount', () => {
    const transaction = createTransaction({ amount: '250.50' })
    render(<TransactionCard transaction={transaction} />)
    expect(screen.getByText('R$ 250,50')).toBeInTheDocument()
  })
})
```

**Why Factories:**
- Consistent test data
- Easy to override specific fields
- Reduces duplication across tests
- Easier to update when types change

## Coverage

### Requirements

**Target:** 70-80% coverage initially, increase as codebase matures
- Utility functions: 90%+ (easy to test)
- Components: 70-80% (focus on behavior, not implementation)
- Pages/Routes: 50%+ (lower priority, heavy mocking required)
- Hooks: 80%+ (core logic, testable)

### View Coverage

**Command:**
```bash
npm run test:coverage
```

**Add to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "latest"
  }
}
```

**Ignore Patterns:**
- Add to `vitest.config.ts`:
  ```typescript
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
    },
  }
  ```

## Test Types

### Unit Tests

**Scope:** Test single function/component in isolation

**What to Test:**
- Utility functions (`formatCurrency`, `encryptValue`, validation)
- Custom hooks logic
- Component behavior with mocked children
- Business logic (date calculations, recurring schedules)

**Example:**
```typescript
describe('formatCurrency', () => {
  it('formats number as Brazilian Real', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
    expect(formatCurrency(0.01)).toBe('R$ 0,01')
  })

  it('handles negative numbers (expenses)', () => {
    expect(formatCurrency(-50)).toBe('-R$ 50,00')
  })
})
```

### Integration Tests

**Scope:** Test multiple components/modules working together

**What to Test:**
- React Query hooks with mocked API
- Forms with validation (React Hook Form + Zod)
- Component trees rendering together
- Data flow between components

**Example:**
```typescript
describe('TransactionForm Integration', () => {
  it('submits form with validated data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<TransactionForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Amount'), '100.50')
    await user.type(screen.getByLabelText('Description'), 'Coffee')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 100.50,
      description: 'Coffee',
    })
  })

  it('shows validation error for invalid amount', async () => {
    const user = userEvent.setup()
    render(<TransactionForm />)

    await user.type(screen.getByLabelText('Amount'), 'not-a-number')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(screen.getByText(/must be a valid amount/i)).toBeInTheDocument()
  })
})
```

### E2E Tests (Future)

**When to Implement:** After MVP release, if user flows warrant it

**Framework Recommendation:** Playwright
- Modern, fast, supports multiple browsers
- Integrates well with Next.js
- Better for complex user journeys

**Scope:** Critical user paths
- User signup → onboarding → first transaction
- Transaction creation → Stripe payment
- WhatsApp integration testing

**Location:** `e2e/` directory at project root

**Not Yet Implemented:** Will be added in later phases

## Common Test Patterns

### Testing Async/Promises

```typescript
import { vi, it, expect } from 'vitest'

it('handles async operation', async () => {
  const result = await fetchTransactions('user-123')
  expect(result).toHaveLength(3)
})

it('handles error in async operation', async () => {
  vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
      from: () => ({
        select: () => Promise.reject(new Error('Network error')),
      }),
    },
  }))

  await expect(fetchTransactions('user-123')).rejects.toThrow('Network error')
})
```

### Testing React Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useTransactions } from '@/hooks/useTransactions'

it('fetches transactions on mount', () => {
  const { result } = renderHook(() => useTransactions('user-123'))

  expect(result.current.isLoading).toBe(true)
})

it('updates data when refetch called', async () => {
  const { result } = renderHook(() => useTransactions('user-123'))

  await act(async () => {
    await result.current.refetch()
  })

  expect(result.current.data).toBeDefined()
})
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event'

it('handles form submission', async () => {
  const user = userEvent.setup()
  render(<TransactionForm onSubmit={vi.fn()} />)

  // Type into input
  await user.type(screen.getByLabelText('Amount'), '100')

  // Click button
  await user.click(screen.getByRole('button', { name: /submit/i }))

  // Select from dropdown
  await user.selectOptions(screen.getByRole('combobox'), 'variable_food')
})
```

### Testing Error Handling

```typescript
it('displays error message on failed submission', async () => {
  vi.mock('@/actions/createTransactionAction', () => ({
    createTransaction: vi.fn(() =>
      Promise.reject(new Error('Insufficient balance'))
    ),
  }))

  const user = userEvent.setup()
  render(<TransactionForm />)

  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument()
})
```

## Best Practices

### Do

- **Test behavior, not implementation:** Click button, check if transaction appears
  - Not: Check if `setState` was called with X
- **Use descriptive test names:** `it('shows error when amount is negative')`
  - Not: `it('renders with negative amount')`
- **One logical assertion per test:** Test one thing well
- **Use user events, not fireEvent:** `userEvent.click()` is more realistic
- **Mock only external dependencies:** Keep internal code real
- **Keep tests fast:** Mock HTTP, avoid real API calls
- **Use factories for test data:** Reduces duplication, easier updates

### Don't

- **Test implementation details:** `expect(component.state.field).toBe('value')`
  - User doesn't care about internal state
- **Create huge test files:** Break into multiple describes
- **Skip/Only tests in commits:** Accidental CI failures
- **Test library code:** You don't own it
- **Test obvious code:** Every line doesn't need a test
  - Simple getters, renders without logic

---

*Testing analysis: 2026-02-11*
