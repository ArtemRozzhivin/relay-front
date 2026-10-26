import { type JSX } from 'react';

import { LoadingSpinner } from '../spinner';

interface PageLoadingProps {
	text?: string;
	className?: string;
}

export function PageLoading({
	text = 'Loading...',
	className,
}: PageLoadingProps): JSX.Element {
	return (
		<div
			className={`flex min-h-[40vh] items-center justify-center text-sm text-foreground ${className ?? ''}`}
			aria-live="polite"
		>
			<LoadingSpinner size="lg" text={text} variant="brand" />
		</div>
	);
}
