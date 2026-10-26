'use client';

import { useEffect, useMemo, useRef } from 'react';

export interface DebouncedCallback<TArgs extends unknown[]> {
	(...args: TArgs): void;
	/** Invoke immediately, cancelling any scheduled calls */
	flush: () => void;
	/** Cancel scheduled calls without invoking them */
	cancel: () => void;
}

export function useDebouncedCallback<TArgs extends unknown[]>(
	callback: (...args: TArgs) => void,
	delay: number,
): DebouncedCallback<TArgs> {
	// Keep the latest callback in a ref so the debounced function isn't
	// recreated on every render and doesn't reset the timer.
	const callbackRef = useRef(callback);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastArgsRef = useRef<TArgs | null>(null);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// EDGE CASE — cleanup on unmount.
	// If the component unmounts before the debounce resolves, leaving the
	// timer running is a memory leak and a potential bug (callback firing
	// on an unmounted component).
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const debounced = useMemo(() => {
		const fn = ((...args: TArgs) => {
			lastArgsRef.current = args;

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				timeoutRef.current = null;
				callbackRef.current(...args);
			}, delay);
		}) as DebouncedCallback<TArgs>;

		fn.flush = () => {
			if (timeoutRef.current && lastArgsRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
				callbackRef.current(...lastArgsRef.current);
			}
		};

		fn.cancel = () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			lastArgsRef.current = null;
		};

		return fn;
	}, [delay]);

	return debounced;
}
