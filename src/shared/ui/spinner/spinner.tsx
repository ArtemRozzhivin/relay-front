import { JSX } from 'react';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	variant?: 'brand' | 'dark' | 'success' | 'warning' | 'white';
	text?: string;
}

export const LoadingSpinner = ({
	size = 'md',
	variant = 'brand',
	text,
}: LoadingSpinnerProps): JSX.Element => {
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8',
		lg: 'h-12 w-12',
	};
	const variantClasses = {
		brand: 'border-t-brand-main',
		dark: 'border-t-dark-main',
		success: 'border-t-green-600',
		warning: 'border-t-amber-500',
		white: 'border-t-white',
	};

	return (
		<div className="flex flex-col items-center justify-center gap-3">
			<div
				className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin rounded-full border-4 border-gray-200`}
				role="status"
				aria-label="Loading"
			/>
			{text && <p className="text-sm text-gray-600">{text}</p>}
		</div>
	);
};

export const LoadingPage = (): JSX.Element => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
			<LoadingSpinner size="lg" text="Loading..." />
		</div>
	);
};
