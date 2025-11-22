# AI Agent Development Guide

> **Last Updated:** Based on actual codebase analysis - December 2024
>
> This guide reflects the **actual implementation patterns** used in this project, not theoretical best practices. All code examples are taken from or based on real code in the repository.

## Project Overview

This is a modern React application built with Feature-Sliced Design (FSD) architecture, focusing on maintainability, scalability, and developer experience. The project uses React 19, TypeScript, Mantine UI v8, and a comprehensive toolchain for building high-performance Single Page Applications.

**Key Characteristics:**

- Type-safe development with strict TypeScript configuration
- Component-driven development with Storybook integration
- Comprehensive testing strategy (Unit, Integration, E2E)
- Modern build tooling with Vite 7 and SWC
- Internationalization with Lingui macros
- Production-ready with Docker and CI/CD workflows
- RFC 9457 Problem Details compliant error handling
- Multi-tenant architecture support

## Tech Stack

### Core Framework

- **React 19** - Latest React with concurrent features and improved performance
- **TypeScript** - Strict type safety with ES2020 target
- **Vite 7** - Lightning-fast development with SWC compiler
- **PNPM** - Fast, disk space efficient package manager

### UI & Styling

- **Mantine UI v8** - Complete component library with theming system
- **Mantine Extensions** - Carousel, Charts, Dates, Dropzone, Modals, Notifications, DataTable
- **Tabler Icons** - 4000+ SVG icons optimized for React
- **Tiptap Editor** - Rich text editor with extensions

### Routing & State

- **TanStack Router v1** - Type-safe routing with code splitting and file-based routing
- **TanStack Query v5** - Server state management and caching
- **Zustand** - Lightweight client state management (when needed)
- **nuqs** - Type-safe URL search params state management

### Data & API

- **Axios** - HTTP client with interceptors and error handling
- **Zod** - Runtime type validation and schema parsing
- **Mantine Form** - Form state management with validation
- **mantine-form-zod-resolver** - Zod integration for Mantine forms

### Development & Quality

- **Vitest** - Fast unit testing with coverage and UI
- **Playwright** - Reliable end-to-end testing
- **Storybook 8** - Component development in isolation
- **ESLint 9** - Modern flat config with Mantine preset
- **Prettier** - Code formatting with package.json plugin
- **Husky** - Git hooks for quality gates
- **Commitlint** - Conventional commit enforcement
- **Knip** - Dead code elimination

### Internationalization & Accessibility

- **Lingui** - Modern i18n with macro support (`msg`, `t`, `Trans`)
- **Built-in A11y** - Accessibility features and Storybook a11y addon

### Testing & Mocking

- **MSW (Mock Service Worker)** - API mocking for development and testing
- **React Testing Library** - Component testing utilities
- **happy-dom** - Fast DOM implementation for tests

## Architecture: Feature-Sliced Design (FSD)

The project follows Feature-Sliced Design methodology with strict layer hierarchy:

```
src/
├── app/          # Application layer (providers, routing, global styles, config)
├── processes/    # Process layer (cross-feature business processes like auth flow)
├── pages/        # Page layer (route components)
├── widgets/      # Widget layer (complex UI blocks like header, sidebar)
├── features/     # Feature layer (user scenarios, business logic)
├── entities/     # Entity layer (business entities, data models, domain logic)
└── shared/       # Shared layer (reusable code, UI kit, utilities, API clients)
```

### FSD Layer Rules (CRITICAL)

1. **Import Rule**: Higher layers can ONLY import from lower layers
   - ❌ `shared` cannot import from `features`
   - ✅ `features` can import from `shared` and `entities`
   - ✅ `processes` can import from `features`, `entities`, and `shared`
   - ✅ `app` can import from all layers

2. **Public API**: Each slice MUST expose functionality through `index.ts`
   - All imports must go through public API: `from "@/features/sample-form"`
   - Never import internal files: `from "@/features/sample-form/model/validation"`
   - Architecture tests enforce this rule automatically

3. **Cross-Feature Isolation**: Features cannot depend on each other
   - Use `shared` layer for common functionality
   - Use `entities` for shared domain logic
   - Use `processes` for cross-feature orchestration

4. **Segment Structure**: Each slice should follow these patterns

   **Standard Feature Structure (Recommended):**

   ```
   feature-name/
   ├── ui/           # React components (recommended)
   ├── model/        # Business logic, stores, types (recommended)
   ├── api/          # API calls and contracts (optional)
   ├── lib/          # Utilities specific to this feature (optional)
   ├── hooks/        # Custom hooks (optional)
   └── index.ts      # Public API exports (REQUIRED)
   ```

   **Simplified Feature Structure (Allowed):**

   ```
   feature-name/
   ├── feature-name.tsx          # Component file
   ├── other-component.tsx       # Additional components
   └── index.ts                  # Public API exports (REQUIRED)
   ```

   **Examples in codebase:**
   - `features/sample-form/` - Standard structure with ui/ and model/
   - `features/user-preferences/` - Simplified structure with direct component files
   - `features/dashboard/` - Simplified structure with ui/ only

5. **Architecture Testing**: The project includes automated FSD compliance tests
   - Tests verify layer structure exists
   - Tests enforce public API (index.ts) presence
   - Tests validate file naming conventions (kebab-case)
   - Run with: `pnpm test:arch`

   **Note:** Some features use simplified structure without strict ui/model separation. This is acceptable for simple features.

## AI Agent Development Guidelines

### Code Generation Principles

