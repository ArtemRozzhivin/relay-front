'use client';

import * as React from 'react';

import type { ModalSize } from './types';

export interface ModalConfig {
	id: string;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
	size?: ModalSize;
	align?: 'center' | 'left';
	// Hide the default title/header row and render only a floating close button,
	// letting `children` own the full layout. `title` is still used as an
	// accessible (screen-reader-only) dialog title.
	hideHeader?: boolean;
	onClose?: () => void;
}

interface ModalContextType {
	modals: ModalConfig[];
	openModal: (config: Omit<ModalConfig, 'id'>) => string;
	closeModal: (id: string) => void;
	closeAllModals: () => void;
}

const ModalContext = React.createContext<ModalContextType | undefined>(
	undefined,
);

export function useModal(): ModalContextType {
	const context = React.useContext(ModalContext);
	if (!context) {
		throw new Error('useModal must be used within ModalProvider');
	}
	return context;
}

interface ModalProviderProps {
	children: React.ReactNode;
}

export function ModalProvider({
	children,
}: ModalProviderProps): React.JSX.Element {
	const [modals, setModals] = React.useState<ModalConfig[]>([]);
	const modalsRef = React.useRef(modals);
	React.useEffect(() => {
		modalsRef.current = modals;
	});

	const closeModal = React.useCallback((id: string) => {
		modalsRef.current.find((m) => m.id === id)?.onClose?.();
		setModals((prev) => prev.filter((m) => m.id !== id));
	}, []);

	const openModal = React.useCallback(
		(config: Omit<ModalConfig, 'id'>): string => {
			const id = `modal-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
			setModals((prev) => [...prev, { ...config, id }]);
			return id;
		},
		[],
	);

	const closeAllModals = React.useCallback(() => {
		for (const m of modalsRef.current) {
			m.onClose?.();
		}
		setModals([]);
	}, []);

	return (
		<ModalContext.Provider
			value={{ modals, openModal, closeModal, closeAllModals }}
		>
			{children}
		</ModalContext.Provider>
	);
}
