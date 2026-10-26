import { configureStore } from '@reduxjs/toolkit';

import { api, fetchErrorToastMiddleware } from '@/shared/api';

import rootReducer from './root-reducer';

export function makeStore() {
	return configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(api.middleware, fetchErrorToastMiddleware),
		devTools: process.env.NODE_ENV !== 'production',
	});
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