1. **Always Follow FSD Architecture**: Respect layer boundaries and public APIs
2. **Type-First Development**: Define TypeScript interfaces before implementation
3. **Component Composition**: Prefer composition over complex prop drilling
4. **Performance by Default**: Use React.memo, useMemo, useCallback appropriately
5. **Accessibility First**: Include ARIA attributes and semantic HTML
6. **Minimal Implementation**: Write only the code needed to solve the problem
7. **Use Existing Patterns**: Follow established patterns in the codebase

### AI-Assisted Development Workflow

```typescript
// 1. Define types in model/types.ts
export interface FormValues {
  name: string;
  email: string;
}

// 2. Define validation in model/validation.ts
import { email, minLength } from "@/entities/form";

export const validateSampleForm = {
  name: minLength(2),
  email,
};

export const initialFormValues: FormValues = {
  name: "",
  email: "",
};

// 3. Create component in ui/feature-name.tsx
// Use Mantine components, Lingui macros, and useFormMutation

// 4. Export through index.ts
export { SampleFormFeature } from "./ui/sample-form-feature";
```

### Code Quality Checklist for AI

- [ ] TypeScript strict mode compliance (no `any` without justification)
- [ ] Proper error handling with RFC 9457 compliant errors
- [ ] Loading states and error boundaries
- [ ] Mantine theme integration (use theme colors, spacing)
- [ ] Responsive design with Mantine breakpoints
- [ ] Internationalization with Lingui macros (`msg`, `t`, `Trans`)
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Performance optimizations (memoization when needed)
- [ ] Public API exports through index.ts
- [ ] Tests only when explicitly requested

## User Confirmation Policy

### CRITICAL RULE: Always Ask Before Applying Changes

**Default Behavior:** AI agents MUST ask for explicit user confirmation before applying any changes to the codebase, configuration, or environment.

### Approval Workflow

Follow this workflow for ALL operations:

1. **Analyze** - Understand the user's request and identify required changes
2. **Explain** - Describe what needs to be done and why
3. **Assess** - Evaluate impact, risks, and alternatives
4. **Present** - Show proposed changes with clear examples
5. **⏸️ WAIT FOR APPROVAL** - Stop and wait for explicit user confirmation
6. **Apply** - Only after approval, execute the changes
7. **Verify** - Confirm changes were applied correctly and report results

### Decision Framework

Use this framework to determine if confirmation is needed:

```
┌─────────────────────────────────────┐
│ Will this operation modify files,   │
│ execute commands, or change state?  │
└─────────────┬───────────────────────┘
              │
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              │
         ┌────▼────────────────────────┐
         │ ASK FOR CONFIRMATION        │
         │ Present changes → Wait      │
         └─────────────────────────────┘

         ┌────┐
         │ NO │
         └────┬────┘
              │
         ┌────▼────────────────────────┐
         │ Is it read-only/info?       │
         └────┬────────────────────────┘
              │
         ┌────┴────┐
         │   YES   │
         └────┬────┘
              │
         ┌────▼────────────────────────┐
         │ PROCEED WITHOUT ASKING      │
         │ (Read, analyze, explain)    │
         └─────────────────────────────┘
```

### Operations That NEVER Auto-Apply

These operations ALWAYS require explicit user confirmation:

**File Operations:**

- ✋ Creating new files
- ✋ Modifying existing files (strReplace, fsWrite, fsAppend)
- ✋ Deleting files
- ✋ Moving or renaming files

**Command Execution:**

- ✋ Running build commands (`pnpm build`, `npm run build`)
- ✋ Installing dependencies (`pnpm install`, `npm install`)
- ✋ Running database migrations
- ✋ Deploying to production
- ✋ Modifying git state (`git commit`, `git push`, `git reset`)
- ✋ Starting/stopping services
- ✋ Modifying environment variables

**Configuration Changes:**

- ✋ Updating package.json
- ✋ Modifying tsconfig.json, vite.config.ts, eslint.config.js
- ✋ Changing .env files
- ✋ Updating CI/CD workflows
- ✋ Modifying Docker configurations

**Destructive Operations:**

- ✋ Dropping databases or tables
- ✋ Clearing caches or storage
- ✋ Removing node_modules
- ✋ Force-pushing to git
- ✋ Reverting commits

### Operations That Can Auto-Execute

These operations are safe to execute without confirmation:

**Read-Only Operations:**

- ✅ Reading files (readFile, readMultipleFiles)
- ✅ Listing directories (listDirectory)
- ✅ Searching code (grepSearch, fileSearch)
- ✅ Checking diagnostics (getDiagnostics)
- ✅ Viewing git status or logs

**Information Requests:**

- ✅ Explaining concepts or code
- ✅ Answering questions about the codebase
- ✅ Providing documentation
- ✅ Suggesting approaches or solutions
- ✅ Analyzing code for issues

**Recommendations:**

- ✅ Proposing architectural improvements
- ✅ Suggesting refactoring opportunities
- ✅ Identifying potential bugs
- ✅ Recommending best practices

### Example Scenarios

#### ❌ WRONG: Auto-applying changes

```
User: "Add a new user form feature"

Agent: *Creates files immediately*
- Created src/features/user-form/index.ts
- Created src/features/user-form/ui/user-form.tsx
- Created src/features/user-form/model/validation.ts
```

#### ✅ CORRECT: Ask first, then apply

```
User: "Add a new user form feature"

Agent: I'll create a new user form feature following FSD architecture.

**Proposed Changes:**

1. Create `src/features/user-form/` directory with:
   - `index.ts` - Public API exports
   - `model/types.ts` - TypeScript interfaces
   - `model/validation.ts` - Form validation rules
   - `ui/user-form-feature.tsx` - Main component

2. The form will include:
   - Name field (text input, min 2 chars)
   - Email field (email validation)
   - Submit button with loading state
   - Integration with useFormMutation

**Files to create:** 4 new files
**Estimated lines:** ~150 lines total

Would you like me to proceed with creating these files?

[WAITING FOR USER RESPONSE]
```

