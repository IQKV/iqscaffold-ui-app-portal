# 🚀 IQ Scaffold Application Portal

## 📜 Description

Modern React Application with Feature-Sliced Design Architecture

> A production-ready template demonstrating authentication, user management, dashboard analytics, and security features with integration to microservices backend. Reference implementation for building scalable SaaS applications with React 19, TypeScript, and modern tooling.

## 🔑 Key Features

### 🚀 **Core Technologies**

- ✨ **React 19** - Latest React with concurrent features and improved performance
- ⚡ **Vite 7** - Lightning-fast development with instant HMR and optimized builds
- 🎯 **TypeScript** - Type-safe development with latest language features
- 📦 **PNPM** - Fast, disk space efficient package manager with workspaces support

### 🎨 **UI & Styling**

- 🎨 **Mantine UI** - Modern React components library with comprehensive theming
- 🎪 **Mantine Extensions** - Carousel, Charts, Dates, Dropzone, Modals, Notifications
- 📝 **Tiptap Editor** - Rich text editor with extensions for images, links, and formatting
- 🎭 **Tabler Icons** - Beautiful SVG icons optimized for React
- 📊 **Mantine DataTable** - Advanced data table with sorting, filtering, and pagination

### 🔄 **State Management & Data**

- 🔄 **TanStack Router** - Type-safe routing with code splitting and search params
- 🔄 **TanStack Query** - Powerful data synchronization and caching
- 🔄 **Axios** - Promise-based HTTP client for API calls
- ✅ **React Hook Form + Zod** - Type-safe form validation and management
- 🍪 **JS Cookie** - Simple cookie management
- 🔗 **nuqs** - Type-safe URL search params state management

### 🌐 **Internationalization & Accessibility**

- 🌍 **Lingui** - Modern i18n framework with macro support and pluralization
- ♿ **A11y Support** - Built-in accessibility features

### 🧪 **Testing & Quality**

- 🧪 **Vitest** - Fast unit testing with coverage reports and UI
- 🧪 **Playwright** - Reliable end-to-end testing with UI mode
- 🧪 **Mock Service Worker** - Client-agnostic API mocking for development and testing
- 🧪 **Testing Library** - Simple and complete testing utilities for React

### 🔍 **Code Quality & Development**

- 🔍 **oxlint** - Modern linting with React/TypeScript rules
- 💅 **Prettier** - Opinionated code formatting with package.json plugin
- 🎨 **Stylelint** - CSS/SCSS linting for consistent styling
- 🪝 **Husky** - Git hooks for pre-commit validation
- 📝 **Commitlint** - Conventional commit message validation
- 🔪 **Knip** - Dead code elimination and dependency analysis

### 🧱 **Development Tools**

- 🔧 **SWC** - Fast TypeScript/JavaScript compiler for React
- 📦 **Bundle Analyzer** - Visualize and optimize bundle size
- 🖼️ **Image Optimizer** - Automatic image optimization in builds
- 🧹 **Console Remover** - Remove console statements in production builds

### 🚀 **DevOps & Automation**

- 👷 **GitHub Actions** - CI/CD workflows for testing, building, and deployment
- 🔒 **Dependabot** - Automated dependency updates and security monitoring
- 📦 **Release-it** - Automated versioning and changelog generation
- 🐳 **Docker Compose** - Local development environment setup
- 📊 **SonarQube** - Code quality and security analysis

### 💳 **Billing & Payments**

- 💳 **Stripe Integration** - Modern payment processing with Stripe Elements and Connect
- 🏦 **Merchant Onboarding** - Automated Stripe Connect onboarding flow for sellers
- 📜 **Billing History** - Paginated transaction history with status tracking and refunds

### 🏗️ **Architecture & Patterns**

- 🏗️ **Feature-Sliced Design** - Scalable frontend architecture methodology with strict layer hierarchy
- 🎯 **TypeScript Strict Mode** - Enhanced type safety with strict configuration
- 🔄 **Hot Module Replacement** - Instant updates during development
- 🔐 **JWT Authentication** - Token-based auth with automatic refresh and session management
- 🏢 **Multi-Tenant Support** - Tenant context propagation and isolation patterns
- 📋 **RFC 9457 Compliance** - Problem Details for HTTP APIs error handling

