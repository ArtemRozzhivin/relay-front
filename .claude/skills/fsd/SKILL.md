---
name: fsd
description: Feature-Sliced Design conventions for THIS Next.js template. Load when creating/organizing code (components, features, entities, pages), deciding where code belongs, scaffolding slices, or whenever the user mentions FSD, Feature-Sliced, layers, slices, or segments. Covers the layers (app/_pages/widgets/features/entities/shared), the ui/api/model/lib/config segments, the `npm run g` generators, the two-layer RTK Query pattern, and the enforced import boundaries.
---

# Feature-Sliced Design — this template

Apply these conventions to all frontend code here. Depth lives in `docs/STRUCTURE.md` and `docs/PATTERNS.md` — read them for edge cases. **Scaffold slices with `npm run g`; don't hand-create folders.**

## Layers (import only downward)

```
app  →  _pages  →  widgets  →  features  →  entities  →  shared
```

| Layer      | Path           | May import from                     | Purpose                                               |
| ---------- | -------------- | ----------------------------------- | ----------------------------------------------------- |
| `app`      | `src/app`      | everything below                    | Providers, Redux store, routing guards, global styles |
| `_pages`   | `src/_pages`   | widgets, features, entities, shared | Route-level compositions                              |
| `widgets`  | `src/widgets`  | features, entities, shared          | Large composite UI blocks                             |
| `features` | `src/features` | entities, shared                    | Reusable user interactions                            |
| `entities` | `src/entities` | shared (+ entities via `@x`)        | Business domain models                                |
| `shared`   | `src/shared`   | shared                              | Reusable infra — **no business logic**                |

- Alias `@/*` → `src/*`. The pages layer is **`_pages`** (underscore-prefixed) because Next.js reserves `src/pages` for its legacy Pages Router. Next's App Router lives at repo-root `/app` and each route file just delegates: `export default () => <HomePage/>` from `@/_pages/home`.
- No same-layer cross-slice imports — **except** entities via the `@x` API (`@/entities/<producer>/@x/<consumer>`).

## Segments (inside a slice)

Group by **purpose**, using only: **`ui` / `api` / `model` / `lib` / `config`**.

| Segment  | Holds                                                     |
| -------- | --------------------------------------------------------- |
| `ui`     | components, styles (kebab-case files: `sign-in-form.tsx`) |
| `api`    | RTK Query `injectEndpoints`, request/response types       |
| `model`  | types, stores, hooks, business logic, form schemas        |
| `lib`    | slice-internal helpers                                    |
| `config` | constants, feature flags                                  |

The segment set is **closed** — anything other than `ui / api / model / lib / config` is the "desegmentation" anti-pattern (`components/`, `hooks/`, `utils/`, `types/`, …). Reusable hooks → `model` or `shared/lib/hooks`; helpers → `lib`; constants → `config`.

## Public API

Import a slice only via its `index.ts` barrel — never a deep path (`@/features/auth`, not `@/features/auth/ui/login-form`). `shared` is imported **per-segment**: `@/shared/ui`, `@/shared/lib`, `@/shared/api`, `@/shared/config`, `@/shared/types`.

## Scaffold with the generator

```
npm run g
```

| Generator                                              | Emits                                                             |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `entity` / `feature` / `widget` / `page` / `shared-ui` | a new slice with canonical segments + barrels                     |
| `hook`                                                 | a shared client hook in `shared/lib/hooks`                        |
| `x`                                                    | an entity `@x` cross-import API                                   |
| `endpoint`                                             | adds an RTK Query endpoint **and** its consumer hook to an entity |
| `redux-slice`                                          | a Redux slice **and** registers the reducer in the store          |
| `test`                                                 | a colocated component test using `renderWithProviders`            |

### Running non-interactively (agents / CI)

`npm run g` is interactive. Pass positional args to skip the prompts:

- `npx plop entity <name>`
- `npx plop feature <name> <true|false>` — the boolean is "is this a form feature?"
- `npx plop widget <name>` · `npx plop page <name>` · `npx plop shared-ui <name>`
- `npx plop hook <name>` — name without the `use` prefix
- `npx plop x <producer> <consumer>` — the `@x` cross-import
- `npx plop endpoint <entity> <name> <query|mutation>`
- `npx plop redux-slice <name>`
- `npx plop test <path-from-src-no-ext> <ExportName>`

Generated code lands lint-clean (each generator runs `eslint --fix` + Prettier).

## Data — the two-layer pattern

The single RTK Query client is `@/shared/api` (`import { api } from '@/shared/api'`). Extend it, don't recreate it in `app`.

- **Layer 1 — contract:** `entities/<e>/api/<e>.ts` calls `api.injectEndpoints(...)` using `API_ROUTES` + `HTTP_METHODS` from `@/shared/config`, with `providesTags`/`invalidatesTags`; exports the generated hooks. No UX here. (The `endpoint` generator writes this for you.)
- **Layer 2 — consumer hook:** `entities/<e>/model/use-<action>.ts` wraps the raw RTK hook and owns toasts (`toast` from `@/shared/ui`, `getApiErrorMessage` from `@/shared/api`). Import the raw hook from `../api/<entity>` — **not** the slice's public barrel (cycle risk).
- Response types build on `ApiSuccessResponse<T>` / `ApiErrorResponse` from `@/shared/types`; one type file per operation, never a monolithic `types.ts`.

## Forms

zod schema in `features/<f>/model/<f>.schema.ts`; the form hook `features/<f>/model/use-<f>-form.ts` owns `useForm` **and** the entity mutation + toasts, returning a narrow `{ control, errors, onSubmit, isLoading }`; the `ui/<f>-form.tsx` component consumes it. (Use `npm run g` → `feature` with the form option.)

## React Server Components

A file using React hooks (`useState`, `useEffect`, …) needs `'use client'` and must not be pulled into a Server Component through a shared barrel — client hooks live in `@/shared/lib/hooks`, not the top-level `@/shared/lib` barrel (which stays server-safe).

## Styling & typography

Tailwind v4 token classes only (defined in `src/app/styles/globals.css`) — no raw hex/arbitrary values, no inline `style=` unless unavoidable. Use `Text` / `H1`–`H6` from `@/shared/ui`, not raw `<p>`/`<h1>`. New components follow the `cn()` + `cva()` pattern (`cn` from `@/shared/lib`). Full rules: `docs/PATTERNS.md` (Styling & Typography).

## Enforcement

Boundaries are enforced, not just documented: `npm run lint` (ESLint `boundaries` + `import/no-cycle`) and `npm run lint:fsd` (Steiger). Steiger doesn't recognize the renamed `_pages` layer, so ESLint boundaries is the source of truth there.

## Where does this code go? (Pages First)

1. Used in **one page**? Keep it in that `_pages/<page>`.
2. Used in one **widget** across pages? Keep it in that widget.
3. Reusable **infrastructure** (UI kit, util, api client, route consts)? → `shared`.
4. A complete, reused **user interaction**? → `features` (only when reused in 2+ places).
5. A **business domain model** reused across the app? → `entities`.
6. App-wide setup (provider, store, routing)? → `app`.

Don't predict reuse — start in the page/widget and extract downward when a second place actually needs it.
