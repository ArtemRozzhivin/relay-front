import type { Middleware } from '@reduxjs/toolkit';

import { toast } from '@/shared/ui';

import { api } from './api';
import { isFetchBaseQueryNetworkError } from './api-error';

const mutationRejectedType = `${api.reducerPath}/executeMutation/rejected`;

export const fetchErrorToastMiddleware: Middleware =
	() => (next) => (action: unknown) => {
		if (
			typeof action === 'object' &&
			action !== null &&
			'type' in action &&
			typeof (action as { type: unknown }).type === 'string' &&
			(action as { type: string }).type === mutationRejectedType &&
			'payload' in action &&
			isFetchBaseQueryNetworkError((action as { payload: unknown }).payload)
		) {
			toast.error('Network error. Please try again.');
		}
		return next(action);
	};
