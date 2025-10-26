# 🚀 Getting Started Guide

Welcome to your new React 19 project! This guide will help you get up and running quickly.

## 📋 Prerequisites

Make sure you have these installed:

- [Node.js 22+](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/installation) (fast, disk space efficient package manager)
- [Git](https://git-scm.com/)

## 🏃‍♂️ Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Development Server

```bash
pnpm dev
```

Your app will be running at `http://localhost:5173` 🎉

### 3. Start Building Features

The project uses **Feature-Sliced Design (FSD)** architecture. Here's how to add your first feature:

```bash
# Create a new feature
mkdir -p src/features/my-feature/{model,ui,api}
touch src/features/my-feature/index.ts
```

## 🏗️ Project Structure

```
src/
├── app/                    # App initialization & routing
├── pages/                  # Route components
├── features/               # Business features
├── entities/               # Business entities
├── shared/                 # Reusable utilities & UI
└── widgets/                # Composite UI blocks
```

## 🔧 Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `pnpm dev`        | Start development server |
| `pnpm build`      | Build for production     |
| `pnpm test`       | Run tests                |
| `pnpm lint`       | Lint code                |
| `pnpm type-check` | Check TypeScript types   |

## 🧪 E2E Testing (Playwright)

- Install browsers (first time): `pnpm playwright:install`
- Run tests: `pnpm e2e`
- UI mode: `pnpm e2e:ui`
- Headed: `pnpm e2e:headed`
- Report: `pnpm e2e:report`

The dev server starts automatically via `webServer` in `playwright.config.ts`.
CI runs E2E on PRs/pushes via `.github/workflows/e2e-playwright.yml`.

## 📚 Key Technologies

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety throughout your app
- **Vite** - Fast build tool and dev server
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Powerful data fetching
- **Zod** - Runtime type validation

## 🎯 Next Steps

1. **Customize the app** - Update `src/app/app.tsx` and routing
2. **Add your API** - Configure endpoints in `src/shared/lib/`
3. **Create features** - Build your business logic in `src/features/`
4. **Style your app** - Customize styles in `src/styles/`
5. **Deploy** - Use the build output from `pnpm build`

## 📖 Learn More

- [Feature-Sliced Design](https://feature-sliced.design/) - Architecture methodology
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [React 19 Docs](https://react.dev/) - Latest React features

## 🆘 Need Help?

- Check the [documentation](index.md)
- Open an [issue](../../../issues)
- Read the [contributing guide](../.github/CONTRIBUTING.md)

Happy coding! 🚀