#### ✅ CORRECT: Read-only operations proceed

```
User: "What validation rules are used in the sample form?"

Agent: *Reads files immediately*

Looking at src/features/sample-form/model/validation.ts:

The sample form uses these validation rules:
- name: minLength(2) - Requires at least 2 characters
- email: email - Validates email format

These rules are imported from @/entities/form.
```

### Confirmation Response Patterns

When waiting for approval, accept these responses:

**Approval:**

- "yes", "y", "ok", "proceed", "go ahead", "do it", "apply", "confirm"
- "looks good", "lgtm", "approved", "👍"

**Rejection:**

- "no", "n", "cancel", "stop", "don't", "abort"
- "wait", "hold on", "not yet"

**Modification:**

- "change X to Y", "use Z instead", "modify the approach"
- "can you adjust...", "what if we..."

### Handling Ambiguity

If the user's intent is unclear:

1. **Ask clarifying questions** before proposing changes
2. **Present multiple options** with pros/cons
3. **Suggest the recommended approach** but wait for confirmation
4. **Never assume** - when in doubt, ask

### Emergency Override

In rare cases where immediate action is critical (e.g., security vulnerability, production outage), the agent may:

1. **Clearly state the emergency**
2. **Explain why immediate action is needed**
3. **Show exactly what will be done**
4. **Ask for rapid confirmation** (yes/no)
5. **Proceed only with explicit approval**

**Never skip confirmation even in emergencies.**

### Verification After Changes

After applying approved changes:

1. **List all files modified/created/deleted**
2. **Run relevant checks** (lint, type-check, tests if applicable)
3. **Report any errors or warnings**
4. **Confirm the changes achieve the intended goal**
5. **Suggest next steps** if applicable
6. **Generate commit message** - For complex tasks involving multiple changes, provide a concise git commit message following conventional commit format

**Commit Message Format:**

```bash
<type>(<scope>): <subject>

<body>
```

**Examples:**

```bash
# Simple change
feat: add user preferences form feature

# Complex change with details
refactor: restructure authentication flow

- Move auth logic to processes/auth layer
- Add JWT token refresh mechanism
- Implement cookie-based session management
- Update API client with auth interceptors
```

**Commit Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `style:` - Code style changes (formatting)
- `perf:` - Performance improvements

### Summary

**Remember:** When in doubt, ASK. User trust is built through transparency and respect for their codebase. It's always better to ask unnecessarily than to make unwanted changes.

## Concise Output Requirements

### CRITICAL RULE: Be Direct and Concise

AI agents MUST communicate efficiently without unnecessary verbosity. Users value clarity and brevity over lengthy explanations.

### Communication Standards

**Core Principles:**

1. **Get to the point** - State what you're doing, do it, report results
2. **No fluff** - Avoid unnecessary preambles, repetition, or over-explanation
3. **Action-oriented** - Focus on what's being done, not meta-commentary
4. **Minimal summaries** - 2-3 sentences maximum for completion reports
5. **No documentation artifacts** - Never create summary/review markdown files unless explicitly requested

### Response Length Guidelines

**For Task Completion:**

- ✅ "Created 4 files for user-form feature. All checks passed."
- ❌ "I have successfully completed the task of creating a new user form feature. Let me provide you with a comprehensive summary of everything that was accomplished..."

**For Explanations:**

- ✅ "The validation uses minLength(2) for name and email format check."
- ❌ "Let me explain in detail how the validation system works. First, we need to understand that validation is a critical part of form handling..."

**For Verification:**

- ✅ "Modified 3 files. No lint errors. Type check passed."
- ❌ "I have carefully verified all the changes and I'm pleased to report that everything is working correctly. Here's a detailed breakdown of what was checked..."

### What NOT to Do

**❌ WRONG: Verbose, repetitive output**

```
I understand you want to add a user form feature. Let me break this down for you.

First, I'll analyze the requirements and create a comprehensive plan.
Then, I'll implement the feature following best practices.
After that, I'll verify everything works correctly.

Now, let me proceed with creating the files...

[Creates files]

Great! I've successfully created all the necessary files. Let me provide
you with a detailed summary of what was accomplished:

1. Created index.ts - This file serves as the public API...
2. Created types.ts - This file contains TypeScript interfaces...
3. Created validation.ts - This file defines validation rules...
4. Created user-form-feature.tsx - This is the main component...

Everything has been implemented according to FSD architecture principles.
The code follows all best practices and is ready for use.

Would you like me to create a detailed documentation file summarizing
all the changes?
```

**✅ CORRECT: Concise, action-focused output**

```
I'll create a user form feature with name/email fields following FSD architecture.

**Proposed Changes:**
- 4 new files in src/features/user-form/
- Form with validation, loading states, and error handling
- ~150 lines total

Proceed?

[User approves]

[Creates files]

Created user form feature. All files pass lint and type checks.
```

### Prohibited Behaviors

**Never do these:**

1. ❌ **Auto-generate summary files** - Don't create `CHANGES.md`, `SUMMARY.md`, `REVIEW.md` unless explicitly requested
2. ❌ **Repeat yourself** - Don't say "I'm going to do X" then "I'm doing X" then "I did X"
3. ❌ **Over-explain obvious actions** - Reading a file doesn't need explanation
4. ❌ **Apologize excessively** - One "sorry" is enough if needed
5. ❌ **Ask rhetorical questions** - "Shall we proceed?" when you're already proceeding
6. ❌ **Provide unsolicited tutorials** - Explain only what's necessary for the task
7. ❌ **List every file touched** - Summarize: "Modified 5 files" not a bullet list of each

