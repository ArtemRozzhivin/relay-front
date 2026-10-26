import { type ReactElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { render, type RenderOptions } from '@testing-library/react';

import { type AppStore, makeStore } from '@/app/store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
	store?: AppStore;
}

/**
 * Render a component wrapped in a real Redux store (fresh per call, unless you
 * pass one) so RTK Query hooks and slices behave exactly as in the app. Returns
 * the render result plus the `store` for dispatching/asserting.
 */
export function renderWithProviders(
	ui: ReactElement,
	{ store = makeStore(), ...options }: ExtendedRenderOptions = {},
) {
	function Wrapper({ children }: { children: ReactNode }): ReactElement {
		return <Provider store={store}>{children}</Provider>;
	}

	return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}
