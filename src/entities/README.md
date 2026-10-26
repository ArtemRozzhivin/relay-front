# Entities layer

Core **business domain models** used across the app (user, product, order).
An entity owns its data contract (`api`), its model/state (`model`), and any
entity-specific UI (`ui`).

- **May import from:** `shared` only (and other entities via the `@x` cross-import API).
- **Must not import from:** `app`, `pages`, `widgets`, `features`, or other entities' internals.
- **Segments:** `api/` (RTK Query `injectEndpoints`), `model/` (types, hooks, store), `ui/`.
- **Cross-imports:** when two entities relate, expose a narrow `@x/<consumer>.ts`
  public API and import it via `@/entities/<producer>/@x/<consumer>`. Never re-export `@x` from the root barrel.
- **Public API:** each slice exposes an `index.ts`; import entities only via `@/entities/<slice>`.

Scaffold one with `npm run g` → `entity`.