### Verification Reporting

After applying changes, keep it brief:

**✅ Good Examples:**

```
Created user-form feature (4 files). Lint passed, no type errors.
```

```
Updated validation rules. Tests pass. Ready to commit.
```

```
Refactored auth flow (8 files). All checks passed. Breaking changes: none.
```

**❌ Bad Examples:**

```
I have successfully completed the implementation of the user form feature.
Here's a comprehensive breakdown of everything that was done:

Files Created:
- src/features/user-form/index.ts (15 lines)
  * This file exports the public API
  * It follows FSD architecture principles
  * All exports are properly typed
...
[continues for 50 more lines]
```

### When to Be Verbose

**Only provide detailed explanations when:**

1. **User explicitly asks** - "Explain how this works"
2. **Complex architectural decisions** - Major refactoring that needs justification
3. **Breaking changes** - Changes that affect existing code
4. **Multiple options exist** - Presenting alternatives with trade-offs
5. **Errors or warnings** - Explaining what went wrong and how to fix it

### Examples: Before and After

**Scenario: User asks to add a form field**

❌ **Verbose (Don't do this):**

```
I understand you'd like to add a phone number field to the user form.
Let me explain what needs to be done:

First, I'll need to update the TypeScript types to include the phone field.
Then, I'll add validation rules for phone number format.
After that, I'll update the form component to include the new field.
Finally, I'll ensure everything is properly exported.

This is a straightforward change that follows our established patterns.
Let me proceed with the implementation...

[Makes changes]

Perfect! I've successfully added the phone number field. Here's what was changed:
- Updated types.ts to include phone: string
- Added phone validation in validation.ts
- Added FormField for phone in the component
- All changes follow FSD architecture

The implementation is complete and ready for testing!
```

✅ **Concise (Do this):**

```
Adding phone field to user form.

[Makes changes]

Added phone field with validation. 3 files modified, all checks passed.
```

**Scenario: User asks what validation rules are used**

❌ **Verbose:**

```
Great question! Let me take a look at the validation rules for you.

I'll read the validation file to see what rules are currently implemented...

[Reads file]

Excellent! I found the validation rules. Let me explain what I discovered:

The sample form uses a validation system that's based on custom validation
functions. These functions are imported from the entities/form layer, which
is part of our FSD architecture. This is a best practice because it allows
us to reuse validation logic across different features.

Specifically, the validation rules are:
1. name field: Uses minLength(2) which requires at least 2 characters
2. email field: Uses email which validates the email format

These rules are very straightforward and follow our established patterns.
```

✅ **Concise:**

```
The sample form uses these validation rules:
- name: minLength(2) - requires 2+ characters
- email: email - validates format

Both imported from @/entities/form.
```

### Summary

**Keep it short. Keep it clear. Keep it actionable.**

Users don't need a play-by-play commentary. They need results. Respect their time by being concise.

## Development Guidelines

### Component Development Standards

1. **Mantine Components First**: Use Mantine UI components as building blocks
2. **TypeScript Interfaces**: Define strict interfaces for all props
3. **Component Naming**: PascalCase for components, kebab-case for folders
4. **Feature-Sliced Structure**: Organize by features, not by file types
5. **Use EnhancedFormField**: The project has a comprehensive FormField component in `@/shared/ui`

### Actual FormField Implementation

The project includes a comprehensive `EnhancedFormField` component that supports:

- All common input types (text, email, password, textarea, select, multiselect, etc.)
- Lingui i18n integration with MessageDescriptor support
- Character counting and validation status indicators
- Password strength indicators
- Tooltips and descriptions
- Loading states and custom errors
- Mantine form integration

**Usage Example:**

```tsx
import { FormField } from "@/shared/ui";
import { useForm } from "@mantine/form";

const form = useForm<FormValues>({
  initialValues: { name: "", email: "" },
  validate: validateForm,
});

<FormField
  type="text"
  name="name"
  label={msg`Name`}
  placeholder={msg`Enter your name`}
  form={form}
  withAsterisk
/>

<FormField
  type="email"
  name="email"
  label={msg`Email`}
  form={form}
  tooltip={msg`We'll never share your email`}
/>
```

### State Management Standards

#### TanStack Query for Server State

The project uses TanStack Query v5 with a pre-configured query client:

```tsx
// Query client configuration (src/shared/lib/query-client.ts)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      networkMode: "always",
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return (
            error?.response?.status === 408 || error?.response?.status === 429
          );
        }
        return failureCount < 3;
      },
    },
    mutations: {
      networkMode: "always",
      retry: false,
    },
  },
});
```

#### useFormMutation Hook (CRITICAL)

The project has a powerful `useFormMutation` hook that integrates Mantine forms with TanStack Query:

**Key Features:**

- Automatic field error mapping from RFC 9457 responses
- Loading notifications with update capability
- Success/error notifications with customization
- Field focus on validation errors
- Form clearing on success
- Retry actions for network errors

**Usage Example:**

```tsx
import { useFormMutation } from "@/shared/lib";
import { t } from "@lingui/core/macro";

const mutation = useFormMutation<ResponseType, FormValues>(
  form,
  async (values) => api.post("/endpoint", values),
  {
    notifySuccess: {
      title: t`Success!`,
      message: t`Form submitted successfully`,
    },
    notifyError: {
      title: t`Error`,
      fallback: t`Failed to submit form`,
      showTechnicalDetails: false,
      enableRetry: true,
    },
    clearOnSuccess: true,
    focusErrorField: true,
    onSuccess: (data) => {
      // Custom success logic
    },
  }
);

