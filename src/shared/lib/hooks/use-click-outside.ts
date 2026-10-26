'use client';

import { useEffect } from 'react';

type UseClickOutsideProps = {
	ref: React.RefObject<HTMLElement | null>;
	handler: (event: MouseEvent | TouchEvent) => void;
	enabled?: boolean;
};

export const useClickOutside = ({
	ref,
	handler,
	enabled = true,
}: UseClickOutsideProps): void => {
	useEffect(() => {
		if (!enabled) return;

		const listener = (event: MouseEvent | TouchEvent) => {
			const el = ref?.current;
			if (!el || el.contains(event.target as Node)) return;
			handler(event);
		};

		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [ref, handler, enabled]);
};
