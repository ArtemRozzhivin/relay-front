import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getPublicApiBaseUrl } from '@/shared/config';

const apiBaseUrl = getPublicApiBaseUrl();

const baseQuery = fetchBaseQuery({
	baseUrl: apiBaseUrl || undefined,
	prepareHeaders: (headers, { arg }) => {
		// The template is auth-agnostic. Attach your token here once you add auth:
		//   const token = getAccessToken();
		//   if (token) headers.set('authorization', `Bearer ${token}`);
		const body =
			typeof arg === 'object' && 'body' in arg ? arg.body : undefined;
		if (!(body instanceof FormData)) {
			headers.set('Content-Type', 'application/json');
		}

		return headers;
	},
});

/**
 * The single RTK Query API instance. Every entity/feature extends it via
 * `api.injectEndpoints`. Add cache tags to `tagTypes` as you add endpoints.
 *
 * Auth (bearer-token attach + 401 refresh/retry) is intentionally NOT included —
 * attach the token in `prepareHeaders`, and for refresh/retry wrap `baseQuery`
 * in a `BaseQueryFn` that retries after a 401 before passing it here.
 */
export const api = createApi({
	reducerPath: 'api',
	baseQuery,
	tagTypes: [],
	endpoints: () => ({}),
});

export default api;
