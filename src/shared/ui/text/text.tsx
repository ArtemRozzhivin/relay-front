import { type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
	children: ReactNode;
	className?: string;
}

interface TextProps extends HTMLAttributes<HTMLElement> {
	children: ReactNode;
	as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
	size?:
		| 'xs'
		| 'sm'
		| 'md'
		| 'lg'
		| 'xl'
		| 'xxl'
		| '3xl'
		| '4xl'
		| '5xl'
		| '6xl'
		| '7xl';
	variant?: 'base' | 'secondary';
}

const textSizes = {
	xs: 'text-body-xs',
	sm: 'text-body-sm',
	md: 'text-body-md',
	lg: 'text-body-lg',
	xl: 'text-body-xl',
	xxl: 'text-body-2xl',
	'3xl': 'text-body-3xl',
	'4xl': 'text-body-4xl',
	'5xl': 'text-body-5xl',
	'6xl': 'text-body-6xl',
	'7xl': 'text-body-7xl',
} as const;

const textVariants = {
	base: 'text-foreground',
	secondary: 'text-muted-foreground',
} as const;

export function H1({
	children,
	className,
	...props
}: TypographyProps): ReactNode {
	return (
		<h1
			className={cn(
				'scroll-m-20 text-4xl font-extrabold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h1>
	);
}

export function H2({
	children,
	className,
	...props
}: TypographyProps): ReactNode {
	return (
		<h2
			className={cn(
				'scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0',
				className,
			)}
			{...props}
		>
			{children}
		</h2>
	);
}

export function H3({
	children,
	className,
	...props
}: TypographyProps): ReactNode {
	return (
		<h3
			className={cn(
				'scroll-m-20 text-2xl font-semibold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h3>
	);
}

export function H4({
	children,
	className,
	...props
}: TypographyProps): ReactNode {
	return (
		<h4
			className={cn(
				'scroll-m-20 text-xl font-semibold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h4>
	);
}

export function H5({
	children,
	className,
	...props
}: TypographyProps): ReactNode {
	return (
		<h5
			className={cn(
				'scroll-m-20 text-lg font-semibold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h5>
	);
}

export function H6({
	children,
	className,
	...props
}: TypographyProps): ReactNode {
	return (
		<h6
			className={cn(
				'scroll-m-20 text-base font-semibold tracking-tight',
				className,
			)}
			{...props}
		>
			{children}
		</h6>
	);
}

export function Text({
	children,
	className,
	as: Component = 'p',
	size = 'sm',
	variant = 'base',
	...props
}: TextProps): ReactNode {
	return (
		<Component
			className={cn(
				'font-normal',
				textSizes[size],
				textVariants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</Component>
	);
}