## 🎯 What This Project Demonstrates

### Core Features Implemented

#### **📊 Analytics & Dashboard**

- **Main Dashboard** - KPI cards with trend indicators (Users, Orders, Revenue, Growth)
- **CRM Analytics** - Lead conversion metrics, pipeline statistics, and date range filtering
- **Real-time Stats** - Dashboard statistics with loading states and error boundaries

#### **🎯 CRM & Lead Management**

- **Lead Management** - Complete CRUD with list/detail views, activity timeline, and follow-up scheduling
- **Contact Management** - Contact listing with search, filtering, bulk operations, and status management
- **Pipeline Tracking** - Kanban-style pipeline view with drag-and-drop stage management
- **CRM Dashboard** - Dedicated CRM analytics with conversion charts and follow-up reminders
- **Activity Timeline** - Lead interaction history and activity tracking

#### **👥 User & Security Management**

- **User Administration** - Enhanced data grid with CRUD operations, feature management, and role-based access
- **Security Settings** - Password change with strength validation, multi-device session management
- **Email Verification** - Email status checking, verification workflow, and registration tracking
- **User Preferences** - Theme switching, locale selection, and customizable user settings

#### **💳 Payment & Billing System**

- **Multi-Gateway Support** - Stripe, PayPal, Square, and Braintree configuration and management
- **Payment Checkout** - Stripe Elements integration with payment status tracking and error handling
- **Subscription Management** - Complete subscription lifecycle with plans, trials, and cancellation workflows
- **Invoice Management** - Invoice listing, PDF downloads, hosted invoice viewing, and payment tracking
- **Refund Processing** - Administrative refund workflow with confirmation dialogs
- **Merchant Onboarding** - Stripe Connect integration for multi-tenant payment routing
- **Billing History** - Transaction history with status tracking and refund management

#### **🏗️ Infrastructure & Architecture**

- **Route Protection** - Declarative guards for authentication and authorization with service access control
- **Multi-Tenant Support** - Tenant context propagation with automatic header injection
- **Service Health Monitoring** - CRM service health checks with degradation banners
- **Internationalization** - Full i18n support with Lingui across all features
- **Error Handling** - RFC 9457 compliant error handling with user-friendly notifications
- **Responsive Design** - Mobile-first approach with touch-friendly interfaces

### Architecture Highlights

```
src/
├── app/          # Application initialization, config, theme
├── processes/    # Complex business processes (auth, tenant)
├── pages/        # Route pages (dashboard, users, preferences)
├── widgets/      # Composite UI blocks (header, sidebar, tenant-info)
├── features/     # User interactions (dashboard, users, security, preferences)
├── entities/     # Business entities (user, form validation)
└── shared/       # Reusable infrastructure (API, UI, utils, mocks)
```

## 📚 Documentation

