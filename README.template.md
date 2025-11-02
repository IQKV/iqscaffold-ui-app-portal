# Mantine UI Project Layout

A modern React + TypeScript + Vite template with Mantine UI, TanStack Router, TanStack Query, and Feature‑Sliced Design. Production‑ready tooling with Storybook, Vitest, Playwright, ESLint 9, Prettier, and Lingui.

## 🔑 Tech Stack

- **React 19**, **TypeScript**, **Vite 7** (SWC)
- **Mantine UI v8** + extensions (Carousel, Charts, Dates, Dropzone, Modals, Notifications, DataTable)
- **TanStack Router v1**, **TanStack Query v5**, **Zustand**
- **React Hook Form** + **Zod** validation
- **Axios**, **GraphQL Request**
- **Lingui** i18n, **Storybook 8**, **Vitest**, **Playwright**, **ESLint 9**, **Prettier**

## 🚀 Getting Started

- Prerequisites: Node LTS, pnpm
- Install: `pnpm install`
- Env: `cp .env.example .env`
- Dev: `pnpm dev` -> http://localhost:5173

## 📜 Common Scripts

- `pnpm dev` — start dev server
- `pnpm build` — type-check, extract/compile i18n, build
- `pnpm preview` — preview production build
- `pnpm test` / `pnpm test:coverage` — unit tests
- `pnpm e2e` / `pnpm e2e:ui` — Playwright tests
- `pnpm storybook` — Storybook dev server
- `pnpm lint` / `pnpm prettier:check` — lint and format

## 🏗️ Architecture (FSD)

- `app/` providers, routing, global styles
- `pages/` route components
- `widgets/` complex UI blocks
- `features/` user scenarios and business logic
- `entities/` data models and API
- `shared/` UI kit, utilities, libs

Import via slice public APIs only (barrels). Higher layers may import lower ones; cross‑feature deps are disallowed.

## 📚 Documentation

- API Docs: `docs/api/README.md`
- Architecture: `docs/architecture/README.md`
- Deployment: `docs/deployment/README.md`
- Contributing: `.github/CONTRIBUTING.md`

## 📑 License

MIT — see `LICENSE`.
