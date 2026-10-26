# Page Documentation

One file per page of the app, explaining what the page is for, who can use it, how people move through it, and what is real vs. mocked today. Each doc serves three readers:

- **Clients** — what the page does and why, in plain language.
- **QA** — the exact fields, rules, states, and messages to test against.
- **Developers new to the project** — a short "For developers" section at the end pointing to where the page lives in code and what it depends on.

**Status legend:** `real` — wired to live data · `partial` — a mix of real and mocked/static content (see the page's "Known limitations") · `mock` — hardcoded or placeholder content only.

## Index

| Page | Routes | Status |
| ---- | ------ | ------ |

_No pages documented yet — add a row whenever a page doc is added, renamed, or removed._

## Writing a page doc

- **One file per routed page**: `docs/pages/<page>.md`, named after the page slice (`src/_pages/<page>/` → `docs/pages/<page>.md`).
- **One page, several routes** (wizard steps, sibling routes sharing a layout) → list every route in that file's frontmatter; don't split it across files.
- **Sub-screens without their own route** (a modal, a step that doesn't change the URL) → a subsection of the host page's doc, not a separate file.
- **Plain language above "For developers".** No code identifiers, file paths, API paths, or HTTP status codes — say what happens, not how it's built. Exact UI copy (button labels, error messages) is welcome: QA tests against it.
- **"For developers" holds pointers, not a code tour** — where the page lives, what it composes, which data it reads and writes, and anything non-obvious. Don't restate what the code already says.
- **Describe what exists today.** Unfinished or mocked parts go in "Known limitations", not in the flows.
- **Every field, filter, or toggle a flow mentions gets a row** in "Fields, filters & statuses".
- **Skip sections that don't apply** (no form → no fields table) rather than writing "N/A".
- **Complex or sensitive flows** (sign-in, payments, permissions, irreversible actions) get a short summary here and a full spec in [`docs/specs/`](../specs/README.md), linked from "For developers".
- **Keep it current**: update the doc in the same change that alters the page's UI or behavior, and the Index in the same change that adds, renames, or removes a doc.

## Template

```
---
routes:
  - /path/one
page: page-folder-name
status: real | partial | mock
---

# Page Title

## Purpose

[1–2 sentences: the problem this page solves, and for whom.]

## Access

[Who can open it (roles, signed in / out) and what happens to everyone else — e.g. "Signed-out visitors are sent to Sign in."]

## User flows

### [Flow name]

- **Starts from:** [entry point]
- **Goal:** [why the user is here]
- **Steps:** [main actions, in order]
- **Result:** [what changes]
- **Next:** [where they go after]
- **Blocked when:** [condition, or "—"]

## What's on the page

[2–5 sentences walking through the screen's sections.]

## Fields, filters & statuses

| Name | Type | Required | Rules / meaning |
| --- | --- | --- | --- |
| [name] | Field / Filter / Status / Column | Always / Conditional / Optional / — | [validation rule, allowed values, or meaning] |

## States & messages

| State | When | What the user sees |
| --- | --- | --- |
| Loading | [when] | [skeleton / spinner] |
| Empty | [when] | ['Exact empty-state copy'] |
| Error | [when] | ['Exact error message'] |
| Success | [when] | ['Exact confirmation copy'] |

## Known limitations

- [Mocked data, unfinished parts, known quirks.]

## For developers

- **Code:** `src/_pages/<page>` — composes [widgets / features / entities].
- **Data:** [entities and endpoints the page reads or writes; what gets cached or invalidated.]
- **Spec:** [`docs/specs/<flow>.md`, if a complex or sensitive flow lives here.]
- **Gotchas:** [anything non-obvious a newcomer would trip over.]
```
