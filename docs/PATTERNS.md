# Code Patterns & Syntax Rules

Conventions enforced across this project. Follow these exactly when adding new
code.

> **Scaffold, don't hand-roll.** `npm run g` (alias for `npm run plop`) generates
> `entity` / `feature` / `widget` / `page` / `shared-ui` slices with the
> canonical segments (`ui`, `api`, `model`, `lib`, `config`) and public-API
> barrels already wired to these patterns. The segment set is closed — any
> folder other than those five is the "desegmentation" anti-pattern (see
> `docs/STRUCTURE.md`). Component files are **kebab-case** (`sign-in-form.tsx`).

---

## API Layer

### Location

```
src/entities/<entity>/api/<entity>.ts
src/entities/<entity>/api/index.ts   ← re-exports
```

### Rules

- Import the shared `api` instance from `@/shared/api`.
- Always import `API_ROUTES` (and `HTTP_METHODS` when needed) from `@/shared/config`.
- Import response/request types from the entity's own model: `../model` (or the
  specific per-operation file, e.g. `../model/create-x`).
- Use `providesTags` on queries and `invalidatesTags` on mutations for cache
  management. Register each tag `type` in `tagTypes` in `src/shared/api/api.ts`.
- Use `transformResponse` to unwrap `.data` when the endpoint always returns
  `{ data: T }` (extract a mapper into `lib/` when you also rename/restructure).

### Template

```typescript
import { api } from '@/shared/api';
import { API_ROUTES, HTTP_METHODS } from '@/shared/config';

import type { CreateXRequest, CreateXResponse } from '../model/create-x';
import type { GetXResponse } from '../model/get-x';

export const xApi = api.injectEndpoints({
	endpoints: (build) => ({
		getX: build.query<GetXResponse, void>({
			query: () => ({
				url: API_ROUTES.X.LIST,
				method: HTTP_METHODS.GET,
			}),
			providesTags: ['X'],
		}),
		createX: build.mutation<CreateXResponse, CreateXRequest>({
			query: (body) => ({
				url: API_ROUTES.X.CREATE,
				method: HTTP_METHODS.POST,
				body,
			}),
			invalidatesTags: ['X'],
		}),
	}),
});

export const { useGetXQuery, useCreateXMutation } = xApi;
```

---

## Entity Model Hooks

### Location

```
src/entities/<entity>/model/use-<action>.ts   ← consumer hook, kebab-case
src/entities/<entity>/model/index.ts           ← re-exports
```

### Rules

- Import the raw RTK hook directly from the api file (`../api/<entity>`), not
  from the entity's public `index.ts`, to avoid circular dependencies.
- Never expose raw RTK state (`data`, `isError`, `isSuccess`) — shape the return
  to what callers actually need.
- Handle errors inside the hook:
  - Queries: watch `isError` in a `useEffect` and call `toast.error(...)`.
  - Mutations: use `.unwrap()` inside a `try/catch` and call `toast.error(...)`.
- Use `getApiErrorMessage` from `@/shared/api` to extract the message from a
  caught error (`getApiError` is available too when you need the full envelope).
- Import `toast` from `@/shared/ui`.
- Wrap mutation calls in `useCallback`.
- Name query hooks `useGet<Entity>` / `useGet<Entity>ById`.
- Name mutation hooks after the action: `useCreate<Entity>`, `useUpdate<Entity>`,
  `useDelete<Entity>` (file `use-create-<entity>.ts`, etc.).

### Query hook template

```typescript
'use client';

import { useGetXQuery } from '../api/x';
import type { X } from './x';

interface UseGetXReturn {
	items: X[];
	isLoading: boolean;
}

export function useGetX(): UseGetXReturn {
	const { data, isLoading } = useGetXQuery();

	return {
		items: data?.data ?? [],
		isLoading,
	};
}
```

### Mutation hook template

