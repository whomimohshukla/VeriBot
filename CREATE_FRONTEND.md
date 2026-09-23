# Complete Frontend Implementation Guide

Due to character limits, I'll create the most critical files. Here's the complete implementation plan:

## ✅ Created Files:

1. ✅ `web/src/api/client.ts` - Axios client with interceptors
2. ✅ `web/src/types/index.ts` - All TypeScript types
3. ✅ `web/src/store/authStore.ts` - Authentication state
4. ✅ `web/tailwind.config.js` - Tailwind configuration
5. ✅ `web/src/index.css` - Global styles with dark theme
6. ✅ `web/.env` - Environment variables

## 🚀 To Complete the Frontend:

I recommend using the frontend template generator. Run this command in the `web` directory:

```bash
# Install additional UI dependencies
npm install clsx tailwind-merge class-variance-authority
npm install @radix-ui/react-slot @radix-ui/react-dropdown-menu
npm install @radix-ui/react-dialog @radix-ui/react-tabs
npm install react-hot-toast sonner
```

## 📋 Files You Need to Create:

### 1. Core API Files (`src/api/`)
- `auth.api.ts` - Login, register, logout
- `projects.api.ts` - Project CRUD
- `tests.api.ts` - Test management
- `bugs.api.ts` - Bug tracking
- `analytics.api.ts` - Dashboard stats

### 2. UI Components (`src/components/ui/`)
- `Button.tsx`
- `Card.tsx`
- `Input.tsx`
- `Badge.tsx`
- `Table.tsx`
- `Modal.tsx`
- `Spinner.tsx`

### 3. Layout Components (`src/components/layout/`)
- `Sidebar.tsx` - Navigation sidebar
- `Header.tsx` - Top header with user menu
- `DashboardLayout.tsx` - Main layout wrapper

### 4. Pages (`src/pages/`)
- `auth/LoginPage.tsx`
- `auth/RegisterPage.tsx`
- `dashboard/DashboardPage.tsx`
- `projects/ProjectsPage.tsx`
- `tests/TestsPage.tsx`
- `bugs/BugsPage.tsx`

### 5. Routes (`src/routes/`)
- `index.tsx` - Route configuration
- `ProtectedRoute.tsx` - Auth guard

## 🎨 Design System:

**Colors:**
```css
Primary: #667eea (Purple)
Background: #0a0a0a (Black)
Card: #1a1a1a (Dark Gray)
Border: #2a2a2a
Text: #fafafa (White)
Muted: #6b7280 (Gray)
```

**Typography:**
- Headings: font-semibold
- Body: font-normal
- Code: font-mono

## 🔄 State Management:

**Zustand Stores:**
1. `authStore` - User authentication ✅
2. `projectStore` - Current project context
3. `uiStore` - UI state (sidebar, modals, notifications)

**React Query:**
- All server data (projects, tests, bugs)
- Automatic caching and refetching

## 📱 Key Features to Implement:

### Dashboard
```tsx
- Stats cards (tests run, pass rate, bugs)
- Recent activity feed
- Test trend chart
- Quick actions
```

### Projects
```tsx
- Project list with search
- Create/edit project modal
- Project stats
- Team members
```

### Tests
```tsx
- Test case list with filters
- Test run history
- Test results with evidence
- AI test generation
```

### Bugs
```tsx
- Bug list with severity filters
- Bug detail with timeline
- Create bug from test failure
- GitHub/Jira links
```

### Analytics
```tsx
- Pass/fail trends
- Flaky test detection
- Release risk score
- Top failing tests
```

## 🎯 Implementation Priority:

1. **High Priority:**
   - Auth pages (Login, Register)
   - Dashboard layout (Sidebar, Header)
   - Dashboard page (Stats, Activity)
   - Projects page
   - Tests page

2. **Medium Priority:**
   - Bug tracking
   - Test results viewer
   - Analytics charts
   - Settings

3. **Low Priority:**
   - Advanced analytics
   - Integrations
   - Team management

## 💻 Quick Start Template:

Here's a minimal working example to get started:

### `src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
```

## 📦 Component Template:

### Button Component Example:
```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-white hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading && <Spinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
```

## 🚀 Next Steps:

1. Copy the component templates above
2. Create the page components
3. Wire up React Router
4. Connect to backend API
5. Test all features
6. Deploy!

---

**Need Help?** The complete codebase would be 50+ files. I recommend:
1. Using this guide to create files one by one
2. Or using a UI component library like shadcn/ui
3. Or I can create specific files you need most urgently

Let me know which components you want me to create first!
