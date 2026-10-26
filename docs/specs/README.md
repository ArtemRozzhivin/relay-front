# Specs

Deep-dives into the app's **complex and sensitive flows** — one Markdown file per flow (e.g. `checkout.md`, `password-reset.md`). A page doc ([`docs/pages/`](../pages/README.md)) says what a screen does; a spec explains how a flow behaves end to end: every state, rule, and failure, and what must never happen.

## When a flow needs a spec

Write one when a flow is either:

- **Complex** — spans several steps, pages, or roles; moves records through statuses; depends on async or background work (webhooks, polling, retries); or has rules that interact in non-obvious ways.
- **Sensitive** — touches authentication or sessions, permissions, payments or money, or personal data, or performs an action that is irreversible or hard to undo (deleting data, sending messages, publishing).

A plain single-screen form doesn't need one — its page doc is enough.

## Writing a spec

- **Audience: developers and QA.** Technical detail is fine here (unlike page docs), but lead each section with the behavior, then the mechanism.
- **Write it before or alongside the code**, and update it in the same change that alters the flow. A spec that disagrees with the code is worse than none.
- **Cover failure at every step**: what happens when it fails, times out, or is repeated (double submit, back button, refresh, two open tabs).
- **State the invariants** — what must never happen (e.g. "a user is never charged twice for one order", "an expired invite link never grants access").
- **Quote exact user-facing copy** for errors and confirmations so QA can test against it, and never let an error reveal sensitive information (e.g. whether an email is registered).
- **Link, don't duplicate**: point to [`docs/PATTERNS.md`](../PATTERNS.md) for code conventions and to page docs for screen-level detail.
- **Name the file after the flow** in kebab-case, and link it from the "For developers" section of every page doc the flow touches.
- **Skip sections that don't apply** (a complex but non-sensitive flow may have no security notes) rather than writing "N/A".

## Template

```
# [Flow name]

## Summary

[2–3 sentences: what the flow achieves, who triggers it, and why it's complex or sensitive.]

## Actors & permissions

- [Role] — [what they can do in this flow; what happens if they lack permission]

## Preconditions

- [What must be true before the flow can start]

## Flow

1. [Step — what the user does / what the system does]
2. [...]

[Optional: a Mermaid sequence or state diagram when steps branch or pass between actors.]

## States & transitions

| From | Event | To | Side effects |
| --- | --- | --- | --- |
| [status] | [trigger] | [status] | [emails, notifications, data changes] |

## Rules & invariants

- [Business rule]
- **Never:** [what must never happen]

## Failure & edge cases

| Case | Expected behavior | User sees |
| --- | --- | --- |
| [failure / repeat / race] | [what the system does] | ['Exact message'] |

## Security & privacy

- [Who is checked where (authn/authz), what data is exposed or logged, rate limits, audit needs.]

## Implementation

- **Pages:** [`docs/pages/<page>.md`]
- **Code:** [slices involved — entities / features / widgets]
- **API:** [endpoints, idempotency, retries]

## Open questions

- [Unresolved decisions — remove this section once empty]
```