> [!TIP]
>
> #### Install Prerequisites:
>
> - [Node.js](https://nodejs.org/) >= 22.0.0 (LTS)
> - [pnpm](https://pnpm.io/installation) >= 10.32.0
> - [Git](https://git-scm.com/)
> - [Docker](https://www.docker.com/get-started/) (optional, for local services)
> - [Docker Compose](https://docs.docker.com/compose/) (optional)

### 🔺 Using This Template

#### Option 1: Use GitHub Template (Recommended)

1. Click **[Use this template](https://github.com/IQKV/iqscaffold-ui-mantine-app-portal/generate)** button
2. Create your new repository
3. Clone your new repository
4. Follow the setup steps below

#### Option 2: Clone Directly

```shell script
# Clone the repository
git clone https://github.com/IQKV/iqscaffold-ui-mantine-app-portal.git my-app

# Navigate to project directory
cd my-app

# Remove the original git history (optional)
rm -rf .git
git init
git add .
git commit -m "feat: initial commit"
```

### 🔺 Local Development Setup

```shell script
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start local dev services in Docker (optional)
docker compose -f compose.yaml up -d

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

### 🚀 Quick Start Guide

**First Time Setup:**

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env

# 3. Install Playwright browsers (for E2E tests)
pnpm playwright:install

# 4. Start development server
pnpm dev
```

**Development Workflow:**

```bash
# Start dev server with hot reload
pnpm dev

# Run unit tests
pnpm test

# Check code quality
pnpm lint
pnpm type-check

# Extract and compile i18n messages
pnpm messages:extract
pnpm messages:compile

# Run E2E tests with UI
pnpm e2e:ui
```

**Mock Service Worker (MSW):**

The project uses MSW for API mocking during development. Enable/disable via `VITE_ENABLE_MSW=true` in `.env`.

- Mock handlers are in `src/shared/mocks/handlers/`
- Browser setup in `src/shared/mocks/browser.ts`
- Automatically initialized when enabled

### 🎨 Template Customization

After creating your project from this template, you'll want to customize it:

#### 1. Update Project Information

- [ ] Update `package.json` name, description, and repository URLs
- [ ] Update `README.md` title and description
- [ ] Update `LICENSE` file with your information
- [ ] Update GitHub repository settings and topics

#### 2. Customize Branding

- [ ] Update the app title in `src/pages/__root.tsx`
- [ ] Modify the theme in `src/app/theme.ts` with your brand colors
- [ ] Replace favicon and other icons in `public/` directory
- [ ] Update meta tags in `index.html`

#### 3. Configure Environment

- [ ] Update `.env.example` with your API endpoints
- [ ] Configure `src/shared/lib/client.ts` with your API base URL and update values in `src/app/config`
- [ ] Set up authentication endpoints in API clients

#### 4. Customize Template Content (Optional)

- [ ] Update the home page content in `src/pages/index.tsx`
- [ ] Customize the about page in `src/pages/about.tsx`

#### 5. Set Up CI/CD

- [ ] Configure GitHub Actions secrets for deployment
- [ ] Update SonarQube configuration in `sonar-project.properties`
- [ ] Set up deployment targets in GitHub Actions workflows

### 📃 Available Scripts

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `pnpm dev`                | Start development server (http://localhost:5173)            |
| `pnpm build`              | Build for production (includes i18n extraction/compilation) |
| `pnpm preview`            | Preview production build                                    |
| `pnpm test`               | Run unit tests with Vitest                                  |
| `pnpm test:arch`          | Run architecture tests (FSD compliance)                     |
| `pnpm test:ui`            | Run tests with UI interface                                 |
| `pnpm test:coverage`      | Run tests with coverage report                              |
| `pnpm e2e`                | Run end-to-end tests with Playwright                        |
| `pnpm e2e:ui`             | Run e2e tests with UI interface (recommended)               |
| `pnpm e2e:headed`         | Run e2e tests in headed mode                                |
| `pnpm e2e:report`         | Open last Playwright HTML report                            |
| `pnpm e2e:update`         | Update Playwright snapshots                                 |
| `pnpm e2e:debug`          | Debug e2e tests (PWDEBUG)                                   |
| `pnpm playwright:install` | Install Playwright browsers                                 |
| `pnpm lint`               | Lint code with oxlint                                       |
| `pnpm lint:fix`           | Fix linting issues automatically                            |
| `pnpm lint:stylelint`     | Lint CSS/SCSS files                                         |
| `pnpm formatter:check`    | Check code formatting                                       |
| `pnpm formatter:write`    | Format code with oxfmt                                      |
| `pnpm type-check`         | Check TypeScript types                                      |
| `pnpm messages:extract`   | Extract i18n messages from code                             |
| `pnpm messages:compile`   | Compile i18n messages for runtime                           |
| `pnpm knip`               | Find dead code and unused dependencies                      |
| `pnpm release`            | Automate versioning and package publishing                  |

### 🏗️ **Feature-Sliced Design Architecture**

This project follows **Feature-Sliced Design (FSD)** methodology for scalable frontend architecture.

**Layer Hierarchy (Import Rules):**

- `app` → can import from all layers
- `processes` → can import from `features`, `entities`, `shared`
- `pages` → can import from `widgets`, `features`, `entities`, `shared`
- `widgets` → can import from `features`, `entities`, `shared`
- `features` → can import from `entities`, `shared` (features cannot depend on each other)
- `entities` → can import from `shared`
- `shared` → cannot import from any upper layers

**Public API Pattern:**

Each slice (feature/widget/entity) MUST expose functionality through `index.ts`. All imports must go through public API:

```typescript
// ✅ Correct - import through public API
import { UserFormFeature } from "@/features/user-form";

// ❌ Wrong - direct import of internal files
import { UserFormFeature } from "@/features/user-form/ui/user-form-feature";
```

**Architecture Testing:**

Run `pnpm test:arch` to verify FSD compliance (layer structure, public APIs, naming conventions).

### Environment Variables

| Variable                          | Description                                   | Default                       | Required |
| --------------------------------- | --------------------------------------------- | ----------------------------- | -------- |
| `VITE_API_SERVER_URL`             | Backend API base URL (user service)           | `http://localhost:8080`       | Yes      |
| `VITE_AUTH_DOMAIN_AUTH`           | Auth portal domain                            | `https://auth.iqscaffold.com` | Yes      |
| `VITE_AUTH_DOMAIN_APP`            | Main application domain                       | `https://app.iqscaffold.com`  | Yes      |
| `VITE_AUTH_REDIRECT_AFTER_LOGIN`  | Redirect URL after successful login           | `/dashboard`                  | No       |
| `VITE_AUTH_REDIRECT_AFTER_LOGOUT` | Redirect URL after logout                     | `/`                           | No       |
| `VITE_AUTH_REDIRECT_AFTER_SIGNUP` | Redirect URL after signup                     | `/verify-email`               | No       |
| `VITE_ENABLE_MSW`                 | Enable Mock Service Worker for API mocking    | `true`                        | No       |
| `VITE_STRIPE_PUBLIC_KEY`          | Stripe Publishable Key                        | `pk_test_...`                 | Yes      |
| `VITE_LOG_LEVEL`                  | Console logging verbosity (silent/info/debug) | `info`                        | No       |
| `TZ`                              | Defines timezone                              | `UTC`                         | No       |
| `NODE_ENV`                        | Defines nodejs environment                    | `development`                 | No       |

### 🤖 AI Agent Development Support

This project includes comprehensive AI agent development guidelines in `AGENTS.md`:

- **Feature-Sliced Design Rules** - Strict layer hierarchy and public API patterns
- **Code Generation Principles** - Type-first development and minimal implementations
- **User Confirmation Policy** - Always ask before applying changes to codebase
- **Concise Output Requirements** - Direct, action-oriented communication standards
- **Tech Stack Patterns** - Actual implementation patterns from the codebase
- **Form Handling Standards** - useFormMutation hook with RFC 9457 error handling
- **Testing Strategy** - Co-located tests with Vitest and Playwright
- **Internationalization** - Lingui macros (t, msg, Trans) usage patterns

The guide reflects actual implementation patterns used in this project, not theoretical best practices. All code examples are based on real code in the repository.

### 🔧 Key Utilities & Patterns

#### useFormMutation Hook

Powerful hook integrating Mantine forms with TanStack Query:

```typescript
import { useFormMutation } from "@/shared/lib";

const mutation = useFormMutation<ResponseType, FormValues>(
  form,
  async (values) => api.post("/endpoint", values),
  {
    notifySuccess: { title: t`Success!`, message: t`Form submitted` },
    notifyError: { title: t`Error`, fallback: t`Failed to submit` },
    clearOnSuccess: true,
    focusErrorField: true,
  },
);
```

**Features:**

- Automatic field error mapping from RFC 9457 responses
- Loading notifications with update capability
- Success/error notifications with customization
- Field focus on validation errors
- Form clearing on success
- Retry actions for network errors

#### Enhanced FormField Component

Comprehensive form field component in `@/shared/ui`:

```typescript
// Business-focused form components
import { CrmFormField } from "@/entities/crm";
import { UserFormField } from "@/entities/user";
import { BillingFormField } from "@/entities/billing";

// CRM Lead Form
<CrmFormField
  type="text"
  name="firstName"
  label={t`First Name`}
  form={form}
  withAsterisk
  maxLength={100}
  showCharacterCount
/>

// User Management Form
<UserFormField
  type="username"
  name="username"
  label={t`Username`}
  form={form}
  withAsterisk
  showCharacterCount
/>

// Billing Configuration Form
<BillingFormField
  type="password"
  name="apiKey"
  label={t`API Key`}
  form={form}
  withAsterisk
  showStrengthIndicator
/>
  type="text"
  name="name"
  label={msg`Name`}
  placeholder={msg`Enter your name`}
  form={form}
  withAsterisk
  tooltip={msg`Helper text`}
/>
```

**Supports:**

- All common input types (text, email, password, textarea, select, multiselect)
- Lingui i18n integration with MessageDescriptor
- Character counting and validation status
- Password strength indicators
- Tooltips and descriptions
- Loading states and custom errors

#### RFC 9457 Error Handling

Standardized error handling with Problem Details for HTTP APIs:

```typescript
import { errorFromAxios, notificationService } from "@/shared/lib";

try {
  await api.post("/endpoint", data);
} catch (error) {
  const appError = errorFromAxios(error);
  notificationService.fromAppError(appError, {
    showTechnicalDetails: true,
    enableRetry: true,
  });
}
```

#### Notification Service

Enhanced notification service with RFC 9457 support:

```typescript
import { notificationService } from "@/shared/lib";

// Simple notifications
notificationService.success({ message: "Saved successfully" });
notificationService.error({ message: "Failed to save" });

// Loading with update
const id = notificationService.showLoading({ message: "Processing..." });
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

#### Multi-Tenant Support

Automatic tenant context propagation:

```typescript
import { resolveTenantId } from "@/shared/lib/tenant-utils";

// Tenant ID automatically injected in API requests
api.interceptors.request.use((config) => {
  const tenantId = resolveTenantId();
  if (tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  }
  return config;
});
```

#### Currency Utility

Locale-aware currency formatting and cents-to-dollars conversion:

```typescript
import { formatCurrency } from "@/shared/lib/currency";

// Automatically handles locale, currency symbol, and cent conversion
const formatted = formatCurrency(2000, "USD"); // "$20.00"
```

---

## 🧪 Testing

### Unit Tests (Vitest)

- Run tests: `pnpm test`
- Watch mode: `pnpm test:watch`
- Coverage: `pnpm test:coverage`
- UI mode: `pnpm test:ui`
- Architecture tests: `pnpm test:arch`

**Test Organization:**

- Tests are co-located with source files (e.g., `component.tsx` → `component.test.tsx`)
- This approach keeps tests close to the code they test, making them easier to maintain
- Use `TestWrapper` from `@/shared/lib/test-utils` for components requiring Mantine/Query providers
- Mock Service Worker (MSW) for API mocking in tests

**Architecture Testing:**

The project includes automated FSD compliance tests in `src/architecture.test.ts`:

- Validates all FSD layers exist (app, processes, pages, widgets, features, entities, shared)
- Ensures every feature/widget/entity has `index.ts` (public API)
- Verifies file naming conventions (kebab-case)
- Checks shared layer has standard segments (api/, lib/, ui/, types/)

### E2E Testing (Playwright)

- Install browsers (first time): `pnpm playwright:install`
- Run tests: `pnpm e2e`
- UI mode: `pnpm e2e:ui` (recommended for development)
- Headed: `pnpm e2e:headed`
- Debug: `pnpm e2e:debug`
- Report: `pnpm e2e:report`

The dev server is auto-started by Playwright via `webServer` in `playwright.config.ts`.
CI runs Playwright on PRs/pushes via `.github/workflows/e2e-playwright.yml`.

## 📆 Changelog

Conventional changelog located [here](CHANGELOG.md).

## 🙏 Community & Contributions

Please follow [Contributing](.github/CONTRIBUTING.md) page.

## 📙 Code of Conduct

Please follow [Code of Conduct](.github/CODE_OF_CONDUCT.md) page.

<a name="license"></a>

## 📑 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