const handleSubmit = (values: FormValues) => {
  mutation.mutateAsync(values);
};
```

#### Zustand for Client State (When Needed)

The project uses Zustand with immer middleware for client state. Example: `theme-store.ts` for theme preferences.

**When to use:**

- UI state that needs to persist (localStorage)
- Global client-side state (theme, locale)
- State shared across many components

**When NOT to use:**

- Server state (use TanStack Query)
- Form state (use Mantine useForm)
- URL state (use nuqs)

### API Service Standards

The project uses Axios with RFC 9457 Problem Details compliant error handling:

#### API Client Configuration

```tsx
// src/shared/lib/client.ts
import axios from "axios";
import { getConfig } from "@/app/config";
import { normalizeAxiosError } from "./http-error";
import { notificationService } from "./notifications";
import { resolveTenantId } from "./tenant-utils";

const BASE_URL = getConfig("VITE_API_URL_SERVER");

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookie-based auth
});

// Tenant header interceptor
api.interceptors.request.use((config) => {
  const tenantId = resolveTenantId();
  if (tenantId && !config.headers["X-Tenant-ID"]) {
    config.headers["X-Tenant-ID"] = tenantId;
  }
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalized = normalizeAxiosError(error);

    // Show global error notification for server errors
    if (normalized.type === "server") {
      const cfg = error.config as any;
      if (!cfg?.__suppressGlobalError) {
        notificationService.error({
          title: "Server error",
          message: normalized.message,
        });
      }
    }

    return Promise.reject(normalized);
  }
);
```

#### RFC 9457 Error Handling

The project implements RFC 9457 Problem Details for HTTP APIs:

**AppError Type:**

```typescript
interface AppError {
  errorType:
    | "auth"
    | "validation"
    | "network"
    | "timeout"
    | "server"
    | "client"
    | "rate-limit"
    | "canceled"
    | "unknown";
  message: string;
  status?: number;
  code?: string;
  details?: any;
  requestId?: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
  retryConfig?: RetryConfig;
  // RFC 9457 fields
  type: string;
  title: string;
  detail: string;
  instance?: string;
}
```

**Usage:**

```tsx
import { errorFromAxios, formatErrorForDisplay } from "@/shared/lib";

try {
  await api.post("/endpoint", data);
} catch (error) {
  const appError = errorFromAxios(error);

  // Use with notifications
  notificationService.fromAppError(appError, {
    showTechnicalDetails: true,
    enableRetry: true,
  });

  // Or format for display
  const { title, message, referenceId } = formatErrorForDisplay(appError);
}
```

#### Environment Configuration

Use the config helper for environment variables:

```tsx
import { getConfig } from "@/app/config";

const apiUrl = getConfig("VITE_API_URL_SERVER");
const authDomain = getConfig("VITE_AUTH_DOMAIN_AUTH");
```

### Form Handling Standards

The project uses **Mantine Form** with custom validation rules (NOT Zod by default):

#### Validation Pattern (Actual Implementation)

```tsx
// features/sample-form/model/validation.ts
import { email, minLength } from "@/entities/form";
import { FormValues } from "./types";

export const validateSampleForm = {
  name: minLength(2),
  email,
};

export const initialFormValues: FormValues = {
  name: "",
  email: "",
};
```

#### Entity-Level Validation Rules

The project defines reusable validation rules in `entities/form`:

```tsx
// entities/form/model/validation-rules.ts
export const minLength = (min: number) => (value: string) =>
  value.length < min ? `Must be at least ${min} characters` : null;

export const email = (value: string) =>
  /^\S+@\S+$/.test(value) ? null : "Invalid email";
