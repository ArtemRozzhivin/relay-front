# Next.js FSD Template

A production-ready **Next.js starter** structured with [Feature-Sliced Design](https://feature-sliced.design) — with architectural boundaries **enforced by tooling**, a slice generator, typed environment variables, and a batteries-included quality setup.

## Highlights

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** (strict)
- **Feature-Sliced Design** layering, enforced by **ESLint boundaries** + **Steiger** (the official FSD linter) — not just documented
- **Generators** (`npm run g`) for FSD slices, RTK Query endpoints, Redux slices, hooks, and tests — with public-API barrels wired up
- **Redux Toolkit + RTK Query** — one shared `api` instance that entities extend, plus an optimistic-update helper; auth-agnostic, so you plug in your own token handling
- **react-hook-form + zod** forms, **Tailwind v4** (CSS-first tokens) + **shadcn/Radix** UI kit, **Geist** font via `next/font`
- **Typed env** (`@t3-oss/env-nextjs`), **conventional commits** (commitlint), **Husky** hooks, **Vitest** + Testing Library + **MSW** + **Cypress**

## Quick start

```bash
npx degit your-org/nextjs-fsd-template my-app   # or click "Use this template" on GitHub
cd my-app
npm install
cp .env.example .env      # fill in values as needed (all optional to boot)
npm run dev               # http://localhost:3000
```

## Project structure

```
app/                      # Next.js App Router — thin routes that delegate to @/_pages/*
src/
  app/                    # FSD app layer: providers, store, styles
  _pages/                 # pages layer (named _pages to avoid Next's reserved src/pages)
  widgets/                # composite UI blocks (empty — add your own)
  features/               # reusable user interactions (empty)
  entities/               # business domain models (empty)
  shared/                 # ui · lib · api · config · types · assets
docs/                     # architecture & patterns, page docs, flow specs
plop/                     # generator templates for `npm run g`
cypress/                  # e2e tests
```

> **Why `_pages`?** Next.js reserves `src/pages` for its legacy Pages Router. FSD's official Next.js guide recommends the underscore prefix. Import via `@/_pages/<slice>`.

## FSD layers

| Layer      | May import from                     | Purpose                                     |
| ---------- | ----------------------------------- | ------------------------------------------- |
| `app`      | everything below                    | Providers, store, global styles             |
| `_pages`   | widgets, features, entities, shared | Route-level compositions                    |
| `widgets`  | features, entities, shared          | Large composite UI blocks                   |
| `features` | entities, shared                    | Reusable user interactions                  |
| `entities` | shared (+ other entities via `@x`)  | Business domain models                      |
| `shared`   | shared                              | Reusable infrastructure (no business logic) |

Segments inside a slice are `ui` / `api` / `model` / `lib` / `config`. See `docs/STRUCTURE.md` and `docs/PATTERNS.md`.

## Generators

```bash
npm run g                                  # interactive picker
npx plop endpoint user get-users query      # or pass args to skip the prompts
```

| Generator                                              | What it does                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| `entity` / `feature` / `widget` / `page` / `shared-ui` | New slice with canonical segments and a public-API `index.ts`         |
| `hook`                                                 | A shared client hook in `shared/lib/hooks`                            |
| `x`                                                    | An entity `@x` cross-import API                                       |
| `endpoint`                                             | An RTK Query endpoint **and** its consumer hook in an entity          |
| `redux-slice`                                          | A Redux slice in a feature **and** registers its reducer in the store |
| `test`                                                 | A colocated component test using `renderWithProviders`                |

Generated slices pass the boundary linters out of the box. The full argument list for each generator is in `.claude/skills/fsd/SKILL.md`.

## Scripts

| Script                                 | What it does                           |
| -------------------------------------- | -------------------------------------- |
| `npm run dev` / `build` / `start`      | Next.js dev / production build / serve |
| `npm run analyze`                      | Production build + bundle analyzer     |
| `npm run g`                            | Run a generator (plop)                 |
| `npm run lint` / `lint:fix`            | ESLint (incl. FSD import boundaries)   |
| `npm run lint:fsd`                     | Steiger (FSD architecture linter)      |
| `npm run type-check`                   | `tsc --noEmit`                         |
| `npm run format` / `format:check`      | Prettier                               |
| `npm run test` / `test:watch`          | Vitest                                 |
| `npm run cypress:open` / `cypress:run` | Cypress e2e                            |

## Enforcement

- **ESLint `boundaries`** — downward-only imports + public-API-only entry points (covers every layer incl. `_pages`).
- **Steiger** — FSD-specific structural checks (`app`, `widgets`, `features`, `entities`, `shared`).
- **Husky** — pre-commit (lint-staged + type-check), commit-msg (commitlint, [Conventional Commits](https://www.conventionalcommits.org)), pre-push (format + lint + steiger + type-check + test + build).
- **CI** — `.github/workflows/ci.yml` runs the same suite on push/PR. It ships commented out; uncomment it to enable.
- **Editor** — in VS Code / Cursor, accept the recommended extensions (Prettier, ESLint, Tailwind CSS IntelliSense) for format-on-save; `.editorconfig` covers other editors.

## Docker (optional)

```bash
docker compose up app-dev     # next dev, source live-synced  → http://localhost:3000
docker compose up app-prod    # next build + start            → http://localhost:3000
```

Both services read `.env` and bind port 3000, so run one at a time.

## Documentation

- `docs/STRUCTURE.md` — FSD layers, segments, public API, `@x` cross-imports
- `docs/PATTERNS.md` — API / hooks / forms / types / mappers / routing / styling patterns
- `docs/SCRIPTS.md` — every npm script explained
- `docs/pages/` — one doc per page: purpose, user flows, fields, states & messages. Written for clients and QA, with a short section for developers getting up to speed
- `docs/specs/` — end-to-end specs for complex and sensitive flows (auth, payments, permissions, multi-step, irreversible actions)

## AI tooling (`.claude/`)

The template ships Claude Code configuration so the AI follows the same rules you do:

- **Agents** (`.claude/agents/`) — `test-writer` writes Vitest/RTL/Cypress tests.
- **Skills** (`.claude/skills/`) — `fsd` (this template's layers/segments/generators + two-layer RTK Query pattern).
- **Commands** (`.claude/commands/`) — `/worktree-new` and `/worktree-remove` create/remove a git worktree as a sibling folder.
- **Settings** (`.claude/settings.json`) — shared permissions plus a `PostToolUse` hook that runs Prettier on every file Claude writes, so formatting never blocks a commit. Per-developer overrides live in the gitignored `.claude/settings.local.json`.

`CLAUDE.md` at the repo root is the always-loaded rule summary: it points into `docs/` and the `fsd` skill, and has Claude keep `docs/pages` and `docs/specs` current as it changes code.
