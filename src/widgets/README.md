# Widgets layer

Large, self-contained UI blocks composed of features, entities, and shared UI —
reused across **multiple pages** (header, sidebar, footer, complex cards).

- **May import from:** `features`, `entities`, `shared`.
- **Must not import from:** `app`, `pages`, or other `widgets` slices.
- **Segments:** `ui/` (required), plus `model/`, `api/`, `lib/`, `config/` as needed.
- **Public API:** each slice exposes an `index.ts`; import widgets only via `@/widgets/<slice>`.

> Pages First (FSD v2.1): keep a block in its page until it's reused on a second
> page — then extract it here. Don't create a widget preemptively.

Scaffold one with `npm run g` → `widget`.
