import { combineReducers } from '@reduxjs/toolkit';

import { api } from '@/shared/api';

const rootReducer = combineReducers({
	[api.reducerPath]: api.reducer,
});

export default rootReducer;