```

#### Complete Form Feature Example

```tsx
// features/sample-form/ui/sample-form-feature.tsx
import { Button, Modal, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { t } from "@lingui/core/macro";
import { FormField } from "@/shared/ui";
import { useFormMutation } from "@/shared/lib";
import { initialFormValues, validateSampleForm } from "../model/validation";
import { FormValues } from "../model/types";

export function SampleFormFeature() {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm<FormValues>({
    initialValues: initialFormValues,
    validate: validateSampleForm,
  });

  const mutation = useFormMutation<void, FormValues>(
    form,
    async (values) => {
      // API call here
      console.log("Submitting:", values);
    },
    {
      notifySuccess: {
        title: t`Form submitted!`,
        message: t`We have received your submission.`,
      },
      notifyError: {
        title: t`Submit Failed`,
        fallback: t`Could not submit the form`,
      },
      onSuccess: () => {
        form.reset();
        close();
      },
    }
  );

  const handleSubmit = (values: FormValues) => {
    void mutation.mutateAsync(values);
  };

  return (
    <>
      <Button onClick={open}>{t`Open Form`}</Button>

      <Modal opened={opened} onClose={close} title={t`Sample Form`} centered>
        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack>
            <FormField
              type="text"
              name="name"
              label={t`Name`}
              placeholder={t`Enter your name`}
              form={form}
            />
            <FormField
              type="email"
              name="email"
              label={t`Email`}
              placeholder={t`Enter your email`}
              form={form}
            />
            <Button type="submit" loading={mutation.isPending}>
              {t`Submit`}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}

// features/sample-form/index.ts
export { SampleFormFeature } from "./ui/sample-form-feature";
```

**Note:** While Zod can be used with `mantine-form-zod-resolver`, the project's established pattern uses custom validation functions from the `entities/form` layer.

## Environment Setup

### Development Requirements

- **Node.js**: >= 22.0.0 (LTS)
- **Package Manager**: pnpm 10.20.0+ (required)
- **Editor**: VS Code or Cursor IDE

### Environment Variables

```env
# Backend API
VITE_API_URL_SERVER=http://localhost:8080

# Auth Configuration
VITE_AUTH_DOMAIN_AUTH=https://auth.iqkv.com
VITE_AUTH_DOMAIN_APP=https://app.iqkv.com
VITE_AUTH_REDIRECT_AFTER_LOGIN=/dashboard
VITE_AUTH_REDIRECT_AFTER_LOGOUT=/
VITE_AUTH_REDIRECT_AFTER_SIGNUP=/verify-email

# Development
VITE_ENABLE_MSW=true
VITE_LOG_LEVEL=info

# System
TZ=UTC
NODE_ENV=development
```

### Editor Configuration

```json
// .prettierrc
{
  "endOfLine": "lf",
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false
}
```

### Development Scripts

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:5173)
pnpm build                  # Build for production
pnpm preview                # Preview production build

# Testing
pnpm test                   # Run unit tests
pnpm test:coverage          # Run tests with coverage
pnpm test:ui                # Run tests with UI
pnpm test:arch              # Run architecture tests
pnpm e2e                    # Run E2E tests
pnpm e2e:ui                 # Run E2E with UI
pnpm e2e:headed             # Run E2E in headed mode

# Code Quality
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint issues
pnpm lint:stylelint         # Lint CSS/SCSS
pnpm prettier:check         # Check formatting
pnpm prettier:write         # Format code
pnpm type-check             # TypeScript type checking
pnpm knip                   # Find dead code

# Internationalization
pnpm messages:extract       # Extract i18n messages
pnpm messages:compile       # Compile translations

# Storybook
pnpm storybook              # Start Storybook
pnpm storybook:build        # Build Storybook

# Release
pnpm release                # Automated versioning
```

## Testing Strategy

### Testing Stack

- **Unit Tests**: Vitest + React Testing Library + happy-dom
- **E2E Tests**: Playwright with auto-start dev server
- **Component Tests**: Storybook 8 with interactions
- **Coverage**: Vitest coverage with v8
- **Architecture Tests**: Automated FSD compliance tests

### Test Configuration

```typescript
// vitest.config.ts uses happy-dom for fast DOM simulation
// setupTests.ts includes Mantine-specific mocks
```

### Architecture Testing (Automated)

The project includes automated FSD compliance tests in `src/architecture.test.ts`:

```bash
pnpm test:arch  # Run architecture tests
```

**What it validates:**

- All FSD layers exist (app, processes, pages, widgets, features, entities, shared)
- Every feature/widget/entity has `index.ts` (public API)
- Features have required segments (ui/, model/)
- File naming conventions (kebab-case)
- Shared layer has standard segments (api/, lib/, ui/, types/)

### Testing Best Practices

**DO:**

- Write tests only when explicitly requested
- Use the existing test utilities in `@/shared/lib/test-utils`
- Mock MSW handlers for API calls
- Test user interactions, not implementation details

**DON'T:**

- Don't write tests automatically for every component
- Don't test Mantine components (they're already tested)
- Don't test implementation details (internal state)

### E2E Testing with Playwright

```bash
# Run E2E tests
pnpm e2e                    # Headless mode
pnpm e2e:ui                 # UI mode (recommended)
pnpm e2e:headed             # Headed mode
pnpm e2e:debug              # Debug mode

# Playwright auto-starts dev server via webServer config
```

### MSW (Mock Service Worker)

The project uses MSW for API mocking:

```typescript
// Enable/disable via environment variable
VITE_ENABLE_MSW = true;

// Handlers in src/shared/mocks/handlers/
// Browser setup in src/shared/mocks/browser.ts
```

## Performance Optimization

### TanStack Router File-Based Routing

The project uses TanStack Router with file-based routing and automatic code splitting:

```tsx
// src/pages/dashboard.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return <div>Dashboard</div>;
}
```

**Route files are automatically:**

- Code-split by Vite
- Type-safe with generated route tree
- Lazy-loaded on navigation

### TanStack Query Configuration

The project has optimized query defaults:

```typescript
// src/shared/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
      networkMode: "always",
      retry: (failureCount, error: any) => {
        // Smart retry logic for 4xx vs 5xx
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return (
            error?.response?.status === 408 || error?.response?.status === 429
          );
        }
        return failureCount < 3;
      },
    },
    mutations: {
      networkMode: "always",
      retry: false,
    },
  },
});
```

### Mantine DataTable

The project uses `mantine-datatable` for advanced tables:

```tsx
import { DataTable } from "mantine-datatable";

<DataTable
  records={data}
  columns={columns}
  highlightOnHover
  striped
  withTableBorder
  withColumnBorders
/>;
```

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      plugins: [["@lingui/swc-plugin", {}]], // SWC for fast compilation
    }),
    lingui(),
    tanstackRouter(), // Auto-generates route tree
  ],
});
```

**Vite 7 Features:**

- SWC compiler for fast builds
- Automatic code splitting
- Tree shaking
- CSS code splitting
- Image optimization (via plugin)

## Internationalization with Lingui

### Lingui Macros (CRITICAL)

The project uses Lingui macros for i18n. **Always use macros, not runtime functions:**

**Correct Usage:**

```tsx
import { t } from "@lingui/core/macro";  // For variables
import { Trans } from "@lingui/react";   // For JSX
import { msg } from "@lingui/core/macro"; // For MessageDescriptor

// In JSX
<Button>{t`Submit Form`}</Button>
<Title><Trans>Welcome, {userName}!</Trans></Title>

// For variables (extracted at compile time)
const placeholder = t`Enter your name`;

