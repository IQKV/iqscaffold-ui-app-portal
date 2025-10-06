Refactor existing code to comply with Feature-Sliced Design architecture and modern development patterns.

## Analysis Phase

1. Use fsd-enforcer to analyze current architecture violations
2. Use typescript-pro to identify type safety improvements
3. Use react-architect to assess component structure and patterns
4. Use ui-specialist to evaluate UI consistency and accessibility

## Refactoring Strategy

### Architecture Violations

- **Layer Boundary Issues**: Fix improper imports between layers
- **Cross-Feature Dependencies**: Break direct feature-to-feature imports
- **Public API Bypassing**: Ensure all imports use index.ts files
- **Segment Misorganization**: Move files to proper segments

### Code Quality Improvements

- **Type Safety**: Add Zod schemas and proper TypeScript types
- **Error Handling**: Implement comprehensive error boundaries
- **Performance**: Add proper memoization and optimization
- **Testing**: Ensure comprehensive test coverage

### UI/UX Enhancements

- **Accessibility**: Fix WCAG 2.1 AA compliance issues
- **Design System**: Replace hardcoded values with theme tokens
- **Responsive Design**: Implement proper mobile-first patterns
- **Loading States**: Add consistent loading and error feedback

## Refactoring Process

### Step 1: Architecture Assessment

```typescript
// Identify violations like:
// ❌ features/auth/ui/login-form.tsx
import { UserProfile } from "@/features/user-profile"; // Cross-feature import

// ❌ entities/user/ui/user-card.tsx
import { CreateUserForm } from "@/features/user-management"; // Layer violation
```

### Step 2: Dependency Mapping

- Map all current imports and dependencies
- Identify circular dependencies
- Plan refactoring order (bottom-up approach)
- Create migration strategy for breaking changes

### Step 3: Layer-by-Layer Refactoring

1. **Shared Layer**: Extract common utilities and UI components
2. **Entities Layer**: Create proper business entity abstractions
3. **Features Layer**: Implement isolated feature modules
4. **Widgets Layer**: Compose features into reusable widgets
5. **Pages Layer**: Create proper page compositions
6. **App Layer**: Set up global configuration and providers

### Step 4: Public API Design

```typescript
// ✅ Clean public APIs
// entities/user/index.ts
export { UserCard, UserAvatar } from "./ui";
export { useUser, useUsers } from "./api";
export { userSchema, type User } from "./model";

// features/user-management/index.ts
export { CreateUserForm, EditUserForm } from "./ui";
export { useCreateUser, useUpdateUser } from "./api";
export type { UserFormData } from "./model";
```

### Step 5: Type Safety Migration

```typescript
// ✅ Zod-first approach
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "manager"]),
});

export type User = z.infer<typeof userSchema>;

// ✅ API contracts with validation
export const createUserSchema = userSchema.omit({ id: true });
export type CreateUserData = z.infer<typeof createUserSchema>;
```

## Migration Guidelines

### Breaking Changes Management

- Create deprecation warnings for old imports
- Provide migration guides for consumers
- Use gradual migration with feature flags
- Maintain backward compatibility during transition

### Testing Strategy

- Update tests to follow new architecture
- Add integration tests for layer boundaries
- Implement architectural tests to prevent regressions
- Create component tests with proper mocking

### Documentation Updates

- Update README with new architecture
- Create architectural decision records (ADRs)
- Document public APIs and usage patterns
- Provide migration examples

## Quality Gates

### Pre-Refactoring Checklist

- [ ] Current architecture violations documented
- [ ] Migration plan approved by team
- [ ] Breaking changes identified and planned
- [ ] Test coverage maintained or improved

### Post-Refactoring Validation

- [ ] All layer boundaries respected
- [ ] No circular dependencies
- [ ] Public APIs properly designed
- [ ] Type safety improved
- [ ] Performance maintained or improved
- [ ] Accessibility compliance verified
- [ ] Tests passing and coverage maintained

## Common Refactoring Patterns

### Extract Shared Components

```typescript
// Before: Duplicated button styles
// After: Shared UI component
// shared/ui/button/index.ts
export { Button } from "./button";
export type { ButtonProps } from "./button";
```

### Break Feature Dependencies

```typescript
// Before: Direct feature import
// features/user-profile/ui/profile.tsx
import { AuthForm } from "@/features/auth";

// After: Use shared state or events
// features/user-profile/ui/profile.tsx
import { useAuthStore } from "@/shared/stores";
```

### Create Proper Entities

```typescript
// Before: Mixed concerns
// After: Clean entity separation
// entities/user/model/types.ts
export const userSchema = z.object({...});
export type User = z.infer<typeof userSchema>;
```

The refactoring should result in a clean, maintainable architecture that follows FSD principles and modern development best practices.
