'use client';

import { useEffect, useRef } from 'react';

type DebouncedEffectCallback = () => void;

export function useDebouncedEffect(
	callback: DebouncedEffectCallback,
	delayMs: number,
	deps: readonly unknown[],
): void {
	const callbackRef = useRef(callback);
	useEffect(() => {
		callbackRef.current = callback;
	});

	useEffect(() => {
		const timeout = setTimeout(() => {
			callbackRef.current();
		}, delayMs);

		return (): void => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delayMs, ...deps]);
}