// For MessageDescriptor (used in props)
<FormField
  label={msg`Email Address`}
  placeholder={msg`Enter your email`}
/>
```

**Wrong Usage (Don't do this):**

```tsx
import { t } from "@lingui/core"; // ❌ Runtime function, not extracted
```

### Lingui Workflow

```bash
# 1. Write code with macros (t``, Trans, msg``)
# 2. Extract messages
pnpm messages:extract

# 3. Translate in locales/*/messages.po
# 4. Compile messages
pnpm messages:compile

# 5. Messages are auto-loaded in app
```

### Dynamic Locale Activation

```tsx
// Locale is activated in app.tsx on mount
import { dynamicActivateLocale, getClientLocale } from "@/shared/locales";

useEffect(() => {
  dynamicActivateLocale(getClientLocale());
}, []);
```

### ESLint Rules

The project enforces Lingui best practices:

- `lingui/t-call-in-function`: Ensures `t` is called correctly
- `lingui/no-single-variables-to-translate`: Prevents translating single variables
- `lingui/no-expression-in-message`: Prevents complex expressions in messages
- `lingui/no-trans-inside-trans`: Prevents nested Trans components

## Error Handling Best Practices

### RFC 9457 Problem Details

The project implements RFC 9457 Problem Details for HTTP APIs. All API errors are normalized to `AppError`:

```typescript
interface AppError {
  errorType:
    | "auth"
    | "validation"
    | "network"
    | "timeout"
    | "server"
    | "client"
    | "rate-limit"
    | "canceled"
    | "unknown";
  message: string;
  status?: number;
  code?: string;
  requestId?: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
  // RFC 9457 fields
  type: string; // Problem type URI
  title: string; // Short, human-readable summary
  detail: string; // Human-readable explanation
  instance?: string; // URI reference to specific occurrence
}
```

### Error Handling Utilities

```tsx
import { errorFromAxios, toMantineErrors, getErrorMessage } from "@/shared/lib";

try {
  await api.post("/endpoint", data);
} catch (error) {
  // Convert to AppError
  const appError = errorFromAxios(error);

  // Get field errors for form
  const fieldErrors = toMantineErrors(error);
  form.setErrors(fieldErrors);

  // Get error message
  const message = getErrorMessage(error, "Something went wrong");
}
```

### Notification Service

The project has an enhanced notification service with RFC 9457 support:

```tsx
import { notificationService } from "@/shared/lib";

// Simple notifications
notificationService.success({ message: "Saved successfully" });
notificationService.error({ message: "Failed to save" });
notificationService.warning({ message: "Please review" });
notificationService.info({ message: "New update available" });

// From AppError (with retry, technical details, etc.)
notificationService.fromAppError(appError, {
  showTechnicalDetails: true,
  enableRetry: true,
  retryAction: () => retryFunction(),
});

// Validation errors with field details
notificationService.validationError({
  title: "Validation Failed",
  fieldErrors: { email: ["Invalid format"], name: ["Too short"] },
});

// Loading notifications
const id = notificationService.showLoading({ message: "Processing..." });
notificationService.updateLoadingNotification(id, {
  message: "Completed!",
  type: "success",
});
```

### Global Error Boundary

The project includes an ErrorBoundary component in `@/shared/ui`:

```tsx
import { ErrorBoundary } from "@/shared/ui";

// Already wrapped in app.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>;
```

## Code Quality Standards

### ESLint Configuration

The project uses ESLint 9 with flat config and Mantine preset:

```javascript
// eslint.config.js
export default tseslint.config({
  extends: [mantine],
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    lingui: pluginLingui,
    "@tanstack/query": pluginQuery,
    "@tanstack/router": pluginRouter,
  },
  rules: {
    // TanStack Router
    "@tanstack/router/create-route-property-order": "error",

    // Lingui i18n
    "lingui/t-call-in-function": 2,
    "lingui/no-single-variables-to-translate": 2,
    "lingui/no-expression-in-message": 2,
    "lingui/no-single-tag-to-translate": 2,
    "lingui/no-trans-inside-trans": 2,

    // Relaxed rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "no-console": "off",
  },
});
```

### TypeScript Configuration

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Commit Standards

```bash
# Conventional Commits with Commitlint
# Enforced by Husky pre-commit hook

# Format: <type>(<scope>): <subject>
feat: add user profile form
fix: resolve validation error in login form
docs: update API documentation
test: add unit tests for form components
refactor: simplify error handling logic
style: format code with prettier
chore: update dependencies
```

### Pre-commit Hooks

```bash
# Husky hooks in .husky/
# - pre-commit: runs lint-staged (prettier check)
# - commit-msg: runs commitlint

# lint-staged configuration
{
  "*": ["pnpm prettier:check"],
  "package.json": ["sort-package-json"]
}
```

### Dead Code Detection

```bash
# Use Knip to find unused code
pnpm knip
```

## Key Project Patterns

### Multi-Tenant Architecture

The project supports multi-tenancy with tenant context:

```tsx
// Tenant ID resolution from subdomain or header
import { resolveTenantId } from "@/shared/lib/tenant-utils";

// Automatic tenant header injection in API client
api.interceptors.request.use((config) => {
  const tenantId = resolveTenantId();
  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  }
  return config;
});
```

### Authentication Flow

The project uses cookie-based authentication with JWT:

```tsx
// Auth context in processes/auth
import { AuthProvider, useAuth } from "@/processes/auth";

// Protected routes
import { ProtectedRoute } from "@/shared/ui";

<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>;
```

### Configuration Management

```tsx
// Centralized config in app/config
import { getConfig } from "@/app/config";

