import type { JSX } from 'react';
import { Image as ImageIcon, type LucideIcon } from 'lucide-react';

import { cn } from '@/shared/lib';

interface ImagePlaceholderProps {
	className?: string;
	iconClassName?: string;
	icon?: LucideIcon;
}

export function ImagePlaceholder({
	className,
	iconClassName,
	icon: Icon = ImageIcon,
}: ImagePlaceholderProps): JSX.Element {
	return (
		<div
			aria-hidden
			className={cn(
				'flex size-full items-center justify-center bg-image-placeholder',
				className,
			)}
		>
			<Icon
				className={cn('size-6 text-text-secondary', iconClassName)}
				aria-hidden
			/>
		</div>
	);
}
