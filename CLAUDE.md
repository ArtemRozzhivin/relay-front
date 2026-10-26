# Claude Development Rules

## Architecture: Feature-Sliced Design (FSD)

Layers, top → bottom — **import only downward**:

`app` → `_pages` → `widgets` → `features` → `entities` → `shared`

Alias: `@/*` → `src/*` (`@/app`, `@/_pages`, `@/widgets`, `@/features`, `@/entities`, `@/shared`).

- The pages layer is `_pages` (underscore-prefixed) — Next.js reserves `src/pages` for its legacy Pages Router. Next's App Router lives at the repo-root `/app` and delegates to `@/_pages/<slice>`. The FSD `app` layer is `src/app` (providers/store/styles).
- **Slices** are business-domain folders (`entities/user`, `features/auth`). No cross-imports between slices on the same layer — except entities via the `@x` public API.
- **Segments** (folders inside a slice) are **exactly** `ui` / `api` / `model` / `lib` / `config` — grouped by _purpose_. Any other segment folder (`components/`, `hooks/`, `utils/`, `types/`, …) is the "desegmentation" anti-pattern: hooks → `model` (or `shared/lib/hooks`), helpers → `lib`, constants → `config`.
- **Public API:** every slice has an `index.ts` barrel; import slices only via it. Shared exposes per-segment APIs: `@/shared/ui`, `@/shared/lib`, `@/shared/config`, `@/shared/api`, `@/shared/types`.
- **Scaffold new slices with** `npm run g` (plop) — it emits canonical segments + barrels that pass the linters. Don't hand-create slice folders. Run it **headlessly** by passing args (the interactive prompts hang a non-interactive shell): e.g. `npx plop entity user`, `npx plop endpoint user get-users query`. Full arg list in `.claude/skills/fsd/SKILL.md`.

Boundaries are **enforced**, not just documented: `npm run lint` (ESLint `boundaries`) + `npm run lint:fsd` (Steiger).

### Where to find the full rules

Open these only when your task touches them:

| When you're…                                                                                | Read                 |
| ------------------------------------------------------------------------------------------- | -------------------- |
| placing code — layers, segments, import direction, `_pages`/Next, public API, `@x`, RSC     | `docs/STRUCTURE.md`  |
| writing a pattern — RTK Query api/model (two-layer), types, mappers, forms, routes; styling | `docs/PATTERNS.md`   |
| scaffolding a slice or need the FSD cheat-sheet + generator args                            | `.claude/skills/fsd` |
| looking up an npm script                                                                    | `docs/SCRIPTS.md`    |

## Before Writing Any Code

1. **Check** `src/shared/ui` for an existing component — import from `@/shared/ui`.
2. **Check** `src/widgets` for composites (empty in the fresh template — add your own).
3. **Read** `src/app/styles/globals.css` for design tokens before using any color/spacing/radius.

## Styling, Typography & Components

Summary — full rules in `docs/PATTERNS.md` (Styling & Typography):

- **Tokens only** — Tailwind v4 token classes; no raw hex/arbitrary values, no inline `style=`. Tokens live in `src/app/styles/globals.css` (`@theme`; no `tailwind.config.js`).
- **Typography** — use `Text` / `H1`–`H6` from `@/shared/ui`, not raw `<p>` / `<h1>`.
- **Variants** — compose with `cn()` + `cva()` (`cn` from `@/shared/lib`). New primitives → `npm run g` → `shared-ui`; composites → `widget`.
- **RSC** — files using React hooks need `'use client'`; client hooks stay in `@/shared/lib/hooks`, out of the server-imported top-level `@/shared/lib` barrel.

## Project Docs

Update these in the same change as the code:

- **Page docs** — adding a page, or changing what a page shows or does → create/update `docs/pages/<page>.md` and its row in the index. Format, audience, and template: `docs/pages/README.md`.
- **Specs** — building or changing a complex or sensitive flow (multi-step, status transitions, auth, permissions, payments, personal data, irreversible actions) → create/update `docs/specs/<flow>.md`. Criteria and template: `docs/specs/README.md`.

## Task Completion

**A task is not done until these pass — run them before declaring it complete:**

```bash
npm run type-check   # tsc --noEmit
npm run lint         # eslint . (incl. FSD import boundaries)
npm run lint:fsd     # steiger ./src (FSD architecture)
npm run test         # vitest run
```

## Commits & Pull Requests

- **Conventional Commits are enforced.** `.husky/commit-msg` runs commitlint (`@commitlint/config-conventional`), so any message not shaped as `type(scope): subject` is rejected. Use one of: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `build`, `ci`, `style`, `revert`. Keep the subject imperative and lowercase (e.g. `feat(auth): add sign-in form`).
- **Never** `git push` **or open a PR on your own initiative.** Commit locally when asked, but pushing and opening pull requests require the developer's explicit go-ahead each time — don't infer permission from "commit this" or "finish the task."
- When you do open a PR (only after being told to), fill out `.github/pull_request_template.md` — the What & why, the Type checkbox, and the checklist.
