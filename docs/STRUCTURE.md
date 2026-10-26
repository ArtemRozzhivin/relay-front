# Structure — Feature-Sliced Design

This project follows [Feature-Sliced Design v2.1](https://feature-sliced.design). Code is organized into **layers** (by responsibility), **slices** (by business domain), and **segments** (by technical purpose).

## Layers

Imports flow **strictly downward** — a module may only import from layers **below** it:

```
app  →  _pages  →  widgets  →  features  →  entities  →  shared
```

| Layer      | Path           | May import from                     | Purpose                                               |
| ---------- | -------------- | ----------------------------------- | ----------------------------------------------------- |
| `app`      | `src/app`      | everything below                    | Providers, Redux store, routing guards, global styles |
| `_pages`   | `src/_pages`   | widgets, features, entities, shared | Route-level compositions (one slice per screen)       |
| `widgets`  | `src/widgets`  | features, entities, shared          | Large, self-contained composite UI blocks             |
| `features` | `src/features` | entities, shared                    | Reusable user interactions with business value        |
| `entities` | `src/entities` | shared (+ entities via `@x`)        | Core business domain models                           |
| `shared`   | `src/shared`   | shared                              | Reusable infrastructure — **no business logic**       |

Alias: `@/*` → `src/*` (e.g. `@/features/auth`, `@/shared/ui`).

### Next.js integration

- **Next's App Router lives at the repo-root `/app`** and contains only thin route files that delegate to a `_pages` slice:
  ```tsx
  // app/page.tsx
  import { HomePage } from '@/_pages/home';
  export default function Page() {
  	return <HomePage />;
  }
  ```
- **The pages layer is `_pages`, not `pages`.** Next.js reserves `src/pages` for its legacy Pages Router and will try to route it. The underscore prefix (FSD's official Next.js recommendation) avoids the collision. `src/app` (the FSD app layer) is safe because the root `/app` takes precedence for the App Router.

## Slices

A slice is a business-domain folder within a layer (`entities/user`, `features/auth`, `_pages/home`). Rules:

- Slices on the same layer are **independent** — no direct imports between them (the one exception: entities via the `@x` API, below).
- A slice keeps **all code for its purpose together** (high cohesion).
- `shared` has **no slices** — it is organized directly into segments.

> **Pages First (v2.1):** keep code in the page/widget that uses it. Extract to `features`/`entities` only when a _second_ place needs it — don't abstract preemptively.

## Segments

Segments are the folders inside a slice, grouped by **technical purpose**:

| Segment  | Contents                                                                             |
| -------- | ------------------------------------------------------------------------------------ |
| `ui`     | Components, styles, presentational formatters (kebab-case files: `sign-in-form.tsx`) |
| `api`    | Backend interactions — RTK Query `injectEndpoints`, request/response types, mappers  |
| `model`  | Data model — types, stores, hooks, business logic, form schemas                      |
| `lib`    | Slice-internal utilities/helpers                                                     |
| `config` | Configuration, constants, feature flags                                              |

The segment set is **closed** — anything other than `ui / api / model / lib / config` (a `components/`, `hooks/`, `types/`, … folder) groups by _essence_ instead of _purpose_ and is the "desegmentation" anti-pattern. Reusable hooks → the slice's `model` or `shared/lib/hooks`; helpers → `lib`; constants → `config`.

Component files are **kebab-case** (`sign-in-form.tsx`, `orders-view.tsx`). Types are per-operation files, never a monolithic `types.ts`.

## Public API

Every slice exposes a public API through its root `index.ts` barrel. **Import a slice only through its public API**, never a deep file path:

```ts
import { LoginForm } from '@/features/auth'; // ✅
import { LoginForm } from '@/features/auth/ui/login-form'; // ❌ (boundaries error)
```

`shared` is special — it has **per-segment** public APIs, so import from the segment:

```
@/shared/ui   @/shared/lib   @/shared/api   @/shared/config   @/shared/types
```

## Cross-entity imports (`@x`)

When two entities have a genuine business relationship, the **producer** exposes a narrow, per-consumer API under `@x/`:

```
entities/user/@x/order.ts     // what `order` may use from `user`
```

```ts
// entities/order/model/…
import { getUserOrders } from '@/entities/user/@x/order';
```

The producer's root `index.ts` **never** re-exports `@x`. Regular cross-slice imports (without `@x`) remain forbidden.

## The `app` layer

```
src/app/
  providers/   # <AppProvider>: Redux, Nuqs, ErrorBoundary, ModalProvider, Toaster
  store/       # configureStore, root-reducer, typed useAppDispatch/useAppSelector
  styles/      # globals.css (Tailwind v4 @theme tokens)
```

## The `shared` layer

```
src/shared/
  ui/       # the UI kit (button, input, modal, text, …) — import from @/shared/ui
  api/      # the RTK Query client + error helpers (getApiErrorMessage) + MSW handlers
  lib/      # cn, validation, rtk, date, format-number, get-initials, hooks/
  config/   # env, path-routes, api-routes, http, messages, public-api-url
  types/    # api-response, form-mode
  assets/   # icons/, images/ (imported by path; see assets/README.md)
```

> **RSC note:** modules that use React hooks (`useState`, `useEffect`, …) must carry the `'use client'` directive. Keep them out of barrels that server components import — client hooks live in `@/shared/lib/hooks`, not the top-level `@/shared/lib` barrel.

## Enforcement

Boundaries are enforced by two complementary tools:

- **ESLint `boundaries`** (`npm run lint`) — downward-only imports + public-API-only entry points. Covers **all** layers, including `_pages`.
- **Steiger** (`npm run lint:fsd`) — the official FSD linter for `app`, `widgets`, `features`, `entities`, `shared`. It doesn't recognize the renamed `_pages` layer, so ESLint boundaries is the source of truth there.

## Scaffolding

Use the generator instead of hand-creating folders — it emits the correct segments + barrels:

```bash
npm run g     # entity | feature | widget | page | shared-ui
```
