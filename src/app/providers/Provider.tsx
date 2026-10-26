'use client';

import { JSX, ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { type AppStore, makeStore } from '@/app/store';

import {
	ErrorBoundary,
	ModalProvider,
	ModalRenderer,
	Toaster as ToasterContainer,
} from '@/shared/ui';

export const AppProvider = ({
	children,
}: {
	children: ReactNode;
}): JSX.Element => {
	const [store] = useState<AppStore>(() => makeStore());

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<NuqsAdapter>
				<ErrorBoundary>
					<Provider store={store}>
						<ModalProvider>
							{children}
							<ModalRenderer />
							<ToasterContainer />
						</ModalProvider>
					</Provider>
				</ErrorBoundary>
			</NuqsAdapter>
		</ThemeProvider>
	);
};