```typescript
'use client';

import { useCallback } from 'react';

import { getApiErrorMessage } from '@/shared/api';
import { toast } from '@/shared/ui';

import { useCreateXMutation } from '../api/x';
import type { CreateXRequest } from './create-x';

interface UseCreateXReturn {
	createX: (payload: CreateXRequest) => Promise<number | undefined>;
	isLoading: boolean;
}

export function useCreateX(): UseCreateXReturn {
	const [createX, { isLoading }] = useCreateXMutation();

	const handleCreate = useCallback(
		async (payload: CreateXRequest): Promise<number | undefined> => {
			try {
				const response = await createX(payload).unwrap();
				toast.success(response.message ?? 'Created successfully');
				return response.data.id;
			} catch (error) {
				const message = getApiErrorMessage(error, {
					fallbackMessage: 'Failed to create item',
				});
				if (message) toast.error(message);
			}
		},
		[createX],
	);

	return { createX: handleCreate, isLoading };
}
```

---

## Summary: Two-Layer Rule

| Layer | File                    | Responsibility                                             |
| ----- | ----------------------- | ---------------------------------------------------------- |
| API   | `api/<entity>.ts`       | RTK Query declaration only — no UX logic                   |
| Hook  | `model/use-<action>.ts` | Consumer-facing wrapper — toasts, callbacks, shaped return |

### Why this separation exists

The API file is a pure data contract — it describes what endpoints exist and how
to call them. Keeping it free of side effects means it stays stable and reusable
regardless of where it is consumed.

The hook is where product behaviour lives. By isolating side actions (toast
notifications, redirects, analytics events, optimistic updates, callbacks) inside
the hook, we get one clear place to add, change, or remove that behaviour without
touching the API declaration or the component that calls the hook. If a mutation
needs to show a different success message in a new context, we create a new hook
— the API file never changes. This prevents side-effect logic from leaking into
components or being duplicated across features.

---

## Types

### Location

```
src/entities/<entity>/model/<operation>.ts   ← one file per endpoint operation
src/entities/<entity>/model/<entity>.ts      ← shared domain model
src/entities/<entity>/model/index.ts         ← re-exports everything
```

### Rules

- **One file per endpoint operation**, named after the action: `create-<entity>.ts`,
  `get-<entity>.ts`, `update-<entity>.ts`, `delete-<entity>.ts`.
- Each file contains the request type and the data shape specific to that operation.
- Use `ApiSuccessResponse<T>` and `ApiErrorResponse` from `@/shared/types` — never
  define a local response envelope.
- If the same domain model is referenced by more than one operation file, extract
  it into `<entity>.ts` and import from there.
- Never put all endpoint types into a single file (e.g. a monolithic `types.ts`
  or `<entity>-responses.ts`).

### Why this separation exists

Each operation file is a self-contained contract for one endpoint. When the
response shape of a single endpoint changes, only one file needs to be touched. A
monolithic types file grows unbounded and makes it hard to see at a glance which
types belong to which endpoint. Using `ApiSuccessResponse<T>` from `@/shared/types`
guarantees a single source of truth for the API envelope — re-defining it locally
leads to drift and duplication.

### Template

```typescript
// src/entities/order/model/create-order.ts
import type { ApiErrorResponse, ApiSuccessResponse } from '@/shared/types';

import type { Order } from './order'; // shared domain model

export type CreateOrderRequest = {
	cartId: number;
};

export type CreateOrderResponse = ApiSuccessResponse<Order>;
export type CreateOrderErrorResponse = ApiErrorResponse;
```

```typescript
// src/entities/order/model/order.ts  (shared domain model)
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Order {
	id: number;
	status: OrderStatus;
	totalCents: number;
	createdAt: string;
}
```

---

## Cross-Entity Imports (`@x`)

Slices on the same layer must **not** import each other directly — `entities/sales`
reaching into `@/entities/products` is forbidden. When one entity genuinely needs
a type or value from another, the **producing** entity exposes a dedicated,
per-consumer public API under `@x/`, and the consumer imports from there.

### Location

```
src/entities/<producer>/@x/<consumer>.ts   ← one file per consuming entity
```

The file is named after the **consumer**, not the producer. It lives inside the
producer and re-exports only what that one consumer is allowed to use.

### Rules

- Cross-entity imports go **only** through `@x/<consumer>` — never reach into
  another entity's `model`, `api`, `ui`, or root `index.ts`.
- Name the file after the consuming entity: `products/@x/sales.ts` means "what
  `products` exposes to `sales`".
- Re-export the **minimum** that consumer needs — prefer `export type` for types;
  re-export values only when a value is genuinely required (e.g. an enum used at
  runtime).
- Import with the slice alias: `import type { ListingStatus } from '@/entities/products/@x/sales';`.
- The producer's own root `index.ts` does **not** re-export `@x` — it is a
  side-channel for peer entities, not part of the entity's main public API.
