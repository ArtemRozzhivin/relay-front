/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

type PatchResult = { undo: () => void };

// Shape that `util.updateQueryData` from any RTK api must be cast to before
// being passed in. The base `api` has no endpoint map, so its real signature
// types `endpointName` as `never` — incompatible with the string names we
// pass per-patch. Cast at the call site: `api.util.updateQueryData as
// OptimisticUpdateQueryData<TData>`.
export type OptimisticUpdateQueryData<TData> = (
	endpointName: string,
	arg: any,
	updater: (draft: TData) => void,
) => any;

interface OptimisticConfig<TData, TArg> {
	updateQueryData: OptimisticUpdateQueryData<TData>;

	patches: Array<{
		endpointName: string;
		queryArg: unknown;
		updater: (draft: TData, mutationArg: TArg) => void;
	}>;

	onRollback?: (arg: TArg, error: unknown) => void;
}

/**
 * Unbound primitive behind `optimisticUpdate` from `@/shared/api` — prefer that
 * one. Reach for this only when targeting a different `createApi` instance.
 *
 * Pass the base api's `util.updateQueryData`, not the one on the value returned
 * by `injectEndpoints`: referencing that value inside its own `injectEndpoints`
 * call throws a ReferenceError (temporal dead zone).
 */
export function createOptimisticUpdate<TData, TArg>(
	config: OptimisticConfig<TData, TArg>,
) {
	return async (
		arg: TArg,
		{
			dispatch,
			queryFulfilled,
		}: {
			dispatch: ThunkDispatch<unknown, unknown, UnknownAction>;
			queryFulfilled: Promise<{ data: unknown }>;
		},
	) => {
		const patchResults: PatchResult[] = config.patches.map(
			({ endpointName, queryArg, updater }) =>
				dispatch(
					config.updateQueryData(endpointName, queryArg, (draft: TData) =>
						updater(draft, arg),
					),
				),
		);

		try {
			await queryFulfilled;
		} catch (error) {
			patchResults.forEach((p) => p.undo());
			config.onRollback?.(arg, error);
		}
	};
}
