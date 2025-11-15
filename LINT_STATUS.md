# Linting Status

## ✅ Our Changes: Clean

All files modified in this refactoring have **no linting errors**:

- ✅ `src/processes/auth/lib/guards.tsx` - No errors
- ✅ `src/processes/auth/index.ts` - No errors
- ✅ `src/shared/ui/index.ts` - No errors

## ⚠️ Pre-existing Issues

The following linting errors existed **before** our changes and are **not related** to the auth portal cleanup:

### 1. Lingui Translation Errors (18 errors)

**Files**:

- `src/features/change-password-form/model/validation.ts` (9 errors)
- `src/features/change-password-form/ui/change-password-form-feature.tsx` (9 errors)

**Issue**: `t`` and t() call should be inside function` (lingui/t-call-in-function)

These are validation schema translation calls that need to be refactored to use dynamic translations.

### 2. React Hooks Warning (1 warning)

**File**: `src/features/change-password-form/ui/change-password-form-feature.tsx`

**Issue**: Missing dependency 'form' in useEffect

### 3. Fast Refresh Warning (1 warning)

**File**: `src/shared/lib/test-utils.tsx`

**Issue**: File exports both components and non-components

## 📊 Summary

| Category     | Count      | Status                     |
| ------------ | ---------- | -------------------------- |
| Our Changes  | 0 errors   | ✅ Clean                   |
| Pre-existing | 18 errors  | ⚠️ Not related to our work |
| Warnings     | 2 warnings | ⚠️ Pre-existing            |

## ✅ Build Status

- **TypeScript**: ✅ Passes (`pnpm type-check`)
- **Build**: ✅ Successful (`pnpm build`)
- **Our Code**: ✅ No linting errors

## 📝 Recommendation

The pre-existing linting errors in `change-password-form` should be fixed separately as they are not related to the auth portal cleanup. They require refactoring the translation calls to be inside functions rather than at the module level.

## 🔧 To Fix Pre-existing Issues

The lingui errors can be fixed by:

1. Moving translation calls inside the validation function
2. Using dynamic translations instead of static ones
3. Or using the `msg` macro for static translations

Example fix:

```typescript
// Before (causes error)
const schema = z.string().min(1, t`Field is required`);

// After (correct)
const createSchema = () => z.string().min(1, t`Field is required`);
```

However, this is outside the scope of the current auth portal cleanup work.
