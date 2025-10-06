Create a new feature following Feature-Sliced Design architecture with the specified name and requirements.

## Process

1. Use fsd-enforcer to validate the feature design and layer placement
2. Use typescript-pro to implement type-safe schemas and interfaces
3. Use react-architect to create React components with proper patterns
4. Use ui-specialist to ensure Mantine UI compliance and accessibility

## Feature Structure

Create the complete FSD feature structure:

```
features/{feature-name}/
├── ui/                     # React components
│   ├── {main-component}.tsx
│   ├── {main-component}.stories.tsx
│   └── {main-component}.test.tsx
├── model/                  # Business logic
│   ├── types.ts           # Zod schemas and TypeScript types
│   ├── validation.ts      # Form validation schemas
│   ├── constants.ts       # Feature constants
│   └── store.ts          # State management (if needed)
├── api/                   # Data layer
│   ├── queries.ts         # TanStack Query hooks
│   ├── mutations.ts       # Mutation hooks
│   └── contracts.ts       # API contracts and schemas
├── lib/                   # Feature utilities
│   └── utils.ts          # Helper functions
├── config/                # Configuration
│   └── constants.ts      # Configuration constants
└── index.ts              # Public API exports
```

## Implementation Requirements

### Type Safety (typescript-pro)

- Define Zod schemas first, then infer TypeScript types
- Implement proper error handling with discriminated unions
- Create type-safe API contracts and validation
- Use strict TypeScript patterns throughout

### React Patterns (react-architect)

- Implement React 19 concurrent features (Suspense, useTransition)
- Create optimized components with proper memoization
- Use TanStack Query for data fetching
- Implement proper error boundaries

### UI Components (ui-specialist)

- Use Mantine UI components with theme tokens
- Ensure WCAG 2.1 AA accessibility compliance
- Implement responsive design patterns
- Create consistent loading and error states

### Architecture (fsd-enforcer)

- Follow strict layer import hierarchy
- Export only necessary items through public API
- Ensure no cross-feature dependencies
- Maintain proper segment organization

## Example Usage

```
Create a user management feature that allows:
- Creating new users with form validation
- Editing existing user information
- Deleting users with confirmation
- Filtering and searching users
- Bulk operations on selected users

Requirements:
- Form validation with Zod schemas
- Optimistic updates for better UX
- Accessible forms and interactions
- Responsive design for mobile devices
- Proper loading and error states
```

The agents will collaborate to create a complete, production-ready feature that follows all established patterns and architectural principles.
