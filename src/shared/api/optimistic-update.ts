import {
	createOptimisticUpdate,
	type OptimisticUpdateQueryData,
} from '@/shared/lib';

import { api } from './api';

interface PatchSpec<TData, TArg> {
	endpointName: string;
	queryArg?: unknown;
	updater: (draft: TData, arg: TArg) => void;
}

interface OptimisticUpdateOptions<TArg> {
	onRollback?: (arg: TArg, error: unknown) => void;
}

/**
 * Builds a mutation's `onQueryStarted` handler that patches cached query data
 * before the request resolves, and undoes every patch if the request fails.
 * Bound to the shared `api` instance.
 *
 * @param patchOrPatches - Cache entries to patch. `endpointName` is a plain
 *   string (typos aren't caught) and `queryArg` must equal the arg the query
 *   was cached with (`undefined` for `void` queries).
 * @param options.onRollback - Runs after the patches are undone, e.g. to toast.
 * @returns The `onQueryStarted` callback for `build.mutation({ … })`.
 *
 * Caveats: patching a query no component is subscribed to is a silent no-op;
 * the mutation's response is not merged back into the cache (keep
 * `invalidatesTags` when you need server-computed fields); and back-to-back
 * mutations aren't serialized, so a late rollback can undo a newer patch —
 * debounce input-driven mutations.
 */
export function optimisticUpdate<TData, TArg>(
	patchOrPatches: PatchSpec<TData, TArg> | PatchSpec<TData, TArg>[],
	options?: OptimisticUpdateOptions<TArg>,
) {
	const patches = Array.isArray(patchOrPatches)
		? patchOrPatches
		: [patchOrPatches];

	return createOptimisticUpdate<TData, TArg>({
		updateQueryData: api.util
			.updateQueryData as OptimisticUpdateQueryData<TData>,
		patches: patches.map(({ endpointName, queryArg, updater }) => ({
			endpointName,
			queryArg,
			updater,
		})),
		onRollback: options?.onRollback,
	});
}
