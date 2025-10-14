# Project Name 🚀

<!-- TEMPLATE: This README.template.md is a starter template. Copy parts into your real README.md and replace placeholders. -->

<details>
  <summary><strong>How to use this template (click to expand)</strong></summary>

1. Rename the title above to your project name and optionally add a logo right below it.
2. Add badges (build, tests, coverage, license) under the title.
3. Fill each section below with your actual project content (keep the section order if you like it).
4. Replace placeholder code blocks and bullet points with real commands and steps.
5. Keep the "Template Usage" links if you want quick access to template docs, or remove them in your final README.md.
6. Remove this guidance block after you finish customizing.

</details>

- Add your project logo.
- Write a short introduction to the project.
- If you are using badges, add them here.

<details>
  <summary><strong>Badge examples (optional)</strong></summary>

- Build: <code>![CI](https://img.shields.io/github/actions/workflow/status/ORG/REPO/ci.yml?label=CI)</code>
- Tests: <code>![Tests](https://img.shields.io/badge/tests-passing-brightgreen)</code>
- Coverage: <code>![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)</code>
- License: <code>![License](https://img.shields.io/github/license/ORG/REPO)</code>

</details>

## :beginner: About

Add a detailed introduction about the project here, everything you want the reader to know.

## :zap: Usage

Write about how to use this project.

### :electric_plug: Installation

- Steps on how to install this project, to use it.
- Be very detailed here, For example, if you have tools which run on different operating systems, write installation steps for all of them.

```
$ add installations steps if you have to.
```

### :package: Commands

- Commands to start the project.

## :wrench: Development

If you want other people to contribute to this project, this is the section, make sure you always add this.

### :notebook: Pre-Requisites

List all the pre-requisites the system needs to develop this project.

- A tool
- B tool

### :nut_and_bolt: Development Environment

Write about setting up the working environment for your project.

- How to download the project...
- How to install dependencies...

---

<details>
  <summary><strong>✅ Pre-publish checklist (remove in final README)</strong></summary>

- [ ] Title updated and logo added
- [ ] Badges added (CI, tests, coverage, license)
- [ ] About/Usage/Installation/Commands completed
- [ ] Development prerequisites and environment documented
- [ ] Architecture notes reflect your stack and modules
- [ ] Links verified (Getting Started, docs, external resources)
- [ ] Guidance blocks, template-docs folder, are removed before publishing

</details>

---

## 📚 Template Usage

- [Getting Started](template-docs/getting-started.md)
- [Project Overview](template-docs/project-overview.md)
- [FSD Architecture](template-docs/fsd-architecture.md)
- [Development Guide](template-docs/development-guide.md)
- [Public API Enforcement](template-docs/public-api-enforcement.md)
- [Template Features](template-docs/template-features.md)
- [Zustand Integration](template-docs/zustand-integration.md)
- [Deployment](template-docs/deployment.md)

## 🧩 Boilerplate Architecture

- FSD boundaries with public API barrels
- Typed forms, notifications, and devtools
- Vite, ESLint/Prettier, Vitest/Playwright, Storybook, Lingui
- Processes: Auth session refresh/logout via `useAuthSession` + provider
- Features: Form/business logic via `useLoginForm`, `useRegisterForm`
- Entities: Pure API methods (e.g., `authApi`)
- Shared: UI kit, utilities, query client, notifications
