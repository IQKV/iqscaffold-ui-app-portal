> ## 🤔 What is this template all about?
>
> - This template can be used as a base layer for a ReactJS UI projects.
> - Make the project easy to maintain with **7 issue templates**.
> - Quick-start documentation with an extraordinary README structure.
> - Manage issues with **20 issue labels**.
> - Make _community healthier_ with all the guides like code of conduct, contributing, support, security...
> - Learn more with the [official GitHub guide on creating repositories from a template](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template).
> - To start using it, click **[Use this template](https://github.com/IQKV/standard-mantine-ui-project-layout/generate)** to create your new repository.

---

# 🚀 Mantine UI Project Layout

## 📜 Description

React + TypeScript + Vite + TanStack Router + Mantine UI Template

> A modern, feature-rich template for building scalable React applications with the latest tools and best practices.

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
- 🔄 **Axiosb** - Promise-based HTTP client for API calls
- 🔍 **GDraphQL Request** - Lightweight GraphQL client
- ✅ **React Hook Form + Zod** - Type-safe form validation and management
- 🍪 **JS Cookie** - Simple cookie management
- 🔗 **nuqs** - Type-safe URL search params state management

### 🌐 **Internationalization & Accessibility**

- 🌍 **Lingui** - Modern i18n framework with macro support and pluralization
- ♿ **A11y Support** - Built-in accessibility features and Storybook a11y addon

### 🧪 **Testing & Quality**

- 🧪 **Vitest** - Fast unit testing with coverage reports and UI
- 🧪 **Playwright** - Reliable end-to-end testing with UI mode
- 🧪 **Mock Service Worker** - Client-agnostic API mocking for development and testing
- 🧪 **Testing Library** - Simple and complete testing utilities for React

### 🔍 **Code Quality & Development**

- 🔍 **ESLint 9** - Modern linting with flat config and React/TypeScript rules
- 💅 **Prettier** - Opinionated code formatting with package.json plugin
- 🎨 **Stylelint** - CSS/SCSS linting for consistent styling
- 🪝 **Husky** - Git hooks for pre-commit validation
- 📝 **Commitlint** - Conventional commit message validation
- 🔪 **Knip** - Dead code elimination and dependency analysis

### 🧱 **Development Tools**

- 📚 **Storybook 8** - Component development in isolation with dark mode support
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

### 🏗️ **Architecture & Patterns**

- 🏗️ **Feature-Sliced Design** - Scalable frontend architecture methodology
- 🔌 **API Code Generation** - Kubb for OpenAPI/Swagger client generation
- 🎯 **TypeScript Strict Mode** - Enhanced type safety with strict configuration
- 🔄 **Hot Module Replacement** - Instant updates during development

## 📚 Documentation

> [!TIP]
>
> #### Install Prerequisites:
>
> - [Node LTS version](https://nodejs.org/en/blog/release/v22.15.0/)
> - [pnpm](https://pnpm.io/installation)
> - [Git](https://git-scm.com/)
> - [Docker](https://www.docker.com/get-started/)
> - [Docker Compose](https://docs.docker.com/compose/)

### 🔺 Using This Template

#### Option 1: Use GitHub Template (Recommended)

1. Click **[Use this template](https://github.com/IQKV/standard-mantine-ui-project-layout/generate)** button
2. Create your new repository
3. Clone your new repository
4. Follow the setup steps below

#### Option 2: Clone Directly

```shell script
# Clone the repository
git clone https://github.com/IQKV/standard-mantine-ui-project-layout.git my-app

# Navigate to project directory
cd my-app

# Remove the original git history (optional)
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
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

### 🎨 Template Customization

After creating your project from this template, you'll want to customize it:

#### 1. Update Project Information

- [ ] Update `package.json` name, description, and repository URLs
- [ ] Update `README.md` title and description
- [ ] Update `LICENSE` file with your information
- [ ] Update GitHub repository settings and topics

#### 2. Customize Branding

- [ ] Update the app title in `src/pages/__root.tsx`
- [ ] Modify the theme in `src/theme.ts` with your brand colors
- [ ] Replace favicon and other icons in `public/` directory
- [ ] Update meta tags in `index.html`

#### 3. Configure Environment

- [ ] Update `.env.example` with your API endpoints
- [ ] Configure `src/shared/lib/client.ts` with your API base URL and update values in `src/app/config`
- [ ] Set up authentication endpoints in API clients

#### 4. Remove Template Examples (Optional)

- [ ] Remove or modify `src/components/SampleComponents.tsx`
- [ ] Update the home page content in `src/routes/index.tsx`
- [ ] Customize the about page in `src/routes/about.tsx`
- [ ] Remove template-specific Storybook stories

#### 5. Set Up CI/CD

- [ ] Configure GitHub Actions secrets for deployment
- [ ] Update SonarQube configuration in `sonar-project.properties`
- [ ] Set up deployment targets in GitHub Actions workflows

### 📃 Available Scripts

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `pnpm dev`              | Start development server                   |
| `pnpm build`            | Build for production                       |
| `pnpm preview`          | Preview production build                   |
| `pnpm test`             | Run unit tests with Vitest                 |
| `pnpm test:ui`          | Run tests with UI interface                |
| `pnpm test:coverage`    | Run tests with coverage report             |
| `pnpm e2e`              | Run end-to-end tests with Playwright       |
| `pnpm e2e:ui`           | Run e2e tests with UI interface            |
| `pnpm storybook`        | Start Storybook development server         |
| `pnpm storybook:build`  | Build Storybook for production             |
| `pnpm lint`             | Lint code with ESLint                      |
| `pnpm lint:fix`         | Fix linting issues automatically           |
| `pnpm lint:stylelint`   | Lint CSS/SCSS files                        |
| `pnpm prettier:check`   | Check code formatting                      |
| `pnpm prettier:write`   | Format code with Prettier                  |
| `pnpm type-check`       | Check TypeScript types                     |
| `pnpm messages:extract` | Extract i18n messages                      |
| `pnpm messages:compile` | Compile i18n messages                      |
| `pnpm release`          | Automate versioning and package publishing |

### 🏗️ **Feature-Sliced Design Architecture**

This project follows **Feature-Sliced Design (FSD)** methodology for scalable frontend architecture.

### 📚 **Architecture Documentation**

- 📚 [**Documentation Index**](template-docs/index.md) - Complete documentation guide
- 📖 [**FSD Architecture Guide**](template-docs/fsd-architecture.md) - Complete architecture overview
- 🔒 [**Public API Enforcement**](template-docs/public-api-enforcement.md) - API patterns and rules
- ✅ [**Validation Guide**](template-docs/validation-guide.md) - Zod validation patterns
- 🛠️ [**Development Guide**](template-docs/development-guide.md) - Step-by-step development patterns
- 📋 [**Project Overview**](template-docs/project-overview.md) - Implementation summary

### Environment Variables

| Variable   | Description                | Default       |
| ---------- | -------------------------- | ------------- |
| `TZ`       | Defines timezone           | `UTC`         |
| `NODE_ENV` | Defines nodejs environment | `development` |

### 🎯 Cursor AI IDE Support

This project includes Cursor AI IDE rules for enhanced development experience:

- **TypeScript React Query Best Practices** - Enforces best practices for using TanStack Query (React Query) in TypeScript React applications
- **Code organization and structure guidelines**
- **Performance optimization recommendations**
- **Security best practices enforcement**
- **Testing approaches and patterns**

The rules are located in `.cursor/rules/` directory and are automatically applied when using Cursor IDE.

---

## 📆 Changelog

Conventional changelog located [here](CHANGELOG.md).

## 🙏 Community & Contributions

Please follow [Contributing](.github/CONTRIBUTING.md) page.

## 📙 Code of Conduct

Please follow [Code of Conduct](.github/CODE_OF_CONDUCT.md) page.

<a name="license"></a>

## 📑 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## _GitHub Project Tooling Overview_

A concise summary of automation and quality tooling. For full details, see:

- template-docs/index.md
- template-docs/development-guide.md

### CI/CD (GitHub Actions)

- .github/workflows/build-nodejs-project.yml – build & test pipeline
- .github/workflows/check-pr-title.yml – PR naming conventions
- .github/workflows/check-commit-message.yml – commit message validation
- .github/workflows/use-template.yml – one-time template setup

### Local Automation (Husky)

- .husky/pre-commit – triggers pre-commit checks
- commitlint.config.js – enforces conventional commit messages

### Quality Gates

- ESLint – see eslint.config.js
- Prettier & Stylelint – run via package.json scripts
- TypeScript – pnpm type-check

See the Available Scripts section above for everyday commands.