const apiUrl = getConfig("VITE_API_URL_SERVER");
const authDomain = getConfig("VITE_AUTH_DOMAIN_AUTH");
```

### Theme Management

```tsx
// Theme configuration in app/theme.ts
import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  // Custom theme configuration
});

// Theme store for persistence
import { useThemeStore } from "@/shared/lib/theme-store";
```

### User Preferences

The project includes a user preferences system:

```tsx
// Entity-level hooks
import {
  useUserPreferences,
  useUpdateUserPreferences,
  useTheme,
  useLocale,
} from "@/entities/user";

const { data: preferences } = useUserPreferences();
const theme = useTheme();
const locale = useLocale();
```

### Modal Management

```tsx
// Mantine Modals with context
import { modals } from "@mantine/modals";

// Confirmation modal
modals.openContextModal({
  modal: "confirmation",
  title: "Confirm Action",
  innerProps: {
    message: "Are you sure?",
    onConfirm: () => handleConfirm(),
  },
});
```

### Notification Patterns

```tsx
// Enhanced notification service
import { notificationService } from "@/shared/lib";

// Loading with update
const id = notificationService.showLoading({
  message: "Processing...",
});

// Update to success/error
notificationService.updateLoadingNotification(id, {
  message: "Completed!",
  type: "success",
});

// From AppError with retry
notificationService.fromAppError(error, {
  enableRetry: true,
  retryAction: () => retry(),
});
```

## Deployment & CI/CD

### Build Process

```bash
# Production build
pnpm build

# Build includes:
# 1. TypeScript compilation
# 2. Lingui message extraction and compilation
# 3. Vite build with optimizations

# Preview production build
pnpm preview

# Type checking
pnpm type-check
```

### Docker Support

The project includes Docker configuration:

```bash
# Development with Docker Compose
docker compose -f compose.yaml up -d

# DevContainer support
# See .devcontainer/ for VS Code DevContainer config
```

### CI/CD Workflows

The project includes GitHub Actions workflows:

- **CI**: Linting, type checking, testing
- **E2E**: Playwright tests
- **Dependabot**: Automated dependency updates
- **Release**: Automated versioning with release-it

### Environment Variables for Production

```env
# Required for production
VITE_API_URL_SERVER=https://api.production.com
VITE_AUTH_DOMAIN_AUTH=https://auth.production.com
VITE_AUTH_DOMAIN_APP=https://app.production.com

# Disable MSW in production
VITE_ENABLE_MSW=false

# Set log level
VITE_LOG_LEVEL=silent
```

### SonarQube Integration

```bash
# Code quality analysis
# Configuration in sonar-project.properties
```

## Quick Reference

### Common Import Paths

```tsx
// UI Components
import { FormField, ErrorBoundary, LoadingOverlay } from "@/shared/ui";

// Utilities
import {
  useFormMutation,
  queryClient,
  notificationService,
} from "@/shared/lib";
import { errorFromAxios, toMantineErrors } from "@/shared/lib";

// API Clients
import { api } from "@/shared/lib/client";
import { publicApi } from "@/shared/lib/public-client";

// Configuration
import { getConfig } from "@/app/config";

// Entities
import { email, minLength } from "@/entities/form";
import { useUserPreferences, useTheme } from "@/entities/user";

// Lingui
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react";
import { msg } from "@lingui/core/macro";

// Mantine
import { Button, Stack, Group, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

// TanStack
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
```

### Feature Creation Checklist

When creating a new feature:

1. **Create feature directory**: `src/features/feature-name/`
2. **Create required segments**:
   - `model/types.ts` - TypeScript interfaces
   - `model/validation.ts` - Form validation rules
   - `ui/feature-name.tsx` - Main component
3. **Create public API**: `index.ts` - Export only public interfaces
4. **Use existing patterns**:
   - `useFormMutation` for form submissions
   - `FormField` for form inputs
   - Lingui macros for i18n
   - `notificationService` for notifications
5. **Follow FSD rules**: Only import from lower layers
6. **Test architecture**: `pnpm test:arch`

### Common Patterns

**Form Feature:**

```tsx
// model/validation.ts
export const validateForm = { name: minLength(2), email };
export const initialFormValues = { name: "", email: "" };

// ui/feature.tsx
const form = useForm({ initialValues, validate: validateForm });
const mutation = useFormMutation(form, apiCall, { notifySuccess, notifyError });
const handleSubmit = (values) => mutation.mutateAsync(values);
```

**Data Fetching:**

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["resource", id],
  queryFn: () => api.get(`/resource/${id}`),
});
```

**Modal with Form:**

```tsx
const [opened, { open, close }] = useDisclosure(false);
<Modal opened={opened} onClose={close}>
  <form onSubmit={form.onSubmit(handleSubmit)}>
    <FormField type="text" name="name" form={form} />
    <Button type="submit" loading={mutation.isPending}>
      Submit
    </Button>
  </form>
</Modal>;
```

### Troubleshooting

**Issue: Import not found**

- Check if importing through public API (`index.ts`)
- Verify path alias `@/*` is used correctly

**Issue: Lingui messages not extracted**

- Use macros (`t`, `msg`, `Trans`), not runtime functions
- Run `pnpm messages:extract`

**Issue: Architecture test fails**

- Ensure `index.ts` exists in feature/widget/entity
- Check segment structure (ui/, model/)
- Verify kebab-case naming

**Issue: Form validation not working**

- Check validation rules are from `@/entities/form`
- Ensure `form.getInputProps(name)` is used
- Verify `useFormMutation` is handling errors

**Issue: API errors not showing**

- Check `notificationService` is imported
- Verify `useFormMutation` has `notifyError` config
- Check API interceptor is not suppressing errors
