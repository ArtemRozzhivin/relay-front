# Features layer

Reusable **user interactions** with clear business value (auth, add-to-cart,
like-post). A feature is a complete, self-contained action reused in more than
one place.

- **May import from:** `entities`, `shared`.
- **Must not import from:** `app`, `pages`, `widgets`, or other `features` slices.
- **Segments:** `ui/` + `model/` (form schema, hooks, state), plus `api/`, `lib/`, `config/` as needed.
- **Public API:** each slice exposes an `index.ts`; import features only via `@/features/<slice>`.

> Pages First (FSD v2.1): keep an interaction in its page/widget until a second
> place needs it — then extract it here. Avoid premature features.

Scaffold one with `npm run g` → `feature`.
