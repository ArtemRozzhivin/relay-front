import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { FETCH_QUERY_ERROR_STATUS } from '@/shared/config';
import { UNKNOWN_ERROR_MESSAGE } from '@/shared/config';
import type { ApiError, ApiErrorResponse } from '@/shared/types';

export type GetApiErrorMessageOptions = {
	fallbackMessage?: string;
	silentOnFetchError?: boolean;
};

function readErrorEnvelope(data: unknown): ApiError | null {
	if (typeof data !== 'object' || data === null) return null;

	const d = data as { success?: unknown; error?: unknown };

	if (d.success !== false) return null;
	if (typeof d.error !== 'object' || d.error === null) return null;

	const err = d.error as Partial<Record<keyof ApiError, unknown>>;

	const code = typeof err.code === 'string' ? err.code : '';
	const message = typeof err.message === 'string' ? err.message.trim() : '';

	if (!code && !message) return null;

	return {
		code,
		message,
		category: typeof err.category === 'string' ? err.category : '',
		requestId: typeof err.requestId === 'string' ? err.requestId : '',
		details:
			typeof err.details === 'object' && err.details !== null
				? (err.details as Record<string, unknown>)
				: undefined,
	};
}

function readFailureMessage(data: unknown): string | undefined {
	const envelope = readErrorEnvelope(data);
	return envelope?.message || undefined;
}

export function getApiError(error: unknown): ApiErrorResponse | null {
	const e = error as FetchBaseQueryError | null;
	if (typeof e !== 'object' || e === null) return null;
	if (e.status === FETCH_QUERY_ERROR_STATUS) return null;

	const envelope = readErrorEnvelope(e.data);

	if (!envelope) return null;

	return {
		success: false,
		error: envelope,
		statusCode: typeof e.status === 'number' ? e.status : 0,
	};
}

export function isFetchBaseQueryNetworkError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'status' in error &&
		(error as FetchBaseQueryError).status === FETCH_QUERY_ERROR_STATUS
	);
}

export function getApiErrorMessage(
	error: unknown,
	options?: GetApiErrorMessageOptions,
): string {
	const fallback = options?.fallbackMessage ?? UNKNOWN_ERROR_MESSAGE;
	const silentOnFetchError = options?.silentOnFetchError ?? true;

	const e = error as FetchBaseQueryError | null;
	if (typeof e !== 'object' || e === null) {
		return fallback;
	}
	if (e.status === FETCH_QUERY_ERROR_STATUS) {
		return silentOnFetchError ? '' : fallback;
	}
	return readFailureMessage(e.data) ?? fallback;
}
