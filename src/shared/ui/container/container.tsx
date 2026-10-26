import { type HTMLAttributes, type JSX, type ReactNode } from 'react';

import { cn } from '@/shared/lib';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
}

export function Container({
	children,
	className,
	...props
}: ContainerProps): JSX.Element {
	return (
		<div className="px-6">
			<div
				className={cn('mx-auto w-full max-w-container', className)}
				{...props}
			>
				{children}
			</div>
		</div>
	);
}
