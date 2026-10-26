import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib';

/**
 * The `variant` × `color` matrix is resolved through the `--btn-*` custom
 * properties declared on `[data-slot='button']` in `globals.css` — the
 * `data-variant` / `data-color` attributes below are what select them.
 */
const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center cursor-pointer border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				solid:
					'bg-(--btn-bg) text-(--btn-fg) hover:bg-(--btn-bg)/90 aria-expanded:bg-(--btn-bg) aria-expanded:text-(--btn-fg)',
				outline:
					'border border-(--btn-border) bg-(--btn-tint) text-(--btn-text) hover:bg-(--btn-tint-hover) hover:text-(--btn-text) aria-expanded:bg-(--btn-tint) aria-expanded:text-(--btn-text)',
				ghost: 'text-(--btn-text) hover:bg-(--btn-muted)',
				link: 'text-(--btn-text) underline-offset-4 hover:underline',
			},
			color: {
				primary: '',
				secondary: '',
				white: '',
				destructive: '',
				success: '',
				dark: '',
			},
			rounded: {
				xs: 'rounded-xs',
				sm: 'rounded-sm',
				md: 'rounded-md',
				lg: 'rounded-lg',
				xl: 'rounded-xl',
				full: 'rounded-full',
			},
			size: {
				default:
					'h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				xs: "h-7 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				xl: 'h-10 gap-1.5 px-6 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				'2xl':
					'h-11 gap-1.5 px-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				icon: 'size-8',
				'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
				'icon-sm': 'size-7',
				'icon-lg': 'size-9',
				'icon-xl': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'solid',
			color: 'primary',
			size: 'default',
			rounded: 'full',
		},
	},
);

function Button({
	className,
	variant = 'solid',
	color = 'primary',
	size = 'default',
	rounded = 'full',
	fullWidth = false,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		fullWidth?: boolean;
	}): React.JSX.Element {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			{...props}
			data-slot="button"
			data-variant={variant}
			data-color={color}
			data-size={size}
			className={cn(
				buttonVariants({ variant, color, size, rounded, className }),
				fullWidth && 'w-full',
			)}
		/>
	);
}

export { Button, buttonVariants };