- A consumer imports from the file named after **itself** (`products/@x/sales` is
  for `sales`) — never borrow another consumer's file.

### Why this separation exists

FSD forbids same-layer slice coupling because direct entity-to-entity imports turn
independent slices into a tangle. The `@x` convention makes the few legitimate
cross-dependencies **explicit and auditable**: reading `products/@x/` tells you
exactly which other entities depend on `products` and precisely what each one
consumes. Because every consumer has its own file exposing the narrowest possible
surface, widening what `sales` can see never accidentally widens what `wishlist`
can see, and the coupling can't silently grow through a shared barrel.

### Example (`entities/products`)

```typescript
// src/entities/products/@x/sales.ts — what products exposes to the sales entity
export type { ListingStatus } from '../model/listing-status';
```

```typescript
// src/entities/products/@x/wishlist.ts — exposes a runtime value + a type to wishlist
export { ListingStatusEnum } from '../model/listing-status';
export type { ListingStatus } from '../model/listing-status';
```

```typescript
// src/entities/sales/model/sale-item.ts — the consumer
import type { ListingStatus } from '@/entities/products/@x/sales';
```

---

## Mappers (reshaping data between layers)

When the backend response shape does not match the shape the app wants to work
with — a renamed field (`name` → `title`), a restructure, a derived flag, a card
shape, a request body built from form values — extract that translation into a
**pure mapper function**. A mapper is `(input) => output` with no I/O, no side
effects, and no React, so it stays trivially unit-testable.

Two questions decide where it goes: **whose data is it** (which owns the file) and
**why are you reshaping** (which decides where it's invoked).

### Where the mapper file lives

- **Reshaping an entity's data** → `src/entities/<entity>/lib/map-*.ts`.
  Example: `entities/sales/lib/map-sale-list-item-to-card.ts` →
  `mapListItemToCard(item): EstateSaleCardData`.
- **A transform that only one feature needs** (e.g. form values → request body) →
  that feature's own `src/features/<...>/lib/map-*.ts`.
  Example: `features/sales/edit-estate-sale/lib/map-edit-sale-to-update.ts` →
  `mapEstateSaleToUpdateRequest(...)`.

> Slice-internal helpers (mappers, formatters, guards) live in the `lib/` segment
> — never a top-level `utils/` or `constants/` segment (that's desegmentation).
> Slice-specific constants belong in the `config/` segment.

### Where the mapper is invoked

- **Normalizing the backend contract into the domain model** — a global
  rename/restructure so that _every_ consumer works with the clean shape
  (`project.name` → `project.title`): call the mapper inside **`transformResponse`**
  in `api/<entity>.ts`. The query then returns the domain type and no hook,
  feature, widget, or page ever sees the raw field. This is the right home for the
  `name` → `title` case.
- **Mapping an entity into a presentation/derived shape** used at one place (card
  data, a select option list): keep the mapper in the entity's `lib/` but invoke it
  where the data is consumed.
  Example: `view-estate-sales.tsx` does `items.map(mapListItemToCard)`.
- **Building a request body from feature state** (form → API): invoke the feature
  mapper inside that feature's form hook.
  Example: `use-edit-estate-sale-form.ts` calls `mapEstateSaleToUpdateRequest(sale, values)`.

### Rules

- Mappers are **pure functions** — no toasts, no fetching, no hooks. Side effects
  belong in the model hook (see Two-Layer Rule).
- Never reshape a backend contract in a feature, widget, or page. A field rename is
  a property of the domain type, which the **entity** owns; doing it higher up means
  every other consumer re-does it or couples to the raw field name.
- Name the file `map-<what>.ts` and the function `map<What>` / `map<X>To<Y>`.
- For a plain `{ data: T }` unwrap with **no field changes**, inline
  `(response) => response.data` in `transformResponse` is fine — only extract a
  mapper once you are renaming or restructuring.
- One mapper per target shape; reuse it across every endpoint/consumer that needs
  that shape rather than duplicating.

### Why this separation exists

Doing a contract rename once, in `transformResponse`, means it happens at the
lowest layer that understands the entity. Every layer above receives the domain
shape, so no consumer couples to backend field names; when the backend renames a
field, only the raw response type and the mapper change. Keeping the mapper a pure
function (rather than inline reshape logic) keeps the api file a clean data
contract, makes the reshape independently testable, and lets it be reused. Splitting
entity-owned mappers (`entities/<e>/lib/`) from feature-owned ones
(`features/<f>/lib/`) keeps each transform at the layer that actually owns the
shapes it touches.

### Template — contract normalization (invoke in `transformResponse`)

```typescript
// src/entities/project/model/get-project.ts
import type { ApiSuccessResponse } from '@/shared/types';

// raw backend shape for this endpoint
export interface ProjectResponseData {
	id: number;
	name: string;
}

export type GetProjectResponse = ApiSuccessResponse<ProjectResponseData>;
```

```typescript
// src/entities/project/model/project.ts  (domain model used across the app)
export interface Project {
	id: number;
	title: string;
}
```

```typescript
// src/entities/project/lib/map-project.ts
import type { ProjectResponseData } from '../model/get-project';
import type { Project } from '../model/project';

export function mapProject(dto: ProjectResponseData): Project {
	const { name, ...rest } = dto;
	return { ...rest, title: name };
}
```

```typescript
// src/entities/project/api/project.ts
import { mapProject } from '../lib';
import type { GetProjectResponse } from '../model/get-project';
import type { Project } from '../model/project';

getProject: build.query<Project, number>({
	query: (id) => ({
		url: API_ROUTES.PROJECT.DETAIL(id),
		method: HTTP_METHODS.GET,
	}),
	transformResponse: (response: GetProjectResponse) => mapProject(response.data),
	providesTags: ['Project'],
}),
```

---

## Forms

### Location

```
src/features/<feature>/model/<feature>.schema.ts   ← zod schema + inferred type + defaults
src/features/<feature>/model/use-<feature>-form.ts ← form hook (form + side effects)
src/features/<feature>/ui/<feature>-form.tsx        ← the form component
```

### Rules

- Use **react-hook-form** with **Zod** via `zodResolver` from
  `@hookform/resolvers/zod` — no other validation libraries.
- The schema file exports the schema, the inferred value type
  (`z.infer<typeof schema>`), and the exported default values — never write the
  value type by hand.
- Shared validation primitives (phone schemas, etc.) live in `@/shared/lib` —
  reuse them instead of repeating regex inline.
- Use `superRefine()` (or `.refine()`) for conditional validation that depends on
  another field's value.
- The form hook owns **both** the form (`useForm` + `zodResolver`) **and** the side
  effects: it calls the entity mutation hook, `.unwrap()`s inside a `try/catch`,
  fires `toast` on success/failure, and returns a **narrow interface** — typically
  `{ control, errors, onSubmit, isLoading }`. It does **not** return the raw
  `UseFormReturn`.
- The `ui/<feature>-form.tsx` component is thin: it consumes the hook and wires
  `control`/`errors`/`onSubmit` to fields. No mutation or toast logic in the UI.
- Display field errors via react-hook-form's `Controller` + the shared `Input`
  (`fieldState.error?.message`) or `errors.field?.message`.

### Why the form hook owns the side effects

Colocating validation and submission in one `model/` hook gives the feature a
single, testable entry point: the component stays declarative (fields + a submit
handler), and everything about "what happens when this form is submitted" —
mutation, success toast, error mapping, reset/redirect — lives in one place. This
mirrors the entity Two-Layer Rule: the UI never touches RTK Query or `toast`
directly; the hook is the seam.

### Schema template

```typescript
// src/features/create-x/model/create-x.schema.ts
import { z } from 'zod';

export const createXSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email'),
});

export type CreateXValues = z.infer<typeof createXSchema>;

export const createXDefaultValues: CreateXValues = {
	name: '',
	email: '',
};
```

### Form hook template

```typescript
// src/features/create-x/model/use-create-x-form.ts
'use client';

import { type Control, type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateX } from '@/entities/x';
import { getApiErrorMessage } from '@/shared/api';
import { toast } from '@/shared/ui';

import {
	createXDefaultValues,
	createXSchema,
	type CreateXValues,
} from './create-x.schema';

interface UseCreateXFormResult {
	control: Control<CreateXValues>;
	errors: FieldErrors<CreateXValues>;
	onSubmit: () => void;
	isLoading: boolean;
}

export function useCreateXForm(): UseCreateXFormResult {
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateXValues>({
		resolver: zodResolver(createXSchema),
		defaultValues: createXDefaultValues,
		mode: 'onTouched',
	});

	const { createX, isLoading } = useCreateX();

	const onSubmit = handleSubmit(async (values) => {
		try {
			await createX(values);
			toast.success('Created');
			reset();
		} catch (error) {
			const message = getApiErrorMessage(error);
			if (message) toast.error(message);
		}
	});

	return { control, errors, onSubmit, isLoading };
}
```

### Consuming in the component

```typescript
// src/features/create-x/ui/create-x-form.tsx
'use client';

import { Button } from '@/shared/ui';

import { useCreateXForm } from '../model/use-create-x-form';

export function CreateXForm() {
	const { control, errors, onSubmit, isLoading } = useCreateXForm();

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-4">
			{/* Wire fields to `control` with react-hook-form's <Controller>
			    + shared Input components; show errors from `errors`. */}
			<Button type="submit" disabled={isLoading}>
				Submit
			</Button>
		</form>
	);
}
```

---

## Config: Routes & API Routes

### Location

```
src/shared/config/path-routes.ts   ← frontend routes  → ROUTING_PATH
src/shared/config/api-routes.ts     ← backend API routes → API_ROUTES
src/shared/config/http.ts           ← HTTP_METHODS, HTTP_STATUS_CODES
```

All are re-exported from `@/shared/config`.

### Rules

- `ROUTING_PATH` and `API_ROUTES` use `SCREAMING_SNAKE_CASE` keys grouped by domain
  (`AUTH`, `ORDERS`, `PRODUCTS`, …).
- Static routes are plain strings; dynamic routes are arrow functions with a typed
  parameter: `(id: number) => \`/path/${id}\``.
- Mark the entire object `as const` for full type inference.
- API routes always include the `/api/` prefix. Frontend routes do not.
- Group nested domains (e.g. `SELLER_DASHBOARD`) as nested objects inside the root
  constant.
- Use `HTTP_METHODS` / `HTTP_STATUS_CODES` from `http.ts` — never bare `'GET'`
  string literals or magic status numbers.
- Never hardcode URL strings in components, hooks, or API files — always reference
  `ROUTING_PATH` or `API_ROUTES`.

### Template

```typescript
// src/shared/config/api-routes.ts
export const API_ROUTES = {
	ORDERS: {
		LIST: '/api/orders',
		BY_ID: (id: number) => `/api/orders/${id}`,
		CREATE: '/api/orders',
	},
} as const;
```

```typescript
// src/shared/config/path-routes.ts
export const ROUTING_PATH = {
	HOME: '/',
	SIGN_IN: '/sign-in',
	ORDER_DETAILS: (id: number) => `/orders/${id}`,
	SELLER_DASHBOARD: {
		ROOT: '/seller-dashboard',
		SALE_BY_ID: (id: number) => `/seller-dashboard/sales/${id}`,
	},
} as const;
```

---

## Styling & Typography

_Authoritative home for the styling and typography conventions. CLAUDE.md and the `fsd` skill carry one-line summaries that point here._

### Rules

- **Design tokens only.** Use Tailwind v4 token classes — never raw hex, `rgb()`, or arbitrary values (`bg-[#0f172a]`, `rounded-[7px]`). The tokens themselves are defined with `@theme` in `src/app/styles/globals.css` (there is no `tailwind.config.js`) — that file is the single source of truth for token _names_; don't enumerate them elsewhere, read them from there.
- **No inline `style=`** unless there is genuinely no token/utility alternative (e.g. a computed transform).
- **Typography components, not raw tags.** Use `Text` and `H1`–`H6` from `@/shared/ui` instead of raw `<p>` / `<h1>`–`<h6>` with manual font classes. See `src/shared/ui/text/text.tsx` for the `size` / `variant` props.
- **`cn()` + `cva()` for variants.** New components compose class names with `cn()` (from `@/shared/lib`) and express variants with `cva()`, matching the existing `shared/ui` primitives — don't hand-roll conditional class strings.

### Why

Tokens keep light/dark theming and the design system coherent; a raw hex value silently opts out of both. Routing UI through `Text`/`H1` means one place controls the type scale. These are enforced only by review (not lint), so they live here as the reference and are summarized — not re-specified — in CLAUDE.md and the skill.

---
